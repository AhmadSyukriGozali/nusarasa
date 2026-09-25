export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Spinner */}
          <div
            className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"
            aria-label="Memuat"
            role="status"
          />

          {/* Text */}
          <h2 className="mt-6 text-lg font-semibold text-gray-900">
            Memuat...
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    </main>
  );
}