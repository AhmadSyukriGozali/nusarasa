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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-gray-500">
              NusaRasa
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Pesanan
            </h1>
          </div>

          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/admin"
              className="text-gray-600 transition hover:text-black"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="text-gray-600 transition hover:text-black"
            >
              Produk
            </Link>

            <Link
              href="/admin/orders"
              className="font-semibold text-black"
            >
              Pesanan
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page intro */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Order Management
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Semua Pesanan
          </h2>

          <p className="mt-2 max-w-2xl text-gray-600">
            Pantau dan proses pesanan pelanggan NusaRasa.
          </p>
        </div>

        {/* Error */}
        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-800">
              Gagal mengambil pesanan.
            </p>

            <p className="mt-1 text-sm text-red-600">
              Silakan refresh halaman atau periksa koneksi database.
            </p>
          </div>
        ) : !orders || orders.length === 0 ? (
          /* Empty state */
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <span className="text-xl">📦</span>
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Belum ada pesanan
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Pesanan pelanggan akan muncul di halaman ini.
            </p>
          </div>
        ) : (
          /* Orders */
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Pesanan
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Pembayaran
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-gray-900">
                          {order.order_number}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-900">
                          {order.customer_name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.customer_phone}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold text-gray-900">
                          {formatRupiah(
                            Number(order.total)
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPaymentMethod(
                            order.payment_method
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatPaymentStatus(
                            order.payment_status
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <OrderStatus
                          status={order.status}
                        />
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Total {orders.length} pesanan
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
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
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
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

function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}

function formatPaymentStatus(value: string) {
  const labels: Record<string, string> = {
    unpaid: "Belum dibayar",
    pending: "Menunggu pembayaran",
    paid: "Dibayar",
    failed: "Gagal",
  };

  return labels[value] ?? value;
}