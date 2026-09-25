import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
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
  categories:
    | {
        name: string;
        slug: string;
      }[]
    | null;
};

// ======================================================
// LOGOUT
// ======================================================

async function logout() {
  "use server";

  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

// ======================================================
// HOMEPAGE
// ======================================================

export default async function HomePage() {
  const supabase = await createClient();

  // ====================================================
  // CEK USER LOGIN
  // ====================================================

  const { data: claimsData } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub ?? null;

  // ====================================================
  // AMBIL PROFILE USER
  // ====================================================

  let profile: Profile | null = null;

  if (userId) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, role, avatar_url"
      )
      .eq("id", userId)
      .single();

    profile = profileData;
  }

  // ====================================================
  // DATA USER
  // ====================================================

  const isLoggedIn = Boolean(userId);

  const displayName =
    profile?.full_name ||
    profile?.email ||
    "Pengguna";

  const avatarInitial =
    displayName.charAt(0).toUpperCase();

  const isAdmin = profile?.role === "admin";
  const isCustomer = profile?.role === "customer";

  // ====================================================
  // AMBIL KATEGORI
  // ====================================================

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categories: Category[] =
    categoriesData ?? [];

  // ====================================================
  // AMBIL PRODUK
  // ====================================================

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

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LOGO */}

          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            NusaRasa
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="font-medium text-gray-700 transition hover:text-black"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="font-medium text-gray-700 transition hover:text-black"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="font-medium text-gray-700 transition hover:text-black"
            >
              Keranjang
            </Link>
          </nav>

          {/* USER AREA */}

          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800"
              >
                Daftar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* PROFILE */}

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
                {/* AVATAR */}

                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-sm font-semibold text-white">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </div>

                {/* NAME + ROLE */}

                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-32 truncate text-sm font-semibold text-gray-900">
                    {displayName}
                  </p>

                  <p className="text-xs capitalize text-gray-500">
                    {profile?.role ?? "user"}
                  </p>
                </div>
              </div>

              {/* ACCOUNT */}

              <Link
                href="/account"
                className="hidden rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100 sm:block"
              >
                Akun
              </Link>

              {/* ADMIN */}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800 md:block"
                >
                  Admin
                </Link>
              )}

              {/* LOGOUT */}

              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          {/* HERO TEXT */}

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
              UMKM Indonesia
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Rasa lokal,
              <br />
              pengalaman digital.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Temukan berbagai produk pilihan dari
              UMKM lokal dengan pengalaman belanja
              yang sederhana, cepat, dan modern.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {/* LIHAT PRODUK */}

              <Link
                href="/products"
                className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                Lihat Produk
              </Link>

              {/* BUTTON BERDASARKAN LOGIN */}

              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Akun Saya
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Buat Akun
                </Link>
              )}
            </div>
          </div>

          {/* HERO CARD */}

          <div className="rounded-3xl bg-black p-8 text-white shadow-xl md:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              NusaRasa
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Belanja produk lokal dengan cara
              yang lebih mudah.
            </h2>

            <p className="mt-4 leading-7 text-gray-300">
              Dari produk rumahan sampai makanan
              favorit, semuanya tersedia dalam satu
              platform.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          KATEGORI
      ================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Jelajahi
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Kategori Produk
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden font-medium text-gray-600 hover:text-black sm:block"
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
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-gray-400 hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold">
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
      </section>

      {/* ==================================================
          PRODUK TERBARU
      ================================================== */}

      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Pilihan
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Produk Terbaru
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden font-medium text-gray-600 hover:text-black sm:block"
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

                    {/* CONTENT */}

                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {categoryName}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-bold">
                          {formatRupiah(product.price)}
                        </p>

                        <p className="text-xs text-gray-500">
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
        </div>
      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl bg-gray-100 p-8 md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">
              Siap mulai belanja?
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Jelajahi produk lokal pilihan dan
              temukan rasa baru dari UMKM Indonesia.
            </p>

            <div className="mt-6">
              <Link
                href="/products"
                className="inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-gray-900">
              NusaRasa
            </p>

            <p className="mt-1">
              Platform digital untuk UMKM lokal.
            </p>
          </div>

          <div className="flex gap-5">
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

            {isLoggedIn && (
              <Link
                href="/account"
                className="transition hover:text-black"
              >
                Akun
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-gray-400">
            © {new Date().getFullYear()} NusaRasa. All
            rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}