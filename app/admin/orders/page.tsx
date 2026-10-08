import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  /*
   * Ambil semua pesanan.
   *
   * RLS admin akan memastikan hanya admin
   * yang dapat melihat seluruh order.
   */
  const {
    data: orders,
    error,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        customer_name,
        customer_phone,
        total,
        status,
        payment_method,
        payment_status,
        created_at
      `
    )
    .order("created_at", {
      ascending: false,
    });

  const totalOrders = orders?.length ?? 0;

  const pendingCount =
    orders?.filter((order) => order.status === "pending").length ?? 0;

  const processingCount =
    orders?.filter(
      (order) =>
        order.status === "confirmed" ||
        order.status === "preparing" ||
        order.status === "ready"
    ).length ?? 0;

  const completedCount =
    orders?.filter((order) => order.status === "completed").length ?? 0;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* Header */}
      <header className="border-b border-[#e8e2d9] bg-[#f7f5f0]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9b5425]">
                NusaRasa Admin
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Pesanan
              </h1>
            </div>

            <Link
              href="/admin"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#dcd5ca] bg-white px-4 py-2 text-sm font-medium text-[#171512] transition hover:border-[#c8beb0] hover:bg-[#fdfcf9]"
            >
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-[#817a70]"
        >
          <Link
            href="/admin"
            className="transition hover:text-[#9b5425]"
          >
            Dashboard
          </Link>

          <span aria-hidden="true">/</span>

          <span className="font-medium text-[#171512]">
            Pesanan
          </span>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#171512] px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#c27336]/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#9b5425]/10 blur-3xl"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/65">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c27336]" />
                Order Management
              </div>

              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Kelola setiap pesanan dengan lebih teratur.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                Pantau pesanan pelanggan, status proses, dan pembayaran
                NusaRasa dari satu tempat.
              </p>
            </div>

            <div className="lg:text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                Total Pesanan
              </p>

              <p className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
                {totalOrders}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        {!error && orders && orders.length > 0 && (
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Semua Pesanan"
              value={totalOrders}
              description="Total order tercatat"
              icon="◉"
            />

            <StatCard
              label="Menunggu"
              value={pendingCount}
              description="Perlu segera diproses"
              icon="◷"
              accent
            />

            <StatCard
              label="Sedang Diproses"
              value={processingCount}
              description="Dalam alur pengerjaan"
              icon="↗"
            />

            <StatCard
              label="Selesai"
              value={completedCount}
              description="Pesanan telah selesai"
              icon="✓"
            />
          </section>
        )}

        {/* Section heading */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9b5425]">
              Order List
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Semua Pesanan
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#746d63]">
              Pesanan terbaru ditampilkan terlebih dahulu.
            </p>
          </div>

          {orders && orders.length > 0 && !error && (
            <div className="inline-flex w-fit items-center rounded-full border border-[#ded7cd] bg-white px-3.5 py-2 text-xs font-medium text-[#6f685f]">
              {orders.length} pesanan
            </div>
          )}
        </div>

        {/* Error */}
        {error ? (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#e9c7c2] bg-[#fff7f6]">
            <div className="flex gap-4 p-6 sm:p-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f5dfdb] text-lg">
                !
              </div>

              <div>
                <h3 className="font-semibold text-[#8d3028]">
                  Gagal mengambil pesanan.
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#a54d45]">
                  Silakan refresh halaman atau periksa koneksi database.
                </p>
              </div>
            </div>
          </div>
        ) : !orders || orders.length === 0 ? (
          /* Empty state */
          <div className="mt-6 overflow-hidden rounded-[28px] border border-[#e5dfd6] bg-white">
            <div className="px-6 py-16 text-center sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f1ede6] text-2xl">
                📦
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9b5425]">
                Belum Ada Order
              </p>

              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                Belum ada pesanan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777067]">
                Pesanan pelanggan akan muncul di halaman ini setelah
                checkout berhasil dilakukan.
              </p>

              <Link
                href="/admin"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#171512] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#292723]"
              >
                Kembali ke Dashboard
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop orders table */}
            <section className="mt-6 hidden overflow-hidden rounded-[28px] border border-[#e5dfd6] bg-white lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px]">
                  <thead>
                    <tr className="border-b border-[#ebe6de] bg-[#faf8f4]">
                      <th className="px-6 py-4 text-left">
                        <TableHeading>Pesanan</TableHeading>
                      </th>

                      <th className="px-6 py-4 text-left">
                        <TableHeading>Customer</TableHeading>
                      </th>

                      <th className="px-6 py-4 text-left">
                        <TableHeading>Total</TableHeading>
                      </th>

                      <th className="px-6 py-4 text-left">
                        <TableHeading>Pembayaran</TableHeading>
                      </th>

                      <th className="px-6 py-4 text-left">
                        <TableHeading>Status</TableHeading>
                      </th>

                      <th className="px-6 py-4 text-right">
                        <TableHeading>Aksi</TableHeading>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eee9e1]">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="group transition-colors hover:bg-[#fcfaf7]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="block"
                          >
                            <p className="font-semibold text-[#171512] transition group-hover:text-[#9b5425]">
                              {order.order_number}
                            </p>

                            <p className="mt-1 text-xs text-[#8a8379]">
                              {formatDate(order.created_at)}
                            </p>
                          </Link>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium text-[#28251f]">
                            {order.customer_name || "Customer"}
                          </p>

                          <p className="mt-1 text-xs text-[#8a8379]">
                            {order.customer_phone || "Nomor tidak tersedia"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#171512]">
                            {formatRupiah(Number(order.total))}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-[#28251f]">
                            {formatPaymentMethod(order.payment_method)}
                          </p>

                          <div className="mt-1">
                            <PaymentStatus
                              status={order.payment_status}
                            />
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <OrderStatus status={order.status} />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[#dcd5ca] bg-white px-4 py-2 text-xs font-semibold text-[#171512] transition hover:border-[#c27336] hover:text-[#9b5425]"
                          >
                            Lihat Detail
                            <span
                              aria-hidden="true"
                              className="transition-transform group-hover:translate-x-0.5"
                            >
                              →
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#ebe6de] bg-[#faf8f4] px-6 py-4">
                <p className="text-xs text-[#817a70]">
                  Menampilkan seluruh pesanan
                </p>

                <p className="text-xs font-semibold text-[#171512]">
                  {orders.length} pesanan
                </p>
              </div>
            </section>

            {/* Mobile order cards */}
            <section className="mt-6 space-y-3 lg:hidden">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="group block overflow-hidden rounded-[24px] border border-[#e5dfd6] bg-white transition hover:-translate-y-0.5 hover:border-[#d7cbbd] hover:shadow-[0_14px_40px_rgba(35,27,18,0.07)]"
                >
                  <div className="p-5">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9b5425]">
                          Order
                        </p>

                        <p className="mt-1 truncate font-semibold text-[#171512]">
                          {order.order_number}
                        </p>

                        <p className="mt-1 text-xs text-[#8a8379]">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <OrderStatus status={order.status} />
                    </div>

                    {/* Customer */}
                    <div className="mt-5 border-t border-[#eee9e1] pt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a9389]">
                        Customer
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#28251f]">
                        {order.customer_name || "Customer"}
                      </p>

                      <p className="mt-0.5 text-xs text-[#817a70]">
                        {order.customer_phone || "Nomor tidak tersedia"}
                      </p>
                    </div>

                    {/* Bottom information */}
                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#eee9e1] pt-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a9389]">
                          Total
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#171512]">
                          {formatRupiah(Number(order.total))}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a9389]">
                          Pembayaran
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#28251f]">
                          {formatPaymentMethod(order.payment_method)}
                        </p>

                        <div className="mt-1">
                          <PaymentStatus
                            status={order.payment_status}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detail action */}
                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#faf8f4] px-4 py-3">
                      <span className="text-xs font-medium text-[#777067]">
                        Buka detail pesanan
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171512] text-sm text-white transition group-hover:bg-[#9b5425]">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              <div className="rounded-[20px] border border-[#e5dfd6] bg-white px-5 py-4 text-center">
                <p className="text-xs text-[#817a70]">
                  Menampilkan seluruh{" "}
                  <span className="font-semibold text-[#171512]">
                    {orders.length} pesanan
                  </span>
                </p>
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e4ded5] pt-6 pb-4">
          <div className="flex flex-col gap-2 text-xs text-[#8a8379] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} NusaRasa Admin
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/admin/products"
                className="transition hover:text-[#9b5425]"
              >
                Produk
              </Link>

              <Link
                href="/admin/categories"
                className="transition hover:text-[#9b5425]"
              >
                Kategori
              </Link>

              <Link
                href="/"
                className="transition hover:text-[#9b5425]"
              >
                Lihat Toko
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* UI helpers                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  description,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-[#e5dfd6] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(35,27,18,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm ${
            accent
              ? "bg-[#f3e2d4] text-[#9b5425]"
              : "bg-[#f1ede6] text-[#6f685f]"
          }`}
        >
          {icon}
        </div>

        <span className="text-2xl font-semibold tracking-tight text-[#171512]">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-[#28251f]">
        {label}
      </p>

      <p className="mt-1 text-xs text-[#8a8379]">
        {description}
      </p>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8379]">
      {children}
    </span>
  );
}

function OrderStatus({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
      dot: string;
    }
  > = {
    pending: {
      label: "Menunggu",
      className: "bg-[#fff3dc] text-[#99691f]",
      dot: "bg-[#d39b38]",
    },

    confirmed: {
      label: "Dikonfirmasi",
      className: "bg-[#e7f0f8] text-[#3e6585]",
      dot: "bg-[#5e89ac]",
    },

    preparing: {
      label: "Diproses",
      className: "bg-[#eee8f5] text-[#72548f]",
      dot: "bg-[#8969a6]",
    },

    ready: {
      label: "Siap",
      className: "bg-[#e8eef8] text-[#506d98]",
      dot: "bg-[#6484b4]",
    },

    completed: {
      label: "Selesai",
      className: "bg-[#e5f2e8] text-[#477652]",
      dot: "bg-[#5d9a69]",
    },

    cancelled: {
      label: "Dibatalkan",
      className: "bg-[#f9e5e2] text-[#9b443b]",
      dot: "bg-[#c45e54]",
    },
  };

  const item = config[status];

  if (!item) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[#f0ede8] px-3 py-1.5 text-xs font-semibold text-[#686158]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#8b8378]" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${item.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function PaymentStatus({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    unpaid: {
      label: "Belum dibayar",
      className: "text-[#99691f]",
    },

    pending: {
      label: "Menunggu pembayaran",
      className: "text-[#8a6530]",
    },

    paid: {
      label: "Dibayar",
      className: "text-[#477652]",
    },

    failed: {
      label: "Gagal",
      className: "text-[#a34b43]",
    },
  };

  const item = config[status];

  return (
    <span
      className={`text-[11px] font-medium ${
        item?.className ?? "text-[#817a70]"
      }`}
    >
      {item?.label ?? status}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}