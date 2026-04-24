"use client";

import Link from "next/link";
import type { Speaker, CategoryWithSubs } from "@/lib/database.types";
import { Icon } from "@/components/icon";
import { SpeakerCard } from "@/components/speaker-card";
import { useInquiry } from "@/app/(public)/inquiry-context";

interface CategoryContentProps {
  category: CategoryWithSubs;
  speakers: Speaker[];
  subcategoryMap: Record<string, string>;
  speakerSubcategoryMap: Record<string, string[]>;
  activeSub: string | null;
}

export function CategoryContent({
  category,
  speakers,
  subcategoryMap,
  speakerSubcategoryMap,
  activeSub,
}: CategoryContentProps) {
  const { openInquiry } = useInquiry();

  return (
    <main>
      <section style={{ padding: "48px 0 56px", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <div style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/" style={{ color: "var(--ink-muted)" }}>Home</Link>
            <Icon name="chevRt" size={12} />
            <span style={{ color: "var(--ink)" }}>{category.label}</span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "end", marginTop: 32 }}
            className="hero-grid"
          >
            <div>
              <div className="eyebrow">{category.label_en}</div>
              <h1
                className="serif"
                style={{
                  marginTop: 20,
                  fontSize: "clamp(44px, 6.5vw, 88px)",
                  fontWeight: 300,
                  lineHeight: 1.0,
                  letterSpacing: "-0.035em",
                }}
              >
                {category.label}
              </h1>
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--ink-soft)", maxWidth: 520 }}>
              {category.description}
            </p>
          </div>

          <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <FilterChip active={activeSub === null} href={`/category/${category.id}`}>
              전체 · {speakers.length}
            </FilterChip>
            {category.subcategories.map((s) => (
              <FilterChip
                key={s.id}
                active={activeSub === s.id}
                href={`/category/${category.id}/${s.id}`}
              >
                {s.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 0 96px" }}>
        <div className="wrap">
          {speakers.length === 0 ? (
            <div style={{ padding: "80px 0", textAlign: "center", color: "var(--ink-muted)" }}>
              <p>해당 세부 분야의 연사가 곧 업데이트됩니다.</p>
              <button
                onClick={() => openInquiry()}
                style={{
                  marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "9px 14px", fontSize: 12, fontWeight: 600,
                  background: "transparent", border: "1px solid var(--line-strong)", color: "var(--ink)",
                }}
              >
                원하는 연사를 요청하기
              </button>
            </div>
          ) : (
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "56px 28px" }}
              className="speaker-grid"
            >
              {speakers.map((s) => (
                <SpeakerCard
                  key={s.id}
                  speaker={s}
                  subcategoryMap={subcategoryMap}
                  subcategoryIds={speakerSubcategoryMap[s.id] ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function FilterChip({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 500,
        border: "1px solid " + (active ? "var(--ink)" : "var(--line-strong)"),
        background: active ? "var(--ink)" : "transparent",
        color: active ? "#fff" : "var(--ink-soft)",
        letterSpacing: "-0.005em",
        transition: "all 180ms ease",
        display: "inline-block",
      }}
    >
      {children}
    </Link>
  );
}
