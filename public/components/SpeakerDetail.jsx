/* global React, Portrait, Icon, Button, SpeakerCard */

// ---------- SPEAKER DETAIL -------------------------------------
const TABS = [
  { id: "at-a-glance", label: "At a Glance", kr: "핵심 요약" },
  { id: "videos", label: "Videos", kr: "강연 영상" },
  { id: "biography", label: "Biography", kr: "상세 프로필" },
  { id: "topics", label: "Topics", kr: "강연 주제" },
  { id: "reviews", label: "Reviews", kr: "수강 후기" },
  { id: "related", label: "Related", kr: "추천 강사" },
  { id: "inquiry", label: "Check Availability", kr: "섭외 문의" },
];

function SpeakerDetail({ speakerId, onRoute, onOpenInquiry }) {
  const speaker = window.getSpeakerById(speakerId) || window.SPEAKERS[0];
  const [active, setActive] = React.useState("at-a-glance");
  const related = window.getRelatedSpeakers(speaker, 4);

  // scroll-spy
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    TABS.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) obs.observe(el);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => obs.disconnect();
  }, [speakerId]);

  const smoothTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <main>
      {/* HERO */}
      <section style={{ padding: "24px 0 80px" }}>
        <div className="wrap">
          <div style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", gap: 8, alignItems: "center" }}>
            <a href="#/" onClick={(e) => { e.preventDefault(); onRoute({ name: "home" }); }} style={{ color: "var(--ink-muted)" }}>Home</a>
            <Icon name="chevRt" size={12} />
            <a href="#" onClick={(e) => { e.preventDefault(); onRoute({ name: "category", id: window.CATEGORY_MAP[speaker.categories[0]]?.parent.id }); }} style={{ color: "var(--ink-muted)" }}>
              {window.CATEGORY_MAP[speaker.categories[0]]?.parent.label}
            </a>
            <Icon name="chevRt" size={12} />
            <span style={{ color: "var(--ink)" }}>{speaker.name}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, marginTop: 40, alignItems: "end" }} className="detail-hero">
            <div>
              <div className="en" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-muted)", textTransform: "uppercase" }}>
                {speaker.nameEn} · {speaker.fee}
              </div>
              <h1 className="serif" style={{ marginTop: 20, fontSize: "clamp(52px, 9vw, 140px)", fontWeight: 300, lineHeight: 0.92, letterSpacing: "-0.04em" }}>
                {speaker.name}
              </h1>
              <p style={{ marginTop: 24, fontSize: 18, color: "var(--ink-soft)", letterSpacing: "-0.005em" }}>
                {speaker.title}
              </p>
              <p className="serif" style={{ marginTop: 28, fontSize: 22, fontWeight: 400, color: "var(--accent)", letterSpacing: "-0.015em", lineHeight: 1.4, maxWidth: 480 }}>
                {speaker.tagline}
              </p>
              <div style={{ marginTop: 36, display: "flex", gap: 12 }}>
                <Button variant="primary" onClick={onOpenInquiry}>
                  <Icon name="arrow" size={14} /> 섭외 문의
                </Button>
                <Button variant="ghost" onClick={() => smoothTo("videos")}>
                  <Icon name="play" size={12} /> 강연 영상 보기
                </Button>
              </div>
            </div>
            <Portrait speaker={speaker} aspect="4/5" />
          </div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div style={{
        position: "sticky", top: "var(--nav-h)", zIndex: 40,
        background: "rgba(250,249,246,.95)", backdropFilter: "blur(10px)",
        borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
      }}>
        <div className="wrap" style={{ display: "flex", overflowX: "auto", gap: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => smoothTo(t.id)}
              style={{
                padding: "18px 20px", fontSize: 13, fontWeight: 500,
                color: active === t.id ? "var(--ink)" : "var(--ink-muted)",
                borderBottom: "2px solid " + (active === t.id ? "var(--accent)" : "transparent"),
                whiteSpace: "nowrap",
                transition: "all 180ms ease",
              }}
            >
              <span>{t.kr}</span>
              <span className="en" style={{ marginLeft: 8, fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-muted)" }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTIONS */}
      <Section id="at-a-glance" index="01" title="핵심 요약" eyebrow="At a Glance">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="stats-grid">
          {[
            ["강연 누적", speaker.stats.talks, "회"],
            ["함께한 기업", speaker.stats.companies, "곳"],
            ["경력", speaker.stats.years, "년"],
          ].map(([l, n, u]) => (
            <div key={l} style={{ borderTop: "1px solid var(--ink)", paddingTop: 20 }}>
              <div className="en" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--ink-muted)", textTransform: "uppercase" }}>{l}</div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="serif" style={{ fontSize: 72, fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1 }}>{n}</span>
                <span style={{ fontSize: 14, color: "var(--ink-muted)" }}>{u}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {speaker.categories.map((c) => (
            <span key={c} style={{ padding: "6px 14px", border: "1px solid var(--line-strong)", fontSize: 12, whiteSpace: "nowrap" }}>
              {window.CATEGORY_MAP[c]?.sub?.label}
            </span>
          ))}
        </div>
      </Section>

      <Section id="videos" index="02" title="강연 영상" eyebrow="Videos" muted>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }} className="videos-grid">
          {speaker.videos.map((v) => (
            <div key={v.id}>
              <div style={{ position: "relative", aspectRatio: "16/9", background: "#141311", overflow: "hidden" }}>
                <div className="portrait-ph" style={{ position: "absolute", inset: 0, aspectRatio: "auto", "--_ph-a": "#3a3834", "--_ph-b": "#141311" }}>
                  <span className="ph-label">Video · Placeholder</span>
                </div>
                <div style={{
                  position: "absolute", inset: 0, display: "grid", placeItems: "center",
                  background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,.4) 100%)",
                }}>
                  <button style={{
                    width: 64, height: 64, borderRadius: 999, background: "rgba(255,255,255,.92)",
                    color: "var(--ink)", display: "grid", placeItems: "center",
                  }}>
                    <Icon name="play" size={22} />
                  </button>
                </div>
                <span className="en" style={{ position: "absolute", bottom: 12, right: 12, fontSize: 11, color: "#fff", background: "rgba(0,0,0,.6)", padding: "3px 8px" }}>
                  {v.duration}
                </span>
              </div>
              <h4 className="serif" style={{ marginTop: 16, fontSize: 20, fontWeight: 400, letterSpacing: "-0.015em" }}>{v.title}</h4>
            </div>
          ))}
        </div>
      </Section>

      <Section id="biography" index="03" title="상세 프로필" eyebrow="Biography">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }} className="bio-grid">
          <div>
            {speaker.bio.map((p, i) => (
              <p key={i} className="serif" style={{ fontSize: 20, lineHeight: 1.55, color: "var(--ink-soft)", marginBottom: 18, letterSpacing: "-0.01em" }}>
                {p}
              </p>
            ))}
          </div>
          <div>
            <div className="en" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 24 }}>Career</div>
            <ul style={{ borderTop: "1px solid var(--ink)" }}>
              {speaker.career.map((c, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16, padding: "18px 0", borderBottom: "1px solid var(--line)" }}>
                  <span className="en" style={{ fontSize: 12, color: "var(--ink-muted)" }}>{c.year}</span>
                  <span style={{ fontSize: 14, color: "var(--ink)" }}>{c.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="topics" index="04" title="강연 주제" eyebrow="Topics" muted>
        <ul>
          {speaker.topics.map((t, i) => (
            <li key={t} style={{
              display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 24, alignItems: "center",
              padding: "28px 0", borderTop: i === 0 ? "1px solid var(--ink)" : "1px solid var(--line)",
            }}>
              <span className="en" style={{ fontSize: 12, color: "var(--ink-muted)" }}>T{String(i + 1).padStart(2, "0")}</span>
              <h4 className="serif" style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t}</h4>
              <button onClick={onOpenInquiry} style={{ fontSize: 12, color: "var(--ink)", borderBottom: "1px solid var(--ink)", paddingBottom: 2 }}>이 주제로 문의</button>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="reviews" index="05" title="수강 후기" eyebrow="Reviews">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }} className="reviews-grid">
          {speaker.reviews.map((r, i) => (
            <figure key={i} style={{ border: "1px solid var(--line)", padding: "40px 36px", background: "var(--surface)" }}>
              <span className="serif" aria-hidden style={{ fontSize: 72, lineHeight: 0.5, color: "var(--accent)", fontWeight: 300, display: "block", height: 24 }}>
                “
              </span>
              <blockquote className="serif" style={{ marginTop: 20, fontSize: 24, fontWeight: 300, lineHeight: 1.5, letterSpacing: "-0.015em", color: "var(--ink)" }}>
                {r.quote}
              </blockquote>
              <figcaption style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.company}</span>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{r.author}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="related" index="06" title="추천 강사" eyebrow="Related" muted>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px 24px" }} className="related-grid">
          {related.map((s) => (
            <SpeakerCard key={s.id} speaker={s} onOpen={(id) => onRoute({ name: "speaker", id })} />
          ))}
        </div>
      </Section>

      <Section id="inquiry" index="07" title="섭외 문의" eyebrow="Check Availability" dark>
        <InquiryForm compact speaker={speaker} onSubmitted={() => {}} />
      </Section>
    </main>
  );
}
window.SpeakerDetail = SpeakerDetail;

function Section({ id, index, title, eyebrow, muted, dark, children }) {
  const bg = dark ? "var(--ink)" : muted ? "var(--surface)" : "transparent";
  const color = dark ? "#fff" : "var(--ink)";
  return (
    <section id={id} style={{ background: bg, color, borderTop: "1px solid " + (dark ? "var(--ink)" : "var(--line)") }}>
      <div className="wrap" style={{ padding: "96px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 48, alignItems: "baseline", marginBottom: 56 }} className="section-head">
          <div>
            <div className="en" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,.55)" : "var(--ink-muted)" }}>
              / {index} · {eyebrow}
            </div>
          </div>
          <h2 className="serif" style={{ fontSize: 52, fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.02 }}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
window.Section = Section;
