import Link from "next/link";

interface LogoProps {
  onDark?: boolean;
  compact?: boolean;
}

export function Logo({ onDark = false, compact = false }: LogoProps) {
  const color = onDark ? "#fff" : "var(--ink)";
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, color }}>
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect
          x="1" y="1" width="38" height="38" rx="2"
          stroke={onDark ? "rgba(255,255,255,.8)" : "var(--ink)"}
          strokeWidth="1.5"
        />
        <path
          d="M12 26c2 2 5 3 8 3s7-1.5 7-5c0-6-13-4-13-10 0-3 3-4.5 6-4.5 2.5 0 5 1 6.5 2.5"
          stroke={onDark ? "#fff" : "var(--accent)"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span className="en" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>INSIDE</span>
          <span
            className="en"
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.22em",
              marginTop: 3,
              color: onDark ? "rgba(255,255,255,.65)" : "var(--ink-muted)",
            }}
          >
            SPEAKERS
          </span>
        </span>
      )}
    </Link>
  );
}
