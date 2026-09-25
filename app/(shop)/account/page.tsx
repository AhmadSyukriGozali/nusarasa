import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
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
  created_at: string;
};

type OrderStatistic = {
  id: string;
  total: number;
  status: string;
};

export default async function AccountPage() {
  const supabase = await createClient();

  // =====================================================
  // CEK LOGIN
  // =====================================================

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  // =====================================================
  // AMBIL PROFILE
  // =====================================================

  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      `
        full_name,
        email,
        phone,
        role,
        avatar_url
      `
    )
    .eq("id", userId)
    .single();

  if (profileError || !profileData) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Profil tidak ditemukan
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Data profil pengguna tidak tersedia.
              Silakan coba login kembali.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Login Kembali
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const profile = profileData as Profile;

  // =====================================================
  // AMBIL SEMUA PESANAN UNTUK STATISTIK
  // =====================================================

  const {
    data: statisticsData,
    error: statisticsError,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        total,
        status
      `
    )
    .eq("customer_id", userId);

  const allOrders: OrderStatistic[] =
    (statisticsData as OrderStatistic[] | null) ?? [];

  // =====================================================
  // AMBIL 1 PESANAN TERBARU UNTUK DITAMPILKAN
  // =====================================================

  const {
    data: latestOrdersData,
    error: latestOrdersError,
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
    })
    .limit(1);

  const latestOrders: Order[] =
    (latestOrdersData as Order[] | null) ?? [];

  // =====================================================
  // STATISTIK
  // =====================================================

  const totalOrders = allOrders.length;

  const completedOrders = allOrders.filter(
    (order) =>
      order.status === "completed"
  ).length;

  const activeOrders = allOrders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "confirmed" ||
      order.status === "preparing" ||
      order.status === "ready"
  ).length;

  const totalSpent = allOrders
    .filter(
      (order) =>
        order.status !== "cancelled"
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.total),
      0
    );

  // =====================================================
  // ERROR LOG
  // =====================================================

  if (statisticsError) {
    console.error(
      "Gagal mengambil statistik pesanan:",
      statisticsError
    );
  }

  if (latestOrdersError) {
    console.error(
      "Gagal mengambil pesanan terbaru:",
      latestOrdersError
    );
  }

  // =====================================================
  // USER DISPLAY
  // =====================================================

  const displayName =
    profile.full_name ||
    profile.email ||
    "Pengguna";

  const avatarInitial =
    displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
            NusaRasa
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Akun Saya
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
            Kelola informasi akun dan pantau
            pesanan kamu dari satu tempat.
          </p>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Profil
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Informasi Akun
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informasi dasar akun NusaRasa kamu.
                </p>
              </div>

              {/* PENGATURAN AKUN */}

              <Link
                href="/account/settings"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543.826 3.31-.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543-.826-3.31.37-2.37.996.607 2.296.07 2.572-1.065z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>

                Pengaturan Akun
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* AVATAR */}

              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-2xl font-bold text-white">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
              </div>

              {/* USER INFO */}

              <div className="min-w-0">
                <h3 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                    {profile.role}
                  </span>

                  {profile.email && (
                    <span className="break-all text-sm text-gray-500">
                      {profile.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PROFILE DETAILS */}

            <div className="mt-8 grid gap-5 border-t border-gray-100 pt-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">
                  Nama Lengkap
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {profile.full_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-gray-900">
                  {profile.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Nomor Telepon
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {profile.phone || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Sedang Diproses
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {activeOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Semua Pesanan aktif
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pesanan Selesai
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {completedOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Semua Pesanan selesai
            </p>
          </div>

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
            ORDER HISTORY
        ================================================= */}

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Riwayat
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Pesanan Saya
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Menampilkan pesanan terbaru kamu.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* LIHAT SEMUA PESANAN */}

              <Link
                href="/account/orders"
                className="inline-flex w-fit rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
              >
                Lihat Semua Pesanan
              </Link>

              {/* BELANJA LAGI */}

              <Link
                href="/products"
                className="inline-flex w-fit rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Belanja Lagi
              </Link>
            </div>
          </div>

          {/* ERROR */}

          {latestOrdersError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-800">
                Gagal mengambil pesanan terbaru
              </p>

              <p className="mt-2 text-sm leading-6 text-red-700">
                Silakan refresh halaman dan coba
                lagi.
              </p>
            </div>
          ) : latestOrders.length === 0 ? (
            /* EMPTY */

            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                🛒
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Belum ada pesanan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Kamu belum memiliki pesanan.
                Yuk pilih produk favoritmu dan
                lakukan checkout.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            /* PESANAN TERBARU */

            <div className="mt-6">
              {latestOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* ORDER */}

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
                        {formatDate(
                          order.created_at
                        )}
                      </p>
                    </div>

                    {/* SUMMARY */}

                    <div className="grid grid-cols-2 gap-8 sm:flex sm:items-center">
                      <div>
                        <p className="text-xs text-gray-400">
                          Pembayaran
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
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

                      <div className="sm:text-right">
                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-900">
                          {formatRupiah(
                            Number(order.total)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm font-medium text-gray-500">
                      Lihat detail pesanan
                    </span>

                    <span className="text-sm font-semibold text-gray-900 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mt-10 overflow-hidden rounded-3xl bg-black p-7 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
            NusaRasa
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Mau belanja lagi?
          </h2>

          <p className="mt-3 max-w-xl leading-7 text-gray-300">
            Temukan produk lokal pilihan dan buat
            pesanan baru dengan mudah.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Lihat Produk
            </Link>

            <Link
              href="/cart"
              className="rounded-xl border border-gray-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              Buka Keranjang
            </Link>
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
// STATUS PESANAN
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
// FORMAT TANGGAL
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
// FORMAT PAYMENT METHOD
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
// FORMAT PAYMENT STATUS
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
