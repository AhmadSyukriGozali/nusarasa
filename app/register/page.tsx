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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            NusaRasa
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Buat Akun
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Daftar untuk mulai menggunakan NusaRasa.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ahmad Syukri"
              autoComplete="name"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-black hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}