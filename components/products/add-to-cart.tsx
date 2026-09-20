"use client";

import { useState } from "react";
import {
  addToCart,
  type CartItem,
} from "@/lib/cart";

type AddToCartProps = {
  product: Omit<CartItem, "quantity">;
};

export default function AddToCart({
  product,
}: AddToCartProps) {
  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(product.stock, current + 1)
    );
  }

  function handleAddToCart() {
    addToCart(product, quantity);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  if (product.stock <= 0) {
    return (
      <div className="mt-8 rounded-xl bg-gray-100 px-6 py-4 text-center font-semibold text-gray-500">
        Produk sedang habis
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-xl font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>

        <div className="flex h-12 min-w-16 items-center justify-center rounded-xl border border-gray-200 px-4 font-semibold">
          {quantity}
        </div>

        <button
          type="button"
          onClick={increaseQuantity}
          disabled={quantity >= product.stock}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-xl font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-4 w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800"
      >
        {added
          ? "✓ Berhasil Ditambahkan"
          : "Tambah ke Keranjang"}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        Maksimal {product.stock} produk dapat ditambahkan.
      </p>
    </div>
  );
}