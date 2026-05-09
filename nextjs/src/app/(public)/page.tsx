// 홈페이지 서버 컴포넌트
// GEO 최적화: FAQPage + ItemList Schema.org 구조화 데이터 포함
import type { Metadata } from "next";
import { getFeaturedSpeakers, getSpeakers, getCategoriesWithSubs, getSpeakerSubcategoryMap } from "@/lib/queries";
import { HomepageClient } from "./homepage-client";
import { JsonLd } from "@/components/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://insidespeakers.co.kr";

// ── 홈페이지 메타데이터 ─────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Just 강사 — 기업 교육 강사 섭외 플랫폼",
  description:
    "기업 교육에 맞는 강사를 빠르게 섭외하세요. 리더십·생성형 AI·인문·경제 분야 검증된 외부강사를 큐레이션합니다. 강연 기획부터 섭외까지 Just 강사 한 곳에서 해결.",
  alternates: {
    canonical: `${siteUrl}/`,
  },
  openGraph: {
    title: "Just 강사 — 기업 교육 강사 섭외 플랫폼",
    description:
      "리더십·AI·인문·경제 분야 검증된 외부강사를 기업 교육 담당자에게 큐레이션합니다.",
    url: `${siteUrl}/`,
    type: "website",
    // OG 이미지: public/og-default.png 생성 후 아래 주석 해제
    // images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Just 강사" }],
  },
};

// ── GEO: FAQPage 구조화 데이터 ─────────────────────────────────────────────
// 기업 교육 담당자가 AI 검색에서 자주 묻는 질문을 Schema.org 포맷으로 표현
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "기업 교육에 적합한 강사를 어떻게 섭외하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Just 강사에서 리더십·생성형 AI·인문·경제 등 카테고리별로 검증된 강사를 찾고, 섭외 문의를 남기면 담당자가 강연 목적에 맞는 강사를 연결해 드립니다. 강사 프로필에서 강연 주제, 경력, 강연 영상, 수강 후기를 확인할 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "강사 섭외 비용(강사료)은 어떻게 책정되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Just 강사의 강사료는 S·A·B·C 4단계 레벨로 구분됩니다. LEVEL S는 국내 최고 수준의 명사·전문가, LEVEL A는 대기업 대상 검증된 전문가, LEVEL B는 중견·스타트업 대상, LEVEL C는 입문/체험 강연에 적합합니다. 정확한 비용은 섭외 문의 후 안내드립니다.",
      },
    },
    {
      "@type": "Question",
      name: "생성형 AI·ChatGPT 관련 기업 교육 강사를 추천해 주세요.",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Just 강사의 '미래 기술 > 생성형 AI 활용' 카테고리에서 생성형 AI, ChatGPT, Prompt Engineering, 디지털 트랜스포메이션 전문 강사를 찾을 수 있습니다. 각 강사의 실무 활용 사례와 강연 영상을 확인하고 섭외 문의를 남겨주세요.",
      },
    },
    {
      "@type": "Question",
      name: "리더십 교육 강사 섭외 시 어떤 점을 확인해야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "리더십 강사 선발 시 강연 대상(임원·팀장·신입사원 등), 교육 목적(동기부여·스킬업·조직문화 등), 강연 형식(강의·워크샵·코칭)을 고려하세요. Just 강사에서는 강사별 대표 주제, 수강 기업 후기, 강연 영상을 제공해 적합한 강사를 비교 선택할 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "강사 등록(등록 신청)은 어떻게 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Just 강사에 강사로 등록하려면 '강사 등록 신청' 페이지에서 강연 분야, 경력, 연락처를 입력하면 됩니다. 검토 후 플랫폼 담당자가 연락드립니다.",
      },
    },
  ],
};

export default async function HomePage() {
  const [categoriesWithSubs, featured, all, subMap] = await Promise.all([
    getCategoriesWithSubs(),
    getFeaturedSpeakers(8),
    getSpeakers(),
    getSpeakerSubcategoryMap(),
  ]);

  const subcategoryMap: Record<string, string> = {};
  categoriesWithSubs.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      subcategoryMap[sub.id] = sub.label;
    });
  });

  // GEO: ItemList — 추천 강사 목록 구조화 데이터
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Just 강사 추천 강사 목록",
    description: "기업 교육 담당자가 가장 많이 찾는 검증된 강사",
    url: `${siteUrl}/`,
    numberOfItems: featured.length,
    itemListElement: featured.map((speaker, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/speakers/${speaker.id}`,
      name: speaker.name,
    })),
  };

  return (
    <>
      {/* GEO: FAQPage + ItemList 구조화 데이터 */}
      <JsonLd data={faqJsonLd} />
      <JsonLd data={itemListJsonLd} />
      <HomepageClient
        categories={categoriesWithSubs}
        featured={featured}
        all={all}
        subcategoryMap={subcategoryMap}
        speakerSubcategoryMap={subMap}
      />
    </>
  );
}
