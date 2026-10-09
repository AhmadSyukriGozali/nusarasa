import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Kelola produk, pesanan, kategori, dan operasional UMKM melalui dashboard admin NusaRasa.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Admin Dashboard - NusaRasa",
    description:
      "Dashboard untuk mengelola produk, pesanan, dan operasional NusaRasa.",
    url: "/admin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Dashboard - NusaRasa",
    description:
      "Dashboard untuk mengelola produk, pesanan, dan operasional NusaRasa.",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/account");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="min-h-screen lg:pl-0">
        {children}
      </div>
    </div>
  );
}
