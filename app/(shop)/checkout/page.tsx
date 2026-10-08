"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  getCart,
  getCartTotal,
  clearCart,
  type CartItem,
} from "@/lib/cart";

import { formatRupiah } from "@/lib/utils";

type PaymentMethod = "cash" | "bank_transfer";

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
  const [cart, setCart] = useState<CartItem[]>(() => getCart());

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] =
    useState<CreatedOrder | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (cart.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }

    const trimmedName = customerName.trim();

    if (!trimmedName) {
      setError("Nama pelanggan wajib diisi.");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Nama pelanggan minimal 3 karakter.");
      return;
    }

    const trimmedPhone = customerPhone.trim();

    if (!trimmedPhone) {
      setError("Nomor HP wajib diisi.");
      return;
    }

    if (trimmedPhone.length < 8) {
      setError("Nomor HP tidak valid.");
      return;
    }

    const trimmedAddress = deliveryAddress.trim();

    if (!trimmedAddress) {
      setError("Alamat pengiriman wajib diisi.");
      return;
    }

    if (trimmedAddress.length < 10) {
      setError("Alamat pengiriman terlalu singkat.");
      return;
    }

    if (
      paymentMethod !== "cash" &&
      paymentMethod !== "bank_transfer"
    ) {
      setError("Metode pembayaran tidak valid.");
      return;
    }

    setIsSubmitting(true);

    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          customerName: trimmedName,
          customerPhone: trimmedPhone,
          deliveryAddress: trimmedAddress,
          notes: notes.trim(),
          paymentMethod,
        }),
      });

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
        result = await response.json();
      } catch {
        throw new Error("Response server tidak valid.");
      }

      if (!response.ok) {
        throw new Error(
          result?.error || "Gagal membuat pesanan."
        );
      }

      if (!result?.order) {
        throw new Error(
          "Pesanan berhasil dibuat, tetapi data pesanan tidak ditemukan."
        );
      }

      if (!result.order.id) {
        throw new Error("ID pesanan tidak ditemukan.");
      }

      const createdOrder: CreatedOrder = {
        id: result.order.id,
        orderNumber:
          result.order.orderNumber ?? "Pesanan",
        subtotal: result.order.subtotal,
        discount: result.order.discount,
        deliveryFee: result.order.deliveryFee,
        total: result.order.total,
        status: result.order.status,
        paymentMethod: result.order.paymentMethod,
        paymentStatus: result.order.paymentStatus,
      };

      clearCart();
      setCart([]);
      setSuccessOrder(createdOrder);
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successOrder) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_70px_rgba(23,21,18,0.08)]">
            {/* TOP ACCENT */}

            <div className="h-1.5 bg-[#9b5425]" />

            <div className="p-6 sm:p-10 lg:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f1e5d8] text-3xl text-[#9b5425]">
                  ✓
                </div>

                <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.25em] text-[#9b5425]">
                  NusaRasa
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Pesanan berhasil dibuat.
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
                  Terima kasih sudah memilih NusaRasa.
                  Pesanan kamu sudah masuk dan akan
                  diproses oleh tim kami.
                </p>
              </div>

              {/* ORDER NUMBER */}

              <div className="mt-9 rounded-2xl bg-[#f7f5f0] p-6 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                  Nomor Pesanan
                </p>

                <p className="mt-3 break-all text-xl font-semibold tracking-wide text-[#171512] sm:text-2xl">
                  {successOrder.orderNumber}
                </p>
              </div>

              {/* SUMMARY */}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 p-5">
                  <p className="text-xs text-black/45">
                    Total Pesanan
                  </p>

                  <p className="mt-2 text-xl font-semibold">
                    {successOrder.total !== undefined
                      ? formatRupiah(
                          Number(successOrder.total)
                        )
                      : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 p-5">
                  <p className="text-xs text-black/45">
                    Pembayaran
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatPaymentMethod(
                      successOrder.paymentMethod
                    )}
                  </p>

                  <p className="mt-1 text-xs text-black/45">
                    {formatPaymentStatus(
                      successOrder.paymentStatus
                    )}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              {successOrder.status && (
                <div className="mt-4 rounded-2xl border border-[#e8d5c2] bg-[#fbf4ed] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9b5425]">
                    Status Pesanan
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#70401f]">
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
                  className="flex items-center justify-center rounded-xl bg-[#171512] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b2824]"
                >
                  Lihat Detail Pesanan
                </Link>

                <Link
                  href="/products"
                  className="flex items-center justify-center rounded-xl border border-black/10 px-5 py-3.5 text-sm font-semibold text-[#171512] transition hover:bg-[#f7f5f0]"
                >
                  Belanja Lagi
                </Link>
              </div>

              <div className="mt-5 text-center">
                <Link
                  href="/account"
                  className="text-sm font-medium text-black/45 transition hover:text-[#171512]"
                >
                  Lihat Semua Pesanan
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(23,21,18,0.06)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f1e5d8] text-3xl">
              🛒
            </div>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.25em] text-[#9b5425]">
              Checkout
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              Keranjang masih kosong.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              Tambahkan produk pilihanmu terlebih
              dahulu sebelum melanjutkan ke checkout.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-xl bg-[#171512] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b2824]"
            >
              Lihat Produk
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const total = getCartTotal(cart);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* HERO */}

      <section className="border-b border-black/5">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9b5425]">
              NusaRasa · Checkout
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Selesaikan pesananmu.
            </h1>

            <p className="mt-4 text-sm leading-7 text-black/55 sm:text-base">
              Lengkapi informasi pengiriman dan pilih
              metode pembayaran untuk menyelesaikan
              pesanan.
            </p>
          </div>

          {/* STEP INDICATOR */}

          <div className="mt-8 flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-2 text-[#9b5425]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9b5425] text-white">
                1
              </span>
              <span className="hidden sm:inline">
                Informasi
              </span>
            </div>

            <div className="h-px w-8 bg-black/10 sm:w-14" />

            <div className="flex items-center gap-2 text-black/35">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white">
                2
              </span>
              <span className="hidden sm:inline">
                Pembayaran
              </span>
            </div>

            <div className="h-px w-8 bg-black/10 sm:w-14" />

            <div className="flex items-center gap-2 text-black/35">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white">
                3
              </span>
              <span className="hidden sm:inline">
                Selesai
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <form
          onSubmit={handleSubmit}
          className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px]"
        >
          {/* LEFT */}

          <div className="space-y-6">
            {/* CUSTOMER */}

            <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_12px_40px_rgba(23,21,18,0.04)] sm:p-8">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e5d8] text-sm font-bold text-[#9b5425]">
                  01
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Informasi Pelanggan
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-black/45">
                    Data ini digunakan untuk proses
                    pengiriman pesanan.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="customerName"
                    className="text-sm font-semibold"
                  >
                    Nama Lengkap
                  </label>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    disabled={isSubmitting}
                    className="mt-2.5 w-full rounded-xl border border-black/10 bg-[#fcfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-[#9b5425] focus:bg-white focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="customerPhone"
                    className="text-sm font-semibold"
                  >
                    Nomor HP
                  </label>

                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(event.target.value)
                    }
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={isSubmitting}
                    className="mt-2.5 w-full rounded-xl border border-black/10 bg-[#fcfbf8] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-[#9b5425] focus:bg-white focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="text-sm font-semibold"
                  >
                    Alamat Pengiriman
                  </label>

                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) =>
                      setDeliveryAddress(event.target.value)
                    }
                    placeholder="Masukkan alamat lengkap pengiriman"
                    autoComplete="street-address"
                    rows={5}
                    disabled={isSubmitting}
                    className="mt-2.5 w-full resize-none rounded-xl border border-black/10 bg-[#fcfbf8] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-black/30 focus:border-[#9b5425] focus:bg-white focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />

                  <p className="mt-2 text-xs leading-5 text-black/35">
                    Sertakan nama jalan, nomor rumah,
                    RT/RW, kelurahan, kecamatan, dan
                    informasi lainnya jika diperlukan.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="text-sm font-semibold"
                  >
                    Catatan{" "}
                    <span className="font-normal text-black/35">
                      (opsional)
                    </span>
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                    placeholder="Contoh: Kirim sore hari."
                    rows={3}
                    disabled={isSubmitting}
                    className="mt-2.5 w-full resize-none rounded-xl border border-black/10 bg-[#fcfbf8] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-black/30 focus:border-[#9b5425] focus:bg-white focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT */}

            <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_12px_40px_rgba(23,21,18,0.04)] sm:p-8">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e5d8] text-sm font-bold text-[#9b5425]">
                  02
                </div>

                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Metode Pembayaran
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-black/45">
                    Pilih metode pembayaran yang tersedia.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <label
                  className={`flex cursor-pointer gap-4 rounded-2xl border p-5 transition ${
                    paymentMethod === "cash"
                      ? "border-[#9b5425] bg-[#fbf4ed] shadow-sm"
                      : "border-black/10 bg-white hover:bg-[#fcfbf8]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() =>
                      setPaymentMethod("cash")
                    }
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 accent-[#9b5425]"
                  />

                  <div>
                    <p className="font-semibold">
                      Cash
                    </p>

                    <p className="mt-1 text-sm leading-6 text-black/45">
                      Bayar secara tunai sesuai instruksi
                      dari penjual.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer gap-4 rounded-2xl border p-5 transition ${
                    paymentMethod === "bank_transfer"
                      ? "border-[#9b5425] bg-[#fbf4ed] shadow-sm"
                      : "border-black/10 bg-white hover:bg-[#fcfbf8]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={
                      paymentMethod === "bank_transfer"
                    }
                    onChange={() =>
                      setPaymentMethod("bank_transfer")
                    }
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 accent-[#9b5425]"
                  />

                  <div>
                    <p className="font-semibold">
                      Transfer Bank
                    </p>

                    <p className="mt-1 text-sm leading-6 text-black/45">
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
                className="rounded-2xl border border-red-200 bg-red-50 p-5"
              >
                <p className="text-sm font-semibold text-red-800">
                  Gagal membuat pesanan
                </p>

                <p className="mt-1.5 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* SECURITY */}

            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e5d8] text-sm text-[#9b5425]">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Pesanan aman
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/40">
                    Harga produk akan diverifikasi kembali
                    oleh server saat pesanan dibuat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <aside className="h-fit rounded-[1.75rem] bg-[#171512] p-6 text-white shadow-[0_20px_60px_rgba(23,21,18,0.16)] sm:p-7 lg:sticky lg:top-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d99561]">
              Pesananmu
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Ringkasan Pesanan
            </h2>

            <div className="mt-7 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] text-white/30">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-white/90">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {item.quantity} ×{" "}
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-white">
                    {formatRupiah(
                      item.price * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div className="space-y-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/45">
                  Jumlah item
                </span>

                <span className="font-medium">
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/45">
                  Subtotal
                </span>

                <span className="font-medium">
                  {formatRupiah(total)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/45">
                  Diskon
                </span>

                <span className="font-medium">
                  Rp0
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/45">
                  Pengiriman
                </span>

                <span className="font-medium text-white/60">
                  Rp0
                </span>
              </div>
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Total
                </p>

                <p className="mt-1 text-[11px] text-white/35">
                  Total sementara
                </p>
              </div>

              <p className="text-2xl font-semibold tracking-tight text-[#d99561]">
                {formatRupiah(total)}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 flex w-full items-center justify-center rounded-xl bg-white px-6 py-4 text-sm font-bold text-[#171512] transition hover:bg-[#f1e5d8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#171512] border-t-transparent" />
                  Memproses Pesanan...
                </>
              ) : (
                "Buat Pesanan"
              )}
            </button>

            <Link
              href="/cart"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              ← Kembali ke Keranjang
            </Link>

            <p className="mt-5 text-center text-[11px] leading-5 text-white/30">
              {cart.length} jenis produk · {totalItems} item
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}

function formatOrderStatus(value?: string) {
  if (!value) {
    return "Menunggu";
  }

  const labels: Record<string, string> = {
    pending: "Menunggu diproses",
    confirmed: "Pesanan dikonfirmasi",
    preparing: "Pesanan sedang diproses",
    ready: "Pesanan siap",
    completed: "Pesanan selesai",
    cancelled: "Pesanan dibatalkan",
  };

  return labels[value] ?? value;
}

function formatPaymentMethod(value?: string) {
  if (!value) {
    return "—";
  }

  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer Bank",
  };

  return labels[value] ?? value;
}

function formatPaymentStatus(value?: string) {
  if (!value) {
    return "Menunggu";
  }

  const labels: Record<string, string> = {
    unpaid: "Belum dibayar",
    pending: "Menunggu pembayaran",
    paid: "Sudah dibayar",
    failed: "Pembayaran gagal",
  };

  return labels[value] ?? value;
}