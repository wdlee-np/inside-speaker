// 강사 등록 신청 페이지
import type { Metadata } from "next";
import { getCategoriesWithSubs } from "@/lib/queries";
import { RegisterForm } from "./register-form";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://insidespeakers.co.kr";

export const metadata: Metadata = {
  title: "강사 등록 신청 — Just 강사",
  description:
    "Just 강사에 강연 전문가로 등록하세요. 리더십·AI·인문·경제 분야 강사를 모집합니다. 등록 후 검토를 거쳐 기업 교육 플랫폼에 노출됩니다.",
  alternates: {
    canonical: `${siteUrl}/register`,
  },
  // 강사 등록 페이지는 검색 인덱싱하되, 중복 노출 방지
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RegisterPage() {
  const categoriesWithSubs = await getCategoriesWithSubs();
  return <RegisterForm categoriesWithSubs={categoriesWithSubs} />;
}
