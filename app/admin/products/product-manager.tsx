"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
} | null;

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

  // Supabase mengembalikan relasi categories sebagai array.
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
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

  const marker = "/storage/v1/object/public/product-images/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return imageUrl.substring(index + marker.length);
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

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  async function uploadImage(
    file: File,
    productId: string
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

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
        throw new Error("Nama produk wajib diisi.");
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

      let productId =
        editingProduct?.id ?? crypto.randomUUID();

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

  async function handleDelete(product: Product) {
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
      {/* Top Actions */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Total produk
          </p>

          <p className="mt-1 text-2xl font-bold">
            {products.length}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Tambah Produk
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {editingProduct
                  ? "Edit Produk"
                  : "Tambah Produk"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Isi informasi produk NusaRasa.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-black"
            >
              Tutup
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nama Produk
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Contoh: Nasi Ayam Nusantara"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kategori
              </label>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-black"
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
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Harga
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="18000"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Stok
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                placeholder="25"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Deskripsi
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Deskripsi singkat produk..."
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Foto Produk
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG, WebP. Maksimal 5 MB.
              </p>
            </div>

            {/* Preview */}
            <div>
              <p className="mb-2 text-sm font-medium">
                Preview
              </p>

              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview produk"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-400">
                    Belum ada foto
                  </span>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(event) =>
                    setIsAvailable(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Produk tersedia untuk pelanggan
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Menyimpan..."
                  : editingProduct
                    ? "Simpan Perubahan"
                    : "Tambah Produk"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-semibold">
            Daftar Produk
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              Belum ada produk.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Tambah Produk
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {product.categories?.name ??
                        "Tanpa kategori"}
                    </p>

                    <h3 className="mt-1 truncate text-lg font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatRupiah(
                        Number(product.price)
                      )}{" "}
                      · Stok {product.stock}
                    </p>

                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        product.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.is_available
                        ? "Tersedia"
                        : "Tidak tersedia"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(product)
                    }
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(product)
                    }
                    disabled={
                      deletingId === product.id
                    }
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === product.id
                      ? "Menghapus..."
                      : "Hapus"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}