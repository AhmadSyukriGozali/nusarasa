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

type PaymentMethod =
  | "cash"
  | "bank_transfer";

type CreatedOrder = {
  id: string;
  orderNumber: string;
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  total?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
};

export default function CheckoutPage() {
  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successOrder, setSuccessOrder] =
    useState<CreatedOrder | null>(null);

  // ==================================================
  // LOAD CART
  // ==================================================

  useEffect(() => {
    const currentCart = getCart();

    setCart(currentCart);
    setLoaded(true);
  }, []);

  // ==================================================
  // SUBMIT CHECKOUT
  // ==================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    // -----------------------------------------------
    // VALIDASI CART
    // -----------------------------------------------

    if (cart.length === 0) {
      setError(
        "Keranjang masih kosong."
      );
      return;
    }

    // -----------------------------------------------
    // VALIDASI NAMA
    // -----------------------------------------------

    const trimmedName =
      customerName.trim();

    if (!trimmedName) {
      setError(
        "Nama pelanggan wajib diisi."
      );
      return;
    }

    if (trimmedName.length < 3) {
      setError(
        "Nama pelanggan minimal 3 karakter."
      );
      return;
    }

    // -----------------------------------------------
    // VALIDASI NOMOR TELEPON
    // -----------------------------------------------

    const trimmedPhone =
      customerPhone.trim();

    if (!trimmedPhone) {
      setError(
        "Nomor HP wajib diisi."
      );
      return;
    }

    if (trimmedPhone.length < 8) {
      setError(
        "Nomor HP tidak valid."
      );
      return;
    }

    // -----------------------------------------------
    // VALIDASI ALAMAT
    // -----------------------------------------------

    const trimmedAddress =
      deliveryAddress.trim();

    if (!trimmedAddress) {
      setError(
        "Alamat pengiriman wajib diisi."
      );
      return;
    }

    if (trimmedAddress.length < 10) {
      setError(
        "Alamat pengiriman terlalu singkat."
      );
      return;
    }

    // -----------------------------------------------
    // VALIDASI PAYMENT
    // -----------------------------------------------

    if (
      paymentMethod !== "cash" &&
      paymentMethod !==
        "bank_transfer"
    ) {
      setError(
        "Metode pembayaran tidak valid."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // ---------------------------------------------
      // PREPARE ITEMS
      // ---------------------------------------------

      /*
       * Jangan kirim harga dari localStorage.
       *
       * Server/API akan mengambil harga asli
       * dari database melalui create_order_atomic.
       */

      const items = cart.map(
        (item) => ({
          productId:
            item.productId,
          quantity:
            item.quantity,
        })
      );

      // ---------------------------------------------
      // SEND REQUEST
      // ---------------------------------------------

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
              trimmedName,

            customerPhone:
              trimmedPhone,

            deliveryAddress:
              trimmedAddress,

            notes:
              notes.trim(),

            paymentMethod,
          }),
        }
      );

      // ---------------------------------------------
      // PARSE RESPONSE
      // ---------------------------------------------

      let result: {
        success?: boolean;
        order?: {
          id?: string;
          orderNumber?: string;
          subtotal?: number;
          discount?: number;
          deliveryFee?: number;
          total?: number;
          status?: string;
          paymentMethod?: string;
          paymentStatus?: string;
        };
        error?: string;
      };

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "Response server tidak valid."
        );
      }

      // ---------------------------------------------
      // API ERROR
      // ---------------------------------------------

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Gagal membuat pesanan."
        );
      }

      // ---------------------------------------------
      // VALIDASI RESPONSE
      // ---------------------------------------------

      if (!result?.order) {
        throw new Error(
          "Pesanan berhasil dibuat, tetapi data pesanan tidak ditemukan."
        );
      }

      if (!result.order.id) {
        throw new Error(
          "ID pesanan tidak ditemukan."
        );
      }

      // ---------------------------------------------
      // BUILD ORDER DATA
      // ---------------------------------------------

      const createdOrder: CreatedOrder =
        {
          id: result.order.id,

          orderNumber:
            result.order.orderNumber ??
            "Pesanan",

          subtotal:
            result.order.subtotal,

          discount:
            result.order.discount,

          deliveryFee:
            result.order.deliveryFee,

          total:
            result.order.total,

          status:
            result.order.status,

          paymentMethod:
            result.order
              .paymentMethod,

          paymentStatus:
            result.order
              .paymentStatus,
        };

      // ---------------------------------------------
      // CLEAR CART
      // ---------------------------------------------

      /*
       * Cart baru boleh dikosongkan setelah
       * server mengembalikan response sukses.
       */

      clearCart();

      setCart([]);

      // ---------------------------------------------
      // SHOW SUCCESS
      // ---------------------------------------------

      setSuccessOrder(
        createdOrder
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

  // ==================================================
  // LOADING
  // ==================================================

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-gray-200" />

            <div className="mt-4 h-10 w-64 rounded bg-gray-200" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-gray-200" />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="h-80 animate-pulse rounded-2xl bg-white" />

              <div className="h-56 animate-pulse rounded-2xl bg-white" />
            </div>

            <div className="h-96 animate-pulse rounded-2xl bg-white" />
          </div>
        </section>
      </main>
    );
  }

  // ==================================================
  // SUCCESS
  // ==================================================

  if (successOrder) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
            {/* SUCCESS ICON */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
              ✓
            </div>

            {/* TITLE */}

            <div className="mt-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                NusaRasa
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Pesanan Berhasil!
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
                Pesanan kamu sudah berhasil
                dibuat dan sedang menunggu
                diproses oleh NusaRasa.
              </p>
            </div>

            {/* ORDER NUMBER */}

            <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                Nomor Pesanan
              </p>

              <p className="mt-2 break-all text-xl font-bold tracking-wide text-gray-900">
                {successOrder.orderNumber}
              </p>
            </div>

            {/* ORDER INFO */}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  Total Pesanan
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {successOrder.total !==
                  undefined
                    ? formatRupiah(
                        Number(
                          successOrder.total
                        )
                      )
                    : "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  Pembayaran
                </p>

                <p className="mt-2 font-semibold text-gray-900">
                  {formatPaymentMethod(
                    successOrder.paymentMethod
                  )}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {formatPaymentStatus(
                    successOrder.paymentStatus
                  )}
                </p>
              </div>
            </div>

            {/* STATUS */}

            {successOrder.status && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-900">
                  Status Pesanan
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  {formatOrderStatus(
                    successOrder.status
                  )}
                </p>
              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/account/orders/${successOrder.id}`}
                className="flex items-center justify-center rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Detail Pesanan
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Belanja Lagi
              </Link>
            </div>

            <div className="mt-5 text-center">
              <Link
                href="/account"
                className="text-sm font-medium text-gray-500 transition hover:text-black"
              >
                Lihat Semua Pesanan
              </Link>
            </div>
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
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
              🛒
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              NusaRasa
            </p>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Keranjang kosong
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Tambahkan produk terlebih dahulu
              sebelum melakukan checkout.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Lihat Produk
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ==================================================
  // CART TOTAL
  // ==================================================

  const total =
    getCartTotal(cart);

  const totalItems =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  // ==================================================
  // CHECKOUT PAGE
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

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
            Lengkapi informasi pengiriman dan
            pilih metode pembayaran untuk
            menyelesaikan pesanan.
          </p>
        </div>
      </section>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="space-y-6">
            {/* CUSTOMER INFORMATION */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  01
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Informasi Pelanggan
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Data ini digunakan untuk
                  proses pengiriman pesanan.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                {/* NAME */}

                <div>
                  <label
                    htmlFor="customerName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nama Lengkap
                  </label>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value
                      )
                    }
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-50"
                    required
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label
                    htmlFor="customerPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nomor HP
                  </label>

                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value
                      )
                    }
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-50"
                    required
                  />
                </div>

                {/* ADDRESS */}

                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Alamat Pengiriman
                  </label>

                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) =>
                      setDeliveryAddress(
                        event.target.value
                      )
                    }
                    placeholder="Masukkan alamat lengkap pengiriman"
                    autoComplete="street-address"
                    rows={5}
                    disabled={isSubmitting}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-50"
                    required
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Sertakan nama jalan, nomor
                    rumah, RT/RW, kelurahan,
                    kecamatan, dan informasi
                    lainnya jika diperlukan.
                  </p>
                </div>

                {/* NOTES */}

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
                    name="notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    placeholder="Contoh: Kirim sore hari."
                    rows={3}
                    disabled={isSubmitting}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  02
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Metode Pembayaran
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Pilih metode pembayaran yang
                  tersedia.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {/* CASH */}

                <label
                  className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                    paymentMethod ===
                    "cash"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={
                      paymentMethod ===
                      "cash"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "cash"
                      )
                    }
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      Cash
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Bayar secara tunai sesuai
                      instruksi dari penjual.
                    </p>
                  </div>
                </label>

                {/* BANK TRANSFER */}

                <label
                  className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                    paymentMethod ===
                    "bank_transfer"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
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
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      Transfer Bank
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Pembayaran dilakukan melalui
                      transfer bank.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <p className="text-sm font-semibold text-red-800">
                  Gagal membuat pesanan
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* SECURITY INFO */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Pesanan aman
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Harga produk akan diverifikasi
                    kembali oleh server saat
                    pesanan dibuat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Pesanan
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Ringkasan Pesanan
            </h2>

            {/* ITEMS */}

            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3"
                >
                  {/* IMAGE */}

                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* INFO */}

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-gray-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {item.quantity} ×{" "}
                      {formatRupiah(
                        item.price
                      )}
                    </p>
                  </div>

                  {/* SUBTOTAL */}

                  <p className="shrink-0 text-sm font-semibold text-gray-900">
                    {formatRupiah(
                      item.price *
                        item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* SUMMARY */}

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Jumlah item
                </span>

                <span className="font-medium text-gray-900">
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-medium text-gray-900">
                  {formatRupiah(total)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Diskon
                </span>

                <span className="font-medium text-gray-900">
                  Rp0
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Biaya Pengiriman
                </span>

                <span className="font-medium text-gray-500">
                  Rp0
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Total
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Total sementara
                    </p>
                  </div>

                  <p className="text-xl font-bold text-black">
                    {formatRupiah(total)}
                  </p>
                </div>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses Pesanan...
                </>
              ) : (
                "Buat Pesanan"
              )}
            </button>

            {/* BACK */}

            <Link
              href="/cart"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              ← Kembali ke Keranjang
            </Link>

            {/* PRODUCT COUNT */}

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              {cart.length} jenis produk ·{" "}
              {totalItems} item
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}

// ==================================================
// FORMAT ORDER STATUS
// ==================================================

function formatOrderStatus(
  value?: string
) {
  if (!value) {
    return "Menunggu";
  }

  const labels: Record<
    string,
    string
  > = {
    pending: "Menunggu diproses",
    confirmed: "Pesanan dikonfirmasi",
    preparing: "Pesanan sedang diproses",
    ready: "Pesanan siap",
    completed: "Pesanan selesai",
    cancelled: "Pesanan dibatalkan",
  };

  return (
    labels[value] ?? value
  );
}

// ==================================================
// FORMAT PAYMENT METHOD
// ==================================================

function formatPaymentMethod(
  value?: string
) {
  if (!value) {
    return "—";
  }

  const labels: Record<
    string,
    string
  > = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}

// ==================================================
// FORMAT PAYMENT STATUS
// ==================================================

function formatPaymentStatus(
  value?: string
) {
  if (!value) {
    return "Menunggu";
  }

  const labels: Record<
    string,
    string
  > = {
    unpaid: "Belum dibayar",
    pending: "Menunggu pembayaran",
    paid: "Sudah dibayar",
    failed: "Pembayaran gagal",
  };

  return labels[value] ?? value;
}