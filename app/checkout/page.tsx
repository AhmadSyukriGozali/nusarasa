"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCart,
  getCartTotal,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import { formatRupiah } from "@/lib/utils";

type PaymentMethod = "cash" | "bank_transfer";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [notes, setNotes] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successOrderNumber, setSuccessOrderNumber] =
    useState("");

  useEffect(() => {
    const currentCart = getCart();

    setCart(currentCart);
    setLoaded(true);
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (cart.length === 0) {
      setError(
        "Keranjang masih kosong."
      );

      return;
    }

    if (!customerName.trim()) {
      setError(
        "Nama pelanggan wajib diisi."
      );

      return;
    }

    if (!customerPhone.trim()) {
      setError(
        "Nomor HP wajib diisi."
      );

      return;
    }

    if (!deliveryAddress.trim()) {
      setError(
        "Alamat pengiriman wajib diisi."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * Hanya kirim productId dan quantity.
       *
       * Harga tidak dipercaya dari localStorage.
       * Server akan mengambil harga asli
       * langsung dari database.
       */
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            items,
            customerName:
              customerName.trim(),
            customerPhone:
              customerPhone.trim(),
            deliveryAddress:
              deliveryAddress.trim(),
            notes: notes.trim(),
            paymentMethod,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Gagal membuat pesanan."
        );
      }

      /*
       * Order berhasil dibuat.
       * Sekarang cart boleh dikosongkan.
       */
      clearCart();
      setCart([]);

      setSuccessOrderNumber(
        result.order.orderNumber
      );
    } catch (err) {
      console.error(
        "CHECKOUT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-gray-500">
            Memuat checkout...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Setelah order berhasil
   */
  if (successOrderNumber) {
    return (
      <main className="min-h-screen bg-gray-50">
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
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
              ✓
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Pesanan berhasil
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Terima kasih!
            </h1>

            <p className="mt-4 text-gray-600">
              Pesanan kamu sudah berhasil
              dibuat dan sedang menunggu
              diproses.
            </p>

            <div className="mt-6 rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Nomor Pesanan
              </p>

              <p className="mt-1 text-xl font-bold tracking-wide">
                {successOrderNumber}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/products"
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Kembali ke Produk
              </Link>

              <Link
                href="/account"
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Lihat Akun
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Keranjang kosong
   */
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
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

        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold">
              Keranjang kosong
            </h1>

            <p className="mt-3 text-gray-500">
              Tambahkan produk terlebih dahulu
              sebelum melakukan checkout.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Lihat Produk
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const total = getCartTotal(cart);

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
              className="text-gray-600 hover:text-black"
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
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Checkout
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
            Selesaikan Pesanan
          </h1>

          <p className="mt-3 text-gray-600">
            Masukkan data pengiriman dan pilih
            metode pembayaran.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          {/* Customer Information */}
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Informasi Pelanggan
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="customerName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nama Lengkap
                  </label>

                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value
                      )
                    }
                    placeholder="Nama lengkap"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="customerPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nomor HP
                  </label>

                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value
                      )
                    }
                    placeholder="08xxxxxxxxxx"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Alamat Pengiriman
                  </label>

                  <textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) =>
                      setDeliveryAddress(
                        event.target.value
                      )
                    }
                    placeholder="Alamat lengkap pengiriman"
                    rows={4}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="text-sm font-medium text-gray-700"
                  >
                    Catatan
                    <span className="ml-1 font-normal text-gray-400">
                      (opsional)
                    </span>
                  </label>

                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    placeholder="Contoh: Tolong jangan terlalu pedas."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Metode Pembayaran
              </h2>

              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={
                      paymentMethod === "cash"
                    }
                    onChange={() =>
                      setPaymentMethod("cash")
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <p className="font-semibold">
                      Cash
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Bayar secara tunai.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={
                      paymentMethod ===
                      "bank_transfer"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "bank_transfer"
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <p className="font-semibold">
                      Transfer Bank
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Pembayaran melalui transfer
                      bank.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              Ringkasan Pesanan
            </h2>

            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
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

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-gray-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.quantity} ×{" "}
                      {formatRupiah(
                        item.price
                      )}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold">
                    {formatRupiah(
                      item.price *
                        item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-medium">
                  {formatRupiah(total)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Diskon
                </span>

                <span className="font-medium">
                  Rp0
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Biaya Pengiriman
                </span>

                <span className="font-medium">
                  Rp0
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Memproses Pesanan..."
                : "Buat Pesanan"}
            </button>

            <Link
              href="/cart"
              className="mt-3 block text-center text-sm font-medium text-gray-500 hover:text-black"
            >
              ← Kembali ke Keranjang
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}