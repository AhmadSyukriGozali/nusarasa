import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export async function POST(
  request: Request
) {
  try {
    const supabase = await createClient();

    /*
     * 1. Pastikan user login.
     */
    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    if (
      claimsError ||
      !claimsData?.claims
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId =
      claimsData.claims.sub;

    /*
     * 2. Pastikan user benar-benar admin.
     *
     * Jangan percaya role dari browser.
     * Role diambil langsung dari database.
     */
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (
      profileError ||
      !profile
    ) {
      return NextResponse.json(
        {
          error: "Profile tidak ditemukan.",
        },
        {
          status: 403,
        }
      );
    }

    if (profile.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 3. Ambil data request.
     */
    const body = await request.formData();

    const orderId =
      body.get("order_id");

    const newStatus =
      body.get("status");

    if (
      typeof orderId !== "string" ||
      typeof newStatus !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Data request tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 4. Validasi status tujuan.
     */
    const validStatuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    if (
      !validStatuses.includes(
        newStatus as OrderStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Status pesanan tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 5. Ambil status order saat ini.
     */
    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(
        "id, status"
      )
      .eq("id", orderId)
      .single();

    if (
      orderError ||
      !order
    ) {
      return NextResponse.json(
        {
          error:
            "Pesanan tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    const currentStatus =
      order.status as OrderStatus;

    /*
     * 6. Pastikan transisi status
     * diperbolehkan.
     */
    const allowed =
      allowedTransitions[
        currentStatus
      ];

    if (
      !allowed ||
      !allowed.includes(
        newStatus as OrderStatus
      )
    ) {
      return NextResponse.json(
        {
          error: `Transisi status ${currentStatus} → ${newStatus} tidak diperbolehkan.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 7. Update status.
     */
    const {
      error: updateError,
    } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Gagal mengubah status pesanan.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 8. Redirect kembali ke detail order.
     */
    return NextResponse.redirect(
      new URL(
        `/admin/orders/${orderId}`,
        request.url
      )
    );
  } catch (error) {
    console.error(
      "ADMIN ORDER STATUS ERROR:",
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