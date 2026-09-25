"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserMenuProps = {
  name: string;
  role: string;
  avatarUrl?: string | null;
};

export default function UserMenu({
  name,
  role,
  avatarUrl,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const initial = name.charAt(0).toUpperCase();

  // Tutup dropdown ketika klik di luar menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLogout() {
    setLoading(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoading(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50"
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-sm font-semibold text-white">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        {/* Name */}
        <div className="hidden text-left sm:block">
          <p className="max-w-32 truncate text-sm font-semibold text-gray-900">
            {name}
          </p>

          <p className="text-xs capitalize text-gray-500">
            {role}
          </p>
        </div>

        {/* Arrow */}
        <span
          className={`text-xs text-gray-500 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {/* User Info */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-sm font-semibold text-white">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {name}
                </p>

                <p className="text-sm capitalize text-gray-500">
                  {role}
                </p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="p-2">
            {role === "admin" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Dashboard Admin
                </Link>

                <Link
                  href="/admin/orders"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Pesanan
                </Link>
              </>
            )}

            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Akun Saya
            </Link>

            {role === "customer" && (
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Pesanan Saya
              </Link>
            )}

            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Keranjang
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {loading
                ? "Logout..."
                : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}