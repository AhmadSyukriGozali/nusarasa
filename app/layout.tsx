import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://nusarasa-ecommerce.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "NusaRasa - Local Food Marketplace",
    template: "%s - NusaRasa",
  },

  description:
    "NusaRasa adalah platform marketplace makanan lokal yang membantu UMKM menjangkau pelanggan secara digital.",

  keywords: [
    "NusaRasa",
    "Local Food Marketplace",
    "Marketplace UMKM",
    "Makanan Lokal",
    "UMKM",
    "E-Commerce",
    "Next.js",
    "React",
    "TypeScript",
    "Supabase",
    "PostgreSQL",
  ],

  authors: [
    {
      name: "Ahmad Syukri Gozali",
    },
  ],

  creator: "Ahmad Syukri Gozali",

  openGraph: {
    title: "NusaRasa - Local Food Marketplace",
    description:
      "Platform marketplace makanan lokal yang membantu UMKM menjangkau pelanggan secara digital.",
    url: siteUrl,
    siteName: "NusaRasa",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NusaRasa - Local Food Marketplace",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "NusaRasa - Local Food Marketplace",
    description:
      "Platform marketplace makanan lokal yang membantu UMKM menjangkau pelanggan secara digital.",
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
