import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import LogoutButton from "@/components/auth/logout-button";

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
    .gte(
      "created_at",
      startOfToday.toISOString()
    )
    .neq("status", "cancelled");

  /*
   * Hitung jumlah order hari ini.
   */
  const todayOrderCount =
    todayOrders?.length ?? 0;

  /*
   * Hitung pendapatan hari ini.
   */
  const todayRevenue =
    todayOrders?.reduce(
      (total, order) =>
        total + Number(order.total),
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
    ordersError ||
    recentOrdersError;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-gray-500">
              NusaRasa
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Pantau produk, pesanan, dan operasional UMKM.
            </p>
          </div>

          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Error */}
        {hasError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-800">
              Sebagian data dashboard gagal dimuat.
            </p>

            <p className="mt-1 text-sm text-red-600">
              Periksa koneksi database dan RLS Supabase.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Kelola Produk
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
          >
            Kelola Pesanan
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            label="Total Produk"
            value={String(totalProducts ?? 0)}
            description="Produk yang tersimpan di katalog"
          />

          <StatCard
            label="Pesanan Hari Ini"
            value={String(todayOrderCount)}
            description="Tidak termasuk pesanan dibatalkan"
          />

          <StatCard
            label="Pendapatan Hari Ini"
            value={formatRupiah(todayRevenue)}
            description="Total order hari ini"
          />
        </div>

        {/* Recent Orders */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pesanan Terbaru
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Lima pesanan terakhir yang masuk.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-gray-900 hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          {!recentOrders ||
          recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-500">
                Belum ada pesanan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.order_number}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {order.customer_name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatRupiah(
                          Number(order.total)
                        )}
                      </p>

                      <OrderStatus
                        status={order.status}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

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
      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        classes[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}