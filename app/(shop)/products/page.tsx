import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  categories:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | null;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;

  const supabase = await createClient();

  // ==================================================
  // CATEGORIES
  // ==================================================

  const {
    data: categoriesData,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categories: Category[] =
    categoriesData ?? [];

  // ==================================================
  // PRODUCTS
  // ==================================================

  let query = supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        stock,
        image_url,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `
    )
    .eq("is_available", true)
    .gt("stock", 0)
    .order("created_at", {
      ascending: false,
    });

  if (selectedCategory) {
    const category = categories.find(
      (item) => item.slug === selectedCategory
    );

    if (category) {
      query = query.eq(
        "category_id",
        category.id
      );
    }
  }

  const {
    data: productsData,
    error: productsError,
  } = await query;

  const products: Product[] =
    (productsData as Product[] | null) ?? [];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              NusaRasa
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Produk
            </h1>

            <p className="mt-3 text-base leading-7 text-gray-600">
              Temukan berbagai produk pilihan dari
              UMKM lokal.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* ==================================================
            CATEGORY FILTER
        ================================================== */}

        {categories.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Kategori
              </h2>

              {selectedCategory && (
                <Link
                  href="/products"
                  className="text-sm font-medium text-gray-500 transition hover:text-black"
                >
                  Reset filter
                </Link>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Link
                href="/products"
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  !selectedCategory
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                }`}
              >
                Semua
              </Link>

              {categories.map((category) => {
                const isActive =
                  selectedCategory ===
                  category.slug;

                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(
                      category.slug
                    )}`}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================
            ERRORS
        ================================================== */}

        {categoriesError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal mengambil data kategori.
          </div>
        )}

        {productsError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal mengambil data produk.
          </div>
        )}

        {/* ==================================================
            RESULT INFO
        ================================================== */}

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              {selectedCategory
                ? `Kategori: ${
                    categories.find(
                      (category) =>
                        category.slug ===
                        selectedCategory
                    )?.name ??
                    selectedCategory
                  }`
                : "Semua produk"}
            </p>
          </div>

          <p className="text-sm font-medium text-gray-500">
            {products.length} produk
          </p>
        </div>

        {/* ==================================================
            PRODUCT GRID
        ================================================== */}

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
              >
                {/* IMAGE */}

                <div className="aspect-square overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      Tidak ada gambar
                    </div>
                  )}
                </div>

                {/* PRODUCT INFO */}

                <div className="p-5">
                  {product.categories?.name && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                      {product.categories.name}
                    </p>
                  )}

                  <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-900">
                    {product.name}
                  </h2>

                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400">
                        Harga
                      </p>

                      <p className="mt-0.5 text-lg font-bold text-black">
                        {formatRupiah(product.price)}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                      Stok {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ==================================================
             EMPTY STATE
          ================================================== */

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                —
              </div>

              <h2 className="mt-5 text-xl font-semibold text-gray-900">
                Produk belum tersedia
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {selectedCategory
                  ? "Belum ada produk yang tersedia pada kategori ini."
                  : "Belum ada produk yang tersedia saat ini."}
              </p>

              {selectedCategory && (
                <Link
                  href="/products"
                  className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Lihat Semua Produk
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} NusaRasa.
          </p>

          <div className="flex gap-5">
            <Link
              href="/"
              className="transition hover:text-black"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="font-medium text-black"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="transition hover:text-black"
            >
              Keranjang
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}