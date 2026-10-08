"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;

  categories:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;
};

type ProductManagerProps = {
  initialProducts: Product[];
  categories: Category[];
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getStoragePath(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  const marker =
    "/storage/v1/object/public/product-images/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return imageUrl.substring(
    index + marker.length
  );
}

function getCategoryName(
  categories: Product["categories"]
) {
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? "TANPA KATEGORI";
  }

  return categories?.name ?? "TANPA KATEGORI";
}

export default function ProductManager({
  initialProducts,
  categories,
}: ProductManagerProps) {
  const supabase = createClient();

  const [products, setProducts] =
    useState<Product[]>(initialProducts);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] =
    useState("");
  const [isAvailable, setIsAvailable] =
    useState(true);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategoryId("");
    setIsAvailable(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingProduct(null);
    setIsFormOpen(false);
    setMessage(null);
    setError(null);
  }

  function openCreateForm() {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategoryId("");
    setIsAvailable(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage(null);
    setError(null);
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setStock(String(product.stock));
    setCategoryId(product.category_id ?? "");
    setIsAvailable(product.is_available);
    setSelectedFile(null);
    setPreviewUrl(product.image_url);
    setMessage(null);
    setError(null);
    setIsFormOpen(true);
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  }

  async function uploadImage(
    file: File,
    productId: string
  ) {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const fileName =
      `${productId}-${crypto.randomUUID()}.${extension}`;

    const filePath = `products/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

    if (uploadError) {
      throw new Error(
        `Upload gambar gagal: ${uploadError.message}`
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!name.trim()) {
        throw new Error(
          "Nama produk wajib diisi."
        );
      }

      const numericPrice = Number(price);
      const numericStock = Number(stock);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        throw new Error(
          "Harga produk tidak valid."
        );
      }

      if (
        !Number.isInteger(numericStock) ||
        numericStock < 0
      ) {
        throw new Error(
          "Stok produk harus berupa angka bulat."
        );
      }

      const productId =
        editingProduct?.id ??
        crypto.randomUUID();

      let imageUrl =
        editingProduct?.image_url ?? null;

      if (selectedFile) {
        imageUrl = await uploadImage(
          selectedFile,
          productId
        );
      }

      const productData = {
        id: productId,
        category_id:
          categoryId || null,
        name: name.trim(),
        slug: createSlug(name),
        description:
          description.trim() || null,
        price: numericPrice,
        stock: numericStock,
        image_url: imageUrl,
        is_available: isAvailable,
      };

      if (editingProduct) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from("products")
          .update({
            category_id:
              productData.category_id,
            name: productData.name,
            slug: productData.slug,
            description:
              productData.description,
            price: productData.price,
            stock: productData.stock,
            image_url:
              productData.image_url,
            is_available:
              productData.is_available,
          })
          .eq("id", editingProduct.id)
          .select(`
            id,
            category_id,
            name,
            slug,
            description,
            price,
            stock,
            image_url,
            is_available,
            created_at,
            categories (
              id,
              name,
              slug
            )
          `)
          .single();

        if (updateError) {
          throw new Error(
            `Gagal memperbarui produk: ${updateError.message}`
          );
        }

        if (data) {
          setProducts((current) =>
            current.map((product) =>
              product.id === data.id
                ? (data as Product)
                : product
            )
          );
        }

        setMessage(
          "Produk berhasil diperbarui."
        );
      } else {
        const {
          data,
          error: insertError,
        } = await supabase
          .from("products")
          .insert(productData)
          .select(`
            id,
            category_id,
            name,
            slug,
            description,
            price,
            stock,
            image_url,
            is_available,
            created_at,
            categories (
              id,
              name,
              slug
            )
          `)
          .single();

        if (insertError) {
          throw new Error(
            `Gagal menambahkan produk: ${insertError.message}`
          );
        }

        if (data) {
          setProducts((current) => [
            data as Product,
            ...current,
          ]);
        }

        setMessage(
          "Produk berhasil ditambahkan."
        );
      }

      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setIsAvailable(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingProduct(null);
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

  async function handleDelete(
    product: Product
  ) {
    const confirmed = window.confirm(
      `Hapus produk "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setError(null);
    setMessage(null);

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) {
        throw new Error(
          `Gagal menghapus produk: ${deleteError.message}`
        );
      }

      const storagePath =
        getStoragePath(product.image_url);

      if (storagePath) {
        await supabase.storage
          .from("product-images")
          .remove([storagePath]);
      }

      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      );

      setMessage(
        "Produk berhasil dihapus."
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

  return (
    <div>
      {/* Toolbar */}
      <section className="rounded-[28px] border border-[#e8e2d9] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a95d2c]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b8175]">
                Katalog Produk
              </p>
            </div>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              Daftar Produk
            </h2>

            <p className="mt-1 text-sm text-[#81786d]">
              {products.length} produk tersimpan di
              katalog NusaRasa.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center rounded-xl bg-[#171512] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2823]"
          >
            <span className="mr-2 text-lg leading-none">
              +
            </span>
            Tambah Produk
          </button>
        </div>
      </section>

      {/* Messages */}
      {message && (
        <div className="mt-4 rounded-2xl border border-[#cfe4d4] bg-[#eef8f0] px-5 py-4 text-sm text-[#39734a]">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9efdd] text-xs font-bold">
              ✓
            </span>

            <span>{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
              !
            </span>

            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form */}
      {isFormOpen && (
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white">
          <div className="border-b border-[#eee9e1] bg-[#faf8f4] px-5 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a95d2c]" />

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
                    {editingProduct
                      ? "Product Editor"
                      : "New Product"}
                  </p>
                </div>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                  {editingProduct
                    ? "Edit Produk"
                    : "Tambah Produk"}
                </h2>

                <p className="mt-1 text-sm text-[#81786d]">
                  Isi informasi produk dengan lengkap.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                aria-label="Tutup form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ddd6cc] text-[#81786d] transition hover:bg-white hover:text-[#171512] disabled:opacity-50"
              >
                ×
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 p-5 sm:p-7 md:grid-cols-2"
          >
            {/* Name */}
            <FormField
              label="Nama Produk"
              required
            >
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Contoh: Nasi Ayam Nusantara"
                className="admin-input"
                required
              />
            </FormField>

            {/* Category */}
            <FormField label="Kategori">
              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                className="admin-input bg-white"
              >
                <option value="">
                  Tanpa kategori
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Price */}
            <FormField
              label="Harga"
              required
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#9a9186]">
                  Rp
                </span>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="18000"
                  className="admin-input pl-11"
                  required
                />
              </div>
            </FormField>

            {/* Stock */}
            <FormField
              label="Stok"
              required
            >
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                placeholder="25"
                className="admin-input"
                required
              />
            </FormField>

            {/* Description */}
            <div className="md:col-span-2">
              <FormField label="Deskripsi">
                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Deskripsi singkat produk..."
                  rows={4}
                  className="admin-input resize-none"
                />
              </FormField>
            </div>

            {/* Image Upload */}
            <FormField label="Foto Produk">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9d1c6] bg-[#faf8f4] px-5 py-6 text-center transition hover:border-[#b98967] hover:bg-[#f7f1eb]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#9b5425] shadow-sm">
                  ↑
                </span>

                <span className="mt-3 text-sm font-semibold text-[#3b3732]">
                  Pilih foto produk
                </span>

                <span className="mt-1 text-xs text-[#958c81]">
                  JPG, PNG, WebP · Maksimal 5 MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {selectedFile && (
                <p className="mt-2 truncate text-xs text-[#71695f]">
                  File: {selectedFile.name}
                </p>
              )}
            </FormField>

            {/* Preview */}
            <FormField label="Preview">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#f1eee8]">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview produk"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <span className="text-2xl text-[#b1a89d]">
                      □
                    </span>

                    <span className="mt-2 text-sm text-[#958c81]">
                      Belum ada foto
                    </span>
                  </div>
                )}
              </div>
            </FormField>

            {/* Availability */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#e8e2d9] bg-[#faf8f4] p-4">
                <div>
                  <p className="text-sm font-semibold">
                    Produk tersedia
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#8d8479]">
                    Produk dapat ditampilkan dan dibeli
                    oleh pelanggan.
                  </p>
                </div>

                <span className="relative inline-flex shrink-0">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(event) =>
                      setIsAvailable(
                        event.target.checked
                      )
                    }
                    className="peer sr-only"
                  />

                  <span className="h-6 w-11 rounded-full bg-[#d7d0c7] transition peer-checked:bg-[#9b5425]" />

                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#eee9e1] pt-6 sm:flex-row md:col-span-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="rounded-xl border border-[#ddd6cc] px-5 py-3 text-sm font-semibold text-[#5f584f] transition hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#171512] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2823] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Menyimpan..."
                  : editingProduct
                    ? "Simpan Perubahan"
                    : "Tambah Produk"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Product List */}
      <section className="mt-6 overflow-hidden rounded-[28px] border border-[#e8e2d9] bg-white">
        <div className="border-b border-[#eee9e1] px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b8175]">
                Inventory
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                Semua Produk
              </h2>
            </div>

            <p className="text-xs text-[#958c81]">
              {products.length} item
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3efe8] text-xl text-[#9a9186]">
              +
            </div>

            <h3 className="mt-5 font-semibold">
              Belum ada produk
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#81786d]">
              Mulai isi katalog NusaRasa dengan
              menambahkan produk pertama.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-[#171512] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2823]"
            >
              Tambah Produk
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#eee9e1]">
            {products.map((product, index) => {
              const categoryName =
                getCategoryName(product.categories);

              const stockState =
                product.stock === 0
                  ? "habis"
                  : product.stock <= 5
                    ? "rendah"
                    : "aman";

              return (
                <div
                  key={product.id}
                  className="group p-5 transition hover:bg-[#fcfaf7] sm:p-7"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 gap-4 sm:gap-5">
                      {/* Number */}
                      <div className="hidden shrink-0 pt-2 text-[10px] font-bold tracking-[0.12em] text-[#b0a79c] sm:block">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      {/* Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f1eee8] sm:h-28 sm:w-28">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="112px"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[#958c81]">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#f4ede6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9b5425]">
                            {categoryName}
                          </span>

                          {product.is_available ? (
                            <span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#39734a]">
                              Aktif
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#f1efeb] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#766e64]">
                              Nonaktif
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 truncate text-lg font-semibold tracking-[-0.02em] text-[#171512] sm:text-xl">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm text-[#71695f]">
                          {formatRupiah(
                            Number(product.price)
                          )}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <StockBadge
                            stock={product.stock}
                            state={stockState}
                          />

                          <span className="text-xs text-[#a1988d]">
                            Stok produk
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2 border-t border-[#eee9e1] pt-4 xl:border-0 xl:pt-0">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(product)
                        }
                        className="flex-1 rounded-xl border border-[#ddd6cc] px-4 py-2.5 text-sm font-semibold text-[#4d4740] transition hover:bg-[#faf8f4] sm:flex-none"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(product)
                        }
                        disabled={
                          deletingId ===
                          product.id
                        }
                        className="flex-1 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        {deletingId ===
                        product.id
                          ? "Menghapus..."
                          : "Hapus"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Local component styling */}
      <style jsx>{`
        .admin-input {
          width: 100%;
          border-radius: 0.875rem;
          border: 1px solid #ddd6cc;
          background: #ffffff;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #171512;
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background-color 150ms ease;
        }

        .admin-input::placeholder {
          color: #aaa196;
        }

        .admin-input:focus {
          border-color: #b98967;
          box-shadow: 0 0 0 3px rgba(169, 93, 44, 0.08);
        }

        .admin-input:disabled {
          cursor: not-allowed;
          background: #f5f2ed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#3f3a34]">
        {label}
        {required && (
          <span className="ml-1 text-[#a95d2c]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function StockBadge({
  stock,
  state,
}: {
  stock: number;
  state: "habis" | "rendah" | "aman";
}) {
  const styles = {
    habis:
      "bg-[#fff0ef] text-[#a34c47]",
    rendah:
      "bg-[#fff4df] text-[#9a651d]",
    aman:
      "bg-[#edf7ef] text-[#39734a]",
  };

  const labels = {
    habis: "Habis",
    rendah: "Stok Rendah",
    aman: "Stok Aman",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${styles[state]}`}
    >
      {labels[state]} · {stock}
    </span>
  );
}