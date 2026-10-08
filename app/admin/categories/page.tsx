import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryManager from "./category-manager";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const {
    data: categories,
    error,
  } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      is_active,
      created_at,
      updated_at
    `)
    .order("name", {
      ascending: true,
    });

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6f675f] transition hover:text-[#171512]"
          >
            <span>←</span>
            Kembali ke Dashboard
          </Link>

          <div className="mt-8 overflow-hidden rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              NusaRasa / Categories
            </p>

            <h1 className="mt-2 text-xl font-bold text-red-900">
              Gagal mengambil data kategori
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6f675f] transition hover:text-[#171512]"
          >
            <span>←</span>
            Kembali ke Dashboard
          </Link>

          <div className="mt-7 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45d2b]">
              NusaRasa / Catalog
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#171512] sm:text-4xl">
              Kelola Kategori
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756d64] sm:text-base">
              Atur kategori produk agar katalog NusaRasa tetap
              rapi, mudah dijelajahi, dan konsisten.
            </p>
          </div>
        </header>

        <CategoryManager
          initialCategories={categories ?? []}
        />
      </div>
    </main>
  );
}