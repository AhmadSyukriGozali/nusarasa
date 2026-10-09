import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

import type { Metadata } from "next";

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

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return {
      title: "Detail Pesanan",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `Detail Pesanan ${data.order_number}`,
    description:
      "Lihat detail dan status pesananmu melalui akun NusaRasa.",
    robots: {
      index: false,
      follow: false,
    },
  };
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
    (orderItemsData as OrderItem[] | null) ?? [];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="border-b border-[#171512]/10 bg-[#f7f5f0]">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
          <Link
            href="/account/orders"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[#171512]/55 transition hover:text-[#9b5425]"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            Kembali ke riwayat pesanan
          </Link>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-[#9b5425]/20 bg-[#9b5425]/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
                  Detail Pesanan
                </span>

                <span className="text-xs font-medium text-[#171512]/40">
                  {formatDate(order.created_at)}
                </span>
              </div>

              <h1 className="mt-5 break-all text-3xl font-semibold tracking-[-0.04em] text-[#171512] sm:text-4xl lg:text-5xl">
                {order.order_number}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#171512]/55 sm:text-base">
                Berikut detail lengkap pesanan Anda, mulai dari
                produk, pembayaran, hingga informasi pengiriman.
              </p>
            </div>

            <div className="lg:pb-1">
              <OrderStatus status={order.status} />
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* =================================================
            STATUS OVERVIEW
        ================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-[#171512]/10 bg-[#171512] text-white shadow-[0_20px_60px_rgba(23,21,18,0.10)]">
          <div className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-6 sm:p-7">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Status Pesanan
              </p>

              <div className="mt-4">
                <OrderStatus status={order.status} dark />
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Pembayaran
              </p>

              <p className="mt-4 font-semibold text-white">
                {formatPaymentMethod(order.payment_method)}
              </p>

              <p className="mt-1 text-sm text-white/50">
                {formatPaymentStatus(order.payment_status)}
              </p>
            </div>

            <div className="p-6 sm:p-7">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                Total Pesanan
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#d99561] sm:text-3xl">
                {formatRupiah(Number(order.total))}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              ORDER ITEMS
          ================================================= */}

          <section className="rounded-[2rem] border border-[#171512]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
                  Pesanan
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  Produk Pesanan
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#171512]/50">
                  Produk yang termasuk dalam pesanan ini.
                </p>
              </div>

              <div className="text-sm font-medium text-[#171512]/40">
                {items.length} produk
              </div>
            </div>

            {orderItemsError ? (
              <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-800">
                  Gagal mengambil produk pesanan
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  Detail produk tidak dapat ditampilkan saat ini.
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="mt-7 rounded-2xl border border-dashed border-[#171512]/15 bg-[#f7f5f0] p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  —
                </div>

                <p className="mt-4 text-sm font-medium text-[#171512]/55">
                  Tidak ada item pada pesanan ini.
                </p>
              </div>
            ) : (
              <div className="mt-7 divide-y divide-[#171512]/8">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0 sm:gap-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f5f0] text-sm font-bold text-[#9b5425]">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-[#171512]">
                            {item.product_name}
                          </p>

                          <p className="mt-1 text-sm text-[#171512]/45">
                            {formatRupiah(Number(item.price))} ×{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#171512]/35">
                            Subtotal
                          </p>

                          <p className="mt-1 font-semibold text-[#171512]">
                            {formatRupiah(
                              Number(item.subtotal)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =================================================
              CUSTOMER INFO
          ================================================= */}

          <section className="h-fit rounded-[2rem] border border-[#171512]/10 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
              Pengiriman
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Informasi Pengiriman
            </h2>

            <div className="mt-7 space-y-6">
              <DetailField
                label="Nama"
                value={order.customer_name}
              />

              <DetailField
                label="Nomor Telepon"
                value={order.customer_phone}
              />

              <DetailField
                label="Alamat"
                value={order.delivery_address}
                multiline
              />

              {order.notes && (
                <DetailField
                  label="Catatan"
                  value={order.notes}
                  multiline
                />
              )}
            </div>
          </section>
        </div>

        {/* =================================================
            PAYMENT SUMMARY
        ================================================= */}

        <section className="mt-6 rounded-[2rem] border border-[#171512]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
                Pembayaran
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                Ringkasan Pembayaran
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#171512]/50">
                Rincian biaya yang digunakan untuk pesanan ini.
              </p>
            </div>

            <div className="space-y-4">
              <PaymentRow
                label="Subtotal"
                value={formatRupiah(Number(order.subtotal))}
              />

              <PaymentRow
                label="Diskon"
                value={formatRupiah(Number(order.discount))}
              />

              <PaymentRow
                label="Biaya Pengiriman"
                value={formatRupiah(
                  Number(order.delivery_fee)
                )}
              />

              <div className="border-t border-[#171512]/10 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#171512]">
                      Total
                    </p>

                    <p className="mt-1 text-xs text-[#171512]/40">
                      Total pembayaran
                    </p>
                  </div>

                  <p className="text-2xl font-semibold tracking-[-0.03em] text-[#9b5425]">
                    {formatRupiah(Number(order.total))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ORDER TIMELINE
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#171512]/10 bg-white shadow-sm">
          <div className="border-b border-[#171512]/8 p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
              Status
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Perjalanan Pesanan
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#171512]/50">
              Ikuti perkembangan pesanan Anda dari awal hingga
              selesai.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="relative">
              <div className="hidden h-px bg-[#171512]/10 lg:absolute lg:left-8 lg:right-8 lg:top-5 lg:block" />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <OrderStep
                  number="01"
                  label="Menunggu"
                  active={isStatusReached(
                    order.status,
                    "pending"
                  )}
                  current={order.status === "pending"}
                />

                <OrderStep
                  number="02"
                  label="Dikonfirmasi"
                  active={isStatusReached(
                    order.status,
                    "confirmed"
                  )}
                  current={order.status === "confirmed"}
                />

                <OrderStep
                  number="03"
                  label="Diproses"
                  active={isStatusReached(
                    order.status,
                    "preparing"
                  )}
                  current={order.status === "preparing"}
                />

                <OrderStep
                  number="04"
                  label="Siap"
                  active={isStatusReached(
                    order.status,
                    "ready"
                  )}
                  current={order.status === "ready"}
                />

                <OrderStep
                  number="05"
                  label="Selesai"
                  active={isStatusReached(
                    order.status,
                    "completed"
                  )}
                  current={order.status === "completed"}
                />
              </div>

              {order.status === "cancelled" && (
                <div className="mt-4">
                  <OrderStep
                    number="!"
                    label="Pesanan Dibatalkan"
                    active
                    current
                    cancelled
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/account/orders"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#171512]/10 bg-white px-6 text-sm font-semibold text-[#171512] shadow-sm transition hover:-translate-y-0.5 hover:border-[#171512]/20 hover:shadow-md"
          >
            ← Pesanan Saya
          </Link>

          <Link
            href="/products"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#171512] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#29251f] hover:shadow-lg"
          >
            Belanja Lagi
          </Link>

          <Link
            href="/cart"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#171512]/10 bg-white px-6 text-sm font-semibold text-[#171512]/70 transition hover:-translate-y-0.5 hover:bg-[#f7f5f0]"
          >
            Buka Keranjang
          </Link>
        </section>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-8 border-t border-[#171512]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold tracking-tight text-[#171512]">
              NusaRasa
            </p>

            <p className="mt-1 text-sm text-[#171512]/45">
              Platform digital untuk UMKM lokal.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/"
              className="text-[#171512]/50 transition hover:text-[#9b5425]"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="text-[#171512]/50 transition hover:text-[#9b5425]"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="text-[#171512]/50 transition hover:text-[#9b5425]"
            >
              Keranjang
            </Link>

            <Link
              href="/account"
              className="font-medium text-[#171512] transition hover:text-[#9b5425]"
            >
              Akun
            </Link>
          </div>
        </div>

        <div className="border-t border-[#171512]/8">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-[#171512]/35 sm:px-6">
            © {new Date().getFullYear()} NusaRasa. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

// =======================================================
// DETAIL FIELD
// =======================================================

function DetailField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#171512]/35">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-medium leading-6 text-[#171512] ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// =======================================================
// PAYMENT ROW
// =======================================================

function PaymentRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[#171512]/50">{label}</span>

      <span className="font-medium text-[#171512]">
        {value}
      </span>
    </div>
  );
}

// =======================================================
// ORDER STATUS
// =======================================================

function OrderStatus({
  status,
  dark = false,
}: {
  status: string;
  dark?: boolean;
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
    pending: dark
      ? "border-yellow-300/20 bg-yellow-400/10 text-yellow-200"
      : "border-yellow-200 bg-yellow-50 text-yellow-800",

    confirmed: dark
      ? "border-blue-300/20 bg-blue-400/10 text-blue-200"
      : "border-blue-200 bg-blue-50 text-blue-800",

    preparing: dark
      ? "border-purple-300/20 bg-purple-400/10 text-purple-200"
      : "border-purple-200 bg-purple-50 text-purple-800",

    ready: dark
      ? "border-indigo-300/20 bg-indigo-400/10 text-indigo-200"
      : "border-indigo-200 bg-indigo-50 text-indigo-800",

    completed: dark
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-800",

    cancelled: dark
      ? "border-red-300/20 bg-red-400/10 text-red-200"
      : "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${
        classes[status] ??
        (dark
          ? "border-white/10 bg-white/5 text-white/70"
          : "border-[#171512]/10 bg-[#f7f5f0] text-[#171512]/60")
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "cancelled"
            ? "bg-red-500"
            : status === "completed"
              ? "bg-emerald-500"
              : "bg-[#d99561]"
        }`}
      />

      {labels[status] ?? status}
    </span>
  );
}

// =======================================================
// ORDER STEP
// =======================================================

function OrderStep({
  number,
  label,
  active,
  current,
  cancelled = false,
}: {
  number: string;
  label: string;
  active: boolean;
  current: boolean;
  cancelled?: boolean;
}) {
  return (
    <div className="relative z-10 rounded-2xl bg-white lg:bg-transparent">
      <div className="flex items-center gap-3 lg:flex-col lg:gap-3 lg:text-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
            current
              ? cancelled
                ? "border-red-500 bg-red-500 text-white"
                : "border-[#9b5425] bg-[#9b5425] text-white"
              : active
                ? "border-[#9b5425]/30 bg-[#f4e5da] text-[#9b5425]"
                : "border-[#171512]/10 bg-[#f7f5f0] text-[#171512]/30"
          }`}
        >
          {active && !current ? "✓" : number}
        </div>

        <div>
          <p
            className={`text-sm font-semibold ${
              current
                ? cancelled
                  ? "text-red-700"
                  : "text-[#9b5425]"
                : active
                  ? "text-[#171512]"
                  : "text-[#171512]/35"
            }`}
          >
            {label}
          </p>

          {current && (
            <p
              className={`mt-0.5 text-[11px] font-medium ${
                cancelled
                  ? "text-red-500"
                  : "text-[#9b5425]/65"
              }`}
            >
              Status saat ini
            </p>
          )}
        </div>
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