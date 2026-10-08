import Image from "next/image";
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

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categories: Category[] = categoriesData ?? [];

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
    .order("created_at", { ascending: false });

  if (selectedCategory) {
    const category = categories.find(
      (item) => item.slug === selectedCategory
    );

    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  const { data: productsData, error: productsError } = await query;

  const products: Product[] =
    (productsData as Product[] | null) ?? [];

  const activeCategory = categories.find(
    (category) => category.slug === selectedCategory
  );

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* Header */}
      <section className="border-b border-[#171512]/10">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#9b5425]">
                Koleksi NusaRasa
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Temukan menu favoritmu.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#171512]/60 sm:text-base">
                Pilihan makanan lokal yang dibuat untuk menemani
                hari-harimu. Pilih rasa yang paling dekat dengan
                seleramu.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#171512]/10 pt-5">
              <div>
                <p className="text-sm font-medium">
                  {activeCategory
                    ? activeCategory.name
                    : "Semua produk"}
                </p>

                <p className="mt-1 text-xs text-[#171512]/45">
                  {products.length} produk tersedia
                </p>
              </div>

              <Link
                href="/"
                className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[#171512]/55 transition-colors hover:text-[#9b5425] sm:block"
              >
                Kembali ke beranda
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-[#171512]/10 bg-[#eeece5]">
        <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-10">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Link
              href="/products"
              className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all ${
                !selectedCategory
                  ? "border-[#171512] bg-[#171512] text-white"
                  : "border-[#171512]/15 bg-[#f7f5f0] text-[#171512]/65 hover:border-[#9b5425]/40 hover:text-[#9b5425]"
              }`}
            >
              Semua
            </Link>

            {categories.map((category) => {
              const isActive = selectedCategory === category.slug;

              return (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(
                    category.slug
                  )}`}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "border-[#171512] bg-[#171512] text-white"
                      : "border-[#171512]/15 bg-[#f7f5f0] text-[#171512]/65 hover:border-[#9b5425]/40 hover:text-[#9b5425]"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
        {categoriesError && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Kategori belum dapat dimuat. Silakan coba lagi.
          </div>
        )}

        {productsError && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Produk belum dapat dimuat. Silakan coba lagi.
          </div>
        )}

        {products.length > 0 ? (
          <>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b5425]">
                  Pilihan hari ini
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  {activeCategory
                    ? activeCategory.name
                    : "Semua menu"}
                </h2>
              </div>

              <p className="hidden text-sm text-[#171512]/45 sm:block">
                {products.length} menu
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/4.5] overflow-hidden rounded-[1.5rem] bg-[#e8e4db]">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition duration-700 ease-out group-hover:scale-105"
                        priority={index < 4}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#171512]/30">
                          NusaRasa
                        </span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Category */}
                    {product.categories?.name && (
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-[#f7f5f0]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#171512] backdrop-blur-sm">
                          {product.categories.name}
                        </span>
                      </div>
                    )}

                    {/* Arrow */}
                    <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#f7f5f0] text-[#171512] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-lg">↗</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-base font-semibold leading-6 tracking-[-0.01em] transition-colors group-hover:text-[#9b5425]">
                        {product.name}
                      </h3>

                      <span className="shrink-0 text-sm font-semibold">
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#171512]/50">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-[#171512]/40">
                      <span>
                        {product.stock <= 5
                          ? `Tersisa ${product.stock}`
                          : "Tersedia"}
                      </span>

                      <span className="font-medium uppercase tracking-[0.12em] opacity-0 transition-opacity group-hover:opacity-100">
                        Lihat detail
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8e4db]">
                <span className="text-2xl">⌕</span>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#9b5425]">
                Belum ada menu
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Produk tidak ditemukan.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#171512]/50">
                Coba pilih kategori lain atau lihat semua produk
                yang tersedia di NusaRasa.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-full bg-[#171512] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-transform hover:-translate-y-0.5"
              >
                Lihat semua produk
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#171512]/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#171512] px-7 py-12 text-white sm:px-12 lg:px-16">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d99561]">
                NusaRasa
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Rasa lokal, dibuat untuk dinikmati.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                Temukan makanan favoritmu dan nikmati pengalaman
                belanja yang sederhana dari awal sampai pesanan tiba.
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex rounded-full bg-[#f7f5f0] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#171512] transition-transform hover:-translate-y-0.5"
              >
                Kembali ke beranda
              </Link>
            </div>

            <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full border border-[#c27336]/20" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#171512]/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-[#171512]/45 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} NusaRasa. Semua hak
            dilindungi.
          </p>

          <Link
            href="/"
            className="font-medium transition-colors hover:text-[#9b5425]"
          >
            NusaRasa
          </Link>
        </div>
      </footer>
    </main>
  );
}