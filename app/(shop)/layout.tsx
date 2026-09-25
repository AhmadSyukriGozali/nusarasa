import Sidebar from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub ?? null;

  let profile = null;

  if (userId) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, role, avatar_url"
      )
      .eq("id", userId)
      .single();

    profile = profileData;
  }

  const isLoggedIn = Boolean(userId);

  const displayName =
    profile?.full_name ||
    profile?.email ||
    "Pengguna";

  const role = profile?.role || "customer";

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        displayName={displayName}
        role={role}
        avatarUrl={profile?.avatar_url}
      />

      <main className="min-h-screen w-full">
        <div className="min-h-screen pt-[68px] lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}