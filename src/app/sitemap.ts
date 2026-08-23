import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://alrawaa.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { isAvailable: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ where: { isActive: true }, select: { slug: true } }),
  ]);

  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${SITE}/shop?cat=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
