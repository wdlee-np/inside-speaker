const PATHS: Record<string, string> = {
  arrow:    "M5 12h14M13 5l7 7-7 7",
  arrowUp:  "M12 19V5M5 12l7-7 7 7",
  close:    "M6 6l12 12M18 6L6 18",
  menu:     "M4 7h16M4 12h16M4 17h16",
  search:   "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm10 2l-4.35-4.35",
  play:     "M6 4l14 8-14 8z",
  chat:     "M21 12a8 8 0 1 1-3.5-6.6L21 4v5h-5",
  plus:     "M12 5v14M5 12h14",
  mail:     "M3 6h18v12H3zM3 6l9 7 9-7",
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.96.72 2.88a2 2 0 0 1-.45 2.11L8.09 10.1a16 16 0 0 0 6 6l1.39-1.29a2 2 0 0 1 2.11-.45c.92.35 1.88.59 2.88.72A2 2 0 0 1 22 16.92z",
  check:    "M20 6L9 17l-5-5",
  star:     "M12 2l3 6 7 .8-5.2 4.8 1.6 7.2L12 17.3 5.6 20.8 7.2 13.6 2 8.8 9 8z",
  clock:    "M12 7v5l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z",
  chevRt:   "M9 6l6 6-6 6",
  chevDn:   "M6 9l6 6 6-6",
  external: "M14 3h7v7M10 14L21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6",
  user:     "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  grid:     "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  calendar: "M3 10h18M8 3v4M16 3v4M5 7h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z",
  bookmark: "M6 3h12v18l-6-4-6 4z",
};

interface IconProps {
  name: keyof typeof PATHS;
  size?: number;
  stroke?: number;
  className?: string;
}

export function Icon({ name, size = 18, stroke = 1.5, className }: IconProps) {
  const d = PATHS[name] ?? PATHS.arrow;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
