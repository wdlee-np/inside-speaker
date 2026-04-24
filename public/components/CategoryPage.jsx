/* global React, Portrait, Icon, Button, SpeakerCard */

// ---------- CATEGORY PAGE --------------------------------------
function CategoryPage({ route, onRoute, onOpenInquiry }) {
  const cat = window.CATEGORIES.find((c) => c.id === route.id) || window.CATEGORIES[0];
  const [activeSub, setActiveSub] = React.useState(route.sub || "all");

  React.useEffect(() => { setActiveSub(route.sub || "all"); }, [route.id, route.sub]);

  const speakers = React.useMemo(() => {
    if (activeSub === "all") return window.getSpeakersByCategory(cat.id);
    return window.getSpeakersByCategory(activeSub);
  }, [cat.id, activeSub]);

  return (
    <main>
      <section style={{ padding: "48px 0 56px", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <div style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", gap: 8, alignItems: "center" }}>
            <a href="#/" onClick={(e) => { e.preventDefault(); onRoute({ name: "home" }); }} style={{ color: "var(--ink-muted)" }}>Home</a>
            <Icon name="chevRt" size={12} />
            <span style={{ color: "var(--ink)" }}>{cat.label}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "end", marginTop: 32 }} className="hero-grid">
            <div>
              <div className="eyebrow">{cat.labelEn}</div>
              <h1 className="serif" style={{ marginTop: 20, fontSize: "clamp(44px, 6.5vw, 88px)", fontWeight: 300, lineHeight: 1.0, letterSpacing: "-0.035em" }}>
                {cat.label}
              </h1>
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--ink-soft)", maxWidth: 520 }}>{cat.description}</p>
          </div>

          <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <FilterChip active={activeSub === "all"} onClick={() => setActiveSub("all")}>
              전체 · {window.getSpeakersByCategory(cat.id).length}
            </FilterChip>
            {cat.subs.map((s) => {
              const n = window.getSpeakersByCategory(s.id).length;
              return (
                <FilterChip key={s.id} active={activeSub === s.id} onClick={() => setActiveSub(s.id)}>
                  {s.label} · {n}
                </FilterChip>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 0 96px" }}>
        <div className="wrap">
          {speakers.length === 0 ? (
            <div style={{ padding: "80px 0", textAlign: "center", color: "var(--ink-muted)" }}>
              <p>해당 세부 분야의 연사가 곧 업데이트됩니다.</p>
              <Button variant="ghost" style={{ marginTop: 16 }} onClick={onOpenInquiry}>원하는 연사를 요청하기</Button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "56px 28px" }} className="speaker-grid">
              {speakers.map((s) => (
                <SpeakerCard key={s.id} speaker={s} onOpen={(id) => onRoute({ name: "speaker", id })} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
window.CategoryPage = CategoryPage;

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px", fontSize: 13, fontWeight: 500,
        border: "1px solid " + (active ? "var(--ink)" : "var(--line-strong)"),
        background: active ? "var(--ink)" : "transparent",
        color: active ? "#fff" : "var(--ink-soft)",
        letterSpacing: "-0.005em",
        transition: "all 180ms ease",
      }}
    >
      {children}
    </button>
  );
}
