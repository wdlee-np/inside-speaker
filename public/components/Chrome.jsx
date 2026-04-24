/* global React, Portrait, Logo, Icon, Button */
const { motion: M1 } = window.FramerMotion || { motion: {} };

// ---------- Nav -------------------------------------------------
function Nav({ route, onRoute, onOpenInquiry }) {
  const [openMeta, setOpenMeta] = React.useState(null); // category id for mega-menu
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 60,
        background: scrolled ? "rgba(250,249,246,.92)" : "transparent",
        backdropFilter: scrolled ? "saturate(140%) blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
      onMouseLeave={() => setOpenMeta(null)}
    >
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "var(--nav-h)" }}>
        <Logo />

        <nav className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {window.CATEGORIES.map((c) => (
            <button
              key={c.id}
              onMouseEnter={() => setOpenMeta(c.id)}
              onClick={() => onRoute({ name: "category", id: c.id })}
              style={{
                fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em",
                color: "var(--ink-soft)", padding: "8px 0",
                borderBottom: openMeta === c.id ? "1px solid var(--ink)" : "1px solid transparent",
              }}
            >
              {c.label}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ padding: 8, color: "var(--ink-soft)" }} aria-label="검색"><Icon name="search" /></button>
          <Button variant="ghost" size="sm" onClick={onOpenInquiry}>
            <Icon name="chat" size={14} /> 섭외 문의
          </Button>
          <button className="nav-mobile-trigger" style={{ padding: 8 }} onClick={() => setMobileOpen(true)} aria-label="메뉴">
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {/* Mega menu */}
      {openMeta && (
        <div
          onMouseEnter={() => setOpenMeta(openMeta)}
          style={{
            position: "absolute", left: 0, right: 0, top: "100%",
            background: "var(--surface)", borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="wrap" style={{ padding: "36px 48px", display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: 48 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{window.CATEGORIES.find((x) => x.id === openMeta).labelEn}</div>
              <h3 className="serif" style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.1, color: "var(--ink)" }}>
                {window.CATEGORIES.find((x) => x.id === openMeta).label}
              </h3>
              <p style={{ marginTop: 12, fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6 }}>
                {window.CATEGORIES.find((x) => x.id === openMeta).description}
              </p>
              <button
                onClick={() => { onRoute({ name: "category", id: openMeta }); setOpenMeta(null); }}
                style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                전체 보기 <Icon name="arrow" size={14} />
              </button>
            </div>
            <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px 40px" }}>
              {window.CATEGORIES.find((x) => x.id === openMeta).subs.map((s) => {
                const n = window.getSpeakersByCategory(s.id).length;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => { onRoute({ name: "category", id: openMeta, sub: s.id }); setOpenMeta(null); }}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "baseline",
                        width: "100%", padding: "12px 0", borderBottom: "1px solid var(--line)",
                        textAlign: "left",
                      }}
                    >
                      <span className="serif" style={{ fontSize: 18, color: "var(--ink)" }}>{s.label}</span>
                      <span className="en" style={{ fontSize: 11, color: "var(--ink-muted)" }}>{String(n).padStart(2, "0")}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--bg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid var(--line)" }}>
            <Logo />
            <button onClick={() => setMobileOpen(false)} style={{ padding: 8 }} aria-label="닫기"><Icon name="close" /></button>
          </div>
          <div style={{ padding: 20, overflowY: "auto", height: "calc(100vh - 70px)" }}>
            {window.CATEGORIES.map((c) => (
              <div key={c.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{c.labelEn}</div>
                <button
                  onClick={() => { onRoute({ name: "category", id: c.id }); setMobileOpen(false); }}
                  className="serif"
                  style={{ fontSize: 22, color: "var(--ink)", display: "block", marginBottom: 8 }}
                >
                  {c.label}
                </button>
                <ul style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {c.subs.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => { onRoute({ name: "category", id: c.id, sub: s.id }); setMobileOpen(false); }}
                        style={{ fontSize: 12, color: "var(--ink-muted)", padding: "6px 10px", border: "1px solid var(--line-strong)" }}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div style={{ marginTop: 24 }}>
              <Button variant="accent" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setMobileOpen(false); onOpenInquiry(); }}>
                섭외 문의하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
window.Nav = Nav;

// ---------- Footer ---------------------------------------------
function Footer({ onOpenInquiry }) {
  return (
    <footer style={{ marginTop: 120, borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
      <div className="wrap" style={{ padding: "64px 48px 36px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 48 }} className="footer-grid">
          <div>
            <Logo />
            <p className="serif" style={{ marginTop: 22, fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.015em", maxWidth: 380 }}>
              한 시간의 강연이
              <br />
              조직의 10년을 바꿉니다.
            </p>
            <Button variant="primary" style={{ marginTop: 28 }} onClick={onOpenInquiry}>
              <Icon name="arrow" size={14} /> 섭외 문의
            </Button>
          </div>
          <FooterCol title="Directory" items={window.CATEGORIES.map((c) => c.label)} />
          <FooterCol title="Company" items={["About Inside", "Press", "Partnerships", "Careers"]} />
          <FooterCol title="Contact" items={["경기도 성남시 수정구 창업로 43", "판교글로벌비즈센터 B동 1011호", "E-mail: contact@insidecompany.co.kr", "Tel. 02-6925-5032"]} />
        </div>
        <div style={{ marginTop: 72, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.04em" }} className="footer-base">
          <span className="en">© 2026 INSIDE COMPANY · SPEAKERS BUREAU</span>
          <span className="en">ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 18 }}>{title}</div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => (
          <li key={it}>
            <a href="#" style={{ fontSize: 13, color: "var(--ink-soft)" }}>{it}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
window.Footer = Footer;

// ---------- Floating Inquiry pill ------------------------------
function FloatingInquiry({ onOpen }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={onOpen}
      aria-label="섭외 문의하기"
      style={{
        position: "fixed", right: 24, bottom: 24, zIndex: 55,
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 18px 14px 14px",
        background: "var(--ink)", color: "#fff",
        boxShadow: "0 10px 30px rgba(20,19,17,0.25)",
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(.95)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "transform 280ms cubic-bezier(.2,.8,.2,1), opacity 280ms ease",
      }}
    >
      <span style={{ width: 28, height: 28, borderRadius: 999, background: "var(--accent)", display: "grid", placeItems: "center" }}>
        <Icon name="chat" size={14} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>섭외 문의</span>
    </button>
  );
}
window.FloatingInquiry = FloatingInquiry;
