"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateSpeakerStatus } from "@/app/admin/_actions/speakers";
import type { SpeakerStatus } from "@/lib/database.types";

const STATUS_OPTIONS: Array<{ value: SpeakerStatus; label: string }> = [
  { value: "노출",    label: "노출" },
  { value: "등록요청", label: "등록요청" },
  { value: "미노출",  label: "미노출" },
];

interface Props {
  id: string;
  status: SpeakerStatus;
  statusColor: string;
}

export function StatusChanger({ id, status, statusColor }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as SpeakerStatus;
    startTransition(async () => {
      const result = await updateSpeakerStatus(id, next);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("상태가 변경되었습니다.");
      }
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      style={{
        padding: "3px 8px",
        fontSize: 12,
        fontWeight: 600,
        color: statusColor,
        border: `1px solid ${statusColor}`,
        borderRadius: 4,
        background: "transparent",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
        appearance: "none",
        paddingRight: 20,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2386827a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
      }}
    >
      {STATUS_OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
