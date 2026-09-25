"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  type CartItem,
} from "@/lib/cart";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [authLoaded, setAuthLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // =========================================================
  // LOAD CART + AUTH
  // =========================================================

  useEffect(() => {
    async function loadPage() {
      // Load cart from localStorage
      setCart(getCart());
      setLoaded(true);

      // Load authentication
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);

          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email, role")
            .eq("id", user.id)
            .maybeSingle();

          setProfile(profileData as Profile | null);
        } else {
          setUserId(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("AUTH ERROR:", error);
        setUserId(null);
        setProfile(null);
      } finally {
        setAuthLoaded(true);
      }
    }

    loadPage();
  }, []);

  // =========================================================
  // QUANTITY
  // =========================================================

  function handleQuantityChange(
    productId: string,
    quantity: number
  ) {
    const updatedCart = updateCartQuantity(
      productId,
      quantity
    );

    setCart(updatedCart);
  }

  // =========================================================
  // REMOVE
  // =========================================================

  function handleRemove(productId: string) {
    const updatedCart = removeFromCart(productId);

    setCart(updatedCart);
  }

  // =========================================================
  // TOTAL
  // =========================================================

  const total = getCartTotal(cart);

  // =========================================================
  // USER DISPLAY
  // =========================================================

  const displayName =
    profile?.full_name?.trim() ||
    profile?.email?.split("@")[0] ||
    "Akun Saya";

  const isAdmin = profile?.role === "admin";

  // =========================================================
  // LOADING
  // =========================================================

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-black"
            >
              NusaRasa
            </Link>

            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-gray-500">
            Memuat keranjang...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-black"
          >
            NusaRasa
          </Link>

          {/* NAVIGATION */}
          <nav className="flex items-center gap-6 text-sm">
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
              href="/cart"
              className="font-semibold text-black"
            >
              Keranjang
            </Link>

            {/* =================================================
                AUTH NAVIGATION
            ================================================= */}

            {!authLoaded ? (
              <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
            ) : !userId ? (
              <>
                <Link
                  href="/login"
                  className="rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="hidden font-medium text-gray-700 transition hover:text-black sm:inline"
                >
                  Daftar
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>

                  <span className="max-w-[140px] truncate">
                    {displayName}
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* TITLE */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-gray-500">
            NusaRasa
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Keranjang
          </h1>

          <p className="mt-2 text-gray-600">
            Periksa kembali produk yang ingin kamu pesan.
          </p>
        </div>

        {/* ===================================================
            EMPTY CART
        =================================================== */}
        {cart.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                🛒
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                Keranjang masih kosong
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Yuk pilih produk yang ingin kamu pesan.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Produk
              </Link>
            </div>
          </div>
        ) : (
          /* =================================================
             CART CONTENT
          ================================================= */
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* =================================================
                CART ITEMS
            ================================================= */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex gap-4">
                    {/* IMAGE */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* PRODUCT INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-semibold text-gray-900">
                            {item.name}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatRupiah(item.price)}
                          </p>
                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(item.productId)
                          }
                          className="text-sm font-medium text-red-600 transition hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </div>

                      {/* QUANTITY + SUBTOTAL */}
                      <div className="mt-5 flex items-center justify-between">
                        {/* QUANTITY */}
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-9 w-9 items-center justify-center text-lg text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-gray-200 px-3 text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-lg text-gray-600 transition hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>

                        {/* SUBTOTAL */}
                        <p className="font-semibold text-gray-900">
                          {formatRupiah(
                            item.price * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}
            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Ringkasan Pesanan
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Jumlah produk
                  </span>

                  <span className="font-medium text-gray-900">
                    {cart.reduce(
                      (total, item) =>
                        total + item.quantity,
                      0
                    )}{" "}
                    item
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatRupiah(total)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-black">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* =================================================
                  CHECKOUT
              ================================================= */}

              {userId ? (
                <Link
                  href="/checkout"
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Lanjut ke Checkout
                </Link>
              ) : (
                <div className="mt-6">
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">
                      Login untuk melanjutkan
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      Produk tetap tersimpan di keranjang,
                      tetapi kamu perlu login sebelum membuat
                      pesanan.
                    </p>
                  </div>

                  <Link
                    href="/login?redirect=/checkout"
                    className="mt-4 flex w-full items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Login & Checkout
                  </Link>

                  <Link
                    href="/register"
                    className="mt-3 flex w-full items-center justify-center rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Buat Akun
                  </Link>
                </div>
              )}

              {/* CONTINUE SHOPPING */}
              <Link
                href="/products"
                className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Lanjut Belanja
              </Link>
            </aside>
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col justify-between gap-4 text-sm text-gray-500 sm:flex-row">
            <p>© {new Date().getFullYear()} NusaRasa.</p>

            <div className="flex gap-5">
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

              {userId && (
                <Link
                  href="/account"
                  className="transition hover:text-black"
                >
                  Akun Saya
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}