import type { Speaker } from "@/lib/database.types";

function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const k = amt / 100;
  r = Math.round(r + (k > 0 ? (255 - r) * k : r * k));
  g = Math.round(g + (k > 0 ? (255 - g) * k : g * k));
  b = Math.round(b + (k > 0 ? (255 - b) * k : b * k));
  const to = (x: number) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

interface PortraitProps {
  speaker: Pick<Speaker, "name" | "name_en" | "portrait_url" | "hero_color">;
  aspect?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Portrait({ speaker, aspect = "4/5", className = "", style = {} }: PortraitProps) {
  const initials = speaker.name_en
    ? speaker.name_en.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : speaker.name.slice(0, 2);

  const base = speaker.hero_color || "#43403a";

  if (speaker.portrait_url) {
    return (
      <div
        className={`portrait-ph ${className}`}
        style={{ aspectRatio: aspect, position: "relative", overflow: "hidden", ...style }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={speaker.portrait_url}
          alt={speaker.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
        />
      </div>
    );
  }

  return (
    <div
      className={`portrait-ph ${className}`}
      style={{
        aspectRatio: aspect,
        "--_ph-a": shade(base, 22),
        "--_ph-b": shade(base, -20),
        ...style,
      } as React.CSSProperties}
    >
      <span className="ph-label">Portrait · Placeholder</span>
      <span className="ph-initials">{initials}</span>
    </div>
  );
}
