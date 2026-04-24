/* global React */
const { motion, AnimatePresence } = window.FramerMotion || {};
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Portrait placeholder --------------------------------
function Portrait({ speaker, aspect = "4/5", className = "", style = {} }) {
  const initials = speaker.nameEn
    ? speaker.nameEn.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : speaker.name.slice(0, 2);

  // derive tint from heroColor
  const base = speaker.heroColor || "#43403a";
  const css = {
    aspectRatio: aspect,
    "--_ph-a": shade(base, 22),
    "--_ph-b": shade(base, -20),
    ...style,
  };

  if (speaker.portrait) {
    return (
      <div className={`portrait-ph ${className}`} style={{ aspectRatio: aspect, ...style }}>
        <img
          src={speaker.portrait}
          alt={speaker.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
        />
      </div>
    );
  }

  return (
    <div className={`portrait-ph ${className}`} style={css}>
      <span className="ph-label">Portrait · Placeholder</span>
      <span className="ph-initials">{initials}</span>
    </div>
  );
}
window.Portrait = Portrait;

function shade(hex, amt) {
  // amt in percentage-ish; positive=lighter, negative=darker
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const k = amt / 100;
  r = Math.round(r + (k > 0 ? (255 - r) * k : r * k));
  g = Math.round(g + (k > 0 ? (255 - g) * k : g * k));
  b = Math.round(b + (k > 0 ? (255 - b) * k : b * k));
  const to = (x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
window.shade = shade;

// ---------- Button ---------------------------------------------
function Button({ variant = "primary", size = "md", as = "button", children, className = "", ...rest }) {
  const cls = `btn btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`;
  const Cmp = as;
  return <Cmp className={cls} {...rest}>{children}</Cmp>;
}
window.Button = Button;

// ---------- Icon (tiny inline set, stroke currentColor) --------
function Icon({ name, size = 18, stroke = 1.5 }) {
  const paths = {
    arrow:   "M5 12h14M13 5l7 7-7 7",
    arrowUp: "M12 19V5M5 12l7-7 7 7",
    close:   "M6 6l12 12M18 6L6 18",
    menu:    "M4 7h16M4 12h16M4 17h16",
    search:  "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm10 2l-4.35-4.35",
    play:    "M6 4l14 8-14 8z",
    chat:    "M21 12a8 8 0 1 1-3.5-6.6L21 4v5h-5",
    plus:    "M12 5v14M5 12h14",
    mail:    "M3 6h18v12H3zM3 6l9 7 9-7",
    phone:   "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.96.72 2.88a2 2 0 0 1-.45 2.11L8.09 10.1a16 16 0 0 0 6 6l1.39-1.29a2 2 0 0 1 2.11-.45c.92.35 1.88.59 2.88.72A2 2 0 0 1 22 16.92z",
    check:   "M20 6L9 17l-5-5",
    star:    "M12 2l3 6 7 .8-5.2 4.8 1.6 7.2L12 17.3 5.6 20.8 7.2 13.6 2 8.8 9 8z",
    clock:   "M12 7v5l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z",
    chevRt:  "M9 6l6 6-6 6",
    chevDn:  "M6 9l6 6 6-6",
    external:"M14 3h7v7M10 14L21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6",
    user:    "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    calendar:"M3 10h18M8 3v4M16 3v4M5 7h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z",
    bookmark:"M6 3h12v18l-6-4-6 4z",
  };
  const d = paths[name] || paths.arrow;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
window.Icon = Icon;

// ---------- Logo (rebuilt, original wordmark) ------------------
function Logo({ onDark = false, compact = false }) {
  const color = onDark ? "#fff" : "var(--ink)";
  return (
    <a href="#/" style={{ display: "inline-flex", alignItems: "center", gap: 10, color }}>
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="1" y="1" width="38" height="38" rx="2" stroke={onDark ? "rgba(255,255,255,.8)" : "var(--ink)"} strokeWidth="1.5"/>
        <path d="M12 26c2 2 5 3 8 3s7-1.5 7-5c0-6-13-4-13-10 0-3 3-4.5 6-4.5 2.5 0 5 1 6.5 2.5"
              stroke={onDark ? "#fff" : "var(--accent)"} strokeWidth="2" strokeLinecap="round"/>
      </svg>
      {!compact && (
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span className="en" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>INSIDE</span>
          <span className="en" style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.22em", marginTop: 3, color: onDark ? "rgba(255,255,255,.65)" : "var(--ink-muted)" }}>SPEAKERS</span>
        </span>
      )}
    </a>
  );
}
window.Logo = Logo;
