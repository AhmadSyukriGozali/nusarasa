export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Authentication Error
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          Terjadi masalah saat memproses authentication.
          Silakan coba login kembali.
        </p>

        <a
          href="/login"
          className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Kembali ke Login
        </a>
      </div>
    </main>
  );
}