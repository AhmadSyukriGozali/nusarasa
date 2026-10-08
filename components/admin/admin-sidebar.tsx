"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ComponentType,
} from "react";
import { createClient } from "@/lib/supabase/client";

type IconProps = {
  className?: string;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
  exact?: boolean;
};

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
  {
    label: "Kategori",
    href: "/admin/categories",
    icon: CategoryIcon,
  },
];

const systemNavigation: NavigationItem[] = [];

function DashboardIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
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
      strokeWidth="1.7"
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
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.5 7.5 4 7.5-4" />
      <path d="M12 12v9" />
    </svg>
  );
}

function CategoryIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l2 2h5.5A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
      <path d="M4 9h16" />
      <path d="M8 13h8M8 16h5" />
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
      strokeWidth="1.7"
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
      strokeWidth="1.7"
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
      strokeWidth="1.7"
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
      strokeWidth="1.7"
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
      strokeWidth="1.7"
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
      strokeWidth="1.7"
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

type NavigationLinkProps = {
  item: NavigationItem;
  pathname: string;
  onNavigate: () => void;
};

function NavigationLink({
  item,
  pathname,
  onNavigate,
}: NavigationLinkProps) {
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href ||
      pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative flex h-[48px] items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-white/[0.10] text-white"
          : "text-white/55 hover:bg-white/[0.055] hover:text-white/90"
      }`}
    >
      {/* Active indicator */}
      <span
        className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#c27336] transition-all duration-300 ${
          active
            ? "opacity-100"
            : "opacity-0"
        }`}
      />

      {/* Icon */}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
          active
            ? "bg-[#c27336]/15 text-[#d99761]"
            : "text-white/45 group-hover:bg-white/[0.06] group-hover:text-white/80"
        }`}
      >
        <item.icon className="h-[18px] w-[18px]" />
      </span>

      {/* Label */}
      <span className="min-w-0 flex-1 truncate">
        {item.label}
      </span>

      {/* Arrow */}
      <span
        className={`shrink-0 transition-all duration-300 ${
          active
            ? "translate-x-0 opacity-60"
            : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-30"
        }`}
      >
        <ChevronIcon className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

type NavigationSectionProps = {
  title: string;
  items: NavigationItem[];
  pathname: string;
  onNavigate: () => void;
};

function NavigationSection({
  title,
  items,
  pathname,
  onNavigate,
}: NavigationSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-2 flex items-center gap-3 px-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
          {title}
        </p>

        <div className="h-px flex-1 bg-white/[0.045]" />
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </section>
  );
}

type SidebarContentProps = {
  pathname: string;
  displayName: string;
  avatarUrl: string | null;
  loggingOut: boolean;
  onNavigate: () => void;
  onLogout: () => void;
};

function SidebarContent({
  pathname,
  displayName,
  avatarUrl,
  loggingOut,
  onNavigate,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* BRAND */}
      <div className="relative flex h-[88px] shrink-0 items-center border-b border-white/[0.07] px-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="group flex min-w-0 items-center gap-3"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-[13px] font-black tracking-tight text-[#171512] shadow-[0_8px_25px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:scale-[1.04]">
            NR
          </div>

          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold tracking-[-0.02em] text-white">
              NusaRasa
            </p>

            <div className="mt-0.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c27336]" />

              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Admin Panel
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
        <div className="space-y-7">
          <NavigationSection
            title="Utama"
            items={mainNavigation}
            pathname={pathname}
            onNavigate={onNavigate}
          />

          <NavigationSection
            title="Toko"
            items={storeNavigation}
            pathname={pathname}
            onNavigate={onNavigate}
          />

          <NavigationSection
            title="Sistem"
            items={systemNavigation}
            pathname={pathname}
            onNavigate={onNavigate}
          />

          {/* VIEW STORE */}
          <section>
            <div className="mb-2 flex items-center gap-3 px-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
                Akses
              </p>

              <div className="h-px flex-1 bg-white/[0.045]" />
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className="group flex h-[48px] items-center gap-3 rounded-2xl px-3 text-sm font-medium text-white/55 transition-all duration-300 hover:bg-white/[0.055] hover:text-white/90"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/45 transition-all duration-300 group-hover:bg-white/[0.06] group-hover:text-white/80">
                <StoreIcon className="h-[18px] w-[18px]" />
              </span>

              <span className="min-w-0 flex-1 truncate">
                Lihat Toko
              </span>

              <span className="shrink-0 text-white/25 transition-all duration-300 group-hover:text-white/60">
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          </section>
        </div>
      </div>

      {/* ADMIN PROFILE */}
      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <div className="rounded-2xl border border-white/[0.055] bg-white/[0.035] p-2">
          <Link
            href="/account"
            onClick={onNavigate}
            className="group flex min-w-0 items-center gap-3 rounded-xl px-2 py-2.5 transition-all duration-300 hover:bg-white/[0.055]"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-sm font-bold text-[#171512] ring-1 ring-white/10">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                displayName
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/90">
                {displayName}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <p className="truncate text-[10px] font-medium text-white/35">
                  Administrator
                </p>
              </div>
            </div>

            <ChevronIcon className="h-3.5 w-3.5 shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white/50" />
          </Link>

          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="group mt-1 flex h-[42px] w-full items-center gap-3 rounded-xl px-2.5 text-sm font-medium text-white/40 transition-all duration-300 hover:bg-red-500/[0.08] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-red-500/[0.08]">
              <LogOutIcon className="h-[17px] w-[17px]" />
            </span>

            <span>
              {loggingOut
                ? "Logout..."
                : "Logout"}
            </span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-2">
          <span className="text-[9px] font-medium tracking-wide text-white/15">
            NusaRasa ©
          </span>

          <SettingsIcon className="h-3.5 w-3.5 text-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [desktopOpen, setDesktopOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [displayName, setDisplayName] =
    useState("Administrator");

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: claimsData } =
        await supabase.auth.getClaims();

      const userId =
        claimsData?.claims?.sub;

      if (!userId) {
        return;
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select(
            "full_name, avatar_url"
          )
          .eq("id", userId)
          .single();

      if (profile?.full_name) {
        setDisplayName(
          profile.full_name
        );
      }

      if (profile?.avatar_url) {
        setAvatarUrl(
          profile.avatar_url
        );
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

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        {/* Invisible hover zone */}
        <div
          className="fixed inset-y-0 left-0 z-[60] w-6"
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
          className={`fixed inset-y-0 left-0 z-50 w-[278px] overflow-hidden bg-[#11110f] shadow-[12px_0_45px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${
            desktopOpen
              ? "translate-x-0"
              : "-translate-x-[calc(100%-14px)]"
          }`}
        >
          {/* Subtle top glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#c27336]/[0.07] to-transparent" />

          <SidebarContent
            pathname={pathname}
            displayName={displayName}
            avatarUrl={avatarUrl}
            loggingOut={loggingOut}
            onNavigate={() => undefined}
            onLogout={handleLogout}
          />

          {!desktopOpen && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-3 items-center justify-center">
              <div className="h-20 w-[3px] rounded-full bg-white/20" />
            </div>
          )}
        </aside>

        {/* Closed sidebar indicator */}
        <div
          className={`pointer-events-none fixed left-0 top-1/2 z-[55] flex h-16 w-3 -translate-y-1/2 items-center justify-center transition-opacity duration-300 ${
            desktopOpen
              ? "opacity-0"
              : "opacity-100"
          }`}
          aria-hidden="true"
        >
          <div className="h-10 w-[3px] rounded-r-full bg-[#171512]/20" />
        </div>
      </div>

      {/* MOBILE TOP BAR */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#e8e0d7] bg-[#f7f5f0]/95 px-4 backdrop-blur-xl lg:hidden">
        <Link
          href="/admin"
          onClick={closeMobileMenu}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171512] text-[10px] font-black tracking-tight text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
            NR
          </div>

          <div>
            <p className="text-[15px] font-bold tracking-tight text-[#171512]">
              NusaRasa
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c27336]" />

              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#91877d]">
                Admin Panel
              </p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          aria-label="Buka menu admin"
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded5cc] bg-white text-[#514a43] shadow-sm transition-all duration-300 hover:bg-[#faf8f5] hover:text-[#171512]"
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
          className="fixed inset-0 z-40 bg-[#171512]/45 backdrop-blur-[3px] lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[290px] overflow-hidden bg-[#11110f] shadow-[15px_0_50px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#c27336]/[0.07] to-transparent" />

        <div className="absolute right-3 top-5 z-10">
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Tutup menu admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/50 transition-all duration-300 hover:bg-white/[0.10] hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <SidebarContent
          pathname={pathname}
          displayName={displayName}
          avatarUrl={avatarUrl}
          loggingOut={loggingOut}
          onNavigate={closeMobileMenu}
          onLogout={handleLogout}
        />
      </aside>

      {/* MOBILE FLOATING BUTTON */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          aria-label="Buka sidebar admin"
          aria-expanded={mobileOpen}
          className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171512] text-white shadow-[0_10px_30px_rgba(23,21,18,0.22)] transition-all duration-300 hover:scale-105 hover:bg-[#302c27] lg:hidden"
        >
          <DashboardIcon className="h-5 w-5" />
        </button>
      )}
    </>
  );
}