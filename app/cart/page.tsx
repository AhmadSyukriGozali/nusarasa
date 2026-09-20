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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setLoaded(true);
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

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50">
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
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            NusaRasa
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-black"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="text-gray-600 hover:text-black"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="font-semibold text-black"
            >
              Keranjang
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-black px-4 py-2 font-medium text-white"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Title */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Pesanan
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Keranjang
          </h1>

          <p className="mt-3 text-gray-600">
            Periksa kembali produk sebelum melanjutkan
            ke checkout.
          </p>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart */
          <div className="mt-10 rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto max-w-md">
              <h2 className="text-xl font-semibold text-gray-900">
                Keranjang masih kosong
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Belum ada produk yang kamu tambahkan
                ke keranjang.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Produk
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const subtotal =
                  item.price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex gap-5">
                      {/* Image */}
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
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

                      {/* Information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <Link
                              href={`/products/${item.slug}`}
                              className="font-semibold text-gray-900 hover:underline"
                            >
                              {item.name}
                            </Link>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatRupiah(item.price)}
                            </p>
                          </div>

                          <p className="font-bold text-gray-900">
                            {formatRupiah(subtotal)}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-lg hover:bg-gray-50"
                            >
                              −
                            </button>

                            <span className="flex h-9 min-w-10 items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-semibold">
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
                              disabled={
                                item.quantity >=
                                item.stock
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(
                                item.productId
                              )
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                          Maksimal {item.stock} produk
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Ringkasan Pesanan
              </h2>

              <div className="mt-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-sm text-gray-500">
                  Jumlah item
                </span>

                <span className="font-medium">
                  {cart.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Subtotal
                </span>

                <span className="text-xl font-bold">
                  {formatRupiah(total)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-xl bg-black px-6 py-4 text-center font-semibold text-white transition hover:bg-gray-800"
              >
                Lanjut ke Checkout
              </Link>

              <Link
                href="/products"
                className="mt-3 block text-center text-sm font-medium text-gray-500 hover:text-black"
              >
                ← Lanjut Belanja
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}