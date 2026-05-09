// sitemap.ts — 동적 sitemap 생성
// 홈 + 전체 강사(노출 상태) + 카테고리 + 서브카테고리 URL 포함
import type { MetadataRoute } from "next";
import { getSpeakers, getCategoriesWithSubs } from "@/lib/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://insidespeakers.co.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [speakers, categoriesWithSubs] = await Promise.all([
    getSpeakers(),
    getCategoriesWithSubs(),
  ]);

  // 고정 페이지
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 강사 상세 페이지
  const speakerRoutes: MetadataRoute.Sitemap = speakers.map((speaker) => ({
    url: `${siteUrl}/speakers/${speaker.id}`,
    lastModified: speaker.updated_at ? new Date(speaker.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // 카테고리 페이지
  const categoryRoutes: MetadataRoute.Sitemap = categoriesWithSubs.map((cat) => ({
    url: `${siteUrl}/category/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 서브카테고리 페이지
  const subCategoryRoutes: MetadataRoute.Sitemap = categoriesWithSubs.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      url: `${siteUrl}/category/${cat.id}/${sub.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  return [...staticRoutes, ...speakerRoutes, ...categoryRoutes, ...subCategoryRoutes];
}
