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

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
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

  // =========================================================
  // AUTH
  // =========================================================

  const { data: claimsData } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub as string | undefined;

  let profile: Profile | null = null;

  if (userId) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", userId)
      .maybeSingle();

    profile = profileData as Profile | null;
  }

  // =========================================================
  // CATEGORIES
  // =========================================================

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  const typedCategories = (categories ?? []) as Category[];

  // =========================================================
  // PRODUCTS
  // =========================================================

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

  const typedProducts = (products ?? []) as Product[];

  // =========================================================
  // USER DISPLAY
  // =========================================================

  const displayName =
    profile?.full_name?.trim() ||
    profile?.email?.split("@")[0] ||
    "Akun Saya";

  const isAdmin = profile?.role === "admin";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-black"
          >
            NusaRasa
          </Link>

          {/* NAVIGATION */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-gray-600 transition hover:text-black"
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
              href="/cart"
              className="text-gray-600 transition hover:text-black"
            >
              Keranjang
            </Link>

            {/* =================================================
                AUTH NAVIGATION
            ================================================= */}

            {!userId ? (
              <>
                <Link
                  href="/login"
                  className="rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="hidden font-medium text-gray-700 transition hover:text-black sm:inline"
                >
                  Daftar
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>

                  <span className="max-w-[140px] truncate">
                    {displayName}
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* PAGE TITLE */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-gray-500">
            NusaRasa
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Produk
          </h1>

          <p className="mt-2 text-gray-600">
            Temukan berbagai produk pilihan dari NusaRasa.
          </p>
        </div>

        {/* ===================================================
            CATEGORY FILTER
        =================================================== */}
        {typedCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !selectedCategory
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                }`}
              >
                Semua
              </Link>

              {typedCategories.map((category) => {
                const isActive = selectedCategory === category.slug;

                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(
                      category.slug
                    )}`}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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

        {/* ===================================================
            CATEGORY ERROR
        =================================================== */}
        {categoriesError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal mengambil data kategori.
          </div>
        )}

        {/* ===================================================
            PRODUCT ERROR
        =================================================== */}
        {productsError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal mengambil data produk.
          </div>
        )}

        {/* ===================================================
            PRODUCT GRID
        =================================================== */}
        {typedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {typedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* IMAGE */}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      Tidak ada gambar
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-5">
                  {/* CATEGORY */}
                  {product.categories?.name && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {product.categories.name}
                    </p>
                  )}

                  {/* NAME */}
                  <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  {/* DESCRIPTION */}
                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                      {product.description}
                    </p>
                  )}

                  {/* PRICE */}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-black">
                      {formatRupiah(product.price)}
                    </p>

                    <span className="text-xs text-gray-500">
                      Stok {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <h2 className="text-xl font-semibold text-gray-900">
                Produk belum tersedia
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Belum ada produk yang tersedia pada kategori ini.
              </p>

              {selectedCategory && (
                <Link
                  href="/products"
                  className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Lihat Semua Produk
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col justify-between gap-4 text-sm text-gray-500 sm:flex-row">
            <p>© {new Date().getFullYear()} NusaRasa.</p>

            <div className="flex gap-5">
              <Link
                href="/"
                className="transition hover:text-black"
              >
                Beranda
              </Link>

              <Link
                href="/products"
                className="transition hover:text-black"
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
        </div>
      </footer>
    </main>
  );
}