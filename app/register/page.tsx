"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Email wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    const origin = window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    /*
     * Jika email confirmation aktif,
     * Supabase biasanya tidak langsung memberikan session.
     */
    if (!data.session) {
      setSuccessMessage(
        "Registrasi berhasil. Silakan cek email untuk melakukan verifikasi akun."
      );

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
                Bergabung dengan NusaRasa
              </p>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-white xl:text-5xl">
                Mulai perjalanan rasa kamu.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
                Buat akun untuk menikmati pengalaman belanja makanan lokal
                yang lebih mudah dan terorganisir.
              </p>

              <div className="mt-8 space-y-3">
                <Feature
                  number="01"
                  text="Simpan informasi akun kamu"
                />

                <Feature
                  number="02"
                  text="Lacak pesanan dengan mudah"
                />

                <Feature
                  number="03"
                  text="Nikmati pilihan makanan lokal"
                />
              </div>
            </div>

            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} NusaRasa
            </p>
          </div>
        </section>

        {/* Register panel */}
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

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 sm:py-10">
            <div className="w-full max-w-md">
              {/* Heading */}
              <div className="mb-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efe9df] text-xl lg:hidden">
                  ✨
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9b5425]">
                  Create Account
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Buat akun NusaRasa.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#777067]">
                  Lengkapi data berikut untuk mulai menggunakan NusaRasa.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-xs font-semibold text-[#49443e]"
                  >
                    Nama Lengkap
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Nama lengkap kamu"
                    autoComplete="name"
                    disabled={loading}
                    className="w-full rounded-2xl border border-[#dcd5ca] bg-white px-4 py-3.5 text-sm text-[#171512] outline-none transition placeholder:text-[#aaa298] focus:border-[#9b5425] focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

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
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold text-[#49443e]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-[#dcd5ca] bg-white px-4 py-3.5 text-sm text-[#171512] outline-none transition placeholder:text-[#aaa298] focus:border-[#9b5425] focus:ring-4 focus:ring-[#9b5425]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-1.5 text-[11px] text-[#9a9389]">
                    Gunakan minimal 8 karakter.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-xs font-semibold text-[#49443e]"
                  >
                    Konfirmasi Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Ulangi password"
                    autoComplete="new-password"
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

                {successMessage && (
                  <div
                    role="status"
                    className="flex gap-3 rounded-2xl border border-[#cfe1d2] bg-[#f4faf5] p-4 text-sm text-[#477652]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dceede] text-xs font-bold">
                      ✓
                    </span>

                    <p className="leading-6">{successMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#171512] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2a2824] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      Buat Akun
                      <span className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-6 border-t border-[#e5dfd6] pt-5 text-center">
                <p className="text-sm text-[#777067]">
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#9b5425] transition hover:text-[#713c1b]"
                  >
                    Login
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
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

function Feature({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold tracking-[0.15em] text-[#c27336]">
        {number}
      </span>

      <span className="h-px w-6 bg-white/15" />

      <span className="text-xs text-white/50">{text}</span>
    </div>
  );
}