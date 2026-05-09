import Link from "next/link";
import { getInquiries, getSpeakerInfoMapForInquiries } from "@/lib/queries";
import { InquiryTable } from "./_components/inquiry-table";
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

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminInquiriesPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = (status && status !== "all") ? status as InquiryStatus : undefined;

  const inquiries = await getInquiries(filter ? { status: filter } : undefined);

  const speakerIds = [...new Set(inquiries.map((i) => i.desired_speaker).filter(Boolean) as string[])];
  const speakerMap = await getSpeakerInfoMapForInquiries(speakerIds);

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
        <InquiryTable inquiries={inquiries} speakerMap={speakerMap} />
      )}
    </div>
  );
}
