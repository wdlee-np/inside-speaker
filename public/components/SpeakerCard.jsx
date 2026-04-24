/* global React, Portrait, Icon, Button */

// ---------- Speaker Card ---------------------------------------
function SpeakerCard({ speaker, onOpen, variant = "portrait" }) {
  const [hover, setHover] = React.useState(false);
  const cats = speaker.categories
    .map((c) => window.CATEGORY_MAP[c]?.sub?.label)
    .filter(Boolean);

  return (
    <a
      href={`#/speaker/${speaker.id}`}
      onClick={(e) => { e.preventDefault(); onOpen(speaker.id); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "block", color: "inherit", cursor: "pointer" }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ transform: hover ? "scale(1.04)" : "scale(1)", transition: "transform 700ms cubic-bezier(.2,.8,.2,1)" }}>
          <Portrait speaker={speaker} aspect={variant === "wide" ? "3/4" : "4/5"} />
        </div>
        <div style={{
          position: "absolute", left: 16, bottom: 16, zIndex: 2,
          color: "#fff",
          transform: hover ? "translateY(0)" : "translateY(8px)",
          opacity: hover ? 1 : 0.0,
          transition: "all 280ms ease",
        }}>
          <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-en)", fontWeight: 500, background: "rgba(20,19,17,0.7)", padding: "6px 10px" }}>
            View Profile →
          </span>
        </div>
        <span className="en" style={{
          position: "absolute", top: 12, right: 12, fontSize: 10, color: "rgba(255,255,255,.85)",
          background: "rgba(20,19,17,.55)", padding: "4px 7px", letterSpacing: "0.1em",
        }}>
          {speaker.fee}
        </span>
      </div>
      <div style={{ paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {speaker.name}
          </h3>
          <span className="en" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.14em" }}>
            {speaker.nameEn}
          </span>
        </div>
        <p style={{ marginTop: 6, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
          {speaker.title}
        </p>
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {cats.slice(0, 2).map((c) => (
            <span key={c} style={{
              fontSize: 11, padding: "3px 8px", border: "1px solid var(--line-strong)",
              color: "var(--ink-soft)", letterSpacing: "-0.005em", whiteSpace: "nowrap",
            }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
window.SpeakerCard = SpeakerCard;

// ---------- Speaker Row (list layout) --------------------------
function SpeakerRow({ speaker, index, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={`#/speaker/${speaker.id}`}
      onClick={(e) => { e.preventDefault(); onOpen(speaker.id); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "60px 120px 1fr auto 40px",
        alignItems: "center", gap: 24,
        padding: "20px 0", borderBottom: "1px solid var(--line)",
        color: "inherit",
      }}
    >
      <span className="en" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div style={{ width: 100 }}>
        <Portrait speaker={speaker} aspect="1/1" />
      </div>
      <div>
        <h4 className="serif" style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {speaker.name} <span className="en" style={{ fontSize: 12, color: "var(--ink-muted)", marginLeft: 8, letterSpacing: "0.1em" }}>{speaker.nameEn}</span>
        </h4>
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--ink-muted)" }}>{speaker.title}</p>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 300 }}>
        {speaker.categories.slice(0, 2).map((c) => (
          <span key={c} style={{
            fontSize: 11, padding: "3px 8px", border: "1px solid var(--line-strong)",
            color: "var(--ink-soft)", whiteSpace: "nowrap",
          }}>
            {window.CATEGORY_MAP[c]?.sub?.label}
          </span>
        ))}
      </div>
      <span style={{ color: hover ? "var(--accent)" : "var(--ink-muted)", transform: hover ? "translateX(4px)" : "translateX(0)", transition: "all 200ms ease" }}>
        <Icon name="arrow" size={16} />
      </span>
    </a>
  );
}
window.SpeakerRow = SpeakerRow;
