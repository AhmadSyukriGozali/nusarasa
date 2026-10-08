"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        setErrorMessage("Email atau password yang kamu masukkan salah.");
      } else {
        setErrorMessage("Terjadi kesalahan saat masuk. Silakan coba lagi.");
      }

      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-[#171512] lg:flex">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#c27336]/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#9b5425]/15 blur-3xl"
          />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <Link
              href="/"
              className="flex w-fit items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c27336] text-sm font-bold text-white">
                NR
              </span>

              <div>
                <p className="text-base font-semibold text-white">
                  NusaRasa
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Local Food Marketplace
                </p>
              </div>
            </Link>

            <div className="max-w-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c27336]">
                Rasa lokal, pilihan spesial
              </p>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-white xl:text-5xl">
                Temukan rasa yang terasa dekat.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
                Masuk ke NusaRasa untuk menikmati pilihan makanan lokal,
                mengelola pesanan, dan melihat perjalanan order kamu.
              </p>

              <div className="mt-8 flex items-center gap-3 text-xs text-white/40">
                <span className="h-px w-10 bg-white/20" />
                <span>Simple. Local. Delicious.</span>
              </div>
            </div>

            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} NusaRasa
            </p>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-h-screen flex-col">
          {/* Mobile header */}
          <header className="flex items-center justify-between border-b border-[#e5dfd6] px-5 py-4 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171512] text-[11px] font-bold text-white">
                NR
              </span>

              <span className="font-semibold">NusaRasa</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-medium text-[#777067] transition hover:text-[#171512]"
            >
              Kembali ke toko
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-md">
              {/* Heading */}
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efe9df] text-xl lg:hidden">
                  👋
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9b5425]">
                  Welcome back
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Selamat datang kembali.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#777067]">
                  Login ke akun NusaRasa kamu untuk melanjutkan.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold text-[#49443e]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-2xl border border-[#dcd5ca] bg-white px-4 py-3.5 text-sm text-[#171512] outline-none transition placeholder:text-[#aaa298] focus:border-[#9b5425] focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-[#49443e]"
                    >
                      Password
                    </label>
                  </div>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-[#dcd5ca] bg-white px-4 py-3.5 text-sm text-[#171512] outline-none transition placeholder:text-[#aaa298] focus:border-[#9b5425] focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-2xl border border-[#e9c7c2] bg-[#fff7f6] p-4 text-sm text-[#9b443b]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5dfdb] text-xs font-bold">
                      !
                    </span>

                    <p className="leading-6">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#171512] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2a2824] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk ke NusaRasa
                      <span className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="mt-7 border-t border-[#e5dfd6] pt-6 text-center">
                <p className="text-sm text-[#777067]">
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-[#9b5425] transition hover:text-[#713c1b]"
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>

              {/* Back to store */}
              <div className="mt-5 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#8a8379] transition hover:text-[#171512]"
                >
                  <span>←</span>
                  Kembali ke toko
                </Link>
              </div>
            </div>
          </div>

          <footer className="px-5 pb-6 text-center lg:hidden">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#aaa298]">
              NusaRasa · Local Food Marketplace
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}