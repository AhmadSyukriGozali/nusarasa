import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

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
  created_at: string;
};

export default async function OrdersPage() {
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
        "/account/orders"
      )}`
    );
  }

  const userId = claimsData.claims.sub;

  // =====================================================
  // AMBIL SEMUA PESANAN USER
  // =====================================================

  const {
    data: ordersData,
    error: ordersError,
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
        created_at
      `
    )
    .eq("customer_id", userId)
    .order("created_at", {
      ascending: false,
    });

  const orders: Order[] =
    (ordersData as Order[] | null) ?? [];

  // =====================================================
  // STATISTIK
  // =====================================================

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "confirmed" ||
      order.status === "preparing" ||
      order.status === "ready"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status === "completed"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "cancelled"
  ).length;

  // =====================================================
  // TOTAL BELANJA
  // =====================================================
  //
  // Menghitung seluruh pesanan kecuali
  // pesanan yang dibatalkan.
  //
  // Contoh:
  // Pesanan 1 = Rp50.000
  // Pesanan 2 = Rp75.000
  // Pesanan 3 = Rp25.000 (cancelled)
  //
  // Total Belanja = Rp125.000
  //
  // =====================================================

  const totalSpent = orders
    .filter(
      (order) =>
        order.status !== "cancelled"
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.total),
      0
    );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-black"
          >
            <span>←</span>
            <span>Kembali ke Akun</span>
          </Link>

          <div className="mt-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              NusaRasa
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Pesanan Saya
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
              Lihat dan pantau semua pesanan yang
              pernah kamu buat di NusaRasa.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL PESANAN */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Pesanan
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Semua pesanan
            </p>
          </div>

          {/* PESANAN AKTIF */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Sedang Diproses
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {activeOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Pesanan aktif
            </p>
          </div>

          {/* SELESAI */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Selesai
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {completedOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Pesanan selesai
            </p>
          </div>

          {/* TOTAL BELANJA */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Belanja
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatRupiah(totalSpent)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Tidak termasuk pesanan batal
            </p>
          </div>
        </div>

        {/* =================================================
            ORDER LIST
        ================================================= */}

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Riwayat
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Semua Pesanan
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Pesanan terbaru ditampilkan terlebih
                dahulu.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex w-fit rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Belanja Lagi
            </Link>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {ordersError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-800">
                Gagal mengambil pesanan
              </p>

              <p className="mt-2 text-sm leading-6 text-red-700">
                Terjadi masalah saat mengambil
                riwayat pesanan. Silakan refresh
                halaman dan coba lagi.
              </p>
            </div>
          ) : orders.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                🛒
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Belum ada pesanan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Kamu belum memiliki riwayat pesanan.
                Temukan produk favoritmu dan mulai
                belanja di NusaRasa.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            /* =================================================
               ORDER CARDS
            ================================================= */

            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-6"
                >
                  {/* =================================================
                      TOP
                  ================================================= */}

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-all font-bold text-gray-900">
                          {order.order_number}
                        </p>

                        <OrderStatus
                          status={order.status}
                        />
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Dibuat pada{" "}
                        {formatDate(
                          order.created_at
                        )}
                      </p>
                    </div>

                    {/* =================================================
                        TOTAL
                    ================================================= */}

                    <div className="lg:text-right">
                      <p className="text-xs text-gray-400">
                        Total Pesanan
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {formatRupiah(
                          Number(order.total)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                      SUMMARY
                  ================================================= */}

                  <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-400">
                        Pembayaran
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {formatPaymentMethod(
                          order.payment_method
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatPaymentStatus(
                          order.payment_status
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Subtotal
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {formatRupiah(
                          Number(
                            order.subtotal
                          )
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Biaya Pengiriman
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {formatRupiah(
                          Number(
                            order.delivery_fee
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                      DETAIL BUTTON
                  ================================================= */}

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm font-medium text-gray-500">
                      Lihat detail pesanan
                    </span>

                    <span className="text-sm font-semibold text-gray-900 transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 font-bold">
                1
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Pilih Pesanan
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Pilih salah satu pesanan untuk
                melihat informasi lengkap.
              </p>
            </div>

            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 font-bold">
                2
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Pantau Status
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Lihat perkembangan pesanan mulai
                dari menunggu hingga selesai.
              </p>
            </div>

            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 font-bold">
                3
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Belanja Lagi
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Setelah selesai, kamu dapat membuat
                pesanan baru kapan saja.
              </p>
            </div>
          </div>
        </section>
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
              className="transition hover:text-black"
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
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        classes[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] ?? status}
    </span>
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
