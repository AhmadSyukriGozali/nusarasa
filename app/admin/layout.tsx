import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/admin-sidebar";

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
