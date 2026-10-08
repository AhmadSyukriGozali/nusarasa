"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CategoryManagerProps = {
  initialCategories: Category[];
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getCategoryEmoji(name: string) {
  const value = name.toLowerCase();

  if (
    value.includes("nasi") ||
    value.includes("rice")
  ) {
    return "🍚";
  }

  if (
    value.includes("mie") ||
    value.includes("mi") ||
    value.includes("noodle")
  ) {
    return "🍜";
  }

  if (
    value.includes("ayam") ||
    value.includes("chicken")
  ) {
    return "🍗";
  }

  if (
    value.includes("daging") ||
    value.includes("sapi") ||
    value.includes("beef")
  ) {
    return "🥩";
  }

  if (
    value.includes("ikan") ||
    value.includes("fish")
  ) {
    return "🐟";
  }

  if (
    value.includes("seafood") ||
    value.includes("udang") ||
    value.includes("cumi")
  ) {
    return "🦐";
  }

  if (
    value.includes("sayur") ||
    value.includes("vegetable")
  ) {
    return "🥬";
  }

  if (
    value.includes("sambal") ||
    value.includes("pedas")
  ) {
    return "🌶️";
  }

  if (
    value.includes("minum") ||
    value.includes("drink") ||
    value.includes("kopi") ||
    value.includes("coffee")
  ) {
    return "🥤";
  }

  if (
    value.includes("jus") ||
    value.includes("juice")
  ) {
    return "🧃";
  }

  if (
    value.includes("dessert") ||
    value.includes("dessert") ||
    value.includes("manis") ||
    value.includes("kue") ||
    value.includes("cake")
  ) {
    return "🍰";
  }

  if (
    value.includes("snack") ||
    value.includes("camilan") ||
    value.includes("gorengan")
  ) {
    return "🍿";
  }

  if (
    value.includes("paket") ||
    value.includes("combo") ||
    value.includes("kombo")
  ) {
    return "🍱";
  }

  if (
    value.includes("roti") ||
    value.includes("bread")
  ) {
    return "🍞";
  }

  return "🍽️";
}

