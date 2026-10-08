import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

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
      <main className="min-h-screen bg-[#f7f5f0] px-4 py-12 text-[#171512] sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] border border-red-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-bold text-red-600">
              !
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Profil tidak ditemukan
            </h1>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              Data profil pengguna tidak tersedia.
              Silakan coba login kembali.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-[#171512] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#302d29]"
              >
                Login Kembali
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
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
  // AMBIL 1 PESANAN TERBARU
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
    (order) => order.status === "completed"
  ).length;

  const activeOrders = allOrders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "confirmed" ||
      order.status === "preparing" ||
      order.status === "ready"
  ).length;

  const totalSpent = allOrders
    .filter((order) => order.status !== "cancelled")
    .reduce(
      (sum, order) => sum + Number(order.total),
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
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="border-b border-[#e8e3db]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd6cc] bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#8d8378]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a95d2c]" />
                NusaRasa Account
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                Halo, {displayName.split(" ")[0]}.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#716b63] sm:text-lg">
                Kelola profil, pantau pesanan, dan
                lanjutkan perjalanan kuliner kamu di
                NusaRasa.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#171512] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#302d29]"
              >
                Jelajahi Produk
                <span aria-hidden="true">↗</span>
              </Link>

              <Link
                href="/account/settings"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d9d2c9] bg-white px-5 py-3 text-sm font-semibold text-[#3b3732] transition hover:border-[#bfb7ac] hover:bg-[#faf9f7]"
              >
                Pengaturan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* =================================================
            PROFILE + STATISTICS
        ================================================= */}

        <div className="grid gap-5 lg:grid-cols-[1.05fr_1.95fr]">
          {/* PROFILE CARD */}

          <section className="overflow-hidden rounded-[2rem] border border-[#e4ded5] bg-white shadow-[0_8px_30px_rgba(23,21,18,0.04)]">
            <div className="border-b border-[#eee9e2] px-6 py-5 sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a19689]">
                    Profil
                  </p>

                  <h2 className="mt-1.5 text-lg font-bold">
                    Informasi Akun
                  </h2>
                </div>

                <Link
                  href="/account/settings"
                  aria-label="Edit profil"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4ded5] bg-[#faf9f7] text-[#716b63] transition hover:border-[#cfc7bd] hover:bg-[#f2eee8] hover:text-[#171512]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.5 1.5-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.5V19.5h-2.12v-.08a1.65 1.65 0 0 0-1-1.5 1.65 1.65 0 0 0-1.82.33l-.06.06-1.5-1.5.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.5-1H7.7v-2.12h.08a1.65 1.65 0 0 0 1.5-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.5-1.5.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.5V5.5h2.12v.08a1.65 1.65 0 0 0 1 1.5 1.65 1.65 0 0 0 1.82-.33l.06-.06 1.5 1.5-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.5 1h.08v2.12h-.08a1.65 1.65 0 0 0-1.5 1Z"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#171512] text-xl font-bold text-white">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-xl font-bold">
                    {displayName}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f2eee8] px-2.5 py-1 text-[11px] font-bold capitalize text-[#6f655a]">
                      {profile.role}
                    </span>

                    {profile.email && (
                      <span className="max-w-full truncate text-xs text-[#91887e]">
                        {profile.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-4 border-t border-[#eee9e2] pt-6">
                <ProfileField
                  label="Nama Lengkap"
                  value={profile.full_name}
                />

                <ProfileField
                  label="Email"
                  value={profile.email}
                />

                <ProfileField
                  label="Nomor Telepon"
                  value={profile.phone}
                />
              </div>
            </div>
          </section>

          {/* STATISTICS */}

          <section className="grid gap-4 sm:grid-cols-2">
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
        </div>

        {/* =================================================
            ORDER HISTORY
        ================================================= */}

        <section className="mt-10">
          <div className="flex flex-col gap-5 border-b border-[#ddd7ce] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a19689]">
                Riwayat
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
                Pesanan Terbaru
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#777067]">
                Pantau pesanan terakhir kamu di NusaRasa.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/account/orders"
                className="rounded-xl border border-[#d9d2c9] bg-white px-4 py-2.5 text-sm font-semibold text-[#3d3934] transition hover:border-[#bbb2a7] hover:bg-[#faf9f7]"
              >
                Semua Pesanan
              </Link>

              <Link
                href="/products"
                className="rounded-xl bg-[#171512] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#302d29]"
              >
                Belanja Lagi
              </Link>
            </div>
          </div>

          {/* ERROR */}

          {latestOrdersError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-[#fff8f7] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold text-red-600">
                  !
                </div>

                <div>
                  <p className="font-semibold text-red-800">
                    Gagal mengambil pesanan terbaru
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    Silakan refresh halaman dan coba lagi.
                  </p>
                </div>
              </div>
            </div>
          ) : latestOrders.length === 0 ? (
            /* EMPTY */

            <div className="mt-6 overflow-hidden rounded-[2rem] border border-dashed border-[#d6cfc5] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2eee8] text-2xl">
                🛒
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Belum ada pesanan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777067]">
                Kamu belum memiliki pesanan.
                Temukan produk favoritmu dan mulai
                pengalaman belanja di NusaRasa.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-xl bg-[#171512] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#302d29]"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            /* LATEST ORDER */

            <div className="mt-6">
              {latestOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group block overflow-hidden rounded-[2rem] border border-[#e2dcd3] bg-white shadow-[0_8px_30px_rgba(23,21,18,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-[#cec5ba] hover:shadow-[0_15px_40px_rgba(23,21,18,0.07)]"
                >
                  <div className="p-6 sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* ORDER INFO */}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#a19689]">
                            Pesanan
                          </span>

                          <OrderStatus
                            status={order.status}
                          />
                        </div>

                        <p className="mt-2 break-all text-lg font-bold text-[#171512]">
                          {order.order_number}
                        </p>

                        <p className="mt-1.5 text-sm text-[#8a8279]">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      {/* SUMMARY */}

                      <div className="grid grid-cols-2 gap-8 sm:flex sm:items-center sm:gap-12">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#aaa197]">
                            Pembayaran
                          </p>

                          <p className="mt-1.5 text-sm font-semibold text-[#4d4842]">
                            {formatPaymentMethod(
                              order.payment_method
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#8a8279]">
                            {formatPaymentStatus(
                              order.payment_status
                            )}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#aaa197]">
                            Total
                          </p>

                          <p className="mt-1.5 text-xl font-bold text-[#171512]">
                            {formatRupiah(
                              Number(order.total)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[#eee9e2] pt-4">
                      <span className="text-sm font-medium text-[#827a71]">
                        Lihat detail pesanan
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ded7ce] text-sm text-[#5d574f] transition group-hover:translate-x-1 group-hover:border-[#bdb4a9] group-hover:bg-[#f6f3ee]">
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
            QUICK ACTION
        ================================================= */}

        <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-[#171512] px-7 py-9 text-white sm:px-10 sm:py-11">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a9a198]">
              NusaRasa
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
              Mau menemukan rasa baru?
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#c5c0ba] sm:text-base">
              Temukan produk lokal pilihan dan buat
              pesanan baru dengan mudah.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#171512] transition hover:bg-[#eeeae4]"
              >
                Lihat Produk
              </Link>

              <Link
                href="/cart"
                className="rounded-xl border border-[#48443f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24211e]"
              >
                Buka Keranjang
              </Link>
            </div>
          </div>

          {/* DECORATIVE SHAPE */}

          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -right-5 -bottom-28 h-72 w-72 rounded-full border border-[#b96532]/30"
          />

          <div
            aria-hidden="true"
            className="absolute right-20 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[#a95d2c]/15 blur-2xl"
          />
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
// PROFILE FIELD
// =======================================================

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#aaa197]">
        {label}
      </p>

      <p className="mt-1.5 break-all text-sm font-semibold text-[#37332e]">
        {value || "Belum diatur"}
      </p>
    </div>
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
      className={`relative min-h-[180px] overflow-hidden rounded-[1.75rem] border border-[#e2dcd3] p-6 shadow-[0_8px_30px_rgba(23,21,18,0.035)] ${
        accentStyles[accent]
      }`}
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
          className={`mt-2 text-xs ${
            descriptionStyles[accent]
          }`}
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
// FORMAT TANGGAL
// =======================================================

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// =======================================================
// FORMAT PAYMENT METHOD
// =======================================================

function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}

// =======================================================
// FORMAT PAYMENT STATUS
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