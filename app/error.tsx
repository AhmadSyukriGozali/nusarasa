"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("NusaRasa Error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.007M10.343 3.94l-7.1 12.25A1.875 1.875 0 004.87 19h14.26a1.875 1.875 0 001.627-2.81l-7.1-12.25a1.875 1.875 0 00-3.314 0z"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Terjadi Kesalahan
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Coba Lagi
        </button>
      </div>
    </main>
  );
}