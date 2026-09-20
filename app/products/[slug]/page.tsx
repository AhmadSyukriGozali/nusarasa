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

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
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
    `,
    )
    .eq("slug", slug)
    .single();

  if (error || !product || !product.is_available) {
    notFound();
  }

  const categoryName = product.categories?.[0]?.name ?? "Tanpa kategori";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            NusaRasa
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-black">
              Beranda
            </Link>

            <Link href="/products" className="font-semibold text-black">
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

      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/products"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Kembali ke Produk
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* Product Image */}
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-400">Foto Produk</span>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {categoryName}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <p className="mt-5 text-3xl font-bold text-gray-900">
              {formatRupiah(Number(product.price))}
            </p>

            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6 rounded-xl bg-white p-4">
              <p className="text-sm text-gray-500">Ketersediaan</p>

              <p className="mt-1 font-semibold">
                {product.stock} produk tersedia
              </p>
            </div>

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
        </div>
      </div>
    </main>
  );
}
