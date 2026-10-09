import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Selesaikan pesananmu di NusaRasa. Lengkapi informasi pengiriman dan pilih metode pembayaran.",

  openGraph: {
    title: "Checkout - NusaRasa",
    description:
      "Selesaikan pesanan produk lokal pilihanmu melalui checkout NusaRasa.",
    url: "/checkout",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Checkout - NusaRasa",
    description:
      "Selesaikan pesanan produk lokal pilihanmu melalui checkout NusaRasa.",
  },

  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
