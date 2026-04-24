import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Inside Speakers — 기업 교육 연사 섭외 플랫폼",
    template: "%s | Inside Speakers",
  },
  description:
    "국내 최고 리더십·미래기술·인문·경제 분야 연사를 기업 교육 담당자에게 연결하는 큐레이션 플랫폼",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://insidespeakers.co.kr"
  ),
  openGraph: {
    siteName: "Inside Speakers",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
