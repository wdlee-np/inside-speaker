// layout.tsx — 루트 레이아웃
// Next.js 15 App Router 기준 메타데이터/뷰포트 분리 설정
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://insidespeakers.co.kr";
const siteName = "Just 강사";

// ── viewport: Next.js 14.x+ 기준 별도 export 필수 ─────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14756b" },
    { media: "(prefers-color-scheme: dark)", color: "#0f5c54" },
  ],
};

// ── 루트 메타데이터 ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: `${siteName} — 기업 교육 강사 섭외 플랫폼`,
    template: `%s | ${siteName}`,
  },
  description:
    "Just 강사는 리더십·AI·인문·경제 분야 검증된 강사를 기업 교육 담당자에게 연결하는 큐레이션 플랫폼입니다. 강사 섭외부터 강연 기획까지 한 번에 해결하세요.",
  keywords: [
    "강사 섭외",
    "기업 교육 강사",
    "외부강사",
    "강연 섭외",
    "리더십 강사",
    "AI 강사",
    "기업 강의",
    "기업 교육 플랫폼",
    "강사 큐레이션",
    "강연 기획",
  ],

  // ── 소셜 메타데이터 ──────────────────────────────────────────────────────
  // OG 이미지: public/og-default.png 파일 생성 후 images 배열 추가
  openGraph: {
    siteName,
    locale: "ko_KR",
    type: "website",
    url: siteUrl,
    title: `${siteName} — 기업 교육 강사 섭외 플랫폼`,
    description:
      "Just 강사는 리더십·AI·인문·경제 분야 검증된 강사를 기업 교육 담당자에게 연결하는 큐레이션 플랫폼입니다.",
  },
  twitter: {
    card: "summary",
    title: `${siteName} — 기업 교육 강사 섭외 플랫폼`,
    description:
      "Just 강사는 리더십·AI·인문·경제 분야 검증된 강사를 기업 교육 담당자에게 연결하는 큐레이션 플랫폼입니다.",
  },

  // ── 크롤러 설정 ──────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── 아이콘 ───────────────────────────────────────────────────────────────
  // favicon.ico, icon.png, apple-touch-icon.png 파일 생성 후 아래 주석 해제
  // icons: {
  //   icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
  //   apple: "/apple-touch-icon.png",
  // },

  // ── 기타 ─────────────────────────────────────────────────────────────────
  alternates: {
    canonical: siteUrl,
  },
};

// ── Organization + WebSite 구조화 데이터 ────────────────────────────────────
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  // logo: 이미지 파일 준비 후 아래 주석 해제
  // logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
  description:
    "리더십·AI·인문·경제 분야 검증된 강사를 기업 교육 담당자에게 연결하는 큐레이션 플랫폼",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "contact@insidecompany.co.kr",
    telephone: "+82-2-6925-5032",
    availableLanguage: "Korean",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "창업로 43, 판교글로벌비즈센터 B동 1011호",
    addressLocality: "성남시 수정구",
    addressRegion: "경기도",
    postalCode: "13449",
    addressCountry: "KR",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description:
    "기업 교육 강사 섭외 큐레이션 플랫폼 — 리더십·AI·인문·경제 분야 검증된 강사",
  inLanguage: "ko-KR",
  // SearchAction: 실제 검색 엔드포인트 구현 후 추가 예정
  // potentialAction: { "@type": "SearchAction", ... }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/* Organization + WebSite 구조화 데이터 */}
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        {children}
      </body>
    </html>
  );
}
