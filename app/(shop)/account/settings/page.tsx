"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
   const router = useRouter();

  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(
    null
  );

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


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="animate-pulse">
            <div className="h-4 w-40 rounded bg-[#171512]/10" />

            <div className="mt-8 h-10 w-64 rounded bg-[#171512]/10" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-[#171512]/8" />

            <div className="mt-10 overflow-hidden rounded-[2rem] border border-[#171512]/8 bg-white">
              <div className="border-b border-[#171512]/8 p-6 sm:p-8">
                <div className="h-6 w-40 rounded bg-[#171512]/10" />

                <div className="mt-3 h-4 w-72 max-w-full rounded bg-[#171512]/8" />

                <div className="mt-8 flex items-center gap-5">
                  <div className="h-24 w-24 rounded-full bg-[#171512]/10" />

                  <div className="space-y-3">
                    <div className="h-10 w-32 rounded bg-[#171512]/10" />
                    <div className="h-3 w-48 rounded bg-[#171512]/8" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="h-14 rounded-xl bg-[#171512]/8" />
                <div className="h-14 rounded-xl bg-[#171512]/8" />
                <div className="h-14 rounded-xl bg-[#171512]/8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // PROFILE ERROR
  // =====================================================

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] px-4 py-8 text-[#171512] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-7">
            <p className="text-sm font-semibold text-red-800">
              Profil tidak dapat dimuat
            </p>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error || "Data profil tidak ditemukan."}
            </p>
          </div>

          <Link
            href="/account"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#171512] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#29251f]"
          >
            Kembali ke Akun
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    profile.full_name?.trim() || "Pengguna";

  const avatarInitial =
    displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171512]">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-[#171512]/10">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
          <Link
            href="/account"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[#171512]/55 transition hover:text-[#9b5425]"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            Kembali ke akun
          </Link>

          <div className="mt-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[#9b5425]/20 bg-[#9b5425]/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
                Pengaturan
              </span>

              <span className="text-xs font-medium text-[#171512]/35">
                Profil akun
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Pengaturan Akun
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#171512]/55 sm:text-base">
              Kelola informasi profil dan data dasar akun
              NusaRasa Anda dari satu tempat.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <form onSubmit={handleSubmit}>
          {/* =================================================
              PROFILE HERO
          ================================================= */}

          <section className="overflow-hidden rounded-[2rem] border border-[#171512]/10 bg-[#171512] shadow-[0_20px_60px_rgba(23,21,18,0.10)]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-5">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={`Foto profil ${displayName}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-3xl font-semibold text-white">
                          {avatarInitial}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                      Profil Anda
                    </p>

                    <h2 className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-white">
                      {displayName}
                    </h2>

                    <p className="mt-1 truncate text-sm text-white/45">
                      {profile.email || "Email tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
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
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white px-5 text-sm font-semibold text-[#171512] transition hover:bg-[#f4f1eb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ubah Foto
                  </button>

                  {selectedFile && (
                    <p className="mt-2 max-w-48 truncate text-right text-xs text-white/40">
                      {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4 sm:px-8 lg:px-10">
              <p className="text-xs leading-5 text-white/40">
                JPG, PNG, WEBP, atau format gambar lainnya.
                Ukuran maksimal 5 MB.
              </p>
            </div>
          </section>

          {/* =================================================
              FORM
          ================================================= */}

          <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#171512]/10 bg-white shadow-sm">
            <div className="border-b border-[#171512]/8 p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b5425]">
                Informasi
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                Data Profil
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#171512]/50">
                Perbarui informasi yang ingin ditampilkan pada
                akun Anda.
              </p>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              {message && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Berhasil
                    </p>

                    <p className="mt-0.5 text-sm text-emerald-700">
                      {message}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    !
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Tidak dapat menyimpan
                    </p>

                    <p className="mt-0.5 text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <FormField
                label="Nama Lengkap"
                htmlFor="fullName"
                hint="Nama yang digunakan pada akun NusaRasa."
              >
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Masukkan nama lengkap"
                  disabled={saving}
                  className="w-full rounded-2xl border border-[#171512]/12 bg-white px-4 py-3.5 text-sm text-[#171512] outline-none transition placeholder:text-[#171512]/25 focus:border-[#9b5425] focus:ring-4 focus:ring-[#9b5425]/8 disabled:cursor-not-allowed disabled:bg-[#f7f5f0]"
                />
              </FormField>

              <FormField
                label="Email"
                htmlFor="email"
                hint="Email digunakan untuk identitas akun dan tidak dapat diubah di halaman ini."
              >
                <input
                  id="email"
                  type="email"
                  value={profile.email ?? ""}
                  disabled
                  className="w-full rounded-2xl border border-[#171512]/8 bg-[#f7f5f0] px-4 py-3.5 text-sm text-[#171512]/45 outline-none"
                />
              </FormField>

              <FormField
                label="Nomor HP"
                htmlFor="phone"
                hint="Nomor ini dapat digunakan sebagai informasi kontak pesanan."
              >
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Contoh: 081234567890"
                  disabled={saving}
                  className="w-full rounded-2xl border border-[#171512]/12 bg-white px-4 py-3.5 text-sm text-[#171512] outline-none transition placeholder:text-[#171512]/25 focus:border-[#9b5425] focus:ring-4 focus:ring-[#9b5425]/8 disabled:cursor-not-allowed disabled:bg-[#f7f5f0]"
                />
              </FormField>

              <FormField
                label="Role Akun"
                htmlFor="role"
                hint="Role akun ditentukan oleh sistem dan tidak dapat diubah dari halaman ini."
              >
                <div className="flex items-center gap-3 rounded-2xl border border-[#171512]/8 bg-[#f7f5f0] px-4 py-3.5">
                  <span className="inline-flex rounded-full border border-[#9b5425]/20 bg-[#9b5425]/8 px-3 py-1 text-xs font-bold capitalize text-[#9b5425]">
                    {profile.role}
                  </span>

                  <span className="text-sm text-[#171512]/35">
                    Dikelola oleh sistem
                  </span>
                </div>
              </FormField>
            </div>

            {/* =================================================
                ACTION BAR
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-[#171512]/8 bg-[#faf9f6] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <button
                type="button"
                onClick={() => router.push("/account")}
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#171512]/10 bg-white px-6 text-sm font-semibold text-[#171512]/65 transition hover:bg-[#f7f5f0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batalkan
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#171512] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#29251f] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </section>
        </form>

        {/* =================================================
            SECURITY INFO
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#171512]/10 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4e5da] text-[#9b5425]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3l7 4v5c0 4.5-2.9 7.9-7 9-4.1-1.1-7-4.5-7-9V7l7-4z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.5 12l1.7 1.7 3.5-3.5"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b5425]">
                  Keamanan
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                  Informasi akun terlindungi
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#171512]/50">
                  Perubahan profil hanya dapat dilakukan pada
                  data yang diizinkan untuk akun Anda. Role dan
                  identitas autentikasi tetap dikendalikan oleh
                  sistem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            QUICK NAVIGATION
        ================================================= */}

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <QuickLink
            href="/account"
            eyebrow="Akun"
            title="Dashboard Akun"
          />

          <QuickLink
            href="/account/orders"
            eyebrow="Pesanan"
            title="Riwayat Pesanan"
          />

          <QuickLink
            href="/products"
            eyebrow="Belanja"
            title="Jelajahi Produk"
          />
        </section>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-[#171512]/10 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold tracking-tight text-[#171512]">
              NusaRasa
            </p>

            <p className="mt-1 text-xs text-[#171512]/40">
              Platform digital untuk UMKM lokal.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/"
              className="text-[#171512]/45 transition hover:text-[#9b5425]"
            >
              Beranda
            </Link>

            <Link
              href="/products"
              className="text-[#171512]/45 transition hover:text-[#9b5425]"
            >
              Produk
            </Link>

            <Link
              href="/cart"
              className="text-[#171512]/45 transition hover:text-[#9b5425]"
            >
              Keranjang
            </Link>

            <Link
              href="/account"
              className="font-medium text-[#171512] transition hover:text-[#9b5425]"
            >
              Akun
            </Link>
          </div>
        </div>

        <div className="border-t border-[#171512]/8">
          <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-[#171512]/30 sm:px-6">
            © {new Date().getFullYear()} NusaRasa. All rights
            reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

// =======================================================
// FORM FIELD
// =======================================================

function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-[#171512]"
      >
        {label}
      </label>

      {children}

      <p className="mt-2 text-xs leading-5 text-[#171512]/38">
        {hint}
      </p>
    </div>
  );
}

// =======================================================
// QUICK LINK
// =======================================================

function QuickLink({
  href,
  eyebrow,
  title,
}: {
  href: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#171512]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#9b5425]/25 hover:shadow-md"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b5425]">
        {eyebrow}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#171512]">
          {title}
        </p>

        <span className="text-[#171512]/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#9b5425]">
          →
        </span>
      </div>
    </Link>
  );
}