"use client";

import Image from "next/image";
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

  useEffect(() => {
    async function loadPage() {
      const currentCart = getCart();

      setCart(currentCart);
      setLoaded(true);

      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUserId(user?.id ?? null);
      } catch (error) {
        console.error("Gagal mengambil session:", error);
        setUserId(null);
      } finally {
        setAuthLoaded(true);
      }
    }

    loadPage();
  }, []);

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

  function handleRemove(productId: string) {
    const updatedCart = removeFromCart(productId);

    setCart(updatedCart);
  }

  const total = getCartTotal(cart);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
        <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded-full bg-[#e4e0d7]" />

            <div className="mt-5 h-12 w-56 rounded-xl bg-[#e4e0d7]" />

            <div className="mt-4 h-5 w-80 max-w-full rounded bg-[#e4e0d7]" />
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-[1.5rem] bg-[#eeece5]"
                />
              ))}
            </div>

            <div className="h-80 animate-pulse rounded-[1.5rem] bg-[#eeece5]" />
          </div>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
        <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9b5425]">
            NusaRasa
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Keranjang
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#171512]/55 sm:text-base">
            Produk pilihanmu akan muncul di sini sebelum
            melanjutkan ke checkout.
          </p>

          <div className="mt-12 flex min-h-[420px] items-center justify-center rounded-[2rem] border border-dashed border-[#171512]/15 bg-[#eeece5] px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f5f0] text-3xl shadow-sm">
                🛒
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#9b5425]">
                Belum ada pilihan
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Keranjang masih kosong.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#171512]/50">
                Yuk temukan makanan dan produk lokal favoritmu
                dari koleksi NusaRasa.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-full bg-[#171512] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5"
              >
                Jelajahi Produk
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* HEADER */}
      <section className="border-b border-[#171512]/10">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9b5425]">
            NusaRasa
          </p>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Keranjang.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#171512]/55 sm:text-base">
                Periksa kembali pilihanmu sebelum melanjutkan
                ke checkout.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-semibold tracking-[-0.03em]">
                {totalItems}
              </p>

              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#171512]/40">
                Total item
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* ITEMS */}
          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b5425]">
                  Pilihanmu
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  Produk dalam keranjang
                </h2>
              </div>

              <Link
                href="/products"
                className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-[#171512]/45 transition-colors hover:text-[#9b5425] sm:block"
              >
                + Tambah produk
              </Link>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="group rounded-[1.5rem] border border-[#171512]/10 bg-[#eeece5] p-4 transition-shadow hover:shadow-[0_18px_50px_rgba(23,21,18,0.06)] sm:p-5"
                >
                  <div className="flex gap-4 sm:gap-5">
                    {/* IMAGE */}
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.1rem] bg-[#e2ded4] sm:h-36 sm:w-36">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 112px, 144px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#171512]/30">
                          NusaRasa
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold tracking-[-0.01em] sm:text-lg">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-[#171512]/45">
                            {formatRupiah(item.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(item.productId)
                          }
                          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#171512]/35 transition-colors hover:text-[#9b5425]"
                        >
                          Hapus
                        </button>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        {/* QUANTITY */}
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#171512]/35">
                            Jumlah
                          </p>

                          <div className="flex w-fit items-center overflow-hidden rounded-full border border-[#171512]/15 bg-[#f7f5f0]">
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
                              className="flex h-10 w-10 items-center justify-center text-lg transition-colors hover:bg-[#e8e4db] disabled:cursor-not-allowed disabled:opacity-25"
                            >
                              −
                            </button>

                            <span className="flex h-10 min-w-11 items-center justify-center border-x border-[#171512]/10 px-3 text-sm font-semibold">
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
                              className="flex h-10 w-10 items-center justify-center text-lg transition-colors hover:bg-[#e8e4db]"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* SUBTOTAL */}
                        <div className="sm:text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#171512]/35">
                            Subtotal
                          </p>

                          <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">
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

            <Link
              href="/products"
              className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.15em] text-[#171512]/45 transition-colors hover:text-[#9b5425] sm:hidden"
            >
              + Tambah produk
            </Link>
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-[1.75rem] border border-[#171512]/10 bg-[#171512] p-6 text-white shadow-[0_20px_60px_rgba(23,21,18,0.10)] lg:sticky lg:top-6 lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d99561]">
              Ringkasan
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
              Pesananmu
            </h2>

            <div className="mt-7 space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/50">
                  Jumlah item
                </span>

                <span className="font-medium">
                  {totalItems} item
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/50">
                  Jenis produk
                </span>

                <span className="font-medium">
                  {cart.length} produk
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/50">
                  Subtotal
                </span>

                <span className="font-medium">
                  {formatRupiah(total)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/50">
                  Pengiriman
                </span>

                <span className="text-right text-xs text-white/40">
                  Dihitung saat checkout
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Total
                </p>

                <p className="mt-1 text-xs text-white/35">
                  Sebelum biaya pengiriman
                </p>
              </div>

              <p className="text-2xl font-semibold tracking-[-0.03em]">
                {formatRupiah(total)}
              </p>
            </div>

            {!authLoaded ? (
              <div className="mt-7 h-12 animate-pulse rounded-full bg-white/10" />
            ) : userId ? (
              <Link
                href="/checkout"
                className="mt-7 flex w-full items-center justify-center rounded-full bg-[#f7f5f0] px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#171512] transition-transform hover:-translate-y-0.5"
              >
                Lanjut ke checkout
              </Link>
            ) : (
              <div className="mt-7">
                <div className="rounded-[1.25rem] border border-[#c27336]/25 bg-[#c27336]/10 p-4">
                  <p className="text-sm font-semibold">
                    Login diperlukan
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Produk tetap tersimpan. Login diperlukan
                    sebelum membuat pesanan.
                  </p>
                </div>

                <Link
                  href="/login?redirect=/checkout"
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-[#f7f5f0] px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#171512] transition-transform hover:-translate-y-0.5"
                >
                  Login & Checkout
                </Link>

                <Link
                  href="/register"
                  className="mt-3 flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Buat akun
                </Link>
              </div>
            )}

            <Link
              href="/products"
              className="mt-3 flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              Lanjut belanja
            </Link>
          </aside>
        </div>
      </section>

      {/* INFORMATION */}
      <section className="border-t border-[#171512]/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-[#eeece5] p-6">
              <p className="text-sm font-semibold">
                Produk lokal
              </p>

              <p className="mt-2 text-sm leading-6 text-[#171512]/50">
                Temukan berbagai pilihan produk dari UMKM
                lokal Indonesia.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-[#eeece5] p-6">
              <p className="text-sm font-semibold">
                Belanja mudah
              </p>

              <p className="mt-2 text-sm leading-6 text-[#171512]/50">
                Pilih produk, masukkan ke keranjang, lalu
                lanjutkan ke checkout.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-[#eeece5] p-6">
              <p className="text-sm font-semibold">
                Pesanan terorganisir
              </p>

              <p className="mt-2 text-sm leading-6 text-[#171512]/50">
                Pantau pesanan yang telah dibuat melalui
                halaman akun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#171512]/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="text-sm font-semibold">
              NusaRasa
            </p>

            <p className="mt-1 text-xs text-[#171512]/40">
              Platform digital untuk UMKM lokal.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-[#171512]/45">
            <Link
              href="/"
              className="transition-colors hover:text-[#9b5425]"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="transition-colors hover:text-[#9b5425]"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="font-medium text-[#171512]"
            >
              Keranjang
            </Link>

            <Link
              href="/account"
              className="transition-colors hover:text-[#9b5425]"
            >
              Akun
            </Link>
          </div>
        </div>

        <div className="border-t border-[#171512]/10">
          <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-[#171512]/35 sm:px-8 lg:px-10">
            © {new Date().getFullYear()} NusaRasa. Semua hak
            dilindungi.
          </div>
        </div>
      </footer>
    </main>
  );
}