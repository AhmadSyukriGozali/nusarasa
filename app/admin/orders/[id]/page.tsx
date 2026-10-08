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
   * yang sudah dibuat sebelumnya.
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
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* Header */}
      <header className="border-b border-[#e8e2d9] bg-[#f7f5f0]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a95d2c]" />

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8b8175]">
                  NusaRasa Admin
                </p>
              </div>

              <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                Detail Pesanan
              </h1>
            </div>

            <Link
              href="/admin/orders"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#ded7cd] bg-white px-4 py-2.5 text-sm font-semibold text-[#514a42] transition hover:border-[#cfc1b2] hover:bg-[#faf8f4] hover:text-[#171512]"
            >
              <span>←</span>
              Kembali ke Pesanan
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#a1988d]">
          <Link
            href="/admin"
            className="transition hover:text-[#9b5425]"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            href="/admin/orders"
            className="transition hover:text-[#9b5425]"
          >
            Pesanan
          </Link>

          <span>/</span>

          <span className="text-[#6f675d]">
            {order.order_number}
          </span>
        </div>

        {/* Order Hero */}
        <section className="mt-5 overflow-hidden rounded-[28px] bg-[#171512]">
          <div className="relative px-6 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#9b5425]/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#c27336]/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d99561]">
                    Order
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <h2 className="break-all text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                      {order.order_number}
                    </h2>

                    <OrderStatus status={order.status} />
                  </div>

                  <p className="mt-3 text-sm text-white/45">
                    Dibuat {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 lg:min-w-[210px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Total Pesanan
                  </p>

                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                    {formatRupiah(Number(order.total))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Management */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white">
          <div className="border-b border-[#eee9e1] px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efe8] text-[#9b5425]">
                <span className="text-sm font-bold">01</span>
              </div>

              <div>
                <h3 className="font-semibold tracking-[-0.02em]">
                  Status Pesanan
                </h3>

                <p className="mt-0.5 text-sm text-[#81786d]">
                  Kelola progres pesanan customer.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-7">
            <OrderProgress status={order.status} />

            <div className="mt-7 flex flex-wrap gap-3">
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
                <div className="flex items-center gap-3 rounded-xl border border-[#d8eadb] bg-[#f0f8f1] px-4 py-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#39734a] text-xs text-white">
                    ✓
                  </span>

                  <p className="text-sm font-semibold text-[#39734a]">
                    Pesanan sudah selesai.
                  </p>
                </div>
              )}

              {order.status === "cancelled" && (
                <div className="flex items-center gap-3 rounded-xl border border-[#f0d6d4] bg-[#fff4f3] px-4 py-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#a34c47] text-xs text-white">
                    ×
                  </span>

                  <p className="text-sm font-semibold text-[#a34c47]">
                    Pesanan telah dibatalkan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Customer */}
          <section className="rounded-[28px] border border-[#e8e2d9] bg-white p-6 sm:p-7">
            <SectionHeading
              number="02"
              title="Customer"
              description="Informasi pelanggan dan pengiriman."
            />

            <div className="mt-7 space-y-6">
              <InfoItem
                label="Nama"
                value={order.customer_name}
              />

              <InfoItem
                label="Nomor Telepon"
                value={order.customer_phone}
              />

              <InfoItem
                label="Alamat Pengiriman"
                value={order.delivery_address}
                multiline
              />

              {order.notes && (
                <div className="border-t border-[#eee9e1] pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a1988d]">
                    Catatan
                  </p>

                  <div className="mt-3 rounded-2xl bg-[#f7f5f0] p-4">
                    <p className="whitespace-pre-line text-sm leading-6 text-[#625b52]">
                      {order.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Items */}
          <section className="rounded-[28px] border border-[#e8e2d9] bg-white p-6 sm:p-7 lg:col-span-2">
            <SectionHeading
              number="03"
              title="Produk Pesanan"
              description={
                orderItems && orderItems.length > 0
                  ? `${orderItems.length} item dalam pesanan.`
                  : "Daftar produk yang dipesan."
              }
            />

            {orderItemsError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-800">
                  Gagal mengambil item pesanan.
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  Silakan coba buka kembali halaman ini.
                </p>
              </div>
            ) : !orderItems || orderItems.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#f7f5f0] px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#a1988d]">
                  —
                </div>

                <p className="mt-4 text-sm font-semibold">
                  Tidak ada produk dalam pesanan.
                </p>

                <p className="mt-1 text-xs text-[#948b80]">
                  Item pesanan tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="mt-7 overflow-hidden rounded-2xl border border-[#eee9e1]">
                <div className="hidden border-b border-[#eee9e1] bg-[#faf8f4] px-5 py-3 sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a1988d]">
                    Produk
                  </p>

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a1988d]">
                    Jumlah
                  </p>

                  <p className="text-right text-[10px] font-bold uppercase tracking-[0.14em] text-[#a1988d]">
                    Subtotal
                  </p>
                </div>

                <div className="divide-y divide-[#eee9e1]">
                  {orderItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="px-5 py-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3efe8] text-[10px] font-bold text-[#8b8175]">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#171512]">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-xs text-[#8b8175]">
                              {formatRupiah(Number(item.price))}{" "}
                              / item
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:block sm:text-center">
                          <span className="text-xs text-[#a1988d] sm:hidden">
                            Jumlah
                          </span>

                          <span className="inline-flex min-w-8 justify-center rounded-lg bg-[#f7f5f0] px-2.5 py-1 text-xs font-bold text-[#5e574f]">
                            × {item.quantity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:block sm:min-w-[130px] sm:text-right">
                          <span className="text-xs text-[#a1988d] sm:hidden">
                            Subtotal
                          </span>

                          <p className="font-semibold text-[#171512]">
                            {formatRupiah(
                              Number(item.subtotal)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Payment Summary */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white">
          <div className="border-b border-[#eee9e1] px-6 py-5 sm:px-7">
            <SectionHeading
              number="04"
              title="Ringkasan Pembayaran"
              description="Rincian nilai transaksi dan metode pembayaran."
            />
          </div>

          <div className="grid gap-8 px-6 py-6 sm:px-7 lg:grid-cols-[1fr_320px]">
            {/* Payment Details */}
            <div>
              <div className="max-w-lg space-y-4">
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

                <div className="border-t border-[#eee9e1] pt-4">
                  <SummaryRow
                    label="Total"
                    value={formatRupiah(
                      Number(order.total)
                    )}
                    bold
                  />
                </div>
              </div>
            </div>

            {/* Payment Card */}
            <div className="rounded-2xl bg-[#f7f5f0] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a1988d]">
                Pembayaran
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs text-[#948b80]">
                    Metode Pembayaran
                  </p>

                  <p className="mt-1.5 font-semibold text-[#171512]">
                    {formatPaymentMethod(
                      order.payment_method
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#948b80]">
                    Status Pembayaran
                  </p>

                  <PaymentStatus
                    status={order.payment_status}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e5dfd6] pt-6 pb-4">
          <div className="flex flex-col gap-2 text-xs text-[#9a9186] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} NusaRasa
            </p>

            <p>Admin Panel · Detail Pesanan</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Heading                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3efe8] text-[10px] font-bold tracking-[0.08em] text-[#9b5425]">
        {number}
      </div>

      <div>
        <h3 className="font-semibold tracking-[-0.02em]">
          {title}
        </h3>

        <p className="mt-0.5 text-sm text-[#81786d]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Info Item                                                                  */
/* -------------------------------------------------------------------------- */

function InfoItem({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string | null;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a1988d]">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-medium text-[#2d2924] ${
          multiline
            ? "whitespace-pre-line leading-6"
            : ""
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Progress                                                            */
/* -------------------------------------------------------------------------- */

function OrderProgress({
  status,
}: {
  status: string;
}) {
  const steps = [
    {
      key: "pending",
      label: "Menunggu",
    },
    {
      key: "confirmed",
      label: "Dikonfirmasi",
    },
    {
      key: "preparing",
      label: "Diproses",
    },
    {
      key: "ready",
      label: "Siap",
    },
    {
      key: "completed",
      label: "Selesai",
    },
  ];

  const currentIndex = steps.findIndex(
    (step) => step.key === status
  );

  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-[#f0d6d4] bg-[#fff7f6] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a34c47] text-sm font-bold text-white">
            ×
          </span>

          <div>
            <p className="text-sm font-semibold text-[#8f413d]">
              Pesanan dibatalkan
            </p>

            <p className="mt-0.5 text-xs text-[#a34c47]/70">
              Proses pesanan telah dihentikan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[620px] items-start">
        {steps.map((step, index) => {
          const isCompleted =
            index < currentIndex;

          const isCurrent =
            index === currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-1 items-start"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                    isCompleted || isCurrent
                      ? "bg-[#9b5425] text-white"
                      : "bg-[#f1eee8] text-[#a1988d]"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                <p
                  className={`mt-2 text-[10px] font-bold uppercase tracking-[0.08em] ${
                    isCurrent
                      ? "text-[#9b5425]"
                      : isCompleted
                        ? "text-[#625b52]"
                        : "text-[#a1988d]"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mt-4 h-px flex-1 ${
                    index < currentIndex
                      ? "bg-[#9b5425]"
                      : "bg-[#e8e2d9]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Button                                                              */
/* -------------------------------------------------------------------------- */

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
        className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
          danger
            ? "border border-[#e9c9c6] bg-white text-[#a34c47] hover:border-[#dca7a3] hover:bg-[#fff5f4]"
            : "bg-[#171512] text-white hover:bg-[#2a2723]"
        }`}
      >
        {label}

        <span className="ml-3 text-base">
          →
        </span>
      </button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary Row                                                                */
/* -------------------------------------------------------------------------- */

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
    <div className="flex items-center justify-between gap-6">
      <span
        className={
          bold
            ? "font-semibold text-[#171512]"
            : "text-sm text-[#81786d]"
        }
      >
        {label}
      </span>

      <span
        className={
          bold
            ? "text-lg font-bold tracking-[-0.02em] text-[#171512]"
            : "text-sm font-medium text-[#2d2924]"
        }
      >
        {value}
      </span>
    </div>
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
    pending:
      "bg-[#fff0d6] text-[#9a651d]",
    confirmed:
      "bg-[#e8f1fb] text-[#35649a]",
    preparing:
      "bg-[#f0e8fb] text-[#7045a4]",
    ready:
      "bg-[#eaedff] text-[#4f5fa6]",
    completed:
      "bg-[#e5f3e8] text-[#39734a]",
    cancelled:
      "bg-[#fbe9e7] text-[#a34c47]",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
        classes[status] ??
        "bg-white/10 text-white/60"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Payment Status                                                             */
/* -------------------------------------------------------------------------- */

function PaymentStatus({
  status,
}: {
  status: string;
}) {
  const labels: Record<string, string> = {
    unpaid: "Belum dibayar",
    pending: "Menunggu pembayaran",
    paid: "Dibayar",
    failed: "Gagal",
  };

  const classes: Record<string, string> = {
    unpaid:
      "bg-[#fff0d6] text-[#9a651d]",
    pending:
      "bg-[#e8f1fb] text-[#35649a]",
    paid:
      "bg-[#e5f3e8] text-[#39734a]",
    failed:
      "bg-[#fbe9e7] text-[#a34c47]",
  };

  return (
    <span
      className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
        classes[status] ??
        "bg-[#ebe8e2] text-[#6f675d]"
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

/* -------------------------------------------------------------------------- */
/* Payment Method                                                             */
/* -------------------------------------------------------------------------- */

function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}