import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import AddToCart from "@/components/products/add-to-cart";
import LogoutButton from "@/components/auth/logout-button";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // =========================================================
  // 1. AMBIL DATA PRODUK
  // Query ini dipertahankan dari versi yang sebelumnya sudah
  // berhasil membuka halaman detail produk.
  // =========================================================
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

  // Kalau produk tidak ditemukan / tidak tersedia,
  // tetap gunakan perilaku lama.
  if (error || !product || !product.is_available) {
    notFound();
  }

  // =========================================================
  // 2. CEK SESSION USER
  // =========================================================
  const { data: claimsData } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub as string | undefined;

  let profile: Profile | null = null;

  // =========================================================
  // 3. AMBIL PROFILE USER JIKA LOGIN
  // =========================================================
  if (userId) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", userId)
      .maybeSingle();

    profile = profileData as Profile | null;
  }

  // =========================================================
  // 4. DATA UNTUK HEADER
  // =========================================================
  const displayName =
    profile?.full_name?.trim() ||
    profile?.email?.split("@")[0] ||
    "Akun Saya";

  const isAdmin = profile?.role === "admin";

  const categoryName = product.categories?.[0]?.name ?? "Tanpa kategori";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-gray-900"
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
                USER BELUM LOGIN
            ================================================== */}
            {!userId && (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 transition hover:text-black"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-gray-800"
                >
                  Daftar
                </Link>
              </>
            )}

            {/* =================================================
                USER SUDAH LOGIN
            ================================================== */}
            {userId && (
              <>
                {/* PROFILE */}
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-gray-700 transition hover:text-black"
                >
                  {/* Avatar Initial */}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>

                  <span className="max-w-32 truncate font-medium">
                    {displayName}
                  </span>
                </Link>

                {/* ADMIN */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg border border-gray-200 px-3 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Admin
                  </Link>
                )}

                {/* LOGOUT */}
                <LogoutButton />
              </>
            )}
          </nav>
        </div>
      </header>

      {/* =====================================================
          DETAIL PRODUK
      ====================================================== */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* BACK */}
        <Link
          href="/products"
          className="text-sm font-medium text-gray-500 transition hover:text-black"
        >
          ← Kembali ke Produk
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* =================================================
              GAMBAR PRODUK
          ================================================== */}
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

          {/* =================================================
              INFORMASI PRODUK
          ================================================== */}
          <div className="flex flex-col justify-center">
            {/* CATEGORY */}
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {categoryName}
            </p>

            {/* NAME */}
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            {/* PRICE */}
            <p className="mt-5 text-3xl font-bold text-gray-900">
              {formatRupiah(Number(product.price))}
            </p>

            {/* DESCRIPTION */}
            <p className="mt-6 leading-7 text-gray-600">
              {product.description || "Tidak ada deskripsi produk."}
            </p>

            {/* STOCK */}
            <div className="mt-6 rounded-xl bg-white p-4">
              <p className="text-sm text-gray-500">Ketersediaan</p>

              <p className="mt-1 font-semibold">
                {product.stock} produk tersedia
              </p>
            </div>

            {/* ADD TO CART */}
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