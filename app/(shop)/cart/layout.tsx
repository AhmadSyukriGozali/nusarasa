import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keranjang",
  description:
    "Periksa produk pilihanmu di keranjang NusaRasa sebelum melanjutkan ke checkout.",

  openGraph: {
    title: "Keranjang - NusaRasa",
    description:
      "Periksa produk pilihanmu sebelum melanjutkan ke checkout di NusaRasa.",
    url: "/cart",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Keranjang - NusaRasa",
    description:
      "Periksa produk pilihanmu sebelum melanjutkan ke checkout di NusaRasa.",
  },

  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
