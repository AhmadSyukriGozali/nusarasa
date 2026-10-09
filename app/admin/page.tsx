import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import LogoutButton from "@/components/auth/logout-button";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Pantau statistik produk, kategori, pendapatan, dan pesanan terbaru melalui dashboard admin NusaRasa.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const supabase = await createClient();

  /*
   * Ambil jumlah produk.
   */
  const {
    count: totalProducts,
    error: productsError,
  } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    });

  /*
   * Ambil jumlah kategori.
   */
  const {
    count: totalCategories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id", {
      count: "exact",
      head: true,
    });

  /*
   * Tentukan awal hari ini.
   */
  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);

  /*
   * Ambil semua order hari ini.
   */
  const {
    data: todayOrders,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select("id, total, status")
    .gte("created_at", startOfToday.toISOString())
    .neq("status", "cancelled");

  /*
   * Hitung jumlah order hari ini.
   */
  const todayOrderCount = todayOrders?.length ?? 0;

  /*
   * Hitung pendapatan hari ini.
   */
  const todayRevenue =
    todayOrders?.reduce(
      (total, order) => total + Number(order.total),
      0
    ) ?? 0;

  /*
   * Ambil order terbaru.
   */
  const {
    data: recentOrders,
    error: recentOrdersError,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_name,
        total,
        status,
        created_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  const hasError =
    productsError ||
    categoriesError ||
    ordersError ||
    recentOrdersError;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* Header */}
      <header className="border-b border-[#e8e2d9] bg-[#f7f5f0]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a95d2c]" />

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8b8175]">
                  NusaRasa Admin
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#71695f]">
                Pantau produk, kategori, pesanan, dan aktivitas
                operasional NusaRasa dari satu tempat.
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Error */}
        {hasError && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-800">
              Sebagian data dashboard gagal dimuat.
            </p>

            <p className="mt-1 text-sm leading-6 text-red-600">
              Periksa koneksi database dan konfigurasi RLS Supabase.
            </p>
          </div>
        )}

        {/* Hero / Quick Actions */}
        <section className="overflow-hidden rounded-[28px] bg-[#171512]">
          <div className="relative px-6 py-7 sm:px-8 sm:py-9">
            {/* Decorative glow */}
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#9b5425]/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-[#c27336]/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d99561]">
                Operasional hari ini
              </p>

              <div className="mt-3">
                <h2 className="max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl lg:text-4xl">
                  Kelola NusaRasa dengan lebih sederhana.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Akses cepat ke katalog produk, kategori, dan pesanan
                  pelanggan melalui satu dashboard.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <QuickAction
                  href="/admin/products"
                  number="01"
                  title="Kelola Produk"
                  description="Atur katalog dan stok"
                />

                <QuickAction
                  href="/admin/categories"
                  number="02"
                  title="Kelola Kategori"
                  description="Atur kategori produk"
                />

                <QuickAction
                  href="/admin/orders"
                  number="03"
                  title="Kelola Pesanan"
                  description="Pantau pesanan masuk"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Produk"
            value={String(totalProducts ?? 0)}
            description="Produk yang tersimpan di katalog"
            accent="neutral"
          />

          <StatCard
            label="Total Kategori"
            value={String(totalCategories ?? 0)}
            description="Kategori yang tersedia di sistem"
            accent="orange"
          />

          <StatCard
            label="Pesanan Hari Ini"
            value={String(todayOrderCount)}
            description="Tidak termasuk pesanan dibatalkan"
            accent="purple"
          />

          <StatCard
            label="Pendapatan Hari Ini"
            value={formatRupiah(todayRevenue)}
            description="Total order hari ini"
            accent="dark"
          />
        </section>

        {/* Recent Orders */}
        <section className="mt-8 overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#eee9e1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a95d2c]" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b8175]">
                  Aktivitas
                </p>
              </div>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Pesanan Terbaru
              </h2>

              <p className="mt-1 text-sm text-[#81786d]">
                Lima pesanan terakhir yang masuk.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="inline-flex items-center text-sm font-semibold text-[#9b5425] transition hover:text-[#7e401b]"
            >
              Lihat semua
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {!recentOrders || recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efe8]">
                <span className="text-xl text-[#8b8175]">—</span>
              </div>

              <p className="mt-4 text-sm font-semibold">
                Belum ada pesanan
              </p>

              <p className="mt-1 text-sm text-[#81786d]">
                Pesanan pelanggan akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eee9e1]">
              {recentOrders.map((order, index) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="group block px-5 py-5 transition hover:bg-[#faf8f4] sm:px-7"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      {/* Number */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3efe8] text-xs font-bold text-[#8b8175] transition group-hover:bg-[#eee6dc] group-hover:text-[#9b5425]">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-[#171512]">
                            {order.order_number}
                          </p>

                          <OrderStatus status={order.status} />
                        </div>

                        <p className="mt-1.5 truncate text-sm text-[#71695f]">
                          {order.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-[#a1988d]">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 lg:justify-end">
                      <div className="lg:text-right">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#a1988d]">
                          Total
                        </p>

                        <p className="mt-1 font-semibold text-[#171512]">
                          {formatRupiah(Number(order.total))}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e3ddd4] text-[#8b8175] transition group-hover:border-[#c9a487] group-hover:bg-[#f7f0e9] group-hover:text-[#9b5425]">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Management Cards */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <ManagementCard
            href="/admin/products"
            eyebrow="Katalog"
            title="Kelola Produk"
            description="Tambah, ubah, hapus, dan atur ketersediaan produk NusaRasa."
            icon="▦"
          />

          <ManagementCard
            href="/admin/categories"
            eyebrow="Organisasi"
            title="Kelola Kategori"
            description="Atur kategori produk agar katalog NusaRasa tetap rapi dan mudah dinavigasi."
            icon="◈"
          />

          <ManagementCard
            href="/admin/orders"
            eyebrow="Operasional"
            title="Kelola Pesanan"
            description="Pantau pesanan masuk dan perbarui status pesanan pelanggan."
            icon="↗"
          />
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e5dfd6] pt-6 pb-4">
          <div className="flex flex-col gap-2 text-xs text-[#9a9186] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} NusaRasa</p>

            <p>Admin Panel</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Quick Action                                                               */
/* -------------------------------------------------------------------------- */

function QuickAction({
  href,
  number,
  title,
  description,
  primary = false,
}: {
  href: string;
  number: string;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 ${
        primary
          ? "border-white bg-white text-[#171512] hover:bg-[#f4f1eb]"
          : "border-white/10 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className={`text-[10px] font-bold tracking-[0.16em] ${
            primary ? "text-[#9b5425]" : "text-[#d99561]"
          }`}
        >
          {number}
        </span>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition group-hover:translate-x-0.5 ${
            primary
              ? "bg-[#f3efe8] text-[#9b5425]"
              : "bg-white/10 text-white"
          }`}
        >
          →
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold">{title}</p>

      <p
        className={`mt-1 text-xs ${
          primary ? "text-[#81786d]" : "text-white/45"
        }`}
      >
        {description}
      </p>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistic Card                                                             */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  accent: "neutral" | "orange" | "purple" | "dark";
}) {
  const accentStyles = {
    neutral: {
      dot: "bg-[#8b8175]",
      value: "text-[#171512]",
    },
    orange: {
      dot: "bg-[#a95d2c]",
      value: "text-[#9b5425]",
    },
    purple: {
      dot: "bg-[#7556a8]",
      value: "text-[#62428f]",
    },
    dark: {
      dot: "bg-[#171512]",
      value: "text-[#171512]",
    },
  };

  return (
    <div className="group rounded-[24px] border border-[#e8e2d9] bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#d9c9ba] hover:shadow-[0_16px_40px_rgba(23,21,18,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b8175]">
          {label}
        </p>

        <span
          className={`h-2 w-2 rounded-full ${accentStyles[accent].dot}`}
        />
      </div>

      <p
        className={`mt-5 break-words text-2xl font-semibold tracking-[-0.04em] sm:text-3xl ${accentStyles[accent].value}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#948b80]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Management Card                                                            */
/* -------------------------------------------------------------------------- */

function ManagementCard({
  href,
  eyebrow,
  title,
  description,
  icon,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-[#e8e2d9] bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#d9c9ba] hover:shadow-[0_16px_40px_rgba(23,21,18,0.06)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b5425]">
            {eyebrow}
          </p>

          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#81786d]">
            {description}
          </p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3efe8] text-lg font-semibold text-[#9b5425] transition group-hover:bg-[#9b5425] group-hover:text-white">
          {icon}
        </span>
      </div>

      <div className="mt-5 flex items-center text-xs font-semibold text-[#9b5425]">
        Buka halaman
        <span className="ml-2 transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Order Status                                                               */
/* -------------------------------------------------------------------------- */

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
    pending: "bg-[#fff4df] text-[#9a651d]",
    confirmed: "bg-[#edf4ff] text-[#35649a]",
    preparing: "bg-[#f3edff] text-[#7045a4]",
    ready: "bg-[#eef0ff] text-[#4f5fa6]",
    completed: "bg-[#edf7ef] text-[#39734a]",
    cancelled: "bg-[#fff0ef] text-[#a34c47]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
        classes[status] ?? "bg-[#f1efeb] text-[#6f675d]"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Date Formatter                                                             */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}