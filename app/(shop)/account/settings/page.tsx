"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
};

function getStoragePath(url: string | null) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/avatars/";

  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const path = url.slice(index + marker.length);

  if (!path) {
    return null;
  }

  return decodeURIComponent(path.split("?")[0]);
}

export default function AccountSettingsPage() {
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

      const { data: claimsData, error: claimsError } =
        await supabase.auth.getClaims();

      if (claimsError || !claimsData?.claims) {
        setError("Sesi login tidak ditemukan.");
        setLoading(false);
        return;
      }

      const userId = claimsData.claims.sub;

      if (!userId) {
        setError("User tidak ditemukan.");
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, role, avatar_url"
        )
        .eq("id", userId)
        .single();

      if (profileError || !data) {
        setError(
          profileError?.message ||
            "Gagal mengambil data profil."
        );
        setLoading(false);
        return;
      }

      setProfile(data);
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setPreviewUrl(data.avatar_url ?? null);

      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setMessage("");
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Ukuran foto maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  }

  function handleChoosePhoto() {
    fileInputRef.current?.click();
  }

  function handleCancel() {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(profile?.avatar_url ?? null);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!profile?.id) {
      setError("Data profil belum tersedia.");
      return;
    }

    const cleanedName = fullName.trim();
    const cleanedPhone = phone.trim();

    if (!cleanedName) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);

    let newAvatarUrl = profile.avatar_url;
    let uploadedFilePath: string | null = null;

    try {
      /*
       * 1. Upload foto baru terlebih dahulu.
       */
      if (selectedFile) {
        const extension =
          selectedFile.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        uploadedFilePath = `${profile.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(uploadedFilePath, selectedFile, {
            cacheControl: "3600",
            contentType: selectedFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            uploadError.message ||
              "Gagal mengunggah foto profil."
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadedFilePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error(
            "Gagal mendapatkan URL foto profil."
          );
        }

        newAvatarUrl = publicUrlData.publicUrl;
      }

      /*
       * 2. Simpan perubahan profil ke database.
       */
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: cleanedName,
          phone: cleanedPhone || null,
          avatar_url: newAvatarUrl,
        })
        .eq("id", profile.id);

      if (updateError) {
        /*
         * Jika database gagal diperbarui tetapi foto baru
         * sudah terlanjur di-upload, hapus foto baru tersebut
         * agar tidak menjadi file yatim.
         */
        if (uploadedFilePath) {
          await supabase.storage
            .from("avatars")
            .remove([uploadedFilePath]);
        }

        throw new Error(
          updateError.message ||
            "Gagal menyimpan perubahan profil."
        );
      }

      /*
       * 3. Database sudah berhasil.
       * Sekarang baru hapus avatar lama.
       */
      if (
        selectedFile &&
        profile.avatar_url &&
        profile.avatar_url !== newAvatarUrl
      ) {
        const oldAvatarPath = getStoragePath(
          profile.avatar_url
        );

        if (oldAvatarPath) {
          const { error: deleteError } =
            await supabase.storage
              .from("avatars")
              .remove([oldAvatarPath]);

          /*
           * Kegagalan menghapus avatar lama tidak membatalkan
           * perubahan profil karena avatar baru sudah tersimpan.
           */
          if (deleteError) {
            console.warn(
              "Avatar lama gagal dihapus:",
              deleteError.message
            );
          }
        }
      }

      /*
       * 4. Update state lokal.
       */
      const updatedProfile: Profile = {
        ...profile,
        full_name: cleanedName,
        phone: cleanedPhone || null,
        avatar_url: newAvatarUrl,
      };

      setProfile(updatedProfile);
      setFullName(cleanedName);
      setPhone(cleanedPhone);
      setSelectedFile(null);
      setPreviewUrl(newAvatarUrl);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Perubahan profil berhasil disimpan.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 rounded bg-gray-200" />
              <div className="h-4 w-72 rounded bg-gray-200" />

              <div className="flex items-center gap-5">
                <div className="h-24 w-24 rounded-full bg-gray-200" />

                <div className="space-y-3">
                  <div className="h-10 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-48 rounded bg-gray-200" />
                </div>
              </div>

              <div className="h-12 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Data profil tidak ditemukan."}
          </div>

          <div className="mt-4">
            <Link
              href="/account"
              className="inline-flex items-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Kembali ke Akun
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    profile.full_name?.trim() || "Pengguna";

  const avatarInitial =
    displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Akun
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Pengaturan Akun
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Kelola informasi profil akun NusaRasa kamu.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Foto Profil
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Gunakan foto yang jelas dengan ukuran maksimal 5 MB.
            </p>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Foto profil ${displayName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-500">
                    {avatarInitial}
                  </span>
                )}
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  disabled={saving}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Pilih Foto
                </button>

                {selectedFile && (
                  <p className="mt-2 max-w-xs truncate text-xs text-gray-500">
                    {selectedFile.name}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Format gambar: JPG, PNG, WEBP, dan format gambar
                  lainnya.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Nama Lengkap
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Masukkan nama lengkap"
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={profile.email ?? ""}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
              />

              <p className="mt-2 text-xs text-gray-500">
                Email akun tidak dapat diubah dari halaman ini.
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Nomor HP
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Contoh: 081234567890"
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Role Akun
              </label>

              <input
                id="role"
                type="text"
                value={profile.role}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm capitalize text-gray-500 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 p-6 sm:flex-row sm:justify-end sm:p-8">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-11V7a4 4 0 00-8 0v3h8z"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Keamanan Akun
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Informasi akun kamu dilindungi oleh autentikasi
                dan kebijakan keamanan database NusaRasa.
              </p>
            </div>
          </div>
        </div>

        <div className="py-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} NusaRasa. Semua hak
          dilindungi.
        </div>
      </div>
    </div>
  );
}
