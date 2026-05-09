---
name: 프로젝트 기본 정보
description: Just 강사 서비스명, 도메인, 스택, 주요 SEO 키워드 및 페이지 구조
type: project
---

서비스명: Just 강사 (구 Inside Speakers)
도메인: https://insidespeakers.co.kr (NEXT_PUBLIC_SITE_URL 환경변수로 제어)
스택: Next.js 15 App Router, TypeScript, Tailwind CSS v4, Supabase

주요 키워드: 강사 섭외, 기업 교육 강사, 외부강사, 강연 섭외, 리더십 강사, AI 강사, 기업 강의

카테고리 구조 (4개 대분류, 13개 서브카테고리):
- competency: 리더십, 인사/조직관리, 영업/마케팅, 전략/기획
- future-tech: 생성형 AI 활용, 디지털 트랜스포메이션, 신산업 트렌드
- humanities: 비즈니스 커뮤니케이션, 심리/마인드풀니스, ESG/윤리경영
- economy-life: 거시경제/재테크, 자기계발, 건강/웰빙

공개 라우트: /, /speakers/[speakerId], /category/[categoryId], /category/[categoryId]/[subId], /register
차단 라우트: /admin, /api/

**Why:** SEO 작업 시 도메인 기준 URL 구성에 활용
**How to apply:** canonical, OG url, sitemap, JSON-LD의 url 필드에 siteUrl 변수 사용
