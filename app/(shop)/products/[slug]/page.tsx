import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import AddToCart from "@/components/products/add-to-cart";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_available: boolean;
  categories:
    | {
        name: string;
        slug: string;
      }
    | {
        name: string;
        slug: string;
      }[]
    | null;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: productData, error } = await supabase
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
        is_available,
        categories (
          name,
          slug
        )
      `
    )
    .eq("slug", slug)
    .single();

  if (
    error ||
    !productData ||
    !productData.is_available ||
    productData.stock <= 0
  ) {
    notFound();
  }

  const product = productData as Product;

  const category = Array.isArray(product.categories)
  ? product.categories[0]
  : product.categories;

  const categoryName = category?.name ?? "Tanpa kategori";
  const categorySlug = category?.slug ?? null;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* Breadcrumb */}
      <section className="border-b border-[#171512]/10">
        <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#171512]/45">
            <Link
              href="/"
              className="transition-colors hover:text-[#9b5425]"
            >
              Beranda
            </Link>

            <span>/</span>

            <Link
              href="/products"
              className="transition-colors hover:text-[#9b5425]"
            >
              Produk
            </Link>

            {categorySlug && (
              <>
                <span>/</span>

                <Link
                  href={`/products?category=${encodeURIComponent(
                    categorySlug
                  )}`}
                  className="transition-colors hover:text-[#9b5425]"
                >
                  {categoryName}
                </Link>
              </>
            )}

            <span>/</span>

            <span className="max-w-[180px] truncate font-medium text-[#171512]/70">
              {product.name}
            </span>
          </div>
        </div>
      </section>

      {/* Main Product */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#171512]/45 transition-colors hover:text-[#9b5425]"
        >
          <span className="text-base transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Kembali ke produk
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          {/* Product Image */}
          <div className="lg:sticky lg:top-8">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#e8e4db]">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f5f0] text-2xl text-[#171512]/30">
                      —
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#171512]/35">
                      Tidak ada gambar
                    </p>
                  </div>
                </div>
              )}

              {/* Image overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

              {/* Category badge */}
              <div className="absolute left-5 top-5">
                <span className="rounded-full bg-[#f7f5f0]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#171512] backdrop-blur-md">
                  {categoryName}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#171512]/35">
              Foto produk NusaRasa
            </p>
          </div>

          {/* Product Information */}
          <div className="lg:pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9b5425]">
              Pilihan NusaRasa
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-7">
              <p className="text-xs uppercase tracking-[0.16em] text-[#171512]/40">
                Harga
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {formatRupiah(Number(product.price))}
              </p>
            </div>

            {/* Description */}
            <div className="mt-9 border-t border-[#171512]/10 pt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#171512]/45">
                Tentang produk
              </p>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#171512]/60 sm:text-base">
                {product.description ||
                  "Nikmati pilihan produk lokal dari NusaRasa."}
              </p>
            </div>

            {/* Stock */}
            <div className="mt-8 rounded-[1.5rem] border border-[#171512]/10 bg-[#eeece5] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#171512]/40">
                    Ketersediaan
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {product.stock} produk tersedia
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f5f0]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5d8a55]" />
                </div>
              </div>

              {product.stock <= 5 && (
                <p className="mt-3 text-xs font-medium text-[#9b5425]">
                  Stok terbatas — segera amankan pesananmu.
                </p>
              )}
            </div>

            {/* Add To Cart */}
            <div className="mt-7">
              <AddToCart
                product={{
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: Number(product.price),
                  stock: product.stock,
                  imageUrl: product.image_url,
                }}
              />
            </div>

            {/* Trust Information */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-[#171512]/10 bg-[#f7f5f0] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8e4db]">
                  <span className="text-sm">✓</span>
                </div>

                <h2 className="mt-4 text-sm font-semibold">
                  Produk lokal
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-[#171512]/50">
                  Mendukung produk dan UMKM lokal Indonesia.
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#171512]/10 bg-[#f7f5f0] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8e4db]">
                  <span className="text-sm">↗</span>
                </div>

                <h2 className="mt-4 text-sm font-semibold">
                  Belanja mudah
                </h2>

                <p className="mt-1.5 text-xs leading-5 text-[#171512]/50">
                  Tambahkan produk ke keranjang dan lanjutkan
                  ke checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className="border-t border-[#171512]/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#171512] px-7 py-12 text-white sm:px-12 lg:px-16">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d99561]">
                NusaRasa
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Masih ingin menjelajah?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                Temukan berbagai pilihan makanan dan produk
                lokal lainnya dari NusaRasa.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-full bg-[#f7f5f0] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#171512] transition-transform hover:-translate-y-0.5"
              >
                Lihat semua produk
              </Link>
            </div>

            <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full border border-[#c27336]/20" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#171512]/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-[#171512]/45 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} NusaRasa. Semua hak
            dilindungi.
          </p>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/"
              className="transition-colors hover:text-[#9b5425]"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="font-medium text-[#171512]"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="transition-colors hover:text-[#9b5425]"
            >
              Keranjang
            </Link>

            <Link
              href="/account"
              className="transition-colors hover:text-[#9b5425]"
            >
              Akun
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}