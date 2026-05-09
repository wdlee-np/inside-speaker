// 강사 상세 페이지 서버 컴포넌트
// 동적 메타데이터 + Person + BreadcrumbList Schema.org JSON-LD
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSpeakerById,
  getRecommendedSpeakers,
  getCategoriesWithSubs,
  getSpeakerSubcategoryMap,
} from "@/lib/queries";
import { SpeakerDetailClient } from "./speaker-detail-client";
import { JsonLd } from "@/components/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://insidespeakers.co.kr";

interface Props {
  params: Promise<{ speakerId: string }>;
}

// ── 동적 메타데이터 ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { speakerId } = await params;
  const speaker = await getSpeakerById(speakerId);

  // 강사가 없을 때는 최소 메타데이터 반환 (notFound는 페이지에서 처리)
  if (!speaker) {
    return {
      title: "강사를 찾을 수 없습니다",
      robots: { index: false, follow: false },
    };
  }

  const title = `${speaker.name} 강사 — ${speaker.title}`;
  // bio 첫 문장을 description으로 사용, 없으면 기본값
  const bioText = speaker.bio[0] ?? "";
  const description = bioText
    ? `${speaker.name} | ${bioText.slice(0, 120)}`
    : `${speaker.name}(${speaker.title}) 강사 프로필 및 강연 주제를 확인하세요.`;

  const canonicalUrl = `${siteUrl}/speakers/${speakerId}`;

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
      type: "profile",
      // 강사 프로필 이미지가 있을 경우에만 OG 이미지로 사용
      ...(speaker.portrait_url
        ? {
            images: [
              {
                url: speaker.portrait_url,
                width: 1200,
                height: 630,
                alt: `${speaker.name} 강사 프로필`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: speaker.portrait_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(speaker.portrait_url ? { images: [speaker.portrait_url] } : {}),
    },
  };
}

export default async function SpeakerDetailPage({ params }: Props) {
  const { speakerId } = await params;

  const speaker = await getSpeakerById(speakerId);
  if (!speaker) notFound();

  const [related, categoriesWithSubs, subMap] = await Promise.all([
    getRecommendedSpeakers(speaker, 4),
    getCategoriesWithSubs(),
    getSpeakerSubcategoryMap(),
  ]);

  const subcategoryMap: Record<string, string> = {};
  categoriesWithSubs.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      subcategoryMap[sub.id] = sub.label;
    });
  });

  const firstSubId = speaker.subcategory_ids[0];
  const parentCategory = categoriesWithSubs.find((cat) =>
    cat.subcategories.some((s) => s.id === firstSubId)
  );

  // ── Person 구조화 데이터 ───────────────────────────────────────────────
  // Event 데이터 없음 — OfferCatalog 방식으로 강의 서비스 표현
  const speakerUrl = `${siteUrl}/speakers/${speakerId}`;
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: speaker.name,
    ...(speaker.name_en ? { alternateName: speaker.name_en } : {}),
    jobTitle: speaker.title,
    ...(speaker.portrait_url
      ? {
          image: {
            "@type": "ImageObject",
            url: speaker.portrait_url,
          },
        }
      : {}),
    url: speakerUrl,
    description: speaker.bio.join(" "),
    // 강의 서비스 목록 (Event 스키마 대신 OfferCatalog 사용)
    // 이유: 실제 일정 데이터가 없어 Event 마크업은 스팸으로 간주될 수 있음
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${speaker.name} 강연 프로그램`,
      itemListElement: speaker.topics.map((topic) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: topic,
          provider: {
            "@type": "Organization",
            name: "Just 강사",
            url: siteUrl,
          },
        },
      })),
    },
    // worksFor: 구조화된 소속 조직 데이터 추가 시 구현 예정
  };

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
      ...(parentCategory
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: parentCategory.label,
              item: `${siteUrl}/category/${parentCategory.id}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: speaker.name,
              item: speakerUrl,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: speaker.name,
              item: speakerUrl,
            },
          ]),
    ],
  };

  return (
    <>
      {/* 강사 Person + BreadcrumbList 구조화 데이터 */}
      <JsonLd data={personJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SpeakerDetailClient
        speaker={speaker}
        related={related}
        subcategoryMap={subcategoryMap}
        speakerSubcategoryMap={subMap}
        parentCategory={parentCategory ?? null}
      />
    </>
  );
}
