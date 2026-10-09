import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
  description:
    "Kelola nama, nomor telepon, dan foto profil akun NusaRasa.",

  openGraph: {
    title: "Pengaturan Akun - NusaRasa",
    description:
      "Perbarui informasi profil dan foto akunmu di NusaRasa.",
    url: "/account/settings",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pengaturan Akun - NusaRasa",
    description:
      "Perbarui informasi profil dan foto akunmu di NusaRasa.",
  },

  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountSettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}