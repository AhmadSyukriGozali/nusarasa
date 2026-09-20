import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("name");

  const { data: products } = await supabase
    .from("products")
    .select(`
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
    `)
    .eq("is_available", true)
    .gt("stock", 0)
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-gray-100">
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
              className="font-medium text-gray-900"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="text-gray-600 transition hover:text-gray-900"
            >
              Produk
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              UMKM Lokal • Rasa Berkualitas
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Rasa lokal,
              <br />
              pengalaman digital.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Temukan makanan dan minuman favorit dari NusaRasa.
              Pesan dengan mudah dan nikmati produk pilihan UMKM lokal.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Produk
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Buat Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Kategori
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Pilih sesuai selera
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:border-gray-400 hover:shadow-sm"
            >
              <h3 className="text-xl font-semibold">
                {category.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Pilihan
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Produk favorit
              </h2>
            </div>

            <Link
              href="/products"
              className="text-sm font-semibold text-gray-900 hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex aspect-square items-center justify-center bg-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">
                        Foto Produk
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {product.categories?.[0]?.name ?? "Tanpa kategori"}
                    </p>

                    <h3 className="mt-2 font-semibold text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                      {product.description}
                    </p>

                    <p className="mt-4 text-lg font-bold text-gray-900">
                      {formatRupiah(Number(product.price))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-gray-500">
                Belum ada produk tersedia.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} NusaRasa. UMKM lokal,
            pengalaman digital.
          </p>
        </div>
      </footer>
    </main>
  );
}