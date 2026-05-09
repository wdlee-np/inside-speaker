import Link from "next/link";

interface LogoProps {
  onDark?: boolean;
  compact?: boolean;
}

export function Logo({ onDark = false, compact = false }: LogoProps) {
  const color = onDark ? "#fff" : "var(--ink)";
  const accent = onDark ? "#fff" : "var(--accent)";
  const frame = onDark ? "rgba(255,255,255,.8)" : "var(--ink)";
  const muted = onDark ? "rgba(255,255,255,.65)" : "var(--ink-muted)";
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, color }}>
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="1" y="1" width="38" height="38" rx="2" stroke={frame} strokeWidth="1.5" />
        {/* J — 상단 가로획 */}
        <line x1="14" y1="11" x2="26" y2="11" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        {/* J — 세로획 + 하단 곡선 */}
        <path
          d="M20 11 L20 27 Q20 33 13 33 Q10 33 8 31"
          stroke={accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {!compact && (
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span className="en" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>JUST</span>
          <span
            className="ko"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              marginTop: 3,
              color: muted,
            }}
          >
            강사
          </span>
        </span>
      )}
    </Link>
  );
}
