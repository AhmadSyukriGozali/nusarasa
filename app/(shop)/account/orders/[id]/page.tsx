import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Order = {
  id: string;
  order_number: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // =====================================================
  // CEK LOGIN
  // =====================================================

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        `/account/orders/${id}`
      )}`
    );
  }

  const userId = claimsData.claims.sub;

  // =====================================================
  // AMBIL ORDER MILIK USER
  // =====================================================

  const {
    data: orderData,
    error: orderError,
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
        payment_status,
        customer_name,
        customer_phone,
        delivery_address,
        notes,
        created_at
      `
    )
    .eq("id", id)
    .eq("customer_id", userId)
    .maybeSingle();

  /*
   * Jika tidak ditemukan, jangan membocorkan
   * apakah order tersebut milik user lain.
   */
  if (orderError || !orderData) {
    notFound();
  }

  const order = orderData as Order;

  // =====================================================
  // AMBIL ITEM PESANAN
  // =====================================================

  const {
    data: orderItemsData,
    error: orderItemsError,
  } = await supabase
    .from("order_items")
    .select(
      `
        id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal
      `
    )
    .eq("order_id", order.id)
    .order("created_at", {
      ascending: true,
    });

  const items: OrderItem[] =
    (orderItemsData as OrderItem[] | null) ??
    [];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-black"
          >
            <span>←</span>
            <span>Kembali ke Akun</span>
          </Link>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Detail Pesanan
              </p>

              <h1 className="mt-2 break-all text-2xl font-bold tracking-tight sm:text-3xl">
                {order.order_number}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Dibuat pada{" "}
                {formatDate(order.created_at)}
              </p>
            </div>

            <OrderStatus
              status={order.status}
            />
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">
                Status Pesanan
              </p>

              <div className="mt-2">
                <OrderStatus
                  status={order.status}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Pembayaran
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {formatPaymentMethod(
                  order.payment_method
                )}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {formatPaymentStatus(
                  order.payment_status
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Pesanan
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {formatRupiah(
                  Number(order.total)
                )}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            TWO COLUMN
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* =================================================
              ORDER ITEMS
          ================================================= */}

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                Pesanan
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Produk Pesanan
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Produk yang termasuk dalam pesanan
                ini.
              </p>
            </div>

            {orderItemsError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-800">
                  Gagal mengambil produk pesanan
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  Detail produk tidak dapat
                  ditampilkan saat ini.
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-500">
                  Tidak ada item pada pesanan ini.
                </p>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 py-5 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {item.product_name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatRupiah(
                          Number(item.price)
                        )}{" "}
                        × {item.quantity}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-gray-400">
                        Subtotal
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {formatRupiah(
                          Number(item.subtotal)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =================================================
              CUSTOMER INFO
          ================================================= */}

          <section className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Pengiriman
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Informasi Pengiriman
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-gray-500">
                  Nama
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Nomor Telepon
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {order.customer_phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Alamat
                </p>

                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700">
                  {order.delivery_address}
                </p>
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-500">
                    Catatan
                  </p>

                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =================================================
            PAYMENT SUMMARY
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Pembayaran
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Ringkasan Pembayaran
            </h2>
          </div>

          <div className="mt-6 max-w-lg space-y-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium text-gray-900">
                {formatRupiah(
                  Number(order.subtotal)
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Diskon
              </span>

              <span className="font-medium text-gray-900">
                {formatRupiah(
                  Number(order.discount)
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Biaya Pengiriman
              </span>

              <span className="font-medium text-gray-900">
                {formatRupiah(
                  Number(order.delivery_fee)
                )}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Total
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Total pembayaran
                  </p>
                </div>

                <p className="text-xl font-bold text-black">
                  {formatRupiah(
                    Number(order.total)
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ORDER TIMELINE
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Status
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Perjalanan Pesanan
            </h2>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <OrderStep
              label="Menunggu"
              active={isStatusReached(
                order.status,
                "pending"
              )}
              current={
                order.status === "pending"
              }
            />

            <OrderStep
              label="Dikonfirmasi"
              active={isStatusReached(
                order.status,
                "confirmed"
              )}
              current={
                order.status === "confirmed"
              }
            />

            <OrderStep
              label="Diproses"
              active={isStatusReached(
                order.status,
                "preparing"
              )}
              current={
                order.status === "preparing"
              }
            />

            <OrderStep
              label="Siap"
              active={isStatusReached(
                order.status,
                "ready"
              )}
              current={
                order.status === "ready"
              }
            />

            <OrderStep
              label="Selesai"
              active={isStatusReached(
                order.status,
                "completed"
              )}
              current={
                order.status === "completed"
              }
            />

            {order.status === "cancelled" && (
              <OrderStep
                label="Dibatalkan"
                active
                current
                cancelled
              />
            )}
          </div>
        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Pesanan Saya
          </Link>

          <Link
            href="/products"
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Belanja Lagi
          </Link>

          <Link
            href="/cart"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Buka Keranjang
          </Link>
        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-gray-900">
              NusaRasa
            </p>

            <p className="mt-1">
              Platform digital untuk UMKM lokal.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/"
              className="transition hover:text-black"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="transition hover:text-black"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="transition hover:text-black"
            >
              Keranjang
            </Link>

            <Link
              href="/account"
              className="font-medium text-black"
            >
              Akun
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-gray-400 sm:px-6">
            © {new Date().getFullYear()} NusaRasa.
            All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

// =======================================================
// ORDER STATUS
// =======================================================

function OrderStatus({
  status,
}: {
  status: string;
}) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    preparing: "Diproses",
    ready: "Siap",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  const classes: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800",
    confirmed:
      "bg-blue-100 text-blue-800",
    preparing:
      "bg-purple-100 text-purple-800",
    ready:
      "bg-indigo-100 text-indigo-800",
    completed:
      "bg-green-100 text-green-800",
    cancelled:
      "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
        classes[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

// =======================================================
// ORDER STEP
// =======================================================

function OrderStep({
  label,
  active,
  current,
  cancelled = false,
}: {
  label: string;
  active: boolean;
  current: boolean;
  cancelled?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        current
          ? cancelled
            ? "border-red-200 bg-red-50"
            : "border-black bg-gray-50"
          : active
            ? "border-gray-200 bg-white"
            : "border-gray-100 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            current
              ? cancelled
                ? "bg-red-600 text-white"
                : "bg-black text-white"
              : active
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-100 text-gray-400"
          }`}
        >
          {active ? "✓" : "•"}
        </div>

        <p
          className={`text-sm font-semibold ${
            current
              ? cancelled
                ? "text-red-800"
                : "text-gray-900"
              : active
                ? "text-gray-700"
                : "text-gray-400"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

// =======================================================
// STATUS ORDER
// =======================================================

function isStatusReached(
  currentStatus: string,
  targetStatus: string
) {
  if (currentStatus === "cancelled") {
    return false;
  }

  const order: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    preparing: 3,
    ready: 4,
    completed: 5,
  };

  return (
    (order[currentStatus] ?? 0) >=
    (order[targetStatus] ?? 0)
  );
}

// =======================================================
// FORMAT DATE
// =======================================================

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

// =======================================================
// PAYMENT METHOD
// =======================================================

function formatPaymentMethod(
  value: string
) {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}

// =======================================================
// PAYMENT STATUS
// =======================================================

function formatPaymentStatus(
  value: string
) {
  const labels: Record<string, string> = {
    unpaid: "Belum dibayar",
    pending: "Menunggu pembayaran",
    paid: "Dibayar",
    failed: "Gagal",
  };

  return labels[value] ?? value;
}