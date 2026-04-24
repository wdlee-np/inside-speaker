// ============================================================
// CATEGORIES — 대분류 / 소분류
// Admin-ready: 이 파일만 수정하면 GNB, 필터, 상세 페이지 모두 자동 반영
// ============================================================

window.CATEGORIES = [
  {
    id: "competency",
    label: "직무 역량",
    labelEn: "Core Competency",
    description: "조직의 성과와 직결되는 실전 역량",
    subs: [
      { id: "leadership", label: "리더십" },
      { id: "hr-org", label: "인사/조직관리" },
      { id: "sales-marketing", label: "영업/마케팅" },
      { id: "strategy", label: "전략/기획" },
    ],
  },
  {
    id: "future-tech",
    label: "미래 기술",
    labelEn: "Future Tech",
    description: "변화의 속도를 읽는 기술 인사이트",
    subs: [
      { id: "gen-ai", label: "생성형 AI 활용" },
      { id: "dx", label: "디지털 트랜스포메이션" },
      { id: "new-industry", label: "신산업 트렌드" },
    ],
  },
  {
    id: "humanities",
    label: "인문/소양",
    labelEn: "Humanities",
    description: "사람과 조직을 움직이는 본질의 언어",
    subs: [
      { id: "communication", label: "비즈니스 커뮤니케이션" },
      { id: "mindfulness", label: "심리/마인드풀니스" },
      { id: "esg", label: "ESG/윤리경영" },
    ],
  },
  {
    id: "economy-life",
    label: "경제/라이프",
    labelEn: "Economy & Life",
    description: "일하는 사람의 삶 전반을 설계하는 시야",
    subs: [
      { id: "macro-finance", label: "거시경제/재테크" },
      { id: "self-dev", label: "자기계발" },
      { id: "health-wellbeing", label: "건강/웰빙" },
    ],
  },
];

// helper: flat map { subId: { parent, sub } } — 상세 페이지에서 브레드크럼용
window.CATEGORY_MAP = window.CATEGORIES.reduce((acc, c) => {
  c.subs.forEach((s) => {
    acc[s.id] = { parent: c, sub: s };
  });
  return acc;
}, {});
