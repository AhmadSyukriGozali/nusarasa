import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/logout-button";
import { formatRupiah } from "@/lib/utils";

export default async function AccountPage() {
  const supabase = await createClient();

  /*
   * Pastikan user sudah login.
   */
  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  /*
   * Ambil profile user.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "full_name, email, phone, role, avatar_url"
    )
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold">
            Account
          </h1>

          <p className="mt-3 text-red-600">
            Profil pengguna tidak ditemukan.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Ambil pesanan milik user.
   *
   * customer_id sengaja menggunakan userId
   * dari session, bukan ID yang dikirim browser.
   */
  const {
    data: orders,
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            NusaRasa
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-gray-600 transition hover:text-black"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="text-gray-600 transition hover:text-black"
            >
              Produk
            </Link>

            <Link
              href="/account"
              className="font-semibold text-black"
            >
              Akun
            </Link>

            <LogoutButton />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Account Header */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
            NusaRasa
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Akun Saya
          </h1>

          <p className="mt-2 text-gray-600">
            Kelola informasi akun dan lihat riwayat pesanan
            kamu.
          </p>
        </div>

        {/* Profile */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Informasi Akun
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informasi dasar akun NusaRasa kamu.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Nama
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile.full_name || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Nomor Telepon
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Role
              </p>

              <span className="mt-1 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {profile.role}
              </span>
            </div>
          </div>
        </section>

        {/* Orders */}
        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Riwayat
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Pesanan Saya
              </h2>
            </div>

            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Belanja lagi →
            </Link>
          </div>

          {ordersError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="font-medium text-red-800">
                Gagal mengambil riwayat pesanan.
              </p>

              <p className="mt-1 text-sm text-red-600">
                Silakan refresh halaman dan coba lagi.
              </p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xl">🛒</span>
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                Belum ada pesanan
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Pesanan yang kamu buat akan muncul di sini.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Produk
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {order.order_number}
                        </p>

                        <OrderStatus
                          status={order.status}
                        />
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-gray-500">
                        Total
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {formatRupiah(
                          Number(order.total)
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatPaymentMethod(
                          order.payment_method
                        )}{" "}
                        ·{" "}
                        {formatPaymentStatus(
                          order.payment_status
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-600">
                      Lihat detail pesanan →
                    </p>
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

/*
 * Badge status pesanan.
 */
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

  const label =
    statusLabel[status] ?? status;

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
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusClass[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
}

/*
 * Format tanggal order.
 */
function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

/*
 * Format metode pembayaran.
 */
function formatPaymentMethod(
  value: string
) {
  const labels: Record<
    string,
    string
  > = {
    cash: "Cash",
    bank_transfer:
      "Transfer Bank",
  };

  return labels[value] ?? value;
}

/*
 * Format status pembayaran.
 */
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