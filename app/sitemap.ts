import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nusarasa-ecommerce.vercel.app";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_available", true)
    .gt("stock", 0);

  if (error) {
    console.error("Gagal mengambil produk untuk sitemap:", error);
    return staticPages;
  }

  const productPages: MetadataRoute.Sitemap = (products ?? [])
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      ...(product.updated_at
        ? { lastModified: product.updated_at }
        : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...productPages];
}
