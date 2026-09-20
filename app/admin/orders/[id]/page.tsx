import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

type AdminOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  /*
   * Ambil detail order.
   *
   * Authorization tetap bergantung pada RLS
   * yang sudah kita buat sebelumnya.
   */
  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        customer_name,
        customer_phone,
        delivery_address,
        notes,
        subtotal,
        discount,
        delivery_fee,
        total,
        status,
        payment_method,
        payment_status,
        created_at,
        updated_at
      `
    )
    .eq("id", id)
    .single();

  if (orderError || !order) {
    notFound();
  }

  /*
   * Ambil item pesanan.
   */
  const {
    data: orderItems,
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-gray-500">
              NusaRasa
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Detail Pesanan
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Back */}
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-gray-500 transition hover:text-black"
        >
          ← Kembali ke Pesanan
        </Link>

        {/* Order Header */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
              Order
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {order.order_number}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Dibuat {formatDate(order.created_at)}
            </p>
          </div>

          <OrderStatus status={order.status} />
        </div>

        {/* Status Management */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Status Pesanan
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Kelola progres pesanan customer.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {order.status === "pending" && (
              <>
                <StatusButton
                  orderId={order.id}
                  status="confirmed"
                  label="Konfirmasi Pesanan"
                />

                <StatusButton
                  orderId={order.id}
                  status="cancelled"
                  label="Batalkan Pesanan"
                  danger
                />
              </>
            )}

            {order.status === "confirmed" && (
              <>
                <StatusButton
                  orderId={order.id}
                  status="preparing"
                  label="Mulai Diproses"
                />

                <StatusButton
                  orderId={order.id}
                  status="cancelled"
                  label="Batalkan Pesanan"
                  danger
                />
              </>
            )}

            {order.status === "preparing" && (
              <StatusButton
                orderId={order.id}
                status="ready"
                label="Tandai Siap"
              />
            )}

            {order.status === "ready" && (
              <StatusButton
                orderId={order.id}
                status="completed"
                label="Selesaikan Pesanan"
              />
            )}

            {order.status === "completed" && (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                Pesanan sudah selesai.
              </p>
            )}

            {order.status === "cancelled" && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                Pesanan telah dibatalkan.
              </p>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Customer */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer
            </h3>

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
                  Alamat Pengiriman
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

          {/* Items */}
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Produk Pesanan
            </h3>

            {orderItemsError ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  Gagal mengambil item pesanan.
                </p>
              </div>
            ) : !orderItems ||
              orderItems.length === 0 ? (
              <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-500">
                  Tidak ada produk dalam pesanan.
                </p>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-gray-100">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div>
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

                    <p className="font-semibold text-gray-900">
                      {formatRupiah(
                        Number(item.subtotal)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Payment */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Ringkasan Pembayaran
          </h3>

          <div className="mt-6 max-w-lg space-y-3">
            <SummaryRow
              label="Subtotal"
              value={formatRupiah(
                Number(order.subtotal)
              )}
            />

            <SummaryRow
              label="Diskon"
              value={formatRupiah(
                Number(order.discount)
              )}
            />

            <SummaryRow
              label="Biaya Pengiriman"
              value={formatRupiah(
                Number(order.delivery_fee)
              )}
            />

            <div className="border-t border-gray-100 pt-4">
              <SummaryRow
                label="Total"
                value={formatRupiah(
                  Number(order.total)
                )}
                bold
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Metode Pembayaran
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {formatPaymentMethod(
                  order.payment_method
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status Pembayaran
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {formatPaymentStatus(
                  order.payment_status
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
 * Server Action untuk mengubah status.
 *
 * Catatan:
 * Kita menggunakan endpoint internal agar perubahan
 * status tidak dilakukan langsung dari browser.
 */
function StatusButton({
  orderId,
  status,
  label,
  danger = false,
}: {
  orderId: string;
  status: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <form
      action="/api/admin/orders/status"
      method="POST"
    >
      <input
        type="hidden"
        name="order_id"
        value={orderId}
      />

      <input
        type="hidden"
        name="status"
        value={status}
      />

      <button
        type="submit"
        className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
          danger
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span
        className={
          bold
            ? "font-semibold text-gray-900"
            : "text-sm text-gray-500"
        }
      >
        {label}
      </span>

      <span
        className={
          bold
            ? "font-bold text-gray-900"
            : "text-sm font-medium text-gray-900"
        }
      >
        {value}
      </span>
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