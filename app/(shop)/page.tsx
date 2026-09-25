import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

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
  categories:
    | {
        name: string;
        slug: string;
      }[]
    | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  // ==================================================
  // AMBIL KATEGORI
  // ==================================================

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categories: Category[] =
    categoriesData ?? [];

  // ==================================================
  // AMBIL PRODUK TERBARU
  // ==================================================

  const { data: productsData } = await supabase
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
        categories (
          name,
          slug
        )
      `
    )
    .eq("is_available", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(8);

  const products: Product[] =
    (productsData as Product[] | null) ?? [];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center">
          {/* HERO TEXT */}

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              UMKM Indonesia
            </p>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Rasa lokal,
              <br />
              pengalaman digital.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Temukan berbagai produk pilihan dari
              UMKM lokal dengan pengalaman belanja
              yang sederhana, cepat, dan modern.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/products"
                className="rounded-xl bg-black px-6 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Produk
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Buat Akun
              </Link>
            </div>
          </div>

          {/* HERO CARD */}

          <div className="relative overflow-hidden rounded-3xl bg-black p-7 text-white shadow-xl sm:p-8 md:p-12">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.05]" />

            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/[0.04]" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                NusaRasa
              </p>

              <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
                Belanja produk lokal dengan cara
                yang lebih mudah.
              </h2>

              <p className="mt-4 max-w-lg leading-7 text-gray-300">
                Dari produk rumahan sampai makanan
                favorit, semuanya tersedia dalam satu
                platform.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-2xl font-bold">
                    {categories.length}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Kategori
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-2xl font-bold">
                    {products.length}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Produk terbaru
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          KATEGORI
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Jelajahi
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Kategori Produk
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden font-medium text-gray-600 transition hover:text-black sm:block"
          >
            Lihat semua →
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-gray-400 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-700 transition duration-300 group-hover:bg-black group-hover:text-white">
                    {category.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span className="text-lg text-gray-300 transition duration-300 group-hover:translate-x-1 group-hover:text-black">
                    →
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Lihat produk kategori ini
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Belum ada kategori produk.
          </div>
        )}

        <Link
          href="/products"
          className="mt-5 block text-center font-medium text-gray-600 transition hover:text-black sm:hidden"
        >
          Lihat semua produk →
        </Link>
      </section>

      {/* ==================================================
          PRODUK TERBARU
      ================================================== */}

      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Pilihan
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Produk Terbaru
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden font-medium text-gray-600 transition hover:text-black sm:block"
            >
              Lihat semua →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const categoryName =
                  product.categories?.[0]?.name ??
                  "Tanpa kategori";

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                        {categoryName}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug">
                        {product.name}
                      </h3>

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

                          <p className="mt-0.5 font-bold text-gray-900">
                            {formatRupiah(product.price)}
                          </p>
                        </div>

                        <p className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                          Stok {product.stock}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              Belum ada produk yang tersedia.
            </div>
          )}

          <Link
            href="/products"
            className="mt-8 block text-center font-medium text-gray-600 transition hover:text-black sm:hidden"
          >
            Lihat semua produk →
          </Link>
        </div>
      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-black p-7 text-white sm:p-8 md:p-12">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.04]" />

          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/[0.03]" />

          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              NusaRasa
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Siap mulai belanja?
            </h2>

            <p className="mt-4 leading-7 text-gray-300">
              Jelajahi produk lokal pilihan dan
              temukan rasa baru dari UMKM Indonesia.
            </p>

            <div className="mt-7">
              <Link
                href="/products"
                className="inline-block w-full rounded-xl bg-white px-6 py-3 text-center font-semibold text-black transition hover:bg-gray-200 sm:w-auto"
              >
                Jelajahi Produk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-gray-900">
              NusaRasa
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Platform digital untuk UMKM lokal.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
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

            <Link
              href="/account"
              className="transition hover:text-black"
            >
              Akun
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-gray-400 sm:px-6">
            © {new Date().getFullYear()} NusaRasa. All
            rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}