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
      }[]
    | null;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // ==================================================
  // AMBIL DATA PRODUK
  // ==================================================

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

  // ==================================================
  // VALIDASI PRODUK
  // ==================================================

  if (
    error ||
    !productData ||
    !productData.is_available ||
    productData.stock <= 0
  ) {
    notFound();
  }

  const product = productData as Product;

  // ==================================================
  // DATA TAMBAHAN
  // ==================================================

  const categoryName =
    product.categories?.[0]?.name ??
    "Tanpa kategori";

  const categorySlug =
    product.categories?.[0]?.slug ?? null;

  // ==================================================
  // HALAMAN
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* ==================================================
          BREADCRUMB / BACK
      ================================================== */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link
              href="/"
              className="transition hover:text-black"
            >
              Beranda
            </Link>

            <span>/</span>

            <Link
              href="/products"
              className="transition hover:text-black"
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
                  className="transition hover:text-black"
                >
                  {categoryName}
                </Link>
              </>
            )}

            <span>/</span>

            <span className="max-w-[200px] truncate font-medium text-gray-900">
              {product.name}
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================
          PRODUCT DETAIL
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* BACK LINK */}

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-black"
        >
          <span>←</span>
          <span>Kembali ke Produk</span>
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* ==================================================
              PRODUCT IMAGE
          ================================================== */}

          <div>
            <div className="aspect-square overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-gray-400 shadow-sm">
                      —
                    </div>

                    <p className="mt-4 text-sm text-gray-400">
                      Tidak ada gambar produk
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              PRODUCT INFORMATION
          ================================================== */}

          <div className="flex flex-col justify-center">
            {/* CATEGORY */}

            <div>
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
                {categoryName}
              </span>
            </div>

            {/* NAME */}

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            {/* PRICE */}

            <div className="mt-6">
              <p className="text-sm text-gray-400">
                Harga
              </p>

              <p className="mt-1 text-3xl font-bold text-black sm:text-4xl">
                {formatRupiah(Number(product.price))}
              </p>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-7 border-t border-gray-200 pt-7">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                Deskripsi
              </h2>

              <p className="mt-3 whitespace-pre-line text-base leading-7 text-gray-600">
                {product.description ||
                  "Tidak ada deskripsi produk."}
              </p>
            </div>

            {/* STOCK */}

            <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Ketersediaan
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {product.stock} produk tersedia
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
              </div>
            </div>

            {/* ADD TO CART */}

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

            {/* INFORMATION */}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Produk Lokal
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Mendukung produk dan UMKM lokal
                  Indonesia.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Belanja Mudah
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Tambahkan produk ke keranjang dan
                  lanjutkan ke checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          BOTTOM CTA
      ================================================== */}

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-5 rounded-3xl bg-gray-50 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
                NusaRasa
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Masih ingin melihat produk lainnya?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Jelajahi berbagai produk pilihan dari
                UMKM lokal lainnya.
              </p>
            </div>

            <Link
              href="/products"
              className="shrink-0 rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} NusaRasa.
          </p>

          <div className="flex flex-wrap gap-5">
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

            <Link
              href="/account"
              className="transition hover:text-black"
            >
              Akun
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}