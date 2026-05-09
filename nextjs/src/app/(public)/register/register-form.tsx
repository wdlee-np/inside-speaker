"use client";

import { useState, type FormEvent } from "react";
import type { CategoryWithSubs } from "@/lib/database.types";
import { publicRegisterSpeaker, type PublicRegisterValues } from "@/app/admin/_actions/register";
import { Icon } from "@/components/icon";

interface Props {
  categoriesWithSubs: CategoryWithSubs[];
}

export function RegisterForm({ categoriesWithSubs }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [statsTalks, setStatsTalks] = useState("");
  const [statsCompanies, setStatsCompanies] = useState("");
  const [statsYears, setStatsYears] = useState("");
  const [bio, setBio] = useState<string[]>([""]);
  const [topics, setTopics] = useState<string[]>([""]);
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [careers, setCareers] = useState<{ year: string; role: string }[]>([{ year: "", role: "" }]);

  const toggleSub = (id: string) =>
    setSubcategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !title) return;

    setSubmitting(true);
    setError(null);

    const values: PublicRegisterValues = {
      name,
      name_en: nameEn,
      title,
      tagline,
      portrait_url: portraitUrl,
      stats_talks: parseInt(statsTalks) || 0,
      stats_companies: parseInt(statsCompanies) || 0,
      stats_years: parseInt(statsYears) || 0,
      bio: bio.filter(Boolean),
      topics: topics.filter(Boolean),
      subcategory_ids: subcategoryIds,
      careers: careers.filter((c) => c.year && c.role),
    };

    const result = await publicRegisterSpeaker(values);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  const field: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 14,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    outline: "none",
    fontFamily: "var(--font-kr)",
    borderRadius: 4,
  };

  if (submitted) {
    return (
      <div className="wrap" style={{ padding: "80px 48px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <div
          style={{
            width: 60, height: 60, borderRadius: 999,
            background: "var(--accent)", display: "grid", placeItems: "center",
            color: "#fff", margin: "0 auto",
          }}
        >
          <Icon name="check" size={26} />
        </div>
        <h2 className="serif" style={{ marginTop: 28, fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em" }}>
          등록 신청이 접수되었습니다.
        </h2>
        <p style={{ marginTop: 14, fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.7 }}>
          담당자가 검토 후 연락드리겠습니다. <br />
          통상 2–3 영업일 이내에 처리됩니다.
        </p>
      </div>
    );
  }

  return (
    <main>
      <div style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="wrap" style={{ padding: "48px 48px 36px" }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Speaker Registration</div>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>
            강사 등록 신청
          </h1>
          <p style={{ marginTop: 12, fontSize: 14, color: "var(--ink-muted)", maxWidth: 540 }}>
            Inside Speakers에 등록 신청을 할 수 있습니다. 검토 후 등록 여부를 연락드립니다.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="wrap" style={{ padding: "48px 48px", maxWidth: 800 }}>

          {/* 기본 정보 */}
          <FormSection title="기본 정보">
            <Grid cols={2}>
              <FormField label="이름 (국문)" required>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" style={field} />
              </FormField>
              <FormField label="이름 (영문)">
                <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Gildong Hong" style={field} />
              </FormField>
              <FormField label="직함 / 직위" required span={2}>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="前 삼성전자 부사장" style={field} />
              </FormField>
              <FormField label="태그라인" span={2}>
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="&quot;변화는 기다리는 것이 아니라 만드는 것입니다.&quot;" style={field} />
              </FormField>
              <FormField label="프로필 이미지 URL" span={2}>
                <input value={portraitUrl} onChange={(e) => setPortraitUrl(e.target.value)} placeholder="https://example.com/photo.jpg" style={field} />
              </FormField>
            </Grid>
          </FormSection>

          {/* 소개글 */}
          <FormSection title="소개글">
            {bio.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <textarea
                  value={p}
                  onChange={(e) => {
                    const next = [...bio];
                    next[i] = e.target.value;
                    setBio(next);
                  }}
                  rows={3}
                  placeholder="소개 단락을 입력하세요"
                  style={{ ...field, resize: "vertical", flex: 1 }}
                />
                {bio.length > 1 && (
                  <button type="button" onClick={() => setBio(bio.filter((_, j) => j !== i))} style={removeBtn}>
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setBio([...bio, ""])} style={addBtn}>+ 단락 추가</button>
          </FormSection>

          {/* 강연 주제 */}
          <FormSection title="강연 주제">
            {topics.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  value={t}
                  onChange={(e) => {
                    const next = [...topics];
                    next[i] = e.target.value;
                    setTopics(next);
                  }}
                  placeholder="예: 리더십과 조직문화 혁신"
                  style={{ ...field, flex: 1 }}
                />
                {topics.length > 1 && (
                  <button type="button" onClick={() => setTopics(topics.filter((_, j) => j !== i))} style={removeBtn}>
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setTopics([...topics, ""])} style={addBtn}>+ 주제 추가</button>
          </FormSection>

          {/* 경력 */}
          <FormSection title="경력">
            {careers.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  value={c.year}
                  onChange={(e) => {
                    const next = [...careers];
                    next[i] = { ...next[i], year: e.target.value };
                    setCareers(next);
                  }}
                  placeholder="2020–현재"
                  style={{ ...field, width: 140, flexShrink: 0 }}
                />
                <input
                  value={c.role}
                  onChange={(e) => {
                    const next = [...careers];
                    next[i] = { ...next[i], role: e.target.value };
                    setCareers(next);
                  }}
                  placeholder="삼성전자 부사장"
                  style={{ ...field, flex: 1 }}
                />
                {careers.length > 1 && (
                  <button type="button" onClick={() => setCareers(careers.filter((_, j) => j !== i))} style={removeBtn}>
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setCareers([...careers, { year: "", role: "" }])} style={addBtn}>+ 경력 추가</button>
          </FormSection>

          {/* 강연 통계 */}
          <FormSection title="강연 통계 (선택)">
            <Grid cols={3}>
              <FormField label="강연 횟수">
                <input type="number" min="0" value={statsTalks} onChange={(e) => setStatsTalks(e.target.value)} placeholder="120" style={field} />
              </FormField>
              <FormField label="기업 수">
                <input type="number" min="0" value={statsCompanies} onChange={(e) => setStatsCompanies(e.target.value)} placeholder="350" style={field} />
              </FormField>
              <FormField label="경력 연수">
                <input type="number" min="0" value={statsYears} onChange={(e) => setStatsYears(e.target.value)} placeholder="15" style={field} />
              </FormField>
            </Grid>
          </FormSection>

          {/* 카테고리 */}
          <FormSection title="전문 분야">
            {categoriesWithSubs.map((cat) => (
              <div key={cat.id} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {cat.label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {cat.subcategories.map((sub) => {
                    const checked = subcategoryIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 14px",
                          background: checked ? "var(--accent-soft, #e6f4f2)" : "var(--surface)",
                          border: `1px solid ${checked ? "var(--accent)" : "var(--line)"}`,
                          borderRadius: 100,
                          fontSize: 13,
                          color: checked ? "var(--accent)" : "var(--ink-soft)",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleSub(sub.id)} style={{ display: "none" }} />
                        {sub.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </FormSection>

          {error && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 4, color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
            <button
              type="submit"
              disabled={submitting || !name || !title}
              style={{
                padding: "12px 32px", fontSize: 14, fontWeight: 600,
                background: submitting || !name || !title ? "var(--ink-muted)" : "var(--accent)",
                color: "#fff", border: "none", cursor: submitting || !name || !title ? "not-allowed" : "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {submitting ? "제출 중…" : <><Icon name="arrow" size={14} /> 등록 신청하기</>}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--line)" }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 20, margin: "0 0 20px" }}>{title}</h2>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px 20px" }}>
      {children}
    </div>
  );
}

function FormField({
  label, required, span, children,
}: {
  label: string; required?: boolean; span?: number; children: React.ReactNode;
}) {
  return (
    <div style={span ? { gridColumn: `span ${span}` } : undefined}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
        {required && <span style={{ color: "var(--accent)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const removeBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32, flexShrink: 0,
  background: "transparent", border: "1px solid var(--line)", borderRadius: 4,
  cursor: "pointer", color: "var(--ink-muted)",
};

const addBtn: React.CSSProperties = {
  fontSize: 13, color: "var(--accent)", background: "transparent",
  border: "1px dashed var(--accent)", borderRadius: 4,
  padding: "8px 14px", cursor: "pointer", marginTop: 4,
};
