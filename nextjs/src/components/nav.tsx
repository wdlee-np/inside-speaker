"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CategoryWithSubs } from "@/lib/database.types";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icon";
import { useInquiry } from "@/app/(public)/inquiry-context";

interface NavProps {
  categories: CategoryWithSubs[];
}

export function Nav({ categories }: NavProps) {
  const [openMeta, setOpenMeta] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openInquiry } = useInquiry();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeCat = categories.find((c) => c.id === openMeta);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: scrolled ? "rgba(250,249,246,.92)" : "transparent",
        backdropFilter: scrolled ? "saturate(140%) blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
      onMouseLeave={() => setOpenMeta(null)}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "var(--nav-h)",
        }}
      >
        <Logo />

        <nav style={{ display: "flex", alignItems: "center", gap: 36 }} className="nav-desktop">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              onMouseEnter={() => setOpenMeta(c.id)}
              onClick={() => setOpenMeta(null)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                color: "var(--ink-soft)",
                padding: "8px 0",
                borderBottom: openMeta === c.id ? "1px solid var(--ink)" : "1px solid transparent",
                display: "inline-block",
              }}
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ padding: 8, color: "var(--ink-soft)" }} aria-label="검색">
            <Icon name="search" />
          </button>
          <button
            onClick={() => openInquiry()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              fontSize: 12,
              fontWeight: 600,
              background: "transparent",
              border: "1px solid var(--line-strong)",
              color: "var(--ink)",
            }}
          >
            <Icon name="chat" size={14} /> 섭외 문의
          </button>
          <button
            className="nav-mobile-trigger"
            style={{ padding: 8 }}
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {activeCat && (
        <div
          onMouseEnter={() => setOpenMeta(activeCat.id)}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="wrap"
            style={{
              padding: "36px 48px",
              display: "grid",
              gridTemplateColumns: "minmax(240px, 320px) 1fr",
              gap: 48,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{activeCat.label_en}</div>
              <h3 className="serif" style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.1, color: "var(--ink)" }}>
                {activeCat.label}
              </h3>
              <p style={{ marginTop: 12, fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6 }}>
                {activeCat.description}
              </p>
              <Link
                href={`/category/${activeCat.id}`}
                onClick={() => setOpenMeta(null)}
                style={{
                  marginTop: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                전체 보기 <Icon name="arrow" size={14} />
              </Link>
            </div>
            <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px 40px" }}>
              {activeCat.subcategories.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/category/${activeCat.id}/${s.id}`}
                    onClick={() => setOpenMeta(null)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      width: "100%",
                      padding: "12px 0",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <span className="serif" style={{ fontSize: 18, color: "var(--ink)" }}>{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--bg)", overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <Logo />
            <button onClick={() => setMobileOpen(false)} style={{ padding: 8 }} aria-label="닫기">
              <Icon name="close" />
            </button>
          </div>
          <div style={{ padding: 20 }}>
            {categories.map((c) => (
              <div key={c.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{c.label_en}</div>
                <Link
                  href={`/category/${c.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="serif"
                  style={{ fontSize: 22, color: "var(--ink)", display: "block", marginBottom: 8 }}
                >
                  {c.label}
                </Link>
                <ul style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {c.subcategories.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/category/${c.id}/${s.id}`}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          fontSize: 12,
                          color: "var(--ink-muted)",
                          padding: "6px 10px",
                          border: "1px solid var(--line-strong)",
                          display: "inline-block",
                        }}
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => { setMobileOpen(false); openInquiry(); }}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 22px",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "var(--accent)",
                  color: "#fff",
                }}
              >
                <Icon name="arrow" size={14} /> 섭외 문의하기
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
