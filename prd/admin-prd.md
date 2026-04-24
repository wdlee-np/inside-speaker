# Inside Speakers 어드민 시스템 및 동적 웹사이트 전환 PRD

## 문서 정보
- **프로젝트명**: Inside Speakers — 기업 교육 연사 섭외 플랫폼
- **문서 버전**: 1.0
- **작성일**: 2026-04-24
- **작성자**: Product / Engineering
- **상태**: 초안 (Draft)
- **관련 문서**: `CLAUDE.md`, `public/Inside Speakers.html` (디자인 레퍼런스)

---

## 1. 개요 (Executive Summary)

### 1.1 제품/기능 설명
Inside Speakers는 국내 최고 수준의 리더십·미래기술·인문·경제 분야 연사를 기업 교육 담당자에게 연결하는 **큐레이션 기반 연사 섭외 플랫폼**이다. 현재는 정적 프로토타입(바닐라 React + CDN, 하드코딩된 샘플 데이터 12명)으로 운영되고 있으며, 본 PRD는 이를 **Next.js + Supabase 기반의 동적 플랫폼**으로 전환하고 **운영자용 어드민 패널**을 신규 구축하기 위한 요구사항을 정의한다.

### 1.2 배경 및 동기
현재 프로토타입은 디자인 검증과 초기 세일즈 자료로는 유효하지만 다음과 같은 한계가 있다:
- 강사 정보가 `public/data/speakers.js`에 하드코딩되어 있어 **비개발자가 콘텐츠를 수정할 수 없음**
- 강사 1명을 추가/수정할 때마다 **배포가 필요**
- **섭외 문의가 DB에 적재되지 않음** (현재 폼은 UI만 존재)
- 카테고리 구조, 추천 순서, featured 플래그 등 **운영 정책을 코드로만 변경 가능**
- 이미지/영상 에셋이 로컬 파일 시스템에 묶여 있어 **CMS형 운영 불가**

본 프로젝트는 위 한계를 제거하고, 운영팀이 자체적으로 콘텐츠를 관리하며, 기업 교육 담당자의 섭외 문의를 체계적으로 수집·추적할 수 있는 기반을 구축하는 것을 목표로 한다.

### 1.3 목표
**비즈니스 목표**
- 운영자가 개발 의존 없이 강사 정보를 CRUD 할 수 있는 환경 제공
- 섭외 문의 리드(Lead)를 100% DB로 수집하여 영업 파이프라인 구축
- 강사 풀 확장(현재 12명 샘플 → 목표 100명 이상) 시 운영 부담 최소화

**사용자 목표**
- **운영자**: 5분 이내에 신규 강사 1명을 등록할 수 있어야 함
- **기업 교육 담당자**: 3클릭 이내에 관심 강사의 상세 정보를 열람하고 문의할 수 있어야 함

**기술적 목표**
- 정적 사이트 → Next.js App Router + Supabase SSR 동적 사이트로 무중단 전환
- 기존 디자인 픽셀 퍼펙트 유지 (Inside Speakers.html 레퍼런스)
- Lighthouse Performance 90+, Accessibility 95+ 유지

### 1.4 성공 지표 (KPI)
- [ ] 운영자가 외부 지원 없이 강사 정보를 등록/수정/삭제할 수 있음 (자가 운영 가능률 100%)
- [ ] 신규 강사 등록 소요 시간 평균 10분 이내
- [ ] 섭외 문의 DB 수집률 100% (기존 0%)
- [ ] 초기 페이지 로딩 LCP < 2.5s (PC 기준)
- [ ] 어드민 로그인 세션 탈취 및 권한 우회 사고 0건
- [ ] 기존 디자인 대비 픽셀 차이 ±2px 이내 (레퍼런스 페이지 비교)

---

## 2. 사용자 분석

### 2.1 타겟 사용자

| 페르소나 | 설명 | 주요 니즈 | 페인 포인트 |
|---------|------|----------|------------|
| **김운영 (Inside Speakers 운영 매니저)** | 30대 중반, 연사 에이전시 운영 담당. 기술 배경 없음. | - 강사 프로필을 직접 업로드/수정<br>- 문의 내역을 한 곳에서 확인<br>- 노출 순서 조정 (featured, 정렬) | - 현재는 개발팀에 매번 요청해야 함<br>- 문의가 이메일로만 와서 관리 어려움<br>- 엑셀로 강사 정보를 관리하는 이중 부담 |
| **박교육 (대기업 HRD팀 대리)** | 30대 초반, 연간 교육 프로그램 기획. 월 5~10회 연사 섭외. | - 분야별로 강사 빠르게 탐색<br>- 강연 영상/후기 실제 확인<br>- 예산과 일정 맞는 강사 섭외 | - 강사 정보 신뢰도 판단 어려움<br>- 여러 플랫폼 비교 피로<br>- 답변 받기까지 오래 걸림 |
| **최임원 (중견기업 경영지원팀 팀장)** | 40대 중반, 임원 대상 특강 1~2회/분기 섭외. | - 리더십·경제 분야 탑티어 강사 확인<br>- 빠른 견적 회신 | - 강사별 피(Fee) 정보 불투명<br>- 상세 프로필 비교 번거로움 |

### 2.2 사용자 여정 (User Journey)

#### 운영자 여정 — 신규 강사 등록
1. 운영자가 `/admin` 접속 → Supabase Auth로 로그인
2. 대시보드에서 "강사 등록" 클릭
3. 기본 정보 입력 (이름, 영문명, 타이틀, 카테고리 선택)
4. 이미지 업로드 (Supabase Storage) → URL 자동 저장
5. 강연 주제, 경력, 통계, Bio 단락 입력
6. 영상 URL, 수강 후기 배열 입력
7. "미리보기"로 실제 프론트엔드 렌더링 확인
8. "발행" 클릭 → DB 저장 + ISR 재검증 → 즉시 공개

#### 기업 교육 담당자 여정 — 섭외 문의
1. 홈 진입 → 분야별 카테고리 또는 Featured 섹션에서 관심 강사 클릭
2. 강사 상세 페이지 진입 → 탭 메뉴(핵심요약/영상/프로필/주제/후기/추천/문의) 탐색
3. sticky 탭바에서 "섭외문의" 클릭 or 플로팅 "문의하기" 버튼 클릭
4. 문의 폼 작성 (기업명/부서/연락처/희망 일정/예산)
5. 제출 → Supabase DB 저장 + 운영자에게 이메일 알림
6. 제출 완료 화면에서 "유사한 강사 보기" 추천

---

## 3. 현재 상태 vs 목표 상태 (As-Is / To-Be)

### 3.1 As-Is (현재)

| 영역 | 현재 상태 |
|------|----------|
| 프레임워크 | 바닐라 React 18 (CDN) + Babel standalone 런타임 변환 |
| 빌드 | 없음 (정적 HTML) |
| 라우팅 | 해시 라우터 (`#/speaker/:id`) |
| 스타일 | 순수 CSS + CSS 변수 토큰 (`tokens.css`, `styles/app.css`) |
| 데이터 | `public/data/speakers.js` 하드코딩 (12명) |
| 이미지 | `public/uploads/` 로컬 파일 |
| 섭외 문의 | UI만 존재, 제출 시 어디에도 저장되지 않음 |
| 어드민 | 없음 |
| 배포 | Vercel 정적 사이트 (`outputDirectory: public`) |
| SEO | 해시 라우팅으로 크롤러에 개별 강사 페이지 노출 어려움 |

### 3.2 To-Be (목표)

| 영역 | 목표 상태 |
|------|----------|
| 프레임워크 | Next.js 15 (App Router) + React Server Components |
| 빌드 | Next.js 빌드 파이프라인 (Vercel) |
| 라우팅 | 파일 기반 라우팅 (`/speaker/[id]`, `/category/[id]`) |
| 스타일 | Tailwind CSS v4 + 기존 CSS 토큰 이식 (`@theme` 블록) |
| 데이터 | Supabase PostgreSQL (speakers, categories, inquiries, assets) |
| 이미지 | Supabase Storage + `next/image` 최적화 |
| 섭외 문의 | `inquiries` 테이블 적재 + 이메일 알림 |
| 어드민 | `/admin` 라우트 + Supabase Auth (이메일/패스워드 + RLS) |
| 배포 | Vercel (동일) + Edge/Node Runtime 혼합 |
| SEO | SSR/ISR 기반, 개별 페이지 메타태그/OG 이미지 |

### 3.3 핵심 전환 원칙
- **디자인 100% 유지**: 기존 `Inside Speakers.html`의 마크업/스타일을 픽셀 단위로 재현
- **데이터 하위호환**: 기존 `speakers.js` 스키마를 DB 컬럼으로 1:1 매핑 (마이그레이션 스크립트 제공)
- **점진적 전환**: 프론트엔드 먼저 Next.js 전환 → 어드민 구축 → 데이터 Supabase 연동 순

---

## 4. 기능 요구사항

### 4.1 핵심 기능 (Must Have — P0)

#### 기능 1: 어드민 인증
- **설명**: Supabase Auth 기반 이메일/패스워드 로그인. 운영자 계정만 사전 등록.
- **사용자 스토리**: As a 운영자, I want to 안전하게 로그인 so that 타인이 강사 데이터를 변경할 수 없다
- **인수 조건**
  - [ ] `/admin`의 모든 하위 페이지는 미인증 시 `/admin/login`으로 리다이렉트
  - [ ] Supabase RLS(Row Level Security)로 `admin` role만 쓰기 허용
  - [ ] 로그아웃 시 세션 즉시 만료
  - [ ] 잘못된 비밀번호 5회 실패 시 5분 잠금 (Supabase 내장 rate limit 활용)
- **우선순위**: P0

#### 기능 2: 강사 CRUD
- **설명**: 운영자가 강사 정보를 등록/조회/수정/삭제
- **사용자 스토리**: As a 운영자, I want to 강사 1명을 폼으로 등록 so that 별도 개발 배포 없이 사이트에 반영된다
- **인수 조건**
  - [ ] 목록 페이지: 검색(이름), 카테고리 필터, featured 필터, 정렬(이름/생성일/노출순서)
  - [ ] 등록 폼: Speaker 스키마의 모든 필드 입력 가능 (4.4 데이터 모델 참고)
  - [ ] 복합 필드(topics, bio, videos, reviews, career, stats)는 반복 추가/삭제 UI 제공
  - [ ] 이미지 업로드: Supabase Storage로 전송, 업로드 진행률 표시, 5MB 제한, jpg/png/webp만 허용
  - [ ] `id` 필드(slug)는 이름 기반 자동 생성 + 수동 편집 가능, 중복 시 저장 불가
  - [ ] 수정 폼: 기존 데이터 프리필, "변경사항 저장" 시 confirm 모달
  - [ ] 삭제: soft delete (`deleted_at` 컬럼 기반), 30일 후 영구 삭제
  - [ ] 저장 성공 시 sonner 토스트 + 목록으로 리다이렉트
- **우선순위**: P0

#### 기능 3: 카테고리 관리
- **설명**: 대분류 + 소분류 모두 CRUD 가능. 초기 4개 대분류는 시드 데이터로 자동 삽입되며, 운영 중 추가/수정 가능.
- **사용자 스토리**: As a 운영자, I want to 트렌드에 따라 대분류/소분류를 추가/수정 so that 새로운 연사 영역을 반영할 수 있다
- **인수 조건**
  - [ ] 대분류: CRUD 가능. `id`, `label`, `label_en`, `description`, `sort_order` 편집 가능
  - [ ] 대분류 삭제 시 하위 소분류가 존재하면 경고 + 블로킹
  - [ ] 소분류: 대분류에 소속되어 CRUD, 정렬 순서 지정
  - [ ] 소분류 삭제 시 해당 소분류를 참조하는 강사가 있으면 경고 + 블로킹
  - [ ] 초기 4개 대분류 및 13개 소분류(`leadership`, `hr-org`, `sales-marketing`, `strategy`, `gen-ai`, `dx`, `new-industry`, `communication`, `mindfulness`, `esg`, `macro-finance`, `self-dev`, `health-wellbeing`)는 시드 데이터로 자동 삽입
- **우선순위**: P0

#### 기능 4: 강사 노출 제어 (Featured / 정렬)
- **설명**: 홈 Featured 섹션 노출 강사 선정 및 순서 조정
- **인수 조건**
  - [ ] `featured` boolean 토글로 홈 featured 노출 여부 제어 (최대 6명 권장, 7명 이상 시 경고)
  - [ ] `display_order` 정수 필드로 정렬 순서 지정 (낮은 값이 상단)
  - [ ] 목록에서 드래그 앤 드롭으로 순서 변경 가능 (dnd-kit 사용)
- **우선순위**: P0

#### 기능 5: 섭외 문의 수집 및 조회
- **설명**: 프론트엔드 문의 폼 제출 내역을 DB에 적재하고 어드민에서 조회
- **사용자 스토리**: As a 운영자, I want to 문의 내역을 한 화면에서 조회 so that 영업 파이프라인을 관리할 수 있다
- **인수 조건**
  - [ ] 프론트 폼 제출 시 `inquiries` 테이블에 저장 + 운영자 이메일 알림 (Resend 또는 Supabase Edge Function)
  - [ ] 어드민 목록: 접수일, 상태(접수/연락중/성사/무산), 기업명, 강사, 담당자, 연락처
  - [ ] 상태 변경 드롭다운 + 내부 메모 필드
  - [ ] 검색/필터: 기업명, 강사, 날짜 범위, 상태
  - [ ] CSV 익스포트
- **우선순위**: P0

#### 기능 6: 동적 프론트엔드 (강사 상세)
- **설명**: 정적 하드코딩 → DB 기반 동적 렌더링. 디자인은 기존 유지.
- **인수 조건**
  - [ ] `/speaker/[id]` SSR 또는 ISR (revalidate 60s)
  - [ ] 탭 메뉴: 핵심요약 / 강연영상 / 상세프로필 / 강연주제 / 수강후기 / 추천강사 / 섭외문의
  - [ ] 탭바 sticky 상단 고정 (scroll 시 fixed)
  - [ ] 탭 클릭 시 해당 섹션으로 smooth scroll (scroll-behavior: smooth + scroll-margin-top)
  - [ ] 현재 보고 있는 섹션이 탭바에서 active 표시 (IntersectionObserver)
  - [ ] "추천강사": 같은 카테고리 내 3명 랜덤 또는 수동 지정 강사 노출
  - [ ] 강사 `fee_level` 정보는 공개 페이지에 노출하지 않음 — DB에는 저장, 어드민에서만 표시
- **우선순위**: P0

#### 기능 7: 섭외 문의 폼 + 플로팅 버튼
- **설명**: 상시 노출되는 플로팅 "문의하기" 버튼, 클릭 시 드로어 오픈
- **인수 조건**
  - [ ] 우측 하단 고정 플로팅 버튼 (모바일/데스크탑 모두 노출, 페이지 전체에서 상시)
  - [ ] 드로어 열림 시 폼 필드: 기업명* / 부서 / 담당자 이름* / 연락처* / 이메일* / 희망 강사(선택) / 희망 일정 / 예산 범위(자유 입력 텍스트) / 문의 내용
  - [ ] react-hook-form + zod로 검증
  - [ ] 강사 상세 페이지에서 연 경우 "희망 강사" 필드에 해당 강사 자동 세팅
  - [ ] 제출 성공 시 "접수되었습니다" 화면 + 추천 강사 3명 노출
  - [ ] 허니팟 필드 + Supabase rate limit으로 봇 차단
- **우선순위**: P0

### 4.2 부가 기능 (Should Have — P1)

#### 기능 8: 이미지 에셋 라이브러리
- 업로드된 이미지를 재사용 가능한 라이브러리로 관리
- 강사 등록 시 "기존 이미지에서 선택" 옵션

#### 기능 9: 변경 이력 (Audit Log)
- 강사 정보 변경 이력 기록 (누가, 언제, 어떤 필드)
- 롤백 기능

#### 기능 10: 대시보드
- 강사 수, 월간 문의 수, 상태별 문의 분포, 인기 강사 Top 5

#### 기능 11: 카테고리별 페이지 동적 전환
- `/category/[id]` 및 `/category/[id]/[sub]` DB 기반 렌더링
- 정렬/필터 옵션 (이름순, 최신순, featured 우선)

### 4.3 향후 고려 기능 (Nice to Have — P2)

- 강사용 셀프 서비스 포털 (본인 프로필 수정)
- 다국어 지원 (영문)
- 블로그 / 콘텐츠 마케팅 섹션
- 강사 추천 AI (문의 내용 → 추천 강사)
- 결제 및 계약 워크플로우
- 강사 평점 / 별점 시스템

---

## 5. 비기능적 요구사항

### 5.1 성능
- LCP < 2.5s (PC 유선망 기준)
- FID < 100ms
- CLS < 0.1
- 강사 상세 페이지 TTFB < 500ms (Vercel Edge + Supabase 서울 리전)
- 이미지는 `next/image` + Supabase Storage CDN 경유

### 5.2 보안
- Supabase RLS로 `speakers`, `categories`, `inquiries` 테이블 쓰기 보호
- `admin` 라우트는 `middleware.ts`에서 세션 검증
- 환경변수(`SUPABASE_SERVICE_ROLE_KEY` 등) 서버 전용, 클라이언트 번들 유출 금지
- 이메일 알림 수신 주소는 환경변수 `NOTIFICATION_EMAIL`로 고정 (단일 주소, `contact@insidecompany.co.kr`). 어드민 UI를 통한 변경 기능 불필요.
- 문의 폼: 서버 사이드 zod 검증, rate limit (IP당 분당 5회)
- XSS 방지: 사용자 입력은 React가 기본 이스케이프, Bio 등 다단락 필드는 허용 HTML 태그 화이트리스트
- HTTPS 강제, HSTS 헤더
- 관리자 비밀번호 정책: 최소 12자, 영문 대소문자/숫자/특수문자 혼합

### 5.3 확장성
- 강사 수 1,000명까지 페이지네이션 및 인덱스로 대응 (name, categories GIN 인덱스)
- 문의 수 연간 10,000건까지 별도 아카이빙 없이 조회 가능
- Supabase Pro 플랜 기준 설계

### 5.4 접근성
- WCAG 2.1 AA 준수
- 모든 인터랙티브 요소 키보드 네비게이션 가능
- 스크린 리더용 aria-label
- 색 대비 4.5:1 이상
- 이미지 alt 필수 (어드민 등록 시 필수 입력)

### 5.5 반응형
- **PC-First**: 1440px 기준 설계
- 브레이크포인트: 1440 / 1180 / 780
- 어드민은 PC 전용(≥1024px), 모바일은 읽기 전용 + 경고 배너

---

## 6. 기술 요구사항

### 6.1 기술 스택 (확정)

| 영역 | 기술 | 근거 |
|------|------|------|
| 프레임워크 | **Next.js 15 (App Router)** | Vercel 최적화, SSR/ISR, 파일 기반 라우팅, RSC로 DB 직접 쿼리 |
| 언어 | **TypeScript** | 타입 안정성, Supabase 생성 타입 활용 |
| 스타일 | **Tailwind CSS v4 (CSS-first)** | 기존 CSS 변수 토큰을 `@theme` 블록으로 이식, 유틸 조합으로 레이아웃 가속 |
| UI 라이브러리 | **shadcn/ui** (어드민 전용) | 어드민 Form/Table/Dialog 빠른 구축, 프론트엔드는 커스텀 유지 |
| 폼 | **react-hook-form + zod** | 클라이언트/서버 검증 스키마 공유 |
| 토스트 | **sonner** | 경량, shadcn 공식 권장 |
| 애니메이션 | **Framer Motion** | 탭 전환, 호버 효과, 드로어 애니메이션 |
| 아이콘 | **lucide-react** | 일관된 선형 아이콘 |
| 백엔드 | **Supabase** (PostgreSQL + Auth + Storage + Edge Functions) | 로컬 개발/운영 통합, RLS 기반 보안 |
| 메일 | **Resend** 또는 Supabase SMTP | 문의 알림 이메일 |
| 드래그앤드롭 | **@dnd-kit** | 어드민 정렬 순서 변경 |
| 배포 | **Vercel** | 현 배포 환경 유지 |

### 6.2 기술 스택 결정 근거

**왜 Next.js App Router인가**
- 기존 `public/` 정적 사이트를 Vercel에서 그대로 서빙하고 있어 전환 비용 최소
- RSC로 Supabase를 서버에서 직접 쿼리 → API 레이어 중복 제거
- ISR로 강사 상세 페이지를 캐싱, 등록/수정 시 on-demand revalidate

**왜 Tailwind CSS v4인가**
- 현 CSS 변수 토큰(`tokens.css`)을 `@theme` 블록에 그대로 이식 가능
- `tailwind.config.js` 없이 CSS-first 구성
- 프로토타입 CSS와 공존 가능한 전환 경로

**왜 Supabase인가**
- Auth + DB + Storage + Edge Functions 통합 → 초기 인프라 부담 최소
- RLS로 세밀한 권한 제어
- TypeScript 타입 자동 생성
- 서울 리전 지원

**왜 shadcn/ui는 어드민 전용인가**
- 프론트엔드는 `Inside Speakers.html`의 고유 디자인을 유지해야 하므로 헤드리스 컴포넌트가 오히려 방해
- 어드민은 빠른 구축이 우선 → Table, Form, Dialog 등 shadcn 채택이 효율적

### 6.3 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 브라우저                              │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────────┐
│              Vercel Edge Network (CDN)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│  Next.js App (Vercel Serverless + Edge Runtime)              │
│  ├─ /(public)           : SSR/ISR 프론트엔드                   │
│  ├─ /admin              : 운영자 어드민 (SSR + CSR)            │
│  ├─ /api/inquiries      : 문의 폼 submit 엔드포인트            │
│  └─ middleware.ts       : /admin 인증 가드                    │
└───────────┬─────────────────────────┬───────────────────────┘
            │                         │
    ┌───────▼────────┐       ┌───────▼─────────┐
    │ Supabase DB    │       │ Supabase Storage │
    │ (PostgreSQL)   │       │ (이미지/영상 썸네일)│
    │ + Auth + RLS   │       │                  │
    └────────────────┘       └──────────────────┘
            │
    ┌───────▼────────────┐
    │ Resend (이메일 알림) │
    └────────────────────┘
```

### 6.4 외부 연동

| 서비스 | 용도 | 방식 | 비고 |
|-------|------|-----|------|
| Supabase | DB / Auth / Storage | @supabase/ssr | 서울 리전 |
| Vercel | 호스팅 / CDN | Vercel CLI | 기존 유지 |
| Resend | 문의 알림 이메일 | REST API | DNS SPF/DKIM 설정 필요 |
| YouTube | 강연 영상 embed | oEmbed URL | 썸네일 자동 추출 |

---

## 7. 데이터 모델 / DB 스키마

### 7.1 ER 다이어그램 (요약)
```
categories (대분류, CRUD 가능)
   │
   └──< subcategories (소분류)
            │
            └──< speaker_subcategories (N:M)
                        │
                        └──< speakers >── speaker_videos
                                    │
                                    ├──< speaker_reviews
                                    │
                                    └──< speaker_careers

inquiries (독립 테이블, speaker_id FK 선택)
admin_users (Supabase auth.users 확장)
```

### 7.2 테이블 정의

#### `speakers`
```sql
CREATE TABLE speakers (
  id              TEXT PRIMARY KEY,              -- slug, 예: "kim-jihyun"
  name            TEXT NOT NULL,
  name_en         TEXT,
  title           TEXT NOT NULL,                 -- 직함
  tagline         TEXT,
  portrait_url    TEXT,                          -- Supabase Storage URL
  hero_color      TEXT DEFAULT '#2c2a26',
  fee_level       TEXT CHECK (fee_level IN ('S','A','B','C')) NOT NULL,
  featured        BOOLEAN DEFAULT FALSE,
  display_order   INT DEFAULT 0,
  stats_talks     INT DEFAULT 0,
  stats_companies INT DEFAULT 0,
  stats_years     INT DEFAULT 0,
  topics          TEXT[] DEFAULT '{}',           -- 강연 주제 배열
  bio             TEXT[] DEFAULT '{}',           -- 다단락 bio
  recommended_ids TEXT[] DEFAULT '{}',           -- 수동 추천 강사 slug 배열
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ                    -- soft delete
);

CREATE INDEX idx_speakers_featured ON speakers(featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_speakers_display_order ON speakers(display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_speakers_name_trgm ON speakers USING gin(name gin_trgm_ops);
```

#### `categories` (대분류, CRUD 가능)
```sql
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,   -- 'competency' | 'future-tech' | 'humanities' | 'economy-life'
  label       TEXT NOT NULL,      -- 한국어 라벨 (예: '직무 역량')
  label_en    TEXT,               -- 영문 라벨 (예: 'Core Competency') — categories.js의 labelEn
  description TEXT,               -- 카드 설명 문구 — categories.js의 description
  sort_order  INT DEFAULT 0
);
```

#### `subcategories` (소분류)
```sql
CREATE TABLE subcategories (
  id           TEXT PRIMARY KEY,           -- 실제 ID 목록은 아래 시드 데이터 참고
  category_id  TEXT REFERENCES categories(id) ON DELETE RESTRICT,
  label        TEXT NOT NULL,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

> **실제 소분류 ID (public/data/categories.js 기준)**
>
> | category_id | id | label |
> |---|---|---|
> | competency | `leadership` | 리더십 |
> | competency | `hr-org` | 인사/조직관리 |
> | competency | `sales-marketing` | 영업/마케팅 |
> | competency | `strategy` | 전략/기획 |
> | future-tech | `gen-ai` | 생성형 AI 활용 |
> | future-tech | `dx` | 디지털 트랜스포메이션 |
> | future-tech | `new-industry` | 신산업 트렌드 |
> | humanities | `communication` | 비즈니스 커뮤니케이션 |
> | humanities | `mindfulness` | 심리/마인드풀니스 |
> | humanities | `esg` | ESG/윤리경영 |
> | economy-life | `macro-finance` | 거시경제/재테크 |
> | economy-life | `self-dev` | 자기계발 |
> | economy-life | `health-wellbeing` | 건강/웰빙 |

#### `speaker_subcategories` (N:M)
```sql
CREATE TABLE speaker_subcategories (
  speaker_id      TEXT REFERENCES speakers(id) ON DELETE CASCADE,
  subcategory_id  TEXT REFERENCES subcategories(id) ON DELETE RESTRICT,
  PRIMARY KEY (speaker_id, subcategory_id)
);
```

#### `speaker_videos`
```sql
CREATE TABLE speaker_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id  TEXT REFERENCES speakers(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  duration    TEXT,                         -- '12:45' 형식
  thumb_url   TEXT,
  video_url   TEXT NOT NULL,                -- YouTube/Vimeo
  sort_order  INT DEFAULT 0
);
```

#### `speaker_reviews`
```sql
CREATE TABLE speaker_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id  TEXT REFERENCES speakers(id) ON DELETE CASCADE,
  company     TEXT NOT NULL,
  author      TEXT,
  quote       TEXT NOT NULL,
  sort_order  INT DEFAULT 0
);
```

#### `speaker_careers`
```sql
CREATE TABLE speaker_careers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id  TEXT REFERENCES speakers(id) ON DELETE CASCADE,
  year        TEXT NOT NULL,                -- '2022' 또는 '2020~2023' 가변
  role        TEXT NOT NULL,
  sort_order  INT DEFAULT 0
);
```

#### `inquiries`
```sql
CREATE TABLE inquiries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company          TEXT NOT NULL,
  department       TEXT,
  contact_name     TEXT NOT NULL,
  phone            TEXT NOT NULL,
  email            TEXT NOT NULL,
  desired_speaker  TEXT REFERENCES speakers(id) ON DELETE SET NULL,
  desired_date     TEXT,                    -- 자유 형식 '2026년 6월 중순'
  budget_range     TEXT,                    -- '500만원 이하' 등 카테고리
  message          TEXT,
  status           TEXT DEFAULT 'new'
                   CHECK (status IN ('new','contacted','won','lost')),
  internal_memo    TEXT,
  source_url       TEXT,                    -- 제출된 페이지 URL
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);
```

#### `admin_users` (Supabase auth.users 확장)
```sql
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role       TEXT CHECK (role IN ('owner','editor')) DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7.3 RLS 정책 (예시)
```sql
-- 공개 읽기
CREATE POLICY "public_read_speakers" ON speakers
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);

-- 어드민만 쓰기
CREATE POLICY "admin_write_speakers" ON speakers
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- 문의는 익명 INSERT 허용, 조회는 어드민만
CREATE POLICY "public_insert_inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_inquiries" ON inquiries FOR SELECT USING (
  auth.uid() IN (SELECT id FROM admin_users)
);
```

---

## 8. API 엔드포인트 설계

Next.js App Router 기반. 대부분 RSC + Server Actions로 처리하며, 외부 호출이 필요한 경우만 Route Handler 제공.

### 8.1 프론트엔드 (공개)

| 메서드 | 경로 | 설명 | 캐싱 |
|-------|------|------|------|
| GET (RSC) | `/` | 홈 (Featured + 카테고리) | ISR 300s |
| GET (RSC) | `/category/[id]` | 대분류 목록 | ISR 300s |
| GET (RSC) | `/category/[id]/[sub]` | 소분류 목록 | ISR 300s |
| GET (RSC) | `/speaker/[id]` | 강사 상세 | ISR 60s |
| POST | `/api/inquiries` | 섭외 문의 submit | 없음 (rate limit) |

#### `POST /api/inquiries` 요청/응답
```json
// Request
{
  "company": "ABC주식회사",
  "department": "인재개발팀",
  "contactName": "박교육",
  "phone": "010-1234-5678",
  "email": "park@abc.com",
  "desiredSpeaker": "kim-jihyun",
  "desiredDate": "2026년 6월 중순",
  "budgetRange": "500~1000만원",
  "message": "임원 대상 리더십 강의 희망합니다",
  "honeypot": ""
}

// Response 201
{ "ok": true, "id": "uuid-..." }

// Response 400 (validation)
{ "ok": false, "errors": { "phone": "형식이 올바르지 않습니다" } }

// Response 429
{ "ok": false, "error": "too_many_requests" }
```

### 8.2 어드민 (인증 필요)

| 메서드 | 경로 | 설명 |
|-------|------|------|
| GET (RSC) | `/admin` | 대시보드 |
| GET (RSC) | `/admin/login` | 로그인 |
| POST (Action) | - | 로그인/로그아웃 Server Action |
| GET (RSC) | `/admin/speakers` | 강사 목록 |
| GET (RSC) | `/admin/speakers/new` | 강사 등록 폼 |
| GET (RSC) | `/admin/speakers/[id]` | 강사 수정 폼 |
| POST (Action) | - | `createSpeaker` / `updateSpeaker` / `deleteSpeaker` Server Action |
| GET (RSC) | `/admin/categories` | 카테고리 관리 |
| GET (RSC) | `/admin/inquiries` | 문의 목록 |
| GET (RSC) | `/admin/inquiries/[id]` | 문의 상세 |
| POST (Action) | - | `updateInquiryStatus` Server Action |
| POST | `/api/admin/upload` | 이미지 업로드 (Supabase Storage) |
| POST | `/api/admin/revalidate` | ISR 재검증 수동 트리거 |

---

## 9. 화면 구성 및 UX 흐름

### 9.1 프론트엔드 화면

| 화면 | 경로 | 핵심 컴포넌트 | 비고 |
|------|------|--------------|------|
| 홈 | `/` | `Hero`, `CategoryGrid`, `FeaturedSpeakers`, `AllSpeakers`, `CTASection` | 기존 `HomePage.jsx` 재현 |
| 카테고리 | `/category/[id]` | `CategoryHeader`, `SubcategoryTabs`, `SpeakerGrid` | 소분류 탭 |
| 카테고리-소분류 | `/category/[id]/[sub]` | 동일 | 필터 적용 상태 |
| 강사 상세 | `/speaker/[id]` | `SpeakerHero`, `StickyTabBar`, `Summary`, `Videos`, `Profile`, `Topics`, `Reviews`, `Recommended`, `InquirySection` | 7개 섹션 + sticky 탭 |
| 문의 완료 | `/inquiry/success` | `SuccessHero`, `RecommendedSpeakers` | 쿼리 파라미터로 recommendation 시드 |
| 공통 | 모든 페이지 | `Nav`, `Footer`, `FloatingInquiryButton`, `InquiryDrawer` | `Chrome.jsx` 재현 |

### 9.2 어드민 화면

| 화면 | 경로 | 주요 기능 |
|------|------|----------|
| 로그인 | `/admin/login` | 이메일/패스워드 |
| 대시보드 | `/admin` | 강사 수, 월 문의 수, 최근 문의 5건 |
| 강사 목록 | `/admin/speakers` | 테이블 + 검색/필터/드래그 정렬 |
| 강사 등록 | `/admin/speakers/new` | 폼 (탭형: 기본/이미지/상세/영상/후기/경력) |
| 강사 수정 | `/admin/speakers/[id]` | 등록 폼 + 삭제 버튼 + 미리보기 |
| 카테고리 | `/admin/categories` | 대분류 CRUD + 소분류 CRUD |
| 문의 목록 | `/admin/inquiries` | 테이블 + 상태 변경 + CSV 익스포트 |
| 문의 상세 | `/admin/inquiries/[id]` | 원본 메시지 + 내부 메모 + 상태 변경 |

### 9.3 UX 플로우 — 강사 상세 탭 내비게이션
1. 페이지 진입 시 Hero 섹션이 뷰포트 상단
2. 스크롤 시 탭바가 뷰포트 상단에 도달하면 `position: sticky; top: 0` 고정
3. 탭 클릭 시 `scrollIntoView({ behavior: 'smooth' })` + `scroll-margin-top: 80px` (탭바 높이만큼)
4. 스크롤 진행에 따라 IntersectionObserver로 현재 섹션 감지 → 활성 탭 스타일 업데이트
5. URL 해시 업데이트(`#videos`)는 선택적 (히스토리 오염 방지를 위해 replaceState 사용)

### 9.4 UX 플로우 — 섭외 문의
1. 플로팅 버튼 클릭 → 우측에서 슬라이드 인 드로어 (Framer Motion)
2. 강사 상세에서 연 경우 "희망 강사" 필드 자동 세팅 + 해당 강사 썸네일 표시
3. 필드 입력 시 실시간 zod 검증, 에러는 필드 하단 인라인 표시
4. 제출 버튼 비활성 → 로딩 스피너 → 성공 시 드로어 닫기 + 성공 페이지 이동
5. 실패 시 sonner 토스트 + 폼 유지

---

## 10. 마이그레이션 전략 (정적 → 동적)

### 10.1 단계별 전환

**Phase 0: 준비 (1주)**
- Supabase 프로젝트 생성 (서울 리전)
- Next.js 프로젝트 초기화 (`nextjs/` 디렉토리 또는 리포 루트로 재구성)
- Tailwind v4 설치 + 기존 `tokens.css` → `@theme` 블록 이식
- Pretendard/Inter/Fraunces 폰트 `next/font` 설정
- CI/CD: Vercel 프로젝트 연결

**Phase 1: 프론트엔드 동형 이식 (2주)**
- `Inside Speakers.html` 레퍼런스 기반으로 `/`, `/category/[id]`, `/speaker/[id]` 재현
- 데이터는 기존 `public/data/speakers.js`를 TypeScript로 변환 (`lib/seed-data.ts`)
- 이 단계에서는 DB 없이 하드코딩 데이터를 import
- 픽셀 비교 QA (기존 정적 사이트 vs Next.js 버전)

**Phase 2: DB 마이그레이션 (1주)**
- 위 스키마로 테이블 생성 + RLS 정책 적용
- `lib/seed-data.ts` → Supabase로 일괄 insert하는 마이그레이션 스크립트 작성 (`scripts/seed.ts`)
  - **fee 필드 변환 주의**: 기존 데이터의 `fee: "LEVEL A"` → DB `fee_level: 'A'` (문자열에서 레벨 코드만 추출)
  - **categories 필드 변환**: 기존 `categories.js`의 `labelEn` → `label_en`, `description` → `description` 그대로 이식
  - **speaker.categories 배열** → `speaker_subcategories` 조인 테이블 insert (예: `["leadership", "hr-org"]`)
- 프론트엔드의 데이터 소스를 `lib/seed-data.ts` → `lib/supabase/queries.ts`로 교체
- 이미지 `public/uploads/` → Supabase Storage 업로드 + URL 업데이트
- **vercel.json**: Next.js 프로젝트 전환 후 `outputDirectory: "public"` 제거 — Vercel이 Next.js를 자동 감지하므로 불필요. 대신 `headers`, `rewrites` 설정이 필요하면 유지.

**Phase 3: 어드민 구축 (2주)**
- `/admin` 레이아웃 + Supabase Auth 미들웨어
- shadcn/ui 초기화, 필요한 컴포넌트 추가 (Table, Form, Dialog, Tabs, DropdownMenu 등)
- 강사 CRUD + 카테고리 CRUD + 문의 조회
- 드래그앤드롭 정렬
- 이미지 업로드 통합

**Phase 4: 문의 시스템 (1주)**
- `/api/inquiries` 엔드포인트 + rate limit
- Resend 이메일 알림
- 플로팅 버튼 + 드로어 완성
- 문의 성공 페이지

**Phase 5: 런칭 및 검증 (1주)**
- Lighthouse, Axe 접근성 검증
- E2E 스모크 테스트 (Playwright)
- 운영자 트레이닝
- 기존 도메인 DNS 컷오버

### 10.2 롤백 전략
- Vercel 배포 단위로 즉시 이전 버전 롤백 가능
- DB는 Supabase Point-in-Time Recovery 활용
- Phase 2 완료까지 기존 정적 사이트 병행 운영 (도메인 분리)

---

## 11. 개발 우선순위 및 단계별 로드맵

| 스프린트 | 주차 | 핵심 산출물 | 완료 기준 |
|----------|-----|------------|----------|
| **S1** | W1 | 프로젝트 세팅, Tailwind 토큰 이식 | 빈 페이지에 폰트/색상 적용 확인 |
| **S2** | W2-3 | 홈 + 카테고리 + 강사 상세 정적 이식 | 기존 사이트와 픽셀 동일, 12명 하드코딩 데이터 |
| **S3** | W4 | Supabase 스키마 + 시드 스크립트 + DB 연동 | 강사 데이터가 DB에서 로드 |
| **S4** | W5 | 어드민 인증 + 강사 CRUD | 운영자가 강사 등록 가능 |
| **S5** | W6 | 카테고리 관리 + 이미지 업로드 + 드래그 정렬 | 운영팀 셀프 운영 가능 |
| **S6** | W7 | 문의 폼 + DB 적재 + 이메일 알림 + 문의 어드민 | 문의 E2E 성공 |
| **S7** | W8 | QA, 성능 튜닝, 런칭 | Lighthouse 90+, 도메인 컷오버 |

**총 소요: 8주 (2026-05-01 ~ 2026-06-26 예상)**

### 11.1 마일스톤

| 마일스톤 | 목표일 | 포함 기능 |
|---------|-------|----------|
| **MVP (내부용)** | 2026-06-05 | 프론트엔드 이식 + 강사 CRUD + DB 연동 |
| **Beta** | 2026-06-19 | 문의 시스템 + 전체 어드민 |
| **v1.0 Launch** | 2026-06-26 | QA 완료 + 도메인 전환 |

---

## 12. 제약 조건 및 가정

### 12.1 제약 조건
- **디자인**: 현재 `Inside Speakers.html` 디자인을 유지해야 하며, 새 디자인 제안은 범위 외
- **기술**: Vercel + Supabase 스택 고정, 타 호스팅 검토 불가
- **일정**: 2026년 Q2 내 런칭 필요
- **예산**: Supabase Pro ($25/월), Resend Free, Vercel Pro 수준
- **운영 인력**: 운영자는 1~2명, 기술 배경 없음

### 12.2 가정 사항 및 확정 결정
- 운영자가 Supabase 계정을 사전 등록받을 수 있음 (자기 회원가입 불필요)
- 어드민 계정은 초기 1명(owner)만 수동 생성. 역할 분리(owner/editor) UI는 v2 범위.
- 강사 이미지는 운영자가 최적화된 이미지를 준비해 업로드 (서버 사이드 리사이징 불필요)
- 강연 영상은 **YouTube embed만 지원**. Vimeo / 직접 업로드는 v2 범위.
- 강사 `fee_level`은 DB에 저장하나 **공개 페이지에는 노출하지 않음**. 어드민에서만 확인 가능.
- 문의 폼 "예산 범위"는 **자유 입력 텍스트** 필드. 선택지 없음.
- **다국어 미지원**. 단일 한국어 사이트로 운영. `name_en` 등 영문 컬럼은 내부 참고용으로만 저장.
- 이메일 알림 수신 주소는 `NOTIFICATION_EMAIL` 환경변수로 고정 (단일 주소, UI 변경 불필요).
- 런칭 후 기존 `public/` 정적 파일은 삭제하지 않고 필요한 위치에 보관 (레퍼런스 / 롤백용).
- 초기 12명 샘플 데이터는 실제 강사로 전환되므로 그대로 마이그레이션
- 결제/계약은 오프라인으로 처리, 시스템 범위 외

### 12.3 의존성
- Supabase 서비스 가용성
- Vercel 배포 파이프라인
- 기존 `Inside Speakers.html` 디자인 레퍼런스의 완전성
- 운영팀의 시드 데이터(초기 강사 12명 확정본) 제공

---

## 13. 리스크 및 대응 방안

| 리스크 | 가능성 | 영향 | 대응 |
|-------|-------|-----|------|
| 디자인 픽셀 불일치 | 중 | 중 | Storybook + 레퍼런스 페이지 비교 자동화, `Playwright` 스크린샷 diff |
| Tailwind v4 토큰 이식 시 이름 충돌 | 중 | 낮 | 접두사 `is-` 적용, 토큰 네이밍 가이드 문서화 |
| Supabase RLS 설정 오류로 권한 우회 | 낮 | 치명 | 런칭 전 권한 테스트 매트릭스 작성, anon/admin 양쪽 접근 검증 |
| 문의 폼 스팸 | 중 | 중 | 허니팟 + rate limit + reCAPTCHA v3 백업안 |
| 이미지 용량 과다 업로드 | 중 | 낮 | 업로드 시 5MB 제한 + 클라이언트 리사이징(browser-image-compression) |
| 해시 라우터 → 파일 라우터 전환으로 기존 URL 깨짐 | 낮 | 중 | `#/speaker/:id` → `/speaker/:id` 리다이렉트 미들웨어 추가 |
| 운영자가 실수로 강사 삭제 | 중 | 중 | Soft delete + "30일 내 복구 가능" 안내, 삭제 confirm 모달 |
| Supabase 서울 리전 장애 | 낮 | 치명 | Daily backup + Point-in-Time Recovery 활성화 |

---

## 14. AI 개발 시 주의사항

> 이 섹션은 이 PRD를 AI(Claude Code 등)에 전달해 개발을 지시할 때 발생할 수 있는 오류를 방지하기 위한 가이드다. Inside Speakers 프로젝트에 특화된 위험 요인을 중심으로 서술한다.

### 14.1 모호한 요구사항으로 인한 오해 가능성

- **"기존 디자인 유지"의 범위**
  - 위험: AI가 shadcn/ui의 기본 스타일을 프론트엔드 공개 페이지에도 적용할 수 있음
  - 명확화: **shadcn/ui는 어드민 전용**. 공개 페이지(`/`, `/speaker/[id]` 등)는 `public/Inside Speakers.html`의 마크업/스타일을 그대로 이식. 커스텀 컴포넌트만 사용.
- **"픽셀 퍼펙트"의 허용 오차**
  - 위험: AI가 "대략 비슷하게"로 해석할 수 있음
  - 명확화: ±2px, 동일 폰트/자간/행간/색상값(hex 단위) 일치
- **"sticky 탭바"의 고정 시점**
  - 위험: AI가 처음부터 `fixed`로 구현할 수 있음
  - 명확화: Hero 아래에서 스크롤 중 탭바가 뷰포트 상단에 도달하는 순간 `sticky`로 고정 (`position: sticky; top: 0`)
- **"smooth scroll"의 스크롤 오프셋**
  - 위험: 탭바 높이를 고려하지 않아 섹션 상단이 탭 뒤에 숨음
  - 명확화: 각 섹션에 `scroll-margin-top: var(--tabbar-height)` 적용
- **"featured 최대 6명"**
  - 위험: AI가 하드 제한으로 구현할 수 있음
  - 명확화: 경고만 표시, 저장은 허용 (운영 정책 유연성)
- **`fee_level` 표기 및 공개 범위**
  - 위험: AI가 "LEVEL A" 전체 문자열로 DB에 저장하거나, 공개 페이지에 노출할 수 있음
  - 명확화: DB에는 'A', 'B', 'C', 'S'만 저장. **공개 페이지(`/speaker/[id]`)에는 렌더링 금지**. 어드민에서만 "LEVEL A" 형태로 표시.
  - **마이그레이션 주의**: 현재 `speakers.js`는 `fee: "LEVEL A"` 형식. 시드 스크립트에서 `fee.replace("LEVEL ", "")` 변환 필수.

### 14.2 과도한 기능 추가 (Over-engineering) 위험

- **하지 말 것**:
  - PRD에 없는 Redis 캐싱, tRPC, GraphQL, Redux, Zustand 도입
  - 강사 상세에 AI 추천 엔진 자체 구현 (v2 범위)
  - 결제 / 계약 / 캘린더 예약 기능
  - 다크 모드 신규 개발 (기존 `body.theme-dark` 클래스는 유지하되 어드민은 라이트 고정)
  - 관리자 초대 플로우, 권한 매트릭스 UI (초기엔 수동 계정 등록)
- **해야 할 것**:
  - 새 라이브러리/패턴 추가 전 본 PRD의 "기술 스택" 섹션 재확인
  - PRD 범위 외 제안은 **구현하지 말고 제안만** (코멘트로 남김)

### 14.3 기술 스택 임의 변경 위험

- **금지**:
  - Tailwind v3 사용 (반드시 v4 CSS-first)
  - `tailwind.config.js` 생성 (CSS-first 유지)
  - Prisma, Drizzle 등 ORM 추가 (Supabase JS 클라이언트만 사용)
  - styled-components, emotion, CSS-in-JS 도입
  - app/ 외부에 pages/ 라우터 혼용
- **고정 스택**:
  - Next.js 15 (App Router, RSC)
  - TypeScript (strict)
  - Tailwind CSS v4
  - @supabase/ssr + @supabase/supabase-js
  - react-hook-form + zod
  - sonner, lucide-react, framer-motion
  - shadcn/ui (어드민만)

### 14.4 보안 요구사항 누락 위험

- **인증**: 쿠키 기반 Supabase SSR 세션. `middleware.ts`에서 `/admin` 경로 보호.
- **RLS 필수**: 모든 테이블에 RLS 활성화. anon 키로 쓰기 시도 시 실패해야 함. **테스트로 검증**.
- **서비스 롤 키 보호**: `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용. `NEXT_PUBLIC_` 접두사 금지. 클라이언트 번들에 포함되지 않음을 빌드 후 검증.
- **입력 검증**: 모든 폼/액션에 zod 스키마. **클라이언트만 검증하고 서버 생략 금지**.
- **Rate limit**: 문의 폼 IP당 분당 5회 (Upstash 또는 Supabase Edge Function).
- **하드코딩 금지**: 비밀번호, 토큰, 이메일 주소 등은 모두 환경변수로.
- **XSS**: Bio 필드는 `<strong>`, `<em>`, `<a>` 등 화이트리스트 태그만 허용 (DOMPurify).
- **이미지 업로드**: MIME 타입 서버 검증 (헤더만 믿지 말 것), 파일 확장자 화이트리스트.

### 14.5 데이터 모델 임의 변경 위험

- **스키마 고정**: 섹션 7의 테이블/컬럼/타입을 그대로 사용
- **이름 변환 주의**:
  - TypeScript에선 camelCase (`nameEn`, `displayOrder`, `heroColor`)
  - DB에선 snake_case (`name_en`, `display_order`, `hero_color`)
  - 기존 JS 데이터의 `portrait` → DB `portrait_url` (필드명 변경)
  - Supabase 타입 자동 생성 활용 (`supabase gen types typescript`)
- **마이그레이션**: 스키마 변경 시 반드시 SQL 마이그레이션 파일 작성 (`supabase/migrations/`)
- **기존 데이터 보호**: 12명 시드 데이터의 `id`(slug)는 변경 금지 — SEO URL로 사용됨
- **JSON 필드 vs 별도 테이블**: topics/bio는 TEXT[] 배열, videos/reviews/careers는 **별도 테이블**. AI가 모두 JSON 컬럼으로 통합하려 할 수 있으므로 주의.
- **소분류 ID 고정**: AI가 임의로 소분류 ID를 변경하지 말 것. 실제 ID는 `gen-ai`이지 `ai-generative`가 아님 (섹션 7.2 테이블 참고).

### 14.6 UI/UX 임의 해석 위험

- **디자인 시스템 우선순위**:
  1. `public/Inside Speakers.html` 레퍼런스 (공개 페이지)
  2. `public/tokens.css` + `public/styles/app.css` 변수 체계
  3. shadcn/ui 기본값 (어드민만)
- **금지**:
  - 색상 하드코딩 (모두 CSS 변수 또는 Tailwind 토큰 참조)
  - 임의의 border-radius, shadow 값 (토큰 범위 내에서만)
  - 이모지 사용 (프로덕션 UI에 이모지 금지)
  - 로딩 스피너 기본 색상 (Teal accent 사용)
- **폰트**:
  - 한글 본문: Pretendard (`var(--font-kr)`)
  - 영문/숫자: Inter (`var(--font-en)`)
  - 에디토리얼 serif: Fraunces (`.serif` 또는 `var(--font-serif)`)
  - **다른 폰트 추가 금지**

### 14.7 에러 처리 및 엣지 케이스 누락 위험

AI는 Happy Path 위주로 구현하고 다음을 누락하기 쉬움:

- **로딩 상태**: 모든 비동기 액션에 Suspense + loading.tsx 또는 skeleton
- **빈 데이터**: featured 강사 0명, 카테고리에 강사 없음, 후기 없음, 영상 없음
- **이미지 누락**: `portrait_url` null 시 placeholder 렌더링 (이니셜 기반)
- **네트워크 오류**: Supabase 쿼리 실패 시 error.tsx + 재시도 버튼
- **권한 없음**: 어드민 세션 만료 시 `/admin/login`으로 리다이렉트 + 원래 경로 쿼리 보존
- **삭제된 강사**: `deleted_at IS NOT NULL`인 강사 접근 시 404
- **slug 충돌**: 강사 등록 시 slug 중복 체크 + 사용자 친화적 에러
- **폼 제출 중복 클릭**: 제출 버튼 비활성화 + `useTransition` 활용
- **문의 이메일 전송 실패**: DB 저장은 성공했지만 이메일 실패 시 로그 + 관리자 알림 (사용자에겐 성공 처리)

### 14.8 라우팅/마이그레이션 관련 특수 위험

- **해시 라우터 → 파일 라우터**
  - 위험: 기존 북마크 `https://.../#/speaker/kim-jihyun` 깨짐
  - 대응: `middleware.ts`에서 해시는 서버가 못 읽으므로 홈에 진입 후 **클라이언트 스크립트**로 `window.location.hash`를 파싱해 리다이렉트
- **ISR 재검증 누락**
  - 위험: 운영자가 강사 수정했는데 사이트에 반영 안 됨
  - 대응: Server Action에서 `revalidatePath('/speaker/[id]')` + `revalidateTag('speakers')` 호출
- **기존 `public/` 에셋**
  - 위험: AI가 Next.js 프로젝트로 전환하며 기존 파일을 삭제
  - 대응: 마이그레이션 완료까지 `public/`은 건드리지 않음. 신규 코드는 별도 `app/`, `components/`, `lib/`에 작성.

### 14.9 테스트 누락 위험

- **필수 테스트**:
  - RLS 정책 테스트 (anon 키로 쓰기 시도 → 실패 확인)
  - 문의 폼 E2E (Playwright)
  - 강사 CRUD 통합 테스트
  - 픽셀 diff 스크린샷 테스트 (Phase 2 완료 후)
- **커버리지 목표**: 핵심 비즈니스 로직(Server Actions, API Routes) 70%+

### 14.10 PRD와 실제 구현 불일치 방지 체크리스트

기능 구현 후 아래를 확인:
- [ ] 섹션 4의 인수 조건을 모두 충족하는가?
- [ ] 섹션 6의 기술 스택만 사용했는가? (신규 의존성은 사전 승인)
- [ ] 섹션 7의 DB 스키마와 정확히 일치하는가?
- [ ] 보안 요구사항(RLS, 입력 검증, rate limit)이 모두 구현되었는가?
- [ ] 접근성(키보드 네비게이션, aria-label, 색대비)을 만족하는가?
- [ ] 에러/로딩/빈 상태가 모두 처리되었는가?
- [ ] 기존 디자인(`Inside Speakers.html`)과 픽셀 일치하는가?

### 14.11 AI 개발 지시 시 권장 프롬프트 패턴

```
Inside Speakers 프로젝트의 [기능명]을 다음 PRD 섹션에 따라 구현해주세요:
- PRD: prd/admin-prd.md
- 참조 섹션: [4.x, 7.x, 9.x]
- 디자인 레퍼런스: public/Inside Speakers.html (수정 금지)

반드시 준수:
1. 기술 스택은 PRD 섹션 6 고정 (Next.js 15, Tailwind v4, Supabase, shadcn/ui는 어드민만)
2. public/ 폴더는 레퍼런스 전용, 수정 금지
3. DB 스키마는 PRD 섹션 7.2 그대로 사용
4. 보안(RLS, 입력 검증, rate limit) 필수
5. 에러/로딩/빈 상태 모두 처리
6. 색상/폰트는 CSS 변수/Tailwind 토큰만 사용, 하드코딩 금지
7. 구현 전 접근 방식을 먼저 설명하고 확인 후 진행
8. 공개 페이지에 shadcn/ui 사용 금지 (어드민만)

완료 후 섹션 15.10 체크리스트 확인.
```

---

## 15. 참고 자료

- 디자인 레퍼런스: `public/Inside Speakers.html`
- 기존 데이터: `public/data/speakers.js`, `public/data/categories.js`
- 디자인 토큰: `public/tokens.css`, `public/styles/app.css`
- 프로젝트 설정: `CLAUDE.md`
- Next.js App Router 공식 문서: https://nextjs.org/docs/app
- Supabase SSR 가이드: https://supabase.com/docs/guides/auth/server-side/nextjs
- Tailwind CSS v4 (CSS-first): https://tailwindcss.com/docs/v4-beta
- shadcn/ui: https://ui.shadcn.com/
