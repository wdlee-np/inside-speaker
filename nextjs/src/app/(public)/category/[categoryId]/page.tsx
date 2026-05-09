// 카테고리 페이지 서버 컴포넌트
// 동적 메타데이터 + BreadcrumbList + ItemList Schema.org JSON-LD
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryById,
  getCategoriesWithSubs,
  getSpeakers,
  getSpeakerSubcategoryMap,
} from "@/lib/queries";
import { CategoryContent } from "./category-content";
import { JsonLd } from "@/components/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://insidespeakers.co.kr";

interface Props {
  params: Promise<{ categoryId: string }>;
}

// ── 동적 메타데이터 ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);

  if (!category) {
    return {
      title: "카테고리를 찾을 수 없습니다",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.label} 강사 섭외 — Just 강사`;
  const description = category.description
    ? `${category.label} 분야 검증된 강사를 Just 강사에서 찾아보세요. ${category.description}`
    : `Just 강사에서 ${category.label} 분야 전문 외부강사를 섭외하세요. 강연 주제, 경력, 수강 후기를 확인할 수 있습니다.`;

  const canonicalUrl = `${siteUrl}/category/${categoryId}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categoryId } = await params;

  const [category, categoriesWithSubs, speakers, subMap] = await Promise.all([
    getCategoryById(categoryId),
    getCategoriesWithSubs(),
    getSpeakers({ categoryId }),
    getSpeakerSubcategoryMap(),
  ]);

  if (!category) notFound();

  const catWithSubs = categoriesWithSubs.find((c) => c.id === categoryId);
  if (!catWithSubs) notFound();

  const subcategoryMap: Record<string, string> = {};
  categoriesWithSubs.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      subcategoryMap[sub.id] = sub.label;
    });
  });

  const categoryUrl = `${siteUrl}/category/${categoryId}`;

  // ── BreadcrumbList 구조화 데이터 ─────────────────────────────────────────
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.label,
        item: categoryUrl,
      },
    ],
  };

  // ── ItemList: 카테고리 내 강사 목록 구조화 데이터 ────────────────────────
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.label} 강사 목록 — Just 강사`,
    description: `Just 강사의 ${category.label} 분야 강사 큐레이션`,
    url: categoryUrl,
    numberOfItems: speakers.length,
    itemListElement: speakers.map((speaker, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/speakers/${speaker.id}`,
      name: speaker.name,
    })),
  };

  return (
    <>
      {/* 카테고리 BreadcrumbList + ItemList 구조화 데이터 */}
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />
      <CategoryContent
        category={catWithSubs}
        speakers={speakers}
        subcategoryMap={subcategoryMap}
        speakerSubcategoryMap={subMap}
        activeSub={null}
      />
    </>
  );
}
