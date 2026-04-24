import Link from "next/link";
import { getInquiries } from "@/lib/queries";
import { StatusBadge } from "./_components/status-badge";
import type { InquiryStatus } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "섭외 문의 | Admin" };

const STATUS_LABELS: Record<string, string> = {
  all: "전체",
  new: "신규",
  contacted: "연락 완료",
  won: "수주",
  lost: "무산",
};

const BUDGET_LABELS: Record<string, string> = {
  A: "500만↓",
  B: "500–1000만",
  C: "1000–2000만",
  D: "2000만↑",
  X: "미정",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminInquiriesPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = (status && status !== "all") ? status as InquiryStatus : undefined;

  const inquiries = await getInquiries(filter ? { status: filter } : undefined);

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
    <div style={{ padding: "40px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
          섭외 문의
        </h1>
        <span style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
          총 {inquiries.length}건
        </span>
      </div>

      {/* 상태 탭 필터 */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const active = (status ?? "all") === key;
          return (
            <Link
              key={key}
              href={key === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${key}`}
              style={{
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                background: active ? "var(--color-ink)" : "transparent",
                color: active ? "#fff" : "var(--color-ink-muted)",
                border: "1px solid",
                borderColor: active ? "var(--color-ink)" : "var(--color-line)",
                textDecoration: "none",
                transition: "all 150ms",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {inquiries.length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--color-ink-muted)", fontSize: 14 }}>
          문의가 없습니다.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>접수일</th>
                <th style={th}>기업</th>
                <th style={th}>담당자</th>
                <th style={th}>연락처</th>
                <th style={th}>희망 연사</th>
                <th style={th}>예산</th>
                <th style={th}>상태</th>
                <th style={th}>메모</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id} style={{ background: "var(--color-surface)" }}>
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
                  <td style={{ ...td, color: inq.desired_speaker ? "var(--color-ink)" : "var(--color-ink-muted)" }}>
                    {inq.desired_speaker || "미지정"}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {inq.budget_range ? (BUDGET_LABELS[inq.budget_range] ?? inq.budget_range) : "-"}
                  </td>
                  <td style={td}>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
