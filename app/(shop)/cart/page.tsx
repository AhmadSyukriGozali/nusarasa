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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [authLoaded, setAuthLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // ==================================================
  // LOAD CART + AUTH
  // ==================================================

  useEffect(() => {
    async function loadPage() {
      // Load cart dari localStorage
      const currentCart = getCart();

      setCart(currentCart);
      setLoaded(true);

      // Cek user yang sedang login
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUserId(user?.id ?? null);
      } catch (error) {
        console.error(
          "Gagal mengambil session:",
          error
        );

        setUserId(null);
      } finally {
        setAuthLoaded(true);
      }
    }

    loadPage();
  }, []);

  // ==================================================
  // UPDATE QUANTITY
  // ==================================================

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

  // ==================================================
  // REMOVE PRODUCT
  // ==================================================

  function handleRemove(productId: string) {
    const updatedCart = removeFromCart(productId);

    setCart(updatedCart);
  }

  // ==================================================
  // TOTAL
  // ==================================================

  const total = getCartTotal(cart);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // ==================================================
  // LOADING
  // ==================================================

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-gray-200" />

            <div className="mt-4 h-10 w-48 rounded bg-gray-200" />

            <div className="mt-3 h-5 w-80 max-w-full rounded bg-gray-200" />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="h-72 animate-pulse rounded-2xl bg-white" />
          </div>
        </section>
      </main>
    );
  }

  // ==================================================
  // EMPTY CART
  // ==================================================

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          {/* HEADER */}

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              NusaRasa
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Keranjang
            </h1>

            <p className="mt-3 text-base leading-7 text-gray-600">
              Periksa kembali produk yang ingin kamu
              pesan.
            </p>
          </div>

          {/* EMPTY STATE */}

          <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                🛒
              </div>

              <h2 className="mt-6 text-xl font-semibold text-gray-900">
                Keranjang masih kosong
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Belum ada produk yang kamu pilih.
                Yuk cari produk dari UMKM lokal.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Produk
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ==================================================
  // CART PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            NusaRasa
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Keranjang
              </h1>

              <p className="mt-3 text-base leading-7 text-gray-600">
                Periksa kembali produk yang ingin kamu
                pesan sebelum checkout.
              </p>
            </div>

            <p className="text-sm font-medium text-gray-500">
              {totalItems} item
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ==================================================
              CART ITEMS
          ================================================== */}

          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Produk Pilihan
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {cart.length} jenis produk
                </p>
              </div>

              <Link
                href="/products"
                className="shrink-0 text-sm font-medium text-gray-500 transition hover:text-black"
              >
                Tambah Produk
              </Link>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* IMAGE */}

                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          Tidak ada gambar
                        </div>
                      )}
                    </div>

                    {/* PRODUCT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900 sm:text-lg">
                            {item.name}
                          </h3>

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
                          className="shrink-0 text-sm font-medium text-red-600 transition hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </div>

                      {/* QUANTITY + SUBTOTAL */}

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* QUANTITY */}

                        <div className="flex items-center self-start overflow-hidden rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Kurangi jumlah ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center text-lg text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            −
                          </button>

                          <span className="flex h-10 min-w-11 items-center justify-center border-x border-gray-200 px-3 text-sm font-semibold">
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
                            aria-label={`Tambah jumlah ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center text-lg text-gray-600 transition hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>

                        {/* SUBTOTAL */}

                        <div className="sm:text-right">
                          <p className="text-xs text-gray-400">
                            Subtotal
                          </p>

                          <p className="mt-1 font-bold text-gray-900">
                            {formatRupiah(
                              item.price * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-6">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
              Ringkasan
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-900">
              Ringkasan Pesanan
            </h2>

            <div className="mt-6 space-y-4">
              {/* TOTAL ITEM */}

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Jumlah item
                </span>

                <span className="font-medium text-gray-900">
                  {totalItems} item
                </span>
              </div>

              {/* JENIS PRODUK */}

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Jenis produk
                </span>

                <span className="font-medium text-gray-900">
                  {cart.length} produk
                </span>
              </div>

              {/* SUBTOTAL */}

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-medium text-gray-900">
                  {formatRupiah(total)}
                </span>
              </div>

              {/* DELIVERY */}

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Pengiriman
                </span>

                <span className="text-right text-xs font-medium text-gray-500">
                  Dihitung saat checkout
                </span>
              </div>

              {/* TOTAL */}

              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Total
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Sebelum biaya pengiriman
                    </p>
                  </div>

                  <p className="text-xl font-bold text-black">
                    {formatRupiah(total)}
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
                CHECKOUT
            ================================================== */}

            {!authLoaded ? (
              <div className="mt-6 h-12 animate-pulse rounded-xl bg-gray-100" />
            ) : userId ? (
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Lanjut ke Checkout
              </Link>
            ) : (
              <div className="mt-6">
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Login diperlukan
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Kamu perlu login sebelum membuat
                    pesanan. Produk di keranjang tetap
                    tersimpan.
                  </p>
                </div>

                <Link
                  href="/login?redirect=/checkout"
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Login & Checkout
                </Link>

                <Link
                  href="/register"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Buat Akun
                </Link>
              </div>
            )}

            {/* CONTINUE SHOPPING */}

            <Link
              href="/products"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Lanjut Belanja
            </Link>
          </aside>
        </div>
      </section>

      {/* ==================================================
          INFORMATION
      ================================================== */}

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">
                Produk Lokal
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Temukan berbagai produk dari UMKM
                lokal Indonesia.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">
                Belanja Mudah
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Pilih produk, masukkan ke keranjang,
                lalu lanjutkan ke checkout.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">
                Pesanan Terorganisir
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Pesanan yang dibuat dapat dilihat
                kembali melalui halaman akun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="border-t border-gray-200 bg-white">
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
              className="font-medium text-black"
            >
              Keranjang
            </Link>

            <Link
              href="/account"
              className="transition hover:text-black"
            >
              Akun
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