import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/*
 * Hanya izinkan redirect ke path internal.
 * "//evil.com" dan "/\evil.com" ditolak karena dianggap host lain oleh browser.
 */
function getSafeNext(next: string | null) {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return "/";
  }

  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const safeNext = getSafeNext(requestUrl.searchParams.get("next"));

  const supabase = await createClient();

  /*
   * Alur 1: link email membawa token_hash.
   * Tidak membutuhkan cookie code-verifier, jadi tetap berhasil
   * walau link dibuka di browser atau perangkat lain.
   */
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
    }

    return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
  }

  /*
   * Alur 2 (PKCE): Supabase sudah memverifikasi email sebelum
   * mengarahkan ke sini dengan ?code=.
   */
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
    }

    /*
     * Code ada artinya email SUDAH terverifikasi. Yang gagal hanya
     * pembuatan sesi (umumnya link dibuka di browser/perangkat berbeda
     * dari tempat pendaftaran, sehingga cookie code-verifier tidak ada).
     * Arahkan ke login, bukan ke halaman error.
     */
    console.error("EXCHANGE CODE ERROR:", error.message);

    return NextResponse.redirect(
      new URL("/login?verified=1", requestUrl.origin)
    );
  }

  /*
   * Tanpa code/token: biasanya link yang sudah dipakai atau kedaluwarsa
   * (Supabase mengirim detail error lewat #fragment yang tidak terbaca server).
   */
  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
}
