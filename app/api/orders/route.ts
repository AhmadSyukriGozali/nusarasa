import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type OrderItemInput = {
  productId: string;
  quantity: number;
};

type CreateOrderBody = {
  items: OrderItemInput[];
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: "cash" | "bank_transfer";
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    /*
     * 1. Pastikan user sudah login
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Anda harus login terlebih dahulu.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * 2. Parse request body
     */
    let body: CreateOrderBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Data checkout tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 3. Validasi informasi customer
     */
    const customerName =
      body.customerName?.trim();

    const customerPhone =
      body.customerPhone?.trim();

    const deliveryAddress =
      body.deliveryAddress?.trim();

    const notes =
      body.notes?.trim() || null;

    if (!customerName) {
      return NextResponse.json(
        {
          error: "Nama pelanggan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!customerPhone) {
      return NextResponse.json(
        {
          error: "Nomor telepon wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!deliveryAddress) {
      return NextResponse.json(
        {
          error:
            "Alamat pengiriman wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 4. Validasi payment method
     */
    if (
      body.paymentMethod !== "cash" &&
      body.paymentMethod !== "bank_transfer"
    ) {
      return NextResponse.json(
        {
          error:
            "Metode pembayaran tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 5. Validasi cart
     */
    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Keranjang masih kosong.",
        },
        {
          status: 400,
        }
      );
    }

    for (const item of body.items) {
      if (
        typeof item.productId !== "string" ||
        !item.productId
      ) {
        return NextResponse.json(
          {
            error:
              "Product ID tidak valid.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Jumlah produk tidak valid.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * 6. Gabungkan product ID yang sama
     *
     * Ini mencegah satu produk dikirim
     * dua kali dalam satu request.
     */
    const itemMap = new Map<
      string,
      number
    >();

    for (const item of body.items) {
      const currentQuantity =
        itemMap.get(item.productId) ?? 0;

      itemMap.set(
        item.productId,
        currentQuantity + item.quantity
      );
    }

    const normalizedItems = Array.from(
      itemMap.entries()
    ).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      })
    );

    /*
     * 7. Batasi jumlah item
     *
     * Ini bukan pengganti validasi database,
     * tetapi mencegah request yang tidak masuk akal.
     */
    if (normalizedItems.length > 50) {
      return NextResponse.json(
        {
          error:
            "Jumlah jenis produk dalam satu pesanan terlalu banyak.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 8. Generate nomor pesanan
     */
    const timestamp = new Date()
      .toISOString()
      .replace(/\D/g, "")
      .slice(0, 14);

    const randomPart = Math.floor(
      Math.random() * 10000
    )
      .toString()
      .padStart(4, "0");

    const orderNumber =
      `NR-${timestamp}-${randomPart}`;

    /*
     * 9. Buat order secara ATOMIC
     *
     * Semua proses berikut dilakukan
     * oleh PostgreSQL:
     *
     * - validasi produk
     * - validasi stok
     * - lock product row
     * - hitung harga
     * - insert orders
     * - insert order_items
     * - kurangi stok
     *
     * Jika salah satu gagal,
     * seluruh transaksi dibatalkan.
     */
    const { data: orderId, error } =
      await supabase.rpc(
        "create_order_atomic",
        {
          p_customer_id: user.id,
          p_order_number: orderNumber,
          p_customer_name: customerName,
          p_customer_phone: customerPhone,
          p_delivery_address:
            deliveryAddress,
          p_notes: notes,
          p_payment_method:
            body.paymentMethod,
          p_items: normalizedItems,
        }
      );

    if (error || !orderId) {
      console.error(
        "CREATE ORDER ATOMIC ERROR:",
        error
      );

      let errorMessage =
        "Gagal membuat pesanan.";

      /*
       * PostgreSQL exception dari function
       * akan masuk ke error.message.
       */
      if (error?.message) {
        const message =
          error.message.toLowerCase();

        if (
          message.includes("stok") ||
          message.includes("tidak mencukupi")
        ) {
          errorMessage =
            error.message;
        } else if (
          message.includes(
            "produk tidak ditemukan"
          )
        ) {
          errorMessage =
            "Salah satu produk sudah tidak tersedia.";
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 10. Ambil order yang baru dibuat
     *
     * Hanya untuk mengembalikan informasi
     * kepada frontend.
     */
    const {
      data: order,
      error: fetchOrderError,
    } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        subtotal,
        discount,
        delivery_fee,
        total,
        status,
        payment_method,
        payment_status
      `
      )
      .eq("id", orderId)
      .single();

    if (fetchOrderError || !order) {
      console.error(
        "FETCH CREATED ORDER ERROR:",
        fetchOrderError
      );

      /*
       * Jangan menganggap transaksi gagal.
       *
       * Order sebenarnya sudah dibuat.
       * Error ini hanya terjadi ketika
       * mengambil kembali data order.
       */
      return NextResponse.json(
        {
          success: true,
          order: {
            id: orderId,
            orderNumber,
          },
        },
        {
          status: 201,
        }
      );
    }

    /*
     * 11. Response sukses
     */
    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber:
            order.order_number,
          subtotal: order.subtotal,
          discount: order.discount,
          deliveryFee:
            order.delivery_fee,
          total: order.total,
          status: order.status,
          paymentMethod:
            order.payment_method,
          paymentStatus:
            order.payment_status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE ORDER UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}