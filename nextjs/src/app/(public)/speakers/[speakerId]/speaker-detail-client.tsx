"use client";

import { useState, useEffect } from "react";

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
import Link from "next/link";
import type { Speaker, SpeakerWithRelations, CategoryWithSubs } from "@/lib/database.types";
import { Portrait } from "@/components/portrait";
import { Icon } from "@/components/icon";
import { SpeakerCard } from "@/components/speaker-card";
import { InquiryForm } from "@/components/inquiry-drawer";
import { useInquiry } from "@/app/(public)/inquiry-context";

const ALL_TABS = [
  { id: "at-a-glance", label: "At a Glance", kr: "핵심 요약" },
  { id: "videos",      label: "Videos",          kr: "강연 영상" },
  { id: "biography",   label: "Biography",        kr: "상세 프로필" },
  { id: "topics",      label: "Topics",           kr: "강연 주제" },
  { id: "reviews",     label: "Reviews",          kr: "수강 후기" },
  { id: "related",     label: "Related",          kr: "추천 강사" },
  { id: "inquiry",     label: "Check Availability", kr: "섭외 문의" },
];

interface SpeakerDetailClientProps {
  speaker: SpeakerWithRelations;
  related: Speaker[];
  subcategoryMap: Record<string, string>;
  speakerSubcategoryMap: Record<string, string[]>;
  parentCategory: CategoryWithSubs | null;
}

export function SpeakerDetailClient({
  speaker,
  related,
  subcategoryMap,
  speakerSubcategoryMap,
  parentCategory,
}: SpeakerDetailClientProps) {
  const [active, setActive] = useState("at-a-glance");
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const { openInquiry } = useInquiry();

  const tabs = ALL_TABS.filter((t) => {
    if (t.id === "videos") return speaker.videos.length > 0;
    if (t.id === "reviews") return speaker.reviews.length > 0;
    return true;
  });

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) obs.observe(el);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => obs.disconnect();
  }, [speaker.id]);

  const smoothTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <main>
      {/* HERO */}
      <section style={{ padding: "24px 0 80px" }}>
        <div className="wrap">
          <div style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/" style={{ color: "var(--ink-muted)" }}>Home</Link>
            {parentCategory && (
              <>
                <Icon name="chevRt" size={12} />
                <Link href={`/category/${parentCategory.id}`} style={{ color: "var(--ink-muted)" }}>
                  {parentCategory.label}
                </Link>
              </>
            )}
            <Icon name="chevRt" size={12} />
            <span style={{ color: "var(--ink)" }}>{speaker.name}</span>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, marginTop: 40, alignItems: "end" }}
            className="detail-hero"
          >
            <div>
              <div
                className="en"
                style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-muted)", textTransform: "uppercase" }}
              >
                {speaker.name_en}
              </div>
              <h1
                className="serif"
                style={{
                  marginTop: 20,
                  fontSize: "clamp(52px, 9vw, 140px)",
                  fontWeight: 300,
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                }}
              >
                {speaker.name}
              </h1>
              <p style={{ marginTop: 24, fontSize: 18, color: "var(--ink-soft)", letterSpacing: "-0.005em" }}>
                {speaker.title}
              </p>
              {speaker.tagline && (
                <p
                  className="serif"
                  style={{
                    marginTop: 28, fontSize: 22, fontWeight: 400,
                    color: "var(--accent)", letterSpacing: "-0.015em",
                    lineHeight: 1.4, maxWidth: 480,
                  }}
                >
                  {speaker.tagline}
                </p>
              )}
              <div style={{ marginTop: 36, display: "flex", gap: 12 }}>
                <button
                  onClick={() => openInquiry(speaker)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "14px 22px", fontSize: 13, fontWeight: 600,
                    background: "var(--ink)", color: "#fff", border: "none",
                  }}
                >
                  <Icon name="arrow" size={14} /> 섭외 문의
                </button>
                {speaker.videos.length > 0 && (
                  <button
                    onClick={() => smoothTo("videos")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      padding: "14px 22px", fontSize: 13, fontWeight: 600,
                      background: "transparent", border: "1px solid var(--line-strong)", color: "var(--ink)",
                    }}
                  >
                    <Icon name="play" size={12} /> 강연 영상 보기
                  </button>
                )}
              </div>
            </div>
            <Portrait speaker={speaker} aspect="4/5" />
          </div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div
        style={{
          position: "sticky", top: "var(--nav-h)", zIndex: 40,
          background: "rgba(250,249,246,.95)", backdropFilter: "blur(10px)",
          borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="wrap" style={{ display: "flex", overflowX: "auto", gap: 0 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => smoothTo(t.id)}
              style={{
                padding: "18px 20px", fontSize: 13, fontWeight: 500,
                color: active === t.id ? "var(--ink)" : "var(--ink-muted)",
                borderBottom: "2px solid " + (active === t.id ? "var(--accent)" : "transparent"),
                whiteSpace: "nowrap",
                transition: "all 180ms ease",
              }}
            >
              <span>{t.kr}</span>
              <span className="en" style={{ marginLeft: 8, fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-muted)" }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AT A GLANCE */}
      <DetailSection id="at-a-glance" index="01" title="핵심 요약" eyebrow="At a Glance">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="stats-grid">
          {[
            ["강연 누적", speaker.stats_talks, "회"],
            ["함께한 기업", speaker.stats_companies, "곳"],
            ["경력", speaker.stats_years, "년"],
          ].map(([l, n, u]) => (
            <div key={String(l)} style={{ borderTop: "1px solid var(--ink)", paddingTop: 20 }}>
              <div className="en" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--ink-muted)", textTransform: "uppercase" }}>{l}</div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="serif" style={{ fontSize: 72, fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1 }}>{n}</span>
                <span style={{ fontSize: 14, color: "var(--ink-muted)" }}>{u}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {speaker.subcategory_ids.map((id) => (
            <span key={id} style={{ padding: "6px 14px", border: "1px solid var(--line-strong)", fontSize: 12, whiteSpace: "nowrap" }}>
              {subcategoryMap[id] ?? id}
            </span>
          ))}
        </div>
      </DetailSection>

      {/* VIDEOS */}
      {speaker.videos.length > 0 && (
        <DetailSection id="videos" index="02" title="강연 영상" eyebrow="Videos" muted>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }} className="videos-grid">
            {speaker.videos.map((v) => {
              const youtubeId = getYoutubeId(v.video_url ?? "");
              const isPlaying = playingVideoId === v.id;

              const handlePlay = () => {
                if (youtubeId) {
                  setPlayingVideoId(v.id);
                } else if (v.video_url) {
                  window.open(v.video_url, "_blank", "noopener,noreferrer");
                }
              };

              return (
                <div key={v.id}>
                  <div style={{ position: "relative", aspectRatio: "16/9", background: "#141311", overflow: "hidden" }}>
                    {isPlaying && youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                      />
                    ) : (
                      <>
                        {v.thumb_url ? (
                          <img
                            src={v.thumb_url}
                            alt={v.title}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : youtubeId ? (
                          <img
                            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                            alt={v.title}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="portrait-ph"
                            style={{
                              position: "absolute", inset: 0, aspectRatio: "auto",
                              "--_ph-a": "#3a3834", "--_ph-b": "#141311",
                            } as React.CSSProperties}
                          >
                            <span className="ph-label">Video · Placeholder</span>
                          </div>
                        )}
                        <div
                          style={{
                            position: "absolute", inset: 0, display: "grid", placeItems: "center",
                            background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,.4) 100%)",
                            cursor: v.video_url ? "pointer" : "default",
                          }}
                          onClick={handlePlay}
                        >
                          {v.video_url && (
                            <button
                              style={{
                                width: 64, height: 64, borderRadius: 999,
                                background: "rgba(255,255,255,.92)", color: "var(--ink)",
                                display: "grid", placeItems: "center", border: "none", cursor: "pointer",
                              }}
                            >
                              <Icon name="play" size={22} />
                            </button>
                          )}
                        </div>
                        {v.duration && (
                          <span
                            className="en"
                            style={{
                              position: "absolute", bottom: 12, right: 12,
                              fontSize: 11, color: "#fff", background: "rgba(0,0,0,.6)", padding: "3px 8px",
                            }}
                          >
                            {v.duration}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <h4 className="serif" style={{ marginTop: 16, fontSize: 20, fontWeight: 400, letterSpacing: "-0.015em" }}>
                    {v.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </DetailSection>
      )}

      {/* BIOGRAPHY */}
      <DetailSection id="biography" index="03" title="상세 프로필" eyebrow="Biography">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }} className="bio-grid">
          <div>
            {speaker.bio.map((p, i) => (
              <p
                key={i}
                className="serif"
                style={{ fontSize: 20, lineHeight: 1.55, color: "var(--ink-soft)", marginBottom: 18, letterSpacing: "-0.01em" }}
              >
                {p}
              </p>
            ))}
          </div>
          <div>
            <div
              className="en"
              style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 24 }}
            >
              Career
            </div>
            <ul style={{ borderTop: "1px solid var(--ink)" }}>
              {speaker.careers.map((c, i) => (
                <li
                  key={i}
                  style={{
                    display: "grid", gridTemplateColumns: "140px 1fr", gap: 16,
                    padding: "18px 0", borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span className="en" style={{ fontSize: 12, color: "var(--ink-muted)" }}>{c.year}</span>
                  <span style={{ fontSize: 14, color: "var(--ink)" }}>{c.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DetailSection>

      {/* TOPICS */}
      <DetailSection id="topics" index="04" title="강연 주제" eyebrow="Topics" muted>
        <ul>
          {speaker.topics.map((t, i) => (
            <li
              key={t}
              style={{
                display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 24, alignItems: "center",
                padding: "28px 0",
                borderTop: i === 0 ? "1px solid var(--ink)" : "1px solid var(--line)",
              }}
            >
              <span className="en" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                T{String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="serif" style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {t}
              </h4>
              <button
                onClick={() => openInquiry(speaker)}
                style={{ fontSize: 12, color: "var(--ink)", borderBottom: "1px solid var(--ink)", paddingBottom: 2, background: "none" } as React.CSSProperties}
              >
                이 주제로 문의
              </button>
            </li>
          ))}
        </ul>
      </DetailSection>

      {/* REVIEWS */}
      {speaker.reviews.length > 0 && (
        <DetailSection id="reviews" index="05" title="수강 후기" eyebrow="Reviews">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }} className="reviews-grid">
            {speaker.reviews.map((r, i) => (
              <figure
                key={i}
                style={{ border: "1px solid var(--line)", padding: "40px 36px", background: "var(--surface)" }}
              >
                <span
                  className="serif"
                  aria-hidden
                  style={{ fontSize: 72, lineHeight: 0.5, color: "var(--accent)", fontWeight: 300, display: "block", height: 24 }}
                >
                  "
                </span>
                <blockquote
                  className="serif"
                  style={{ marginTop: 20, fontSize: 24, fontWeight: 300, lineHeight: 1.5, letterSpacing: "-0.015em", color: "var(--ink)" }}
                >
                  {r.quote}
                </blockquote>
                <figcaption
                  style={{
                    marginTop: 28, paddingTop: 16, borderTop: "1px solid var(--line)",
                    display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.company}</span>
                  {r.author && <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{r.author}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </DetailSection>
      )}

      {/* RELATED */}
      <DetailSection id="related" index="06" title="추천 강사" eyebrow="Related" muted>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px 24px" }} className="related-grid">
          {related.map((s) => (
            <SpeakerCard
              key={s.id}
              speaker={s}
              subcategoryMap={subcategoryMap}
              subcategoryIds={speakerSubcategoryMap[s.id] ?? []}
            />
          ))}
        </div>
      </DetailSection>

      {/* INQUIRY */}
      <DetailSection id="inquiry" index="07" title="섭외 문의" eyebrow="Check Availability" dark>
        <InquiryForm speakerId={speaker.id} compact />
      </DetailSection>
    </main>
  );
}

function DetailSection({
  id,
  index,
  title,
  eyebrow,
  muted,
  dark,
  children,
}: {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  muted?: boolean;
  dark?: boolean;
  children: React.ReactNode;
}) {
  const bg = dark ? "var(--ink)" : muted ? "var(--surface)" : "transparent";
  const color = dark ? "#fff" : "var(--ink)";
  return (
    <section
      id={id}
      style={{ background: bg, color, borderTop: "1px solid " + (dark ? "var(--ink)" : "var(--line)") }}
    >
      <div className="wrap" style={{ padding: "96px 48px" }}>
        <div
          style={{
            display: "grid", gridTemplateColumns: "220px 1fr", gap: 48,
            alignItems: "baseline", marginBottom: 56,
          }}
          className="section-head"
        >
          <div>
            <div
              className="en"
              style={{
                fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                color: dark ? "rgba(255,255,255,.55)" : "var(--ink-muted)",
              }}
            >
              / {index} · {eyebrow}
            </div>
          </div>
          <h2 className="serif" style={{ fontSize: 52, fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.02 }}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
