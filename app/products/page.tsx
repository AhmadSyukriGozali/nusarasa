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

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;

  const supabase = await createClient();

  // Ambil kategori aktif
  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  const typedCategories = (categories ?? []) as Category[];

  // Ambil produk beserta kategori
  let query = supabase
    .from("products")
    .select(`
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
    `)
    .eq("is_available", true)
    .gt("stock", 0)
    .order("created_at", {
      ascending: false,
    });

  // Filter kategori
  if (selectedCategory) {
    const category = typedCategories.find(
      (item) => item.slug === selectedCategory
    );

    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  const {
    data: products,
    error: productsError,
  } = await query;

  console.error("PRODUCT QUERY ERROR:", productsError);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            NusaRasa
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-black"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="font-semibold text-black"
            >
              Produk
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-black px-4 py-2 font-medium text-white"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Heading */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Katalog
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Semua Produk
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Temukan makanan, minuman, dan camilan pilihan NusaRasa.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !selectedCategory
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Semua
          </Link>

          {typedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category.slug
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Category Error */}
        {categoriesError && (
          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
            <p className="font-semibold">
              Gagal mengambil kategori.
            </p>

            <p className="mt-1">
              {categoriesError.message}
            </p>
          </div>
        )}

        {/* Product Error */}
        {productsError ? (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">
              Gagal mengambil data produk.
            </p>

            <p className="mt-2">
              {productsError.message}
            </p>
          </div>
        ) : products && products.length > 0 ? (
          /* Product Grid */
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const category = Array.isArray(product.categories)
                ? product.categories[0]
                : product.categories;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">
                        Foto Produk
                      </span>
                    )}
                  </div>

                  {/* Information */}
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {category?.name ?? "Tanpa kategori"}
                    </p>

                    <h2 className="mt-2 font-semibold text-gray-900">
                      {product.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {product.description ??
                        "Tidak ada deskripsi produk."}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-bold text-gray-900">
                        {formatRupiah(Number(product.price))}
                      </p>

                      <span className="text-xs text-gray-500">
                        Stok {product.stock}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-10 rounded-2xl bg-white p-12 text-center">
            <p className="text-gray-500">
              Tidak ada produk pada kategori ini.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}