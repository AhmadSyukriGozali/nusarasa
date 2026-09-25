import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/logout-button";
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
    data: profile,
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

  // =====================================================
  // PROFILE TIDAK DITEMUKAN
  // =====================================================

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight"
            >
              NusaRasa
            </Link>

            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Produk
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-800">
              Profil tidak ditemukan
            </h1>

            <p className="mt-2 text-sm text-red-700">
              Data profil pengguna tidak tersedia.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // AMBIL PESANAN USER
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
  // STATISTIK SEDERHANA
  // =====================================================

  const totalOrders = orders.length;

  const completedOrders = orders.filter(
    (order) =>
      order.status === "completed"
  ).length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "confirmed" ||
      order.status === "preparing" ||
      order.status === "ready"
  ).length;

  const totalSpent = orders
    .filter(
      (order) =>
        order.status !== "cancelled"
    )
    .reduce(
      (total, order) =>
        total + Number(order.total),
      0
    );

  // =====================================================
  // USER DISPLAY
  // =====================================================

  const displayName =
    profile.full_name ||
    profile.email ||
    "Pengguna";

  const avatarInitial =
    displayName.charAt(0).toUpperCase();

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          {/* LOGO */}

          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            NusaRasa
          </Link>

          {/* NAVIGATION */}

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="hidden text-gray-600 transition hover:text-black sm:block"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="hidden text-gray-600 transition hover:text-black sm:block"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="text-gray-600 transition hover:text-black"
            >
              Keranjang
            </Link>

            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="hidden rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800 sm:block"
              >
                Admin
              </Link>
            )}

            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            NusaRasa
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Akun Saya
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Kelola informasi akun dan pantau semua
            pesanan kamu dari satu tempat.
          </p>
        </div>

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
            <h2 className="font-semibold text-gray-900">
              Informasi Akun
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Informasi dasar akun NusaRasa kamu.
            </p>
          </div>

          <div className="p-6">
            {/* PROFILE HEADER */}

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

              {/* NAME */}

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                    {profile.role}
                  </span>

                  {profile.email && (
                    <span className="text-sm text-gray-500">
                      {profile.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PROFILE DETAILS */}

            <div className="mt-8 grid gap-5 border-t border-gray-100 pt-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* NAME */}

              <div>
                <p className="text-sm text-gray-500">
                  Nama Lengkap
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {profile.full_name || "-"}
                </p>
              </div>

              {/* EMAIL */}

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-gray-900">
                  {profile.email || "-"}
                </p>
              </div>

              {/* PHONE */}

              <div>
                <p className="text-sm text-gray-500">
                  Nomor Telepon
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {profile.phone || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ORDER STATISTICS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL ORDERS */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
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

          {/* PENDING */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Sedang Diproses
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pendingOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Pesanan aktif
            </p>
          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pesanan Selesai
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {completedOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Pesanan selesai
            </p>
          </div>

          {/* SPENDING */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
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
        </section>

        {/* =================================================
            ORDER HISTORY
        ================================================= */}

        <section className="mt-10">
          {/* SECTION HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Riwayat
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Pesanan Saya
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Semua pesanan yang pernah kamu buat.
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
              <h3 className="font-semibold text-red-800">
                Gagal mengambil riwayat pesanan
              </h3>

              <p className="mt-2 text-sm text-red-600">
                Silakan refresh halaman dan coba lagi.
              </p>
            </div>
          ) : orders.length === 0 ? (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="mt-6 rounded-3xl bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                🛒
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
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
            /* =================================================
               ORDER LIST
            ================================================= */

            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group block rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* ORDER INFO */}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-gray-900">
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

                    {/* ORDER SUMMARY */}

                    <div className="grid grid-cols-2 gap-6 sm:flex sm:items-center">
                      {/* PAYMENT */}

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

                      {/* TOTAL */}

                      <div className="sm:text-right">
                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-900">
                          {formatRupiah(
                            Number(
                              order.total
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DETAIL */}

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

        <section className="mt-10 rounded-3xl bg-black p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
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
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                NusaRasa
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Platform digital untuk UMKM lokal.
              </p>
            </div>

            <div className="flex gap-5 text-sm text-gray-500">
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

          <div className="mt-6 border-t border-gray-100 pt-5 text-xs text-gray-400">
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
  const statusLabel: Record<
    string,
    string
  > = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    preparing: "Diproses",
    ready: "Siap",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  const statusClass: Record<
    string,
    string
  > = {
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
        statusClass[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {statusLabel[status] ?? status}
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
  const labels: Record<
    string,
    string
  > = {
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
  const labels: Record<
    string,
    string
  > = {
    unpaid: "Belum dibayar",
    pending: "Menunggu pembayaran",
    paid: "Dibayar",
    failed: "Gagal",
  };

  return labels[value] ?? value;
}