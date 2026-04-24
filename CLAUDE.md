# CLAUDE.md — Inside Speakers

Claude Code 작업 지침 파일.

## 언어 및 커뮤니케이션 규칙
- **기본 응답 언어**: 한국어
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 (코드 표준 준수)

---

## 프로젝트 개요

**Inside Speakers** — 기업 교육 연사 섭외 플랫폼  
국내 최고 리더십·미래기술·인문·경제 분야 연사를 기업 교육 담당자에게 연결하는 큐레이션 플랫폼.

---

## 주요 명령어

```bash
npm run dev  # 로컬 개발 서버 실행 (http://localhost:3000)
npm start    # 프로덕션 서버 실행
```

---

## 프로젝트 구조

```
/
  public/                        # 정적 파일 루트 (Vercel 서빙 기준, 수정 시 주의)
    Inside Speakers.html         # 클로드 디자인 원본 메인 페이지 (픽셀 퍼펙트 레퍼런스)
    index.html                   # 진입점 → Inside Speakers.html 로 리다이렉트
    tokens.css                   # 디자인 토큰 (색상/타이포/간격) — 수정 금지
    tweaks-panel.jsx             # 디자인 트윅 패널 — 수정 금지
    styles/
      app.css                    # 앱 공통 스타일 — 수정 금지
    components/                  # 원본 React 컴포넌트 (레퍼런스)
      App.jsx                    # 루트 컴포넌트 + 해시 라우터
      Chrome.jsx                 # Nav, Footer, FloatingInquiry
      HomePage.jsx               # 홈 페이지
      CategoryPage.jsx           # 카테고리 페이지
      SpeakerCard.jsx            # 강사 카드/행 컴포넌트
      SpeakerDetail.jsx          # 강사 상세 페이지
      Inquiry.jsx                # 섭외 문의 드로어
      Primitives.jsx             # 공통 원시 컴포넌트 (Button, Icon, Portrait 등)
    data/
      speakers.js                # 강사 데이터 (12명 샘플)
      categories.js              # 카테고리 데이터
    fonts/                       # Pretendard 로컬 폰트 (.otf)
    uploads/                     # 업로드 에셋

  vercel.json                    # Vercel 배포 설정 (outputDirectory: public)
  package.json                   # 로컬 dev 서버 스크립트
  CLAUDE.md
```

> `public/` 안의 원본 디자인 파일은 **레퍼런스 전용** — 직접 수정 금지.  
> 새 코드는 향후 `src/` 또는 Next.js `app/` 디렉토리에 작성.

---

## 기술 스택

### 현재 (프로토타입)
- **서빙**: `npx serve` (정적 파일 서버)
- **프론트**: 바닐라 React 18 (CDN + Babel standalone)
- **스타일**: 순수 CSS (CSS 변수 토큰 기반)
- **배포**: Vercel 정적 사이트 (`outputDirectory: public`)

### 향후 프로덕션 전환 대상
- **프레임워크**: Next.js (App Router) — Vercel 최적화, React 기반 유지
- **스타일**: CSS Modules 또는 Tailwind (현 토큰 시스템 그대로 이식)
- **데이터**: CSV → API Routes 또는 외부 DB
- **배포**: Vercel (동일, 무설정 배포)

---

## 디자인 시스템

### 디자인 원칙
- **Editorial, minimal** — 군더더기 없는 에디토리얼 미학
- **Teal accent only** — 강조색은 teal 단일 사용
- **Warm neutrals** — 아이보리 계열 중성색

### 앱 레벨 CSS 변수 (`styles/app.css`)
```css
--bg: #faf9f6          /* 페이지 배경 */
--surface: #ffffff     /* 카드/섹션 배경 */
--ink: #141311         /* 기본 텍스트 */
--ink-soft: #3a3834    /* 보조 텍스트 */
--ink-muted: #86827a   /* 힌트/메타 텍스트 */
--line: #e7e3da        /* 구분선 */
--accent: var(--brand-teal-600)   /* #14756b */
```

### 브랜드 색상 토큰 (`tokens.css`)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--brand-teal-500` | `#1a8e82` | 브랜드 Primary |
| `--brand-teal-600` | `#14756b` | Accent (기본) |
| `--brand-teal-300` | `#73c2b8` | 다크모드 accent |
| `--neutral-25` | `#fbfaf7` | warm ivory 배경 |
| `--neutral-900` | `#1a1916` | 본문 잉크 |

### 타이포그래피
| 폰트 | CSS 변수 | 용도 |
|------|----------|------|
| Pretendard | `--font-kr` | 기본 한국어 sans-serif |
| Inter | `--font-en` | 영문·숫자 |
| Fraunces | `--font-serif` | 에디토리얼 serif 제목 (`.serif`) |
| Noto Serif KR | serif fallback | 한국어 serif |
| Playfair Display italic | — | 인용구 블록 (`.italic-quote`) |

### 간격 / 반응형
- 기본 단위: 4px / 최대 페이지 폭: `1440px`
- `.wrap`: max-width 1440px, 좌우 `48px` 패딩
- 브레이크포인트:
  - `≤ 1180px`: 3열 그리드, 단일 컬럼 hero
  - `≤ 780px`: 1열 그리드, 모바일 nav (`20px` 패딩)

---

## 페이지 및 라우팅

해시 라우팅 (`#/`):

| 경로 | 컴포넌트 | 설명 |
|------|---------|------|
| `#/` | `HomePage` | 홈: hero, 카테고리, featured speakers, 전체 목록, CTA |
| `#/category/:id` | `CategoryPage` | 대분류 카테고리 |
| `#/category/:id/:sub` | `CategoryPage` | 소분류 필터 적용 |
| `#/speaker/:id` | `SpeakerDetail` | 강사 상세 |

---

## 데이터 스키마

### Speaker
```js
{
  id: "kim-jihyun",           // URL slug
  name: "김지현",
  nameEn: "Jihyun Kim",
  title: "前 글로벌 테크 조직문화 총괄",
  tagline: ""일하는 방식을 설계하면, 성과는 따라온다."",
  categories: ["leadership", "hr-org"],  // sub category id 배열
  featured: true,
  portrait: null,             // 이미지 URL; null이면 placeholder 자동
  heroColor: "#2c2a26",
  stats: { talks: 142, companies: 380, years: 18 },
  topics: ["주제1", "주제2", "주제3"],
  bio: ["단락1", "단락2"],
  videos: [{ id, title, duration, thumb }],
  reviews: [{ company, author, quote }],
  fee: "LEVEL A",             // S / A / B / C
  career: [{ year, role }],
}
```

### 4개 대분류 카테고리
1. **직무 역량** (competency): 리더십, 인사/조직관리, 영업/마케팅, 전략/기획
2. **미래 기술** (future-tech): 생성형 AI, 디지털 트랜스포메이션, 신산업 트렌드
3. **인문/소양** (humanities): 비즈니스 커뮤니케이션, 심리/마인드풀니스, ESG/윤리경영
4. **경제/라이프** (economy-life): 거시경제/재테크, 자기계발, 건강/웰빙

---

## 구현 규칙

1. **디자인 레퍼런스 절대 준수**: `public/Inside Speakers.html`을 픽셀 퍼펙트하게 재현
2. **토큰 사용**: 색상·간격은 반드시 CSS 변수 사용 (하드코딩 금지)
3. **`public/` 원본 수정 금지**: 새 코드는 `src/` 또는 `app/` 에 작성
4. **반응형**: 3개 브레이크포인트 (1440 / 1180 / 780) 모두 검증
5. **다크모드**: `body.theme-dark` 클래스 기반 지원

---

## 연락처 (Footer)
- 경기도 성남시 수정구 창업로 43, 판교글로벌비즈센터 B동 1011호
- E-mail: contact@insidecompany.co.kr
- Tel. 02-6925-5032
