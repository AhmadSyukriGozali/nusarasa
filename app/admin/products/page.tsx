import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import ProductManager from "./product-manager";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const [
    { data: products, error: productsError },
    { data: categories },
  ] = await Promise.all([
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
      <main className="min-h-screen bg-[#f7f5f0] px-5 py-8 text-[#171512] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm font-semibold text-[#71695f] transition hover:text-[#171512]"
          >
            <span className="mr-2">←</span>
            Kembali ke Dashboard
          </Link>

          <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                !
              </div>

              <div>
                <h1 className="font-semibold text-red-800">
                  Gagal mengambil data produk
                </h1>

                <p className="mt-2 text-sm leading-6 text-red-600">
                  {productsError.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const productCount = products?.length ?? 0;
  const categoryCount = categories?.length ?? 0;
  const availableCount =
    products?.filter(
      (product) =>
        product.is_available && product.stock > 0
    ).length ?? 0;
  const lowStockCount =
    products?.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5
    ).length ?? 0;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <Link
          href="/admin"
          className="inline-flex items-center text-sm font-semibold text-[#71695f] transition hover:text-[#171512]"
        >
          <span className="mr-2">←</span>
          Dashboard
        </Link>

        {/* Header */}
        <header className="mt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a95d2c]" />

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8b8175]">
                  NusaRasa Admin
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Kelola Produk
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71695f]">
                Kelola katalog, harga, stok, kategori, dan
                foto produk NusaRasa.
              </p>
            </div>
          </div>
        </header>

        {/* Overview */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            label="Total Produk"
            value={String(productCount)}
            description="Produk dalam katalog"
          />

          <OverviewCard
            label="Produk Aktif"
            value={String(availableCount)}
            description="Tersedia dan memiliki stok"
            accent
          />

          <OverviewCard
            label="Stok Rendah"
            value={String(lowStockCount)}
            description="Stok 1–5 item"
          />

          <OverviewCard
            label="Kategori Aktif"
            value={String(categoryCount)}
            description="Kategori yang tersedia"
          />
        </section>

        {/* Product Manager */}
        <div className="mt-8">
          <ProductManager
            initialProducts={products ?? []}
            categories={categories ?? []}
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e5dfd6] pt-6 pb-4">
          <div className="flex flex-col gap-2 text-xs text-[#9a9186] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} NusaRasa
            </p>

            <p>Product Management</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function OverviewCard({
  label,
  value,
  description,
  accent = false,
}: {
  label: string;
  value: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-[#e8e2d9] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b8175]">
          {label}
        </p>

        <span
          className={`h-2 w-2 rounded-full ${
            accent
              ? "bg-[#a95d2c]"
              : "bg-[#c9c1b6]"
          }`}
        />
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#948b80]">
        {description}
      </p>
    </div>
  );
}