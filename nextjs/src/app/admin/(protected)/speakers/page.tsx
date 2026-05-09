import Link from "next/link";
import { getAdminSpeakers, getSpeakerStatusCounts, getSpeakerSubcategoryMap, getSubcategories, getSpeakerCodeMap } from "@/lib/queries";
import { DeleteSpeakerButton } from "./_components/delete-button";
import { StatusChanger } from "./_components/status-changer";
import type { SpeakerStatus } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "강사 관리 | Admin" };

const STATUS_OPTIONS: Array<{ value: SpeakerStatus | "all"; label: string; color: string }> = [
  { value: "all",    label: "전체",    color: "var(--color-ink-muted)" },
  { value: "노출",   label: "노출",    color: "#14756b" },
  { value: "등록요청", label: "등록요청", color: "#d97706" },
  { value: "미노출", label: "미노출",  color: "#64748b" },
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSpeakersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filterStatus = (status && status !== "all") ? status as SpeakerStatus : undefined;

  const [speakers, counts, subMap, subcategories, codeMap] = await Promise.all([
    getAdminSpeakers(filterStatus ? { speakerStatus: filterStatus } : undefined),
    getSpeakerStatusCounts(),
    getSpeakerSubcategoryMap(),
    getSubcategories(),
    getSpeakerCodeMap(),
  ]);

  const subLabel = Object.fromEntries(subcategories.map((s) => [s.id, s.label]));

  return (
    <div style={{ padding: "40px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
            강사 관리
          </h1>
          <p style={{ marginTop: 4, color: "var(--color-ink-muted)", fontSize: 13 }}>
            총 {counts.all}명
          </p>
        </div>
        <Link
          href="/admin/speakers/new"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 18px", background: "var(--color-accent)", color: "#fff",
            borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: "none",
          }}
        >
          + 새 강사 추가
        </Link>
      </div>

      {/* REQ-5: 상태 필터 탭 */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {STATUS_OPTIONS.map(({ value, label, color }) => {
          const active = (status ?? "all") === value;
          const count = value === "all" ? counts.all : counts[value as SpeakerStatus] ?? 0;
          return (
            <Link
              key={value}
              href={value === "all" ? "/admin/speakers" : `/admin/speakers?status=${value}`}
              style={{
                padding: "7px 14px", fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? color : "transparent",
                color: active ? "#fff" : "var(--color-ink-muted)",
                border: "1px solid", borderColor: active ? color : "var(--color-line)",
                textDecoration: "none", transition: "all 150ms",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              {label}
              <span style={{
                fontSize: 11, padding: "1px 6px", borderRadius: 100,
                background: active ? "rgba(255,255,255,0.25)" : "var(--color-bg)",
                color: active ? "#fff" : "var(--color-ink-muted)",
              }}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: 8, overflow: "hidden" }}>
        {speakers.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-ink-muted)", fontSize: 14 }}>
            해당 상태의 강사가 없습니다.{" "}
            <Link href="/admin/speakers/new" style={{ color: "var(--color-accent)" }}>추가하기</Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-line)", background: "var(--color-bg)" }}>
                {(["강사코드", "순서", "이름", "직함", "카테고리", "요금", "상태", "추천", "관리"] as const).map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px", textAlign: i >= 8 ? "right" : "left",
                      fontSize: 11, fontWeight: 600, color: "var(--color-ink-muted)",
                      textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {speakers.map((sp, i) => {
                const subIds = subMap[sp.id] ?? [];
                const labels = subIds.map((id) => subLabel[id]).filter(Boolean);
                const statusColor = sp.speaker_status === "노출" ? "#14756b" : sp.speaker_status === "등록요청" ? "#d97706" : "#64748b";
                return (
                  <tr key={sp.id} style={{ borderBottom: i < speakers.length - 1 ? "1px solid var(--color-line)" : "none" }}>
                    {/* REQ-3: 강사코드 */}
                    <td style={{ ...tdStyle, fontFamily: "var(--font-en)", fontSize: 11, color: "var(--color-ink-muted)" }}>
                      {codeMap[sp.id] ?? "—"}
                    </td>
                    <td style={tdStyle}>{sp.display_order}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500, color: "var(--color-ink)" }}>{sp.name}</div>
                      {sp.name_en && <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 1 }}>{sp.name_en}</div>}
                    </td>
                    <td style={{ ...tdStyle, color: "var(--color-ink-soft)", maxWidth: 200 }}>{sp.title}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {labels.map((label) => (
                          <span key={label} style={{ padding: "2px 8px", background: "var(--color-bg)", border: "1px solid var(--color-line)", borderRadius: 100, fontSize: 11, color: "var(--color-ink-soft)", whiteSpace: "nowrap" }}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: "2px 8px", background: "var(--color-accent-soft)", color: "var(--color-accent)", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        {sp.fee_level}
                      </span>
                    </td>
                    {/* REQ-5: 상태 변경 */}
                    <td style={tdStyle}>
                      <StatusChanger id={sp.id} status={sp.speaker_status} statusColor={statusColor} />
                    </td>
                    <td style={tdStyle}>
                      {sp.featured
                        ? <span style={{ color: "var(--color-accent)" }}>●</span>
                        : <span style={{ color: "var(--color-line-strong)" }}>○</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <Link href={`/admin/speakers/${sp.id}/edit`} style={{ padding: "4px 10px", fontSize: 12, color: "var(--color-ink-soft)", border: "1px solid var(--color-line)", borderRadius: 4, textDecoration: "none", marginRight: 6, display: "inline-block" }}>
                        수정
                      </Link>
                      <DeleteSpeakerButton id={sp.id} name={sp.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};
