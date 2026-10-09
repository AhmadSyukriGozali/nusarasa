import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/products"],
      disallow: [
        "/admin",
        "/account",
        "/cart",
        "/checkout",
        "/login",
        "/register",
        "/api",
        "/auth",
      ],
    },
    sitemap: "https://nusarasa-ecommerce.vercel.app/sitemap.xml",
    host: "https://nusarasa-ecommerce.vercel.app",
  };
}
