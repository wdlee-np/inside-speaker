"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteSpeaker } from "@/app/admin/_actions/speakers";

export function DeleteSpeakerButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`'${name}'을(를) 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteSpeaker(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("삭제되었습니다.");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        padding: "4px 10px",
        fontSize: 12,
        color: isPending ? "var(--color-ink-muted)" : "var(--color-semantic-error)",
        border: "1px solid var(--color-line)",
        borderRadius: 4,
        background: "transparent",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? "삭제 중…" : "삭제"}
    </button>
  );
}
