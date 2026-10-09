import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Akun",
  description:
    "Kelola profil, lihat riwayat pesanan, dan pantau aktivitas belanja kamu di NusaRasa.",
  openGraph: {
    title: "Akun - NusaRasa",
    description:
      "Kelola profil dan pantau pesananmu melalui akun NusaRasa.",
    url: "/account",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akun - NusaRasa",
    description:
      "Kelola profil dan pantau pesananmu melalui akun NusaRasa.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  return <>{children}</>;
}