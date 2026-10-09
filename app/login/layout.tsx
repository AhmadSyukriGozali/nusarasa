import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke akun NusaRasa untuk memesan makanan lokal, memantau pesanan, dan mengelola akunmu.",

  openGraph: {
    title: "Masuk - NusaRasa",
    description:
      "Masuk ke NusaRasa dan nikmati pilihan makanan lokal dari berbagai UMKM.",
    url: "/login",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Masuk - NusaRasa",
    description:
      "Masuk ke NusaRasa dan nikmati pilihan makanan lokal dari berbagai UMKM.",
  },

  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}