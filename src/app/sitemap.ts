import type { MetadataRoute } from "next";

import { listPublicProducts } from "../../lib/db/publicProducts";

const siteUrl = "https://kittisap-admin.vercel.app";

const staticPaths = [
  "/",
  "/products",
  "/pricing",
  "/promotions",
  "/contact",
  "/en",
  "/en/products",
  "/en/pricing",
  "/en/promotions",
  "/en/contact",
  "/lo",
  "/lo/products",
  "/lo/pricing",
  "/lo/promotions",
  "/lo/contact",
];

async function listAllProductSlugs() {
  const slugs = new Set<string>();
  let page = 1;
  let totalPages = 1;

  do {
    const result = await listPublicProducts({ page, pageSize: 200 });
    for (const item of result.items) {
      slugs.add(item.slug);
    }
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages);

  return [...slugs];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const productSlugs = await listAllProductSlugs().catch(() => [] as string[]);

  const productPaths = productSlugs.flatMap((slug) => [`/products/${slug}`, `/en/products/${slug}`, `/lo/products/${slug}`]);
  const allPaths = [...staticPaths, ...productPaths];

  return allPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: now,
    changeFrequency: path.includes("/products/") ? "weekly" : "daily",
    priority: path === "/" || path === "/en" ? 1 : 0.7,
  }));
}
