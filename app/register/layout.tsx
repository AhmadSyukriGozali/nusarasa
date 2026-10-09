import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Buat akun NusaRasa untuk menemukan makanan lokal, memesan produk UMKM, dan memantau pesananmu.",

  openGraph: {
    title: "Daftar - NusaRasa",
    description:
      "Gabung dengan NusaRasa dan temukan pilihan makanan lokal dari berbagai UMKM.",
    url: "/register",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Daftar - NusaRasa",
    description:
      "Gabung dengan NusaRasa dan temukan pilihan makanan lokal dari berbagai UMKM.",
  },

  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}