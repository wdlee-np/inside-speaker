/* global React, Portrait, Icon, Button, SpeakerCard, SpeakerRow */

// ---------- HOME PAGE -------------------------------------------
function HomePage({ onRoute, onOpenInquiry }) {
  const featured = window.getFeaturedSpeakers();
  const all = window.SPEAKERS;
  const heroSpeaker = featured[0];

  return (
    <main>
      {/* HERO */}
      <section style={{ padding: "32px 0 96px" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 520px", gap: 64, alignItems: "end" }} className="hero-grid">
            <div>
              <div className="eyebrow fade-in">Inside Speakers · Corporate Training Bureau</div>
              <h1 className="serif fade-in" style={{
                marginTop: 28, fontSize: "clamp(44px, 7.2vw, 104px)",
                fontWeight: 300, lineHeight: 0.98, letterSpacing: "-0.035em", color: "var(--ink)",
              }}>
                조직을 바꾸는<br />
                <span style={{ color: "var(--accent)", fontWeight: 400 }}>한 명의 목소리.</span>
              </h1>
              <p className="fade-in" style={{
                marginTop: 28, maxWidth: 520, fontSize: 17, lineHeight: 1.65,
                color: "var(--ink-soft)",
                animationDelay: "120ms",
              }}>
                Inside Speakers는 국내 최고의 리더십 · 미래기술 · 인문 소양 · 경제 분야 연사를
                기업 교육 담당자에게 연결합니다. 300여 개 기업이 신뢰한 인물 중심의 큐레이션.
              </p>
              <div className="fade-in" style={{ marginTop: 40, display: "flex", gap: 12, animationDelay: "220ms" }}>
                <Button variant="primary" onClick={onOpenInquiry}>
                  <Icon name="arrow" size={14} /> 섭외 문의 시작
                </Button>
                <Button variant="ghost" onClick={() => onRoute({ name: "category", id: "competency" })}>
                  전체 연사 둘러보기
                </Button>
              </div>
              <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: 48 }}>
                {[
                  ["120+", "Active Speakers"],
                  ["580", "Client Companies"],
                  ["2,400", "Talks Delivered"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="serif" style={{ fontSize: 40, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1 }}>{n}</div>
                    <div className="en" style={{ marginTop: 8, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fade-in" style={{ animationDelay: "160ms" }}>
              <a
                href={`#/speaker/${heroSpeaker.id}`}
                onClick={(e) => { e.preventDefault(); onRoute({ name: "speaker", id: heroSpeaker.id }); }}
                style={{ display: "block", color: "inherit" }}
              >
                <div style={{ position: "relative" }}>
                  <Portrait speaker={heroSpeaker} aspect="4/5" />
                  <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(20,19,17,.7)", color: "#fff", padding: "6px 10px", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-en)" }}>
                    This Month
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 }}>
                  <div>
                    <h3 className="serif" style={{ fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em" }}>{heroSpeaker.name}</h3>
                    <p style={{ marginTop: 4, fontSize: 13, color: "var(--ink-muted)" }}>{heroSpeaker.title}</p>
                  </div>
                  <span style={{ color: "var(--accent)" }}><Icon name="arrow" /></span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      <section style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "64px 0", background: "var(--surface)" }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 40 }}>
            <div>
              <div className="eyebrow">01 · Categories</div>
              <h2 className="serif" style={{ marginTop: 14, fontSize: 44, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                분야별로 둘러보기
              </h2>
            </div>
            <div style={{ maxWidth: 360, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>
              기업 교육 담당자가 가장 많이 찾는 네 개의 분야.
              대분류 안에서 세부 주제까지 이어지는 큐레이션.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }} className="cat-grid">
            {window.CATEGORIES.map((c, i) => {
              const count = window.getSpeakersByCategory(c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => onRoute({ name: "category", id: c.id })}
                  style={{ background: "var(--surface)", padding: "36px 28px", textAlign: "left", minHeight: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                  className="cat-tile"
                >
                  <div>
                    <span className="en" style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.16em" }}>
                      {String(i + 1).padStart(2, "0")} / {c.labelEn}
                    </span>
                    <h3 className="serif" style={{ marginTop: 18, fontSize: 30, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                      {c.label}
                    </h3>
                    <p style={{ marginTop: 12, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55 }}>
                      {c.description}
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                    <ul style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px" }}>
                      {c.subs.slice(0, 4).map((s) => (
                        <li key={s.id} style={{ fontSize: 11, color: "var(--ink-soft)" }}>· {s.label}</li>
                      ))}
                    </ul>
                    <span className="en" style={{ fontSize: 12, color: "var(--ink-muted)" }}>{count} speakers</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED GRID */}
      <section style={{ padding: "96px 0" }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 40 }}>
            <div>
              <div className="eyebrow">02 · Featured Speakers</div>
              <h2 className="serif" style={{ marginTop: 14, fontSize: 44, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                이번 분기의 주목할 연사
              </h2>
            </div>
            <button onClick={() => onRoute({ name: "category", id: "competency" })} style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--ink)", paddingBottom: 4 }}>
              All Speakers <Icon name="arrow" size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "48px 28px" }} className="speaker-grid">
            {featured.slice(0, 8).map((s) => (
              <SpeakerCard key={s.id} speaker={s} onOpen={(id) => onRoute({ name: "speaker", id })} />
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL QUOTE */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap" style={{ maxWidth: 1040 }}>
          <div className="eyebrow">Philosophy</div>
          <span className="italic-quote" aria-hidden style={{ display: "block", marginTop: 8, fontSize: 120, lineHeight: 0.5, color: "var(--accent)", height: 48 }}>
            “
          </span>
          <blockquote className="italic-quote" style={{ marginTop: 28, fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1.35, color: "var(--ink)" }}>
            <span className="ko">강연은 정보 전달이 아니라</span>{" "}
            <span className="ko" style={{ color: "var(--accent)", fontWeight: 400 }}>의사결정의 전환</span>
            <span className="ko">입니다. Inside Speakers는 연사의 이름이 아닌, 조직이 얻을 구체적 변화로 매칭을 설계합니다.</span>
          </blockquote>
          <div style={{ marginTop: 32, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 36, height: 1, background: "var(--ink)" }}></span>
            <span className="en" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
              Inside Speakers · Editorial
            </span>
          </div>
        </div>
      </section>

      {/* DIRECTORY (list) */}
      <section style={{ padding: "96px 0" }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
            <div>
              <div className="eyebrow">03 · Full Directory</div>
              <h2 className="serif" style={{ marginTop: 14, fontSize: 44, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                전체 연사 명단
              </h2>
            </div>
            <span className="en" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-muted)" }}>{all.length} Speakers</span>
          </div>
          <div style={{ borderTop: "1px solid var(--ink)" }}>
            {all.map((s, i) => (
              <SpeakerRow key={s.id} speaker={s} index={i} onOpen={(id) => onRoute({ name: "speaker", id })} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 0", background: "var(--ink)", color: "#fff" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "end" }} className="cta-grid">
          <div>
            <div className="en" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>Check Availability</div>
            <h2 className="serif" style={{ marginTop: 20, fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 300, lineHeight: 1.02, letterSpacing: "-0.03em" }}>
              강연 주제와 일정이<br />있으시면 <span style={{ color: "var(--brand-teal-300)", fontWeight: 400 }}>바로 시작하세요.</span>
            </h2>
            <p style={{ marginTop: 24, maxWidth: 520, fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.65 }}>
              기업명, 일정, 주제를 알려주시면 담당 에이전트가 24시간 이내에 회신합니다.
              연사 매칭 · 계약 · 현장 운영까지 단일 창구로 진행됩니다.
            </p>
          </div>
          <Button variant="accent" onClick={onOpenInquiry} style={{ padding: "18px 28px", fontSize: 14 }}>
            <Icon name="arrow" /> 문의 양식 열기
          </Button>
        </div>
      </section>
    </main>
  );
}
window.HomePage = HomePage;
