import Image from "next/image";
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
  // CATEGORIES
  // ==================================================

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categories: Category[] = categoriesData ?? [];

  // ==================================================
  // PRODUCTS
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

  const heroProduct = products[0] ?? null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f5f0] text-[#171512]">
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden border-b border-black/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(194,115,54,0.14),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(0,0,0,0.04),transparent_25%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
          {/* HERO COPY */}

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/60 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c27336]" />
              Rasa lokal, pilihan spesial
            </div>

            <h1 className="max-w-3xl text-[clamp(2.8rem,7vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.055em]">
              Temukan rasa yang terasa{" "}
              <span className="text-[#9b5425]">dekat.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
              NusaRasa mempertemukan kamu dengan produk
              pilihan dari UMKM lokal. Pilih favoritmu,
              masukkan ke keranjang, lalu pesan dengan mudah.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#171512] px-7 font-semibold text-white shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#2a2722]"
              >
                Jelajahi Produk
                <span className="ml-2 text-base">→</span>
              </Link>

              <Link
                href="#produk"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-white/70 px-7 font-semibold text-[#171512] transition duration-300 hover:border-black/20 hover:bg-white"
              >
                Lihat Pilihan Hari Ini
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-black/10 pt-6 text-sm text-black/55">
              <span>
                <strong className="text-[#171512]">
                  {products.length}+
                </strong>{" "}
                produk tersedia
              </span>

              <span>
                <strong className="text-[#171512]">
                  {categories.length}
                </strong>{" "}
                kategori
              </span>

              <span>Pesan langsung secara online</span>
            </div>
          </div>

          {/* HERO PRODUCT */}

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-[#c27336]/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#e7dfd2] shadow-[0_30px_80px_rgba(23,21,18,0.14)]">
              <div className="absolute left-5 top-5 z-10 rounded-full bg-white/90 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur">
                NusaRasa
              </div>

              <div className="relative aspect-[0.92] overflow-hidden">
                {heroProduct?.image_url ? (
                  <Image
                    src={heroProduct.image_url}
                    alt={heroProduct.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 48vw"
                    className="object-cover transition duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#ded4c5] text-sm text-black/40">
                    Produk NusaRasa
                  </div>
                )}

                <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/30 bg-black/70 p-4 text-white backdrop-blur-md sm:p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    Produk pilihan
                  </p>

                  <div className="mt-1 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold sm:text-xl">
                        {heroProduct?.name ??
                          "Pilihan lokal terbaik"}
                      </h2>

                      {heroProduct && (
                        <p className="mt-1 text-sm text-white/60">
                          {formatRupiah(heroProduct.price)}
                        </p>
                      )}
                    </div>

                    <Link
                      href={
                        heroProduct
                          ? `/products/${heroProduct.slug}`
                          : "/products"
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg text-black transition hover:scale-105"
                      aria-label="Lihat produk"
                    >
                      ↗
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          CATEGORIES
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b5425]">
              Jelajahi
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Pilih berdasarkan kategori
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold transition hover:border-black/20 sm:block"
          >
            Semua produk →
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(
                  category.slug
                )}`}
                className="group relative min-h-36 overflow-hidden rounded-[1.35rem] border border-black/8 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e8dd] text-sm font-bold text-[#9b5425]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-xl text-black/25 transition group-hover:translate-x-1 group-hover:text-[#9b5425]">
                    ↗
                  </span>
                </div>

                <h3 className="mt-8 text-lg font-semibold">
                  {category.name}
                </h3>

                <p className="mt-1 text-sm text-black/45">
                  Jelajahi pilihan{" "}
                  {category.name.toLowerCase()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.35rem] border border-dashed border-black/15 bg-white/60 p-10 text-center text-sm text-black/45">
            Belum ada kategori produk.
          </div>
        )}

        <Link
          href="/products"
          className="mt-5 block text-center text-sm font-semibold text-[#9b5425] sm:hidden"
        >
          Lihat semua produk →
        </Link>
      </section>

      {/* ==================================================
          PRODUCTS
      ================================================== */}

      <section
        id="produk"
        className="border-y border-black/5 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b5425]">
                Pilihan hari ini
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Produk yang sedang tersedia
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition hover:bg-[#f7f5f0] sm:block"
            >
              Lihat semua →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="mt-9 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const categoryName =
                  product.categories?.[0]?.name ??
                  "Tanpa kategori";

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[0.92] overflow-hidden rounded-[1.4rem] bg-[#eee9e1]">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.045]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-black/35">
                          Tidak ada gambar
                        </div>
                      )}

                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/60 shadow-sm backdrop-blur">
                        {categoryName}
                      </div>

                      <div className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-lg opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        ↗
                      </div>
                    </div>

                    <div className="px-1 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-base font-semibold leading-6">
                          {product.name}
                        </h3>

                        <span className="shrink-0 text-sm font-bold">
                          {formatRupiah(product.price)}
                        </span>
                      </div>

                      {product.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-black/45">
                          {product.description}
                        </p>
                      )}

                      <p className="mt-3 text-xs font-medium text-black/40">
                        {product.stock} tersedia
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-9 rounded-[1.4rem] border border-dashed border-black/15 bg-[#f7f5f0] p-10 text-center text-sm text-black/45">
              Belum ada produk yang tersedia.
            </div>
          )}

          <Link
            href="/products"
            className="mt-10 block text-center text-sm font-semibold text-[#9b5425] sm:hidden"
          >
            Lihat semua produk →
          </Link>
        </div>
      </section>

      {/* ==================================================
          VALUE PROPOSITION
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[1.75rem] bg-[#171512] p-7 text-white sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
              Kenapa NusaRasa?
            </p>

            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              Belanja lokal tanpa pengalaman yang ribet.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/55">
              Semua alur dibuat sederhana, dari memilih
              produk sampai melihat status pesanan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [
                "01",
                "Pilihan lokal",
                "Temukan produk dari UMKM dengan lebih mudah.",
              ],
              [
                "02",
                "Checkout sederhana",
                "Keranjang dan pemesanan dibuat ringkas.",
              ],
              [
                "03",
                "Pesanan terpantau",
                "Lihat status pesananmu dari akun.",
              ],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-sm"
              >
                <span className="text-xs font-bold tracking-[0.14em] text-[#9b5425]">
                  {number}
                </span>

                <h3 className="mt-12 text-lg font-semibold">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/45">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#d8c1a8] px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[50px] border-white/20" />

          <div className="absolute -bottom-28 right-24 h-64 w-64 rounded-full border-[40px] border-black/5" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              NusaRasa
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Temukan favoritmu hari ini.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-black/55 sm:text-base">
              Jelajahi produk yang tersedia dan pesan
              dengan beberapa langkah sederhana.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#171512] px-7 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#2a2722]"
            >
              Mulai Belanja
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="border-t border-black/8 bg-[#f7f5f0]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xl font-semibold tracking-[-0.03em]">
              NusaRasa
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
              Platform digital untuk menemukan dan memesan
              produk UMKM lokal.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm font-medium text-black/55">
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

        <div className="border-t border-black/8">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-black/35 sm:px-6">
            © {new Date().getFullYear()} NusaRasa. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}