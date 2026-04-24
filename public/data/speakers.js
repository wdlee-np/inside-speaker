// ============================================================
// SPEAKERS — 강사 데이터베이스
// Admin에서 이 구조를 그대로 쓸 수 있도록 필드 정규화
// ============================================================

window.SPEAKERS = [
  {
    id: "kim-jihyun",
    name: "김지현",
    nameEn: "Jihyun Kim",
    title: "前 글로벌 테크 조직문화 총괄",
    tagline: "“일하는 방식을 설계하면, 성과는 따라온다.”",
    categories: ["leadership", "hr-org"],
    featured: true,
    portrait: null, // admin에서 업로드 시 URL; null이면 placeholder 자동
    heroColor: "#2c2a26",
    stats: { talks: 142, companies: 380, years: 18 },
    topics: [
      "성과를 만드는 리더십 루틴",
      "성숙한 조직을 만드는 1:1 대화법",
      "고성장 조직의 인재 밀도 관리",
    ],
    bio: [
      "글로벌 테크 기업의 조직문화 총괄로 8년간 근무하며, 3천 명 규모 조직의 일하는 방식을 재설계했다.",
      "현재는 국내 대기업과 스타트업의 리더십 코칭 및 조직 설계 자문을 병행하고 있다.",
      "저서 『성과를 만드는 루틴』 외 3권.",
    ],
    videos: [
      { id: "v1", title: "성과를 만드는 리더십 루틴 (삼성전자 사내 강연)", duration: "14:32", thumb: null },
      { id: "v2", title: "1:1 미팅, 왜 실패하는가", duration: "09:18", thumb: null },
    ],
    reviews: [
      { company: "LG전자 HR", author: "인재개발팀 이**", quote: "추상적인 리더십 이론이 아니라, 당장 월요일에 적용할 수 있는 프레임워크를 주셨습니다." },
      { company: "쿠팡", author: "People Team 박**", quote: "팀장 100명 대상 강연 후 리더십 평가 점수가 유의미하게 올라갔습니다." },
    ],
    fee: "LEVEL A",
    career: [
      { year: "2019–현재", role: "Inside Co. Principal Coach" },
      { year: "2011–2019", role: "Global Tech Co. Head of Culture" },
      { year: "2005–2011", role: "Top-tier Consulting Firm Sr. Consultant" },
    ],
  },
  {
    id: "park-minjae",
    name: "박민재",
    nameEn: "Minjae Park",
    title: "AI Research Lead · 前 대기업 CTO",
    tagline: "“AI는 도구가 아니라 동료의 문법이다.”",
    categories: ["gen-ai", "dx"],
    featured: true,
    portrait: null,
    heroColor: "#0f5c54",
    stats: { talks: 96, companies: 210, years: 12 },
    topics: [
      "실무자를 위한 생성형 AI 활용 워크샵",
      "DX, 어디서부터 시작할 것인가",
      "AI 시대, 조직의 일하는 방식",
    ],
    bio: [
      "AI 스타트업 공동창업자로 엑싯 후, 현재는 대기업의 AI 전환 자문을 맡고 있다.",
      "기업 내재화 프로그램을 70여 개 수행했다.",
    ],
    videos: [
      { id: "v1", title: "실무자를 위한 Prompt Engineering 입문", duration: "22:10", thumb: null },
      { id: "v2", title: "DX, 왜 대부분 실패하는가", duration: "17:45", thumb: null },
    ],
    reviews: [
      { company: "현대자동차", author: "미래기술전략팀 김**", quote: "기술 유행어가 아닌, 우리 조직이 당장 실행할 수 있는 단계를 짚어주셨습니다." },
    ],
    fee: "LEVEL A",
    career: [
      { year: "2022–현재", role: "Inside Co. AI Research Lead" },
      { year: "2016–2022", role: "AI Startup Co-founder (M&A)" },
    ],
  },
  {
    id: "lee-seoyoon",
    name: "이서윤",
    nameEn: "Seoyoon Lee",
    title: "커뮤니케이션 전략가 · 前 방송국 앵커",
    tagline: "“말의 밀도가 리더의 밀도다.”",
    categories: ["communication", "leadership"],
    featured: true,
    portrait: null,
    heroColor: "#43403a",
    stats: { talks: 210, companies: 450, years: 15 },
    topics: [
      "임원을 위한 프레젠테이션 구조학",
      "내부 커뮤니케이션, 무엇이 조직을 흐트러뜨리는가",
      "어려운 메시지 전달의 기술",
    ],
    bio: [
      "10년간 지상파 메인 뉴스 앵커로 활동하며 공적 언어의 감각을 쌓았다.",
      "현재는 대기업 임원 커뮤니케이션 코칭을 주로 담당한다.",
    ],
    videos: [
      { id: "v1", title: "임원 프레젠테이션, 구조가 전부다", duration: "19:22", thumb: null },
    ],
    reviews: [
      { company: "SK하이닉스", author: "기업문화실", quote: "임원진 전원이 메시지 구조 하나로 프레젠테이션이 달라졌습니다." },
    ],
    fee: "LEVEL B",
    career: [
      { year: "2021–현재", role: "Inside Co. Sr. Facilitator" },
      { year: "2008–2021", role: "Major Broadcaster News Anchor" },
    ],
  },
  {
    id: "choi-daehoon",
    name: "최대훈",
    nameEn: "Daehoon Choi",
    title: "경영 전략 컨설턴트 · MBA 교수",
    tagline: "“좋은 전략은 버릴 것을 결정하는 일이다.”",
    categories: ["strategy", "new-industry"],
    featured: false,
    portrait: null,
    heroColor: "#14756b",
    stats: { talks: 180, companies: 260, years: 20 },
    topics: ["조직의 의사결정 시스템", "신사업 진출의 5가지 원칙", "PMI 실전 전략"],
    bio: ["Top-tier 전략 컨설팅 파트너 출신. 국내 최대 MBA에서 전략 과목을 가르친다."],
    videos: [{ id: "v1", title: "신사업, 무엇을 버릴 것인가", duration: "16:04", thumb: null }],
    reviews: [
      { company: "CJ 그룹", author: "전략기획실", quote: "이론이 아니라 실제 의사결정의 틀을 바꿔주셨습니다." },
    ],
    fee: "LEVEL S",
    career: [
      { year: "2017–현재", role: "K-MBA Professor of Strategy" },
      { year: "1999–2017", role: "Global Strategy Firm Partner" },
    ],
  },
  {
    id: "jung-haein",
    name: "정해인",
    nameEn: "Haein Jung",
    title: "조직심리학자 · 베스트셀러 작가",
    tagline: "“지속가능한 성과는 건강한 심리에서 나온다.”",
    categories: ["mindfulness", "hr-org"],
    featured: true,
    portrait: null,
    heroColor: "#2c2a26",
    stats: { talks: 320, companies: 510, years: 14 },
    topics: ["번아웃 없이 성과내는 팀", "임원의 감정 체력", "마인드풀 리더십"],
    bio: ["조직심리학 박사. 『지치지 않는 팀』 저자."],
    videos: [{ id: "v1", title: "번아웃 없는 팀의 7가지 습관", duration: "21:40", thumb: null }],
    reviews: [
      { company: "네이버", author: "People Experience", quote: "임원진 스스로의 상태를 돌아보게 만드는 시간이었습니다." },
    ],
    fee: "LEVEL A",
    career: [{ year: "2018–현재", role: "Inside Co. Sr. Psychologist" }],
  },
  {
    id: "han-soojin",
    name: "한수진",
    nameEn: "Soojin Han",
    title: "ESG 전략 자문 · 前 UN 컨설턴트",
    tagline: "“ESG는 비용이 아니라 생존 전략이다.”",
    categories: ["esg", "strategy"],
    featured: false,
    portrait: null,
    heroColor: "#0b443e",
    stats: { talks: 75, companies: 140, years: 11 },
    topics: ["실행 가능한 ESG", "윤리경영과 조직 신뢰", "공시 시대의 전략"],
    bio: ["국제기구 지속가능경영 자문 출신. 국내 주요 대기업 ESG 자문 다수."],
    videos: [{ id: "v1", title: "실행 가능한 ESG, 무엇부터 할 것인가", duration: "18:55", thumb: null }],
    reviews: [
      { company: "포스코", author: "지속가능경영실", quote: "당위가 아닌 실행 관점의 설명이 인상적이었습니다." },
    ],
    fee: "LEVEL A",
    career: [{ year: "2020–현재", role: "Inside Co. ESG Advisor" }],
  },
  {
    id: "yoon-taehee",
    name: "윤태희",
    nameEn: "Taehee Yoon",
    title: "세일즈 퍼포먼스 코치",
    tagline: "“영업은 감이 아니라 구조다.”",
    categories: ["sales-marketing"],
    featured: false,
    portrait: null,
    heroColor: "#14756b",
    stats: { talks: 260, companies: 340, years: 16 },
    topics: ["B2B 세일즈의 구조화", "영업 리더를 위한 코칭", "성과 루틴 설계"],
    bio: ["B2B SaaS 세일즈 VP 출신. 10년간 영업 조직 퍼포먼스를 설계해왔다."],
    videos: [{ id: "v1", title: "B2B 영업의 5단계 구조", duration: "15:22", thumb: null }],
    reviews: [
      { company: "KT", author: "B2B 본부", quote: "막연했던 영업 활동이 체계가 되었습니다." },
    ],
    fee: "LEVEL B",
    career: [{ year: "2019–현재", role: "Inside Co. Sales Coach" }],
  },
  {
    id: "oh-yena",
    name: "오예나",
    nameEn: "Yena Oh",
    title: "거시경제 애널리스트",
    tagline: "“지도를 읽는 사람만이 길을 낸다.”",
    categories: ["macro-finance"],
    featured: false,
    portrait: null,
    heroColor: "#43403a",
    stats: { talks: 130, companies: 180, years: 13 },
    topics: ["2026년 거시경제 전망", "자산 배분의 원칙", "금리의 시대 읽기"],
    bio: ["증권사 수석 애널리스트 출신. 기업 대상 경제 전망 강연 다수."],
    videos: [{ id: "v1", title: "2026 거시경제 전망", duration: "28:10", thumb: null }],
    reviews: [
      { company: "하나금융", author: "리서치센터", quote: "논리와 데이터의 균형이 뛰어납니다." },
    ],
    fee: "LEVEL A",
    career: [{ year: "2022–현재", role: "Inside Co. Chief Economist" }],
  },
  {
    id: "seo-youngjun",
    name: "서영준",
    nameEn: "Youngjun Seo",
    title: "자기계발 베스트셀러 작가",
    tagline: "“작은 습관이 조직을 바꾼다.”",
    categories: ["self-dev", "mindfulness"],
    featured: false,
    portrait: null,
    heroColor: "#2c2a26",
    stats: { talks: 400, companies: 620, years: 17 },
    topics: ["1%의 습관", "몰입의 과학", "개인의 루틴, 조직의 성과"],
    bio: ["『작은 습관』 저자. 자기계발 분야 대표 연사."],
    videos: [{ id: "v1", title: "1%의 습관, 100배의 결과", duration: "24:00", thumb: null }],
    reviews: [
      { company: "삼성SDS", author: "인재개발팀", quote: "직원들의 몰입도가 가장 높았던 강연 중 하나였습니다." },
    ],
    fee: "LEVEL A",
    career: [{ year: "2015–현재", role: "Author & Keynote Speaker" }],
  },
  {
    id: "kang-mirae",
    name: "강미래",
    nameEn: "Mirae Kang",
    title: "웰빙·건강 전문가 · 예방의학 박사",
    tagline: "“건강은 최고의 퍼포먼스 자원이다.”",
    categories: ["health-wellbeing"],
    featured: false,
    portrait: null,
    heroColor: "#0f5c54",
    stats: { talks: 150, companies: 200, years: 10 },
    topics: ["임원의 건강 관리", "수면과 인지 성과", "조직의 웰빙 시스템"],
    bio: ["대학병원 예방의학 박사. 기업 임원 건강 프로그램 자문."],
    videos: [{ id: "v1", title: "임원의 수면, 성과의 숨은 레버리지", duration: "20:15", thumb: null }],
    reviews: [
      { company: "KB국민은행", author: "복리후생팀", quote: "임원 대상 가장 반응이 좋았던 강연입니다." },
    ],
    fee: "LEVEL B",
    career: [{ year: "2021–현재", role: "Inside Co. Wellness Advisor" }],
  },
  {
    id: "bae-hyuk",
    name: "배혁",
    nameEn: "Hyuk Bae",
    title: "신산업 트렌드 분석가",
    tagline: "“트렌드는 미래가 아니라 현재의 신호다.”",
    categories: ["new-industry", "dx"],
    featured: false,
    portrait: null,
    heroColor: "#14756b",
    stats: { talks: 110, companies: 170, years: 9 },
    topics: ["2026 산업 지도", "스페이스테크와 모빌리티", "플랫폼 이후의 비즈니스"],
    bio: ["Tech 전문 미디어 편집장 출신. 신산업 리포트 발간."],
    videos: [{ id: "v1", title: "플랫폼 이후의 게임", duration: "19:08", thumb: null }],
    reviews: [
      { company: "현대모비스", author: "미래전략팀", quote: "추상적 트렌드가 아닌 산업 구조로 설명해 주셨습니다." },
    ],
    fee: "LEVEL B",
    career: [{ year: "2023–현재", role: "Inside Co. Industry Analyst" }],
  },
  {
    id: "moon-arin",
    name: "문아린",
    nameEn: "Arin Moon",
    title: "브랜드 마케팅 스트래티지스트",
    tagline: "“브랜드는 조직의 얼굴이다.”",
    categories: ["sales-marketing", "strategy"],
    featured: false,
    portrait: null,
    heroColor: "#43403a",
    stats: { talks: 190, companies: 230, years: 12 },
    topics: ["B2B 브랜드 포지셔닝", "콘텐츠 마케팅 전략", "브랜드와 조직문화의 연결"],
    bio: ["글로벌 FMCG 브랜드 매니저 출신. 현재 B2B 브랜드 자문."],
    videos: [{ id: "v1", title: "B2B 브랜드, 어디서부터 시작하는가", duration: "17:35", thumb: null }],
    reviews: [
      { company: "한화시스템", author: "브랜드실", quote: "B2B 브랜딩을 구조적으로 정리할 수 있었습니다." },
    ],
    fee: "LEVEL B",
    career: [{ year: "2020–현재", role: "Inside Co. Brand Advisor" }],
  },
];

// helpers -----------------------------------------------------
window.getSpeakerById = (id) => window.SPEAKERS.find((s) => s.id === id);

window.getSpeakersByCategory = (catId) => {
  // catId can be top-level id or sub id
  const topLevel = window.CATEGORIES.find((c) => c.id === catId);
  if (topLevel) {
    const subIds = topLevel.subs.map((s) => s.id);
    return window.SPEAKERS.filter((sp) => sp.categories.some((c) => subIds.includes(c)));
  }
  return window.SPEAKERS.filter((sp) => sp.categories.includes(catId));
};

window.getRelatedSpeakers = (speaker, limit = 4) => {
  const set = new Set(speaker.categories);
  return window.SPEAKERS
    .filter((s) => s.id !== speaker.id && s.categories.some((c) => set.has(c)))
    .slice(0, limit);
};

window.getFeaturedSpeakers = () => window.SPEAKERS.filter((s) => s.featured);