export default function CategoryManager({
  initialCategories,
}: CategoryManagerProps) {
  const supabase = createClient();

  const [categories, setCategories] =
    useState<Category[]>(initialCategories);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [isActive, setIsActive] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [togglingId, setTogglingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  function resetForm() {
    setName("");
    setDescription("");
    setIsActive(true);
    setEditingCategory(null);
    setIsFormOpen(false);
    setMessage(null);
    setError(null);
  }

  function openCreateForm() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setMessage(null);
    setError(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setIsActive(category.is_active);
    setMessage(null);
    setError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const trimmedName = name.trim();
      const trimmedDescription =
        description.trim();

      if (!trimmedName) {
        throw new Error(
          "Nama kategori wajib diisi."
        );
      }

      if (trimmedName.length < 2) {
        throw new Error(
          "Nama kategori minimal 2 karakter."
        );
      }

      const slug = createSlug(trimmedName);

      if (!slug) {
        throw new Error(
          "Nama kategori menghasilkan slug yang tidak valid."
        );
      }

      if (editingCategory) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from("categories")
          .update({
            name: trimmedName,
            slug,
            description:
              trimmedDescription || null,
            is_active: isActive,
          })
          .eq("id", editingCategory.id)
          .select(`
            id,
            name,
            slug,
            description,
            image_url,
            is_active,
            created_at,
            updated_at
          `)
          .single();

        if (updateError) {
          throw new Error(
            `Gagal memperbarui kategori: ${updateError.message}`
          );
        }

        if (data) {
          setCategories((current) =>
            current.map((category) =>
              category.id === data.id
                ? (data as Category)
                : category
            )
          );
        }

        setMessage(
          "Kategori berhasil diperbarui."
        );
      } else {
        const {
          data,
          error: insertError,
        } = await supabase
          .from("categories")
          .insert({
            name: trimmedName,
            slug,
            description:
              trimmedDescription || null,
            is_active: isActive,
          })
          .select(`
            id,
            name,
            slug,
            description,
            image_url,
            is_active,
            created_at,
            updated_at
          `)
          .single();

        if (insertError) {
          throw new Error(
            `Gagal menambahkan kategori: ${insertError.message}`
          );
        }

        if (data) {
          setCategories((current) =>
            [...current, data as Category].sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name,
                  "id"
                )
            )
          );
        }

        setMessage(
          "Kategori berhasil ditambahkan."
        );
      }

      setName("");
      setDescription("");
      setIsActive(true);
      setEditingCategory(null);
      setIsFormOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(
    category: Category
  ) {
    setTogglingId(category.id);
    setError(null);
    setMessage(null);

    try {
      const {
        data,
        error: updateError,
      } = await supabase
        .from("categories")
        .update({
          is_active: !category.is_active,
        })
        .eq("id", category.id)
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          is_active,
          created_at,
          updated_at
        `)
        .single();

      if (updateError) {
        throw new Error(
          `Gagal mengubah status kategori: ${updateError.message}`
        );
      }

      if (data) {
        setCategories((current) =>
          current.map((item) =>
            item.id === data.id
              ? (data as Category)
              : item
          )
        );
      }

      setMessage(
        category.is_active
          ? "Kategori dinonaktifkan."
          : "Kategori diaktifkan."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(
    category: Category
  ) {
    const confirmed = window.confirm(
      `Hapus kategori "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setError(null);
    setMessage(null);

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        throw new Error(
          `Gagal menghapus kategori: ${deleteError.message}`
        );
      }

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );

      setMessage(
        "Kategori berhasil dihapus."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = categories.filter(
    (category) => category.is_active
  ).length;

  const inactiveCount =
    categories.length - activeCount;

  return (
    <div>
      {/* Summary */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#e8e0d7] bg-white p-5 shadow-[0_8px_30px_rgba(38,28,18,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#948a80]">
            Total kategori
          </p>

          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight text-[#171512]">
              {categories.length}
            </p>

            <span className="text-2xl">🍽️</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e8e0d7] bg-white p-5 shadow-[0_8px_30px_rgba(38,28,18,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#948a80]">
            Kategori aktif
          </p>

          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight text-[#171512]">
              {activeCount}
            </p>

            <span className="text-2xl">✓</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e8e0d7] bg-white p-5 shadow-[0_8px_30px_rgba(38,28,18,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#948a80]">
            Tidak aktif
          </p>

          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-bold tracking-tight text-[#171512]">
              {inactiveCount}
            </p>

            <span className="text-2xl">○</span>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <section className="mb-6 flex flex-col gap-5 rounded-3xl border border-[#e8e0d7] bg-[#171512] p-6 text-white shadow-[0_12px_40px_rgba(23,21,18,0.12)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c98a58]">
            Category Management
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Susun katalog dengan lebih rapi.
          </h2>

          <p className="mt-1 text-sm leading-6 text-white/60">
            Buat kategori yang jelas agar pelanggan
            lebih mudah menemukan produk.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#c27336] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a95f2c] active:scale-[0.98]"
        >
          <span className="text-lg leading-none">
            +
          </span>
          Tambah Kategori
        </button>
      </section>

      {/* Messages */}
      {message && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <span className="mt-0.5">✓</span>
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="mt-0.5">!</span>
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      {isFormOpen && (
        <section className="mb-8 overflow-hidden rounded-3xl border border-[#e8e0d7] bg-white shadow-[0_10px_35px_rgba(38,28,18,0.06)]">
          <div className="border-b border-[#eee7df] bg-[#fcfaf7] px-6 py-5 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a45d2b]">
                  {editingCategory
                    ? "Edit Category"
                    : "New Category"}
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#171512]">
                  {editingCategory
                    ? "Edit kategori"
                    : "Tambah kategori baru"}
                </h2>

                <p className="mt-1 text-sm text-[#756d64]">
                  Gunakan nama kategori yang singkat
                  dan mudah dipahami pelanggan.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                aria-label="Tutup form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e4dbd2] text-[#756d64] transition hover:bg-white hover:text-[#171512]"
              >
                ×
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 p-6 sm:p-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-[#29251f]"
                >
                  Nama Kategori
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Contoh: Makanan Utama"
                  className="w-full rounded-2xl border border-[#e4dbd2] bg-[#fcfaf7] px-4 py-3.5 text-sm text-[#171512] outline-none transition placeholder:text-[#aaa097] focus:border-[#a45d2b] focus:bg-white focus:ring-4 focus:ring-[#a45d2b]/10"
                  required
                />
              </div>

              {/* Preview */}
              <div>
                <p className="mb-2 block text-sm font-semibold text-[#29251f]">
                  Identitas Kategori
                </p>

                <div className="flex items-center gap-4 rounded-2xl border border-[#e4dbd2] bg-[#fcfaf7] p-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1e5d9] text-2xl">
                    {getCategoryEmoji(name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#29251f]">
                      {name.trim() || "Nama kategori"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#938980]">
                      {createSlug(name) ||
                        "slug-kategori"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="category-description"
                className="mb-2 block text-sm font-semibold text-[#29251f]"
              >
                Deskripsi
              </label>

              <textarea
                id="category-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Contoh: Pilihan makanan utama khas NusaRasa."
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#e4dbd2] bg-[#fcfaf7] px-4 py-3.5 text-sm leading-6 text-[#171512] outline-none transition placeholder:text-[#aaa097] focus:border-[#a45d2b] focus:bg-white focus:ring-4 focus:ring-[#a45d2b]/10"
              />
            </div>

            {/* Active */}
            <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-[#e4dbd2] bg-[#fcfaf7] p-4 transition hover:bg-white">
              <div>
                <p className="text-sm font-semibold text-[#29251f]">
                  Kategori aktif
                </p>

                <p className="mt-1 text-xs leading-5 text-[#8b8178]">
                  Kategori aktif dapat digunakan dan
                  ditampilkan kepada pelanggan.
                </p>
              </div>

              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(
                      event.target.checked
                    )
                  }
                  className="peer sr-only"
                />

                <div className="h-7 w-12 rounded-full bg-[#d8d0c8] transition peer-checked:bg-[#a45d2b]" />

                <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
              </div>
            </label>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#eee7df] pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="rounded-2xl border border-[#ddd4cb] px-5 py-3 text-sm font-semibold text-[#5f574f] transition hover:bg-[#f8f5f1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[#171512] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#302c27] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Menyimpan..."
                  : editingCategory
                    ? "Simpan Perubahan"
                    : "Tambah Kategori"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Category List */}
      <section className="overflow-hidden rounded-3xl border border-[#e8e0d7] bg-white shadow-[0_10px_35px_rgba(38,28,18,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[#eee7df] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a45d2b]">
              Catalog
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#171512]">
              Daftar Kategori
            </h2>
          </div>

          <p className="text-sm text-[#8b8178]">
            {categories.length} kategori
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f3e8dc] text-4xl">
              🍽️
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#171512]">
              Belum ada kategori
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#80766d]">
              Buat kategori pertama untuk mulai
              mengatur katalog produk NusaRasa.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 rounded-2xl bg-[#171512] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#302c27]"
            >
              + Tambah Kategori
            </button>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
            {categories.map((category) => (
              <article
                key={category.id}
                className="group rounded-3xl border border-[#e9e1d8] bg-[#fcfaf7] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#d8c8ba] hover:bg-white hover:shadow-[0_12px_35px_rgba(38,28,18,0.07)]"
              >
                <div className="flex items-start gap-4">
                  {/* Emoji */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f1e5d9] text-3xl">
                    {getCategoryEmoji(
                      category.name
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-bold text-[#171512]">
                        {category.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                          category.is_active
                            ? "bg-[#e8f3e9] text-[#397342]"
                            : "bg-[#eeeae6] text-[#81786f]"
                        }`}
                      >
                        {category.is_active
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#9a9087]">
                      /{category.slug}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#70675e]">
                      {category.description ||
                        "Belum ada deskripsi kategori."}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9e1d8] pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(category)
                    }
                    disabled={
                      togglingId === category.id
                    }
                    className="text-xs font-semibold text-[#756b62] transition hover:text-[#a45d2b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {togglingId === category.id
                      ? "Mengubah..."
                      : category.is_active
                        ? "Nonaktifkan"
                        : "Aktifkan"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(category)
                      }
                      className="rounded-xl border border-[#ddd4cb] bg-white px-4 py-2 text-xs font-semibold text-[#514a43] transition hover:border-[#c9b8a8] hover:bg-[#f8f5f1]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(category)
                      }
                      disabled={
                        deletingId === category.id
                      }
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === category.id
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Info */}
      <section className="mt-6 rounded-3xl border border-[#e8e0d7] bg-[#efe6dc] p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
            💡
          </div>

          <div>
            <h3 className="font-bold text-[#29251f]">
              Tips mengatur kategori
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#71675e]">
              Gunakan kategori yang spesifik tetapi tidak
              terlalu banyak. Nama kategori sebaiknya
              singkat, mudah dipahami, dan sesuai dengan
              produk yang ada di dalamnya.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}