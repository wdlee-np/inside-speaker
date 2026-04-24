import Link from "next/link";
import { getSpeakers, getSpeakerSubcategoryMap, getSubcategories } from "@/lib/queries";
import { DeleteSpeakerButton } from "./_components/delete-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "연사 관리 | Admin" };

export default async function AdminSpeakersPage() {
  const [speakers, subMap, subcategories] = await Promise.all([
    getSpeakers(),
    getSpeakerSubcategoryMap(),
    getSubcategories(),
  ]);

  const subLabel = Object.fromEntries(subcategories.map((s) => [s.id, s.label]));

  return (
    <div style={{ padding: "40px 48px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
            연사 관리
          </h1>
          <p style={{ marginTop: 4, color: "var(--color-ink-muted)", fontSize: 13 }}>
            총 {speakers.length}명
          </p>
        </div>
        <Link
          href="/admin/speakers/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            background: "var(--color-accent)",
            color: "#fff",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          + 새 연사 추가
        </Link>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-line)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {speakers.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--color-ink-muted)",
              fontSize: 14,
            }}
          >
            등록된 연사가 없습니다.{" "}
            <Link href="/admin/speakers/new" style={{ color: "var(--color-accent)" }}>
              추가하기
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--color-line)",
                  background: "var(--color-bg)",
                }}
              >
                {(["순서", "이름", "직함", "카테고리", "요금", "추천", "관리"] as const).map(
                  (h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: i === 6 ? "right" : "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-ink-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {speakers.map((sp, i) => {
                const subIds = subMap[sp.id] ?? [];
                const labels = subIds.map((id) => subLabel[id]).filter(Boolean);
                return (
                  <tr
                    key={sp.id}
                    style={{
                      borderBottom:
                        i < speakers.length - 1 ? "1px solid var(--color-line)" : "none",
                    }}
                  >
                    <td style={td}>{sp.display_order}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 500, color: "var(--color-ink)" }}>{sp.name}</div>
                      {sp.name_en && (
                        <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 1 }}>
                          {sp.name_en}
                        </div>
                      )}
                    </td>
                    <td style={{ ...td, color: "var(--color-ink-soft)", maxWidth: 200 }}>
                      {sp.title}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {labels.map((label) => (
                          <span
                            key={label}
                            style={{
                              padding: "2px 8px",
                              background: "var(--color-bg)",
                              border: "1px solid var(--color-line)",
                              borderRadius: 100,
                              fontSize: 11,
                              color: "var(--color-ink-soft)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "var(--color-accent-soft)",
                          color: "var(--color-accent)",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {sp.fee_level}
                      </span>
                    </td>
                    <td style={td}>
                      {sp.featured ? (
                        <span style={{ color: "var(--color-accent)" }}>●</span>
                      ) : (
                        <span style={{ color: "var(--color-line-strong)" }}>○</span>
                      )}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <Link
                        href={`/admin/speakers/${sp.id}/edit`}
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          color: "var(--color-ink-soft)",
                          border: "1px solid var(--color-line)",
                          borderRadius: 4,
                          textDecoration: "none",
                          marginRight: 6,
                          display: "inline-block",
                        }}
                      >
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

const td: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};
