---
name: SEO 구현 패턴 및 결정 사항
description: Schema.org 스키마 선택, 이미지 없을 때 처리, 주의사항
type: feedback
---

## Schema.org 스키마 선택

Person 페이지에서 강사 강의 서비스 표현: Event 스키마 X → OfferCatalog + Offer + Service 사용
**Why:** 실제 일정(startDate, location) 데이터가 없는 상태에서 Event 마크업하면 Google이 스팸으로 판단. 데이터 모델에 이벤트 일정이 생기면 Event 스키마 추가 가능.

Person.worksFor 필드: 현재 미사용
**Why:** careers[].role은 "Inside Co. Principal Coach" 같은 직책 문자열이어서 Organization.name으로 부적합. 구조화된 소속 조직 데이터 추가 시 구현.

SearchAction (WebSite potentialAction): 현재 미사용
**Why:** 실제 검색 엔드포인트(/search?q=) 없이 마크업하면 Rich Results Test에서 오류. 사이트 검색 기능 구현 후 추가.

## 이미지 자산 현황 (2026-05-09 기준)

public/ 디렉토리에 이미지 파일 없음 (fonts/ 폴더만 존재)
- /og-default.png: 아직 없음. OG 이미지 관련 메타데이터는 주석 처리됨.
- /favicon.ico, /icon.png, /apple-touch-icon.png: 아직 없음. icons 메타데이터 주석 처리됨.
- /logo.png: 아직 없음. Organization JSON-LD logo 주석 처리됨.

**How to apply:** 이미지 파일 생성 후 layout.tsx, page.tsx의 주석 해제 필요.

## 구현된 구조화 데이터 맵 (페이지별)

| 페이지 | 스키마 타입 |
|--------|------------|
| layout (전체 공통) | Organization, WebSite |
| 홈 (/) | FAQPage (GEO 핵심), ItemList |
| 강사 상세 (/speakers/[id]) | Person + OfferCatalog, BreadcrumbList |
| 카테고리 (/category/[id]) | BreadcrumbList, ItemList |
| 서브카테고리 (/category/[id]/[sub]) | BreadcrumbList, ItemList |

## Next.js 15 필수 사항

- viewport (themeColor, width, initialScale)는 layout.tsx에서 `export const viewport: Viewport`로 별도 export 필수.
- metadata에 넣으면 빌드 경고 + 무시됨.

## isDev() 동작 및 sitemap

sitemap.ts가 빌드 시 getSpeakers()를 호출함.
NEXT_PUBLIC_SUPABASE_URL이 없거나 placeholder면 isDev()=true → seed 데이터(12명)로 sitemap 생성.
Vercel 프로덕션에서는 실제 DB 데이터로 생성됨 — 환경변수 설정 확인 필요.
