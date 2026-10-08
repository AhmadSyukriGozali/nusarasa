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
    (order) => order.status === "completed"
  ).length;

  // =====================================================
  // TOTAL BELANJA
  // =====================================================

  const totalSpent = orders
    .filter(
      (order) => order.status !== "cancelled"
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.total),
      0
    );

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="border-b border-[#e4ded5]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/account"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#817970] transition hover:text-[#171512]"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>

            <span>Kembali ke Akun</span>
          </Link>

          <div className="mt-7 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd6cc] bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#91877c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a95d2c]" />
              Order History
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Pesanan Saya
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#716b63] sm:text-lg">
              Semua perjalanan pesanan kamu di
              NusaRasa, dari dibuat hingga selesai.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Pesanan"
            value={String(totalOrders)}
            description="Semua pesanan"
            accent="dark"
          />

          <StatCard
            label="Sedang Diproses"
            value={String(activeOrders)}
            description="Pesanan aktif"
            accent="terracotta"
          />

          <StatCard
            label="Pesanan Selesai"
            value={String(completedOrders)}
            description="Pesanan selesai"
            accent="soft"
          />

          <StatCard
            label="Total Belanja"
            value={formatRupiah(totalSpent)}
            description="Tidak termasuk pesanan batal"
            accent="dark"
            compact
          />
        </section>

        {/* =================================================
            ORDER LIST
        ================================================= */}

        <section className="mt-12">
          <div className="flex flex-col gap-5 border-b border-[#ddd7ce] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a19689]">
                Riwayat
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
                Semua Pesanan
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#777067]">
                Pesanan terbaru ditampilkan terlebih
                dahulu.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#171512] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#302d29]"
            >
              Belanja Lagi
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {ordersError ? (
            <div className="mt-6 rounded-[2rem] border border-red-200 bg-[#fff8f7] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold text-red-600">
                  !
                </div>

                <div>
                  <p className="font-semibold text-red-800">
                    Gagal mengambil pesanan
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-red-700">
                    Terjadi masalah saat mengambil
                    riwayat pesanan. Silakan refresh
                    halaman dan coba lagi.
                  </p>
                </div>
              </div>
            </div>
          ) : orders.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="mt-6 overflow-hidden rounded-[2rem] border border-dashed border-[#d6cfc5] bg-white px-6 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2eee8] text-2xl">
                🛒
              </div>

              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a19689]">
                NusaRasa
              </p>

              <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                Belum ada pesanan
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#777067]">
                Kamu belum memiliki riwayat pesanan.
                Temukan produk favoritmu dan mulai
                belanja di NusaRasa.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-xl bg-[#171512] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#302d29]"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            /* =================================================
               ORDER CARDS
            ================================================= */

            <div className="mt-6 space-y-4">
              {orders.map((order, index) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group relative block overflow-hidden rounded-[2rem] border border-[#e2dcd3] bg-white shadow-[0_8px_30px_rgba(23,21,18,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-[#cec5ba] hover:shadow-[0_15px_40px_rgba(23,21,18,0.07)]"
                >
                  {/* LEFT ACCENT */}

                  <div
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-full w-1 ${
                      order.status === "completed"
                        ? "bg-[#4c8a5c]"
                        : order.status ===
                            "cancelled"
                          ? "bg-[#c45449]"
                          : "bg-[#a95d2c]"
                    }`}
                  />

                  <div className="p-6 sm:p-7">
                    {/* =================================================
                        TOP ROW
                    ================================================= */}

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="rounded-full bg-[#f2eee8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8d8378]">
                            #{String(index + 1).padStart(2, "0")}
                          </span>

                          <OrderStatus
                            status={order.status}
                          />
                        </div>

                        <p className="mt-3 break-all text-lg font-bold tracking-[-0.015em] text-[#171512]">
                          {order.order_number}
                        </p>

                        <p className="mt-1.5 text-sm text-[#8a8279]">
                          Dibuat pada{" "}
                          {formatDate(
                            order.created_at
                          )}
                        </p>
                      </div>

                      {/* TOTAL */}

                      <div className="lg:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#aaa197]">
                          Total Pesanan
                        </p>

                        <p className="mt-1.5 text-2xl font-bold tracking-[-0.025em] text-[#171512]">
                          {formatRupiah(
                            Number(order.total)
                          )}
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        SUMMARY
                    ================================================= */}

                    <div className="mt-6 grid gap-4 border-t border-[#eee9e2] pt-6 sm:grid-cols-3">
                      <OrderMeta
                        label="Pembayaran"
                        value={formatPaymentMethod(
                          order.payment_method
                        )}
                        secondary={formatPaymentStatus(
                          order.payment_status
                        )}
                      />

                      <OrderMeta
                        label="Subtotal"
                        value={formatRupiah(
                          Number(order.subtotal)
                        )}
                      />

                      <OrderMeta
                        label="Biaya Pengiriman"
                        value={formatRupiah(
                          Number(
                            order.delivery_fee
                          )
                        )}
                      />
                    </div>

                    {/* =================================================
                        DETAIL
                    ================================================= */}

                    <div className="mt-6 flex items-center justify-between border-t border-[#eee9e2] pt-4">
                      <span className="text-sm font-semibold text-[#817970]">
                        Lihat detail pesanan
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded7ce] text-sm text-[#5d574f] transition duration-200 group-hover:translate-x-1 group-hover:border-[#bdb4a9] group-hover:bg-[#f6f3ee]">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#171512] p-7 text-white sm:p-9">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a9a198]">
              Cara Kerja
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-[-0.025em]">
              Pantau pesanan dengan mudah.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-7 text-[#c5c0ba]">
              Setiap pesanan memiliki detail dan
              status yang dapat kamu pantau kapan
              saja.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            <InfoStep
              number="01"
              title="Pilih Pesanan"
              description="Pilih salah satu pesanan untuk melihat informasi lengkap."
            />

            <InfoStep
              number="02"
              title="Pantau Status"
              description="Lihat perkembangan pesanan mulai dari menunggu hingga selesai."
            />

            <InfoStep
              number="03"
              title="Belanja Lagi"
              description="Setelah selesai, kamu dapat membuat pesanan baru kapan saja."
            />
          </div>
        </section>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-10 border-t border-[#e3ddd4] bg-[#fbfaf8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[#817970] sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-[#171512]">
              NusaRasa
            </p>

            <p className="mt-1">
              Platform digital untuk UMKM lokal.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/"
              className="transition hover:text-[#171512]"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="transition hover:text-[#171512]"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="transition hover:text-[#171512]"
            >
              Keranjang
            </Link>

            <Link
              href="/account"
              className="transition hover:text-[#171512]"
            >
              Akun
            </Link>
          </div>
        </div>

        <div className="border-t border-[#eee9e2]">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-[#aaa197] sm:px-6">
            © {new Date().getFullYear()} NusaRasa.
            All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

// =======================================================
// STAT CARD
// =======================================================

function StatCard({
  label,
  value,
  description,
  accent,
  compact = false,
}: {
  label: string;
  value: string;
  description: string;
  accent: "dark" | "terracotta" | "soft";
  compact?: boolean;
}) {
  const accentStyles = {
    dark: "bg-[#171512] text-white",
    terracotta: "bg-[#a95d2c] text-white",
    soft: "bg-white text-[#171512]",
  };

  const descriptionStyles = {
    dark: "text-[#aaa49d]",
    terracotta: "text-[#f0d6c2]",
    soft: "text-[#999087]",
  };

  return (
    <div
      className={`relative min-h-[180px] overflow-hidden rounded-[1.75rem] border border-[#e2dcd3] p-6 shadow-[0_8px_30px_rgba(23,21,18,0.035)] ${accentStyles[accent]}`}
    >
      <div className="relative z-10">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
            accent === "soft"
              ? "text-[#9b9187]"
              : "text-white/55"
          }`}
        >
          {label}
        </p>

        <p
          className={`mt-4 font-bold tracking-[-0.04em] ${
            compact
              ? "text-2xl sm:text-3xl"
              : "text-4xl"
          }`}
        >
          {value}
        </p>

        <p
          className={`mt-2 text-xs ${descriptionStyles[accent]}`}
        >
          {description}
        </p>
      </div>

      <div
        aria-hidden="true"
        className={`absolute -bottom-12 -right-12 h-32 w-32 rounded-full border ${
          accent === "terracotta"
            ? "border-white/15"
            : accent === "dark"
              ? "border-white/10"
              : "border-[#e5ded5]"
        }`}
      />
    </div>
  );
}

// =======================================================
// ORDER META
// =======================================================

function OrderMeta({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#aaa197]">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-[#4d4842]">
        {value}
      </p>

      {secondary && (
        <p className="mt-1 text-xs text-[#8a8279]">
          {secondary}
        </p>
      )}
    </div>
  );
}

// =======================================================
// INFO STEP
// =======================================================

function InfoStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-t border-white/10 pt-5">
      <span className="text-xs font-bold tracking-[0.15em] text-[#b96532]">
        {number}
      </span>

      <h3 className="mt-3 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#aaa49d]">
        {description}
      </p>
    </div>
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
      "bg-[#fff4d6] text-[#8a6410]",

    confirmed:
      "bg-[#e7f0ff] text-[#315d9b]",

    preparing:
      "bg-[#f0e7fb] text-[#70449b]",

    ready:
      "bg-[#e8e9ff] text-[#5559a3]",

    completed:
      "bg-[#e4f4e9] text-[#327347]",

    cancelled:
      "bg-[#fde8e6] text-[#a83e35]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
        classes[status] ??
        "bg-[#f1eee9] text-[#655e56]"
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
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// =======================================================
// PAYMENT METHOD
// =======================================================

function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}

// =======================================================
// PAYMENT STATUS
// =======================================================

function formatPaymentStatus(value: string) {
  const labels: Record<string, string> = {
    unpaid: "Belum dibayar",
    pending: "Menunggu pembayaran",
    paid: "Dibayar",
    failed: "Gagal",
  };

  return labels[value] ?? value;
}