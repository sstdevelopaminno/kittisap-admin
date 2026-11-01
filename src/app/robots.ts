import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/pricing", "/promotions", "/contact", "/en", "/lo"],
        disallow: [
          "/admin/",
          "/api/",
          "/account",
          "/orders",
          "/cart",
          "/checkout",
          "/auth/",
          "/login",
          "/en/account",
          "/en/orders",
          "/en/cart",
          "/en/checkout",
          "/en/auth/",
          "/lo/account",
          "/lo/orders",
          "/lo/cart",
          "/lo/checkout",
          "/lo/auth/",
        ],
      },
    ],
    sitemap: "https://kittisap-admin.vercel.app/sitemap.xml",
    host: "https://kittisap-admin.vercel.app",
  };
}
