import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductManager from "./product-manager";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const [{ data: products, error: productsError }, { data: categories }] =
    await Promise.all([
      supabase
        .from("products")
        .select(`
          id,
          category_id,
          name,
          slug,
          description,
          price,
          stock,
          image_url,
          is_available,
          created_at,
          categories (
            id,
            name,
            slug
          )
        `)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name"),
    ]);

  if (productsError) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Kembali ke Dashboard
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="font-semibold">
              Gagal mengambil data produk
            </h1>

            <p className="mt-2 text-sm">
              {productsError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Kembali ke Dashboard
          </Link>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">
              NusaRasa
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Kelola Produk
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Tambahkan, ubah, hapus, dan kelola foto produk NusaRasa.
            </p>
          </div>
        </div>

        <ProductManager
          initialProducts={products ?? []}
          categories={categories ?? []}
        />
      </div>
    </main>
  );
}