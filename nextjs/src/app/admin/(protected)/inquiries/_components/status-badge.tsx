"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateInquiryStatus } from "@/app/admin/_actions/inquiries";
import type { InquiryStatus } from "@/lib/database.types";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "신규",
  contacted: "연락 완료",
  won: "수주",
  lost: "무산",
};

const STATUS_COLORS: Record<InquiryStatus, { bg: string; color: string }> = {
  new:       { bg: "#e8f4fd", color: "#1565c0" },
  contacted: { bg: "#fff8e1", color: "#e65100" },
  won:       { bg: "#e8f5e9", color: "#2e7d32" },
  lost:      { bg: "#f5f5f5", color: "#757575" },
};

const ALL_STATUSES: InquiryStatus[] = ["new", "contacted", "won", "lost"];

export function StatusBadge({ id, status }: { id: string; status: InquiryStatus }) {
  const [isPending, startTransition] = useTransition();
  const { bg, color } = STATUS_COLORS[status];

  const next = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as InquiryStatus;
    startTransition(async () => {
      const result = await updateInquiryStatus(id, newStatus);
      if (result.error) toast.error(result.error);
      else toast.success("상태가 변경되었습니다.");
    });
  };

  return (
    <select
      value={status}
      onChange={next}
      disabled={isPending}
      style={{
        padding: "4px 8px",
        fontSize: 12,
        fontWeight: 600,
        background: bg,
        color,
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        opacity: isPending ? 0.6 : 1,
        fontFamily: "inherit",
      }}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
