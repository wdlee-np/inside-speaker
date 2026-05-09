"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { Inquiry } from "@/lib/database.types";
import type { SpeakerInfoEntry } from "@/lib/queries";

const BUDGET_LABELS: Record<string, string> = {
  AA: "100만↓",
  AB: "100–500만",
  A: "500만↓",
  B: "500–1000만",
  C: "1000–2000만",
  D: "2000만↑",
  X: "미정",
};

interface Props {
  inquiries: Inquiry[];
  speakerMap: Record<string, SpeakerInfoEntry>;
}

export function InquiryTable({ inquiries, speakerMap }: Props) {
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const th: React.CSSProperties = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--color-ink-muted)",
    borderBottom: "2px solid var(--color-line)",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 13,
    borderBottom: "1px solid var(--color-line)",
  };

  return (
    <div style={{ display: "flex", gap: 0 }}>
      <div style={{ flex: 1, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>접수일</th>
              <th style={th}>기업</th>
              <th style={th}>담당자</th>
              <th style={th}>연락처</th>
              <th style={th}>희망 강사</th>
              <th style={th}>예산</th>
              <th style={th}>상태</th>
              <th style={th}>메모</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => {
              const isActive = selected?.id === inq.id;
              const spInfo = inq.desired_speaker ? speakerMap[inq.desired_speaker] : null;
              return (
                <tr
                  key={inq.id}
                  onClick={() => setSelected(isActive ? null : inq)}
                  style={{
                    background: isActive ? "var(--color-surface-hover, #f4f4f2)" : "var(--color-surface)",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ ...td, color: "var(--color-ink-muted)", whiteSpace: "nowrap" }}>
                    {inq.created_at.slice(0, 10)}
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{inq.company}</div>
                    {inq.department && (
                      <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>
                        {inq.department}
                      </div>
                    )}
                  </td>
                  <td style={td}>
                    <div>{inq.contact_name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>
                      {inq.email}
                    </div>
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{inq.phone || "-"}</td>
                  <td style={td}>
                    {spInfo ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Link
                          href={`/admin/speakers/${inq.desired_speaker}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-accent, #14756b)",
                            textDecoration: "none",
                            fontFamily: "var(--font-en)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {spInfo.speaker_code ?? inq.desired_speaker}
                        </Link>
                        <span style={{ fontSize: 13, color: "var(--color-ink)" }}>{spInfo.name}</span>
                      </div>
                    ) : inq.desired_speaker ? (
                      <span style={{ color: "var(--color-ink-muted)", fontSize: 12 }}>{inq.desired_speaker}</span>
                    ) : (
                      <span style={{ color: "var(--color-ink-muted)" }}>미지정</span>
                    )}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {inq.budget_range ? (BUDGET_LABELS[inq.budget_range] ?? inq.budget_range) : "-"}
                  </td>
                  <td style={td} onClick={(e) => e.stopPropagation()}>
                    <StatusBadge id={inq.id} status={inq.status} />
                  </td>
                  <td style={{ ...td, maxWidth: 200 }}>
                    {inq.internal_memo ? (
                      <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{inq.internal_memo}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--color-line)" }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 상세 패널 */}
      {selected && (
        <div
          style={{
            width: 380,
            flexShrink: 0,
            borderLeft: "1px solid var(--color-line)",
            background: "var(--color-surface)",
            padding: "28px 28px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 180px)",
            position: "sticky",
            top: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>문의 상세</span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 18, color: "var(--color-ink-muted)", lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <DetailRow label="접수일" value={selected.created_at.slice(0, 16).replace("T", " ")} />
          <DetailRow label="기업명" value={selected.company} />
          {selected.department && <DetailRow label="부서" value={selected.department} />}
          <DetailRow label="담당자" value={selected.contact_name} />
          <DetailRow label="이메일" value={selected.email} />
          <DetailRow label="연락처" value={selected.phone || "-"} />
          {selected.desired_speaker && (() => {
            const sp = speakerMap[selected.desired_speaker];
            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                  희망 강사
                </div>
                {sp ? (
                  <div>
                    <Link
                      href={`/admin/speakers/${selected.desired_speaker}/edit`}
                      style={{ fontSize: 12, fontWeight: 600, color: "var(--color-accent, #14756b)", textDecoration: "none", fontFamily: "var(--font-en)" }}
                    >
                      {sp.speaker_code ?? selected.desired_speaker}
                    </Link>
                    <span style={{ fontSize: 13, color: "var(--color-ink)", marginLeft: 8 }}>{sp.name}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: "var(--color-ink)" }}>{selected.desired_speaker}</span>
                )}
              </div>
            );
          })()}
          {selected.desired_date && <DetailRow label="희망 일자" value={selected.desired_date} />}
          {selected.budget_range && (
            <DetailRow label="예산" value={BUDGET_LABELS[selected.budget_range] ?? selected.budget_range} />
          )}
          {selected.message && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                문의 내용
              </div>
              <div
                style={{
                  fontSize: 13, color: "var(--color-ink)", lineHeight: 1.65,
                  whiteSpace: "pre-wrap", background: "var(--color-bg, #faf9f6)",
                  padding: "12px 14px", borderRadius: 4,
                }}
              >
                {selected.message}
              </div>
            </div>
          )}
          {selected.internal_memo && <DetailRow label="내부 메모" value={selected.internal_memo} />}
          {selected.source_url && <DetailRow label="유입 경로" value={selected.source_url} />}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-ink)" }}>{value}</div>
    </div>
  );
}
