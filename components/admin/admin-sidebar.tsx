"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type IconProps = {
  className?: string;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: (props: IconProps) => React.ReactNode;
  exact?: boolean;
};

function DashboardIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function ClipboardIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M9 10h6M9 14h6M9 18h4" />
    </svg>
  );
}

function PackageIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.5 7.5 4 7.5-4M12 12v9" />
    </svg>
  );
}

function StoreIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10h16" />
      <path d="M5 10v10h14V10" />
      <path d="M3 10 5 4h14l2 6" />
      <path d="M8 10v2a2 2 0 0 0 4 0v-2" />
      <path d="M12 10v2a2 2 0 0 0 4 0v-2" />
    </svg>
  );
}

function SettingsIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function ExternalLinkIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 5h5v5" />
      <path d="M19 5l-8 8" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function LogOutIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H7" />
    </svg>
  );
}

function MenuIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronIcon({
  className = "h-4 w-4",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function UserIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

const mainNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: DashboardIcon,
    exact: true,
  },
  {
    label: "Pesanan",
    href: "/admin/orders",
    icon: ClipboardIcon,
  },
];

const storeNavigation: NavigationItem[] = [
  {
    label: "Produk",
    href: "/admin/products",
    icon: PackageIcon,
  },
];

const systemNavigation: NavigationItem[] = [];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [displayName, setDisplayName] = useState("Administrator");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: claimsData,
      } = await supabase.auth.getClaims();

      const userId = claimsData?.claims?.sub;

      if (!userId) {
        return;
      }

      const {
        data: profile,
      } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (profile?.full_name) {
        setDisplayName(profile.full_name);
      }

      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }

    loadProfile();
  }, [supabase]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(item: NavigationItem) {
    if (item.exact) {
      return pathname === item.href;
    }

    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
    );
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Admin logout error:",
        error
      );

      setLoggingOut(false);
      return;
    }

    setMobileOpen(false);
    setDesktopOpen(false);

    router.replace("/login");
    router.refresh();
  }

  function NavigationLink({
    item,
  }: {
    item: NavigationItem;
  }) {
    const active = isActive(item);

    return (
      <Link
        href={item.href}
        onClick={closeMobileMenu}
        className={`group relative flex h-[46px] items-center gap-3 overflow-hidden whitespace-nowrap rounded-xl px-3.5 text-sm font-medium transition-all duration-300 ${
          active
            ? "bg-white/[0.12] text-white shadow-sm"
            : "text-white/70 hover:bg-white/[0.07] hover:text-white"
        }`}
      >
        <span
          className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all duration-300 ${
            active
              ? "bg-white opacity-100"
              : "bg-white opacity-0 group-hover:opacity-30"
          }`}
        />

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
            active
              ? "bg-white/10 text-white"
              : "text-white/60 group-hover:bg-white/5 group-hover:text-white"
          }`}
        >
          <item.icon className="h-[19px] w-[19px]" />
        </span>

        <span className="truncate">
          {item.label}
        </span>

        <span
          className={`ml-auto transition-all duration-300 ${
            active
              ? "translate-x-0 opacity-100"
              : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
          }`}
        >
          <ChevronIcon className="h-4 w-4" />
        </span>
      </Link>
    );
  }

  function NavigationSection({
    title,
    items,
  }: {
    title: string;
    items: NavigationItem[];
  }) {
    if (items.length === 0) {
      return null;
    }

    return (
      <section>
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
          {title}
        </p>

        <nav className="space-y-1">
          {items.map((item) => (
            <NavigationLink
              key={item.href}
              item={item}
            />
          ))}
        </nav>
      </section>
    );
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        {/* BRAND */}
        <div className="flex h-[82px] shrink-0 items-center border-b border-white/[0.08] px-5">
          <Link
            href="/admin"
            onClick={closeMobileMenu}
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black tracking-tight text-black shadow-lg shadow-black/20 transition-transform duration-300 group-hover:scale-105">
              NR
            </div>

            <div className="min-w-0">
              <p className="truncate text-[17px] font-bold tracking-tight text-white">
                NusaRasa
              </p>

              <p className="truncate text-[11px] font-medium tracking-wide text-white/40">
                ADMIN PANEL
              </p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-7">
            <NavigationSection
              title="Utama"
              items={mainNavigation}
            />

            <NavigationSection
              title="Toko"
              items={storeNavigation}
            />

            <NavigationSection
              title="Sistem"
              items={systemNavigation}
            />

            {/* LIHAT TOKO */}
            <section>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Akses
              </p>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                className="group flex h-[46px] items-center gap-3 overflow-hidden whitespace-nowrap rounded-xl px-3.5 text-sm font-medium text-white/70 transition-all duration-300 hover:bg-white/[0.07] hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition-all duration-300 group-hover:bg-white/5 group-hover:text-white">
                  <StoreIcon className="h-[19px] w-[19px]" />
                </span>

                <span className="truncate">
                  Lihat Toko
                </span>

                <span className="ml-auto opacity-40 transition-all duration-300 group-hover:opacity-70">
                  <ExternalLinkIcon className="h-4 w-4" />
                </span>
              </Link>
            </section>
          </div>
        </div>

        {/* PROFILE */}
        <div className="shrink-0 border-t border-white/[0.08] p-3">
          <div className="rounded-2xl bg-white/[0.05] p-2">
            <Link
              href="/account"
              onClick={closeMobileMenu}
              className="group flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300 hover:bg-white/[0.06]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-sm font-bold text-black ring-1 ring-white/10">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>

                <p className="truncate text-xs capitalize text-white/40">
                  Administrator
                </p>
              </div>

              <ChevronIcon className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white/60" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="group mt-1 flex h-[42px] w-full items-center gap-3 rounded-xl px-2.5 text-sm font-medium text-white/50 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-red-500/10">
                <LogOutIcon className="h-[18px] w-[18px]" />
              </span>

              <span>
                {loggingOut
                  ? "Logout..."
                  : "Logout"}
              </span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between px-2">
            <span className="text-[10px] text-white/20">
              © NusaRasa
            </span>

            <SettingsIcon className="h-3.5 w-3.5 text-white/15" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:block">
        <div
          className="fixed inset-y-0 left-0 z-[60] w-5"
          onMouseEnter={() =>
            setDesktopOpen(true)
          }
          aria-hidden="true"
        />

        <aside
          onMouseEnter={() =>
            setDesktopOpen(true)
          }
          onMouseLeave={() =>
            setDesktopOpen(false)
          }
          className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-[#111111] shadow-2xl shadow-black/30 transition-transform duration-300 ease-out ${
            desktopOpen
              ? "translate-x-0"
              : "-translate-x-[calc(100%-12px)]"
          }`}
        >
          <SidebarContent />

          {!desktopOpen && (
            <div className="absolute inset-y-0 right-0 flex w-3 items-center justify-center">
              <div className="h-20 w-1 rounded-full bg-white/20" />
            </div>
          )}
        </aside>

        <div
          className={`fixed left-0 top-1/2 z-[55] flex h-16 w-3 -translate-y-1/2 items-center justify-center transition-opacity duration-300 ${
            desktopOpen
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }`}
          aria-hidden="true"
        >
          <div className="h-10 w-1 rounded-r-full bg-black/20" />
        </div>
      </div>

      {/* MOBILE TOP BAR */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-xl lg:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-xs font-black text-white">
            NR
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-gray-900">
              NusaRasa
            </p>

            <p className="text-[9px] font-medium tracking-[0.16em] text-gray-400">
              ADMIN PANEL
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu admin"
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-black"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu admin"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[285px] bg-[#111111] shadow-2xl shadow-black/30 transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute right-3 top-5 z-10">
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Tutup menu admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <SidebarContent />
      </aside>

      {/* MOBILE FLOATING BUTTON */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka sidebar admin"
          aria-expanded={mobileOpen}
          className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105 hover:bg-gray-800 lg:hidden"
        >
          <DashboardIcon className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
