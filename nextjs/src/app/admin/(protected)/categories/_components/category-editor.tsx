"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCategory, updateSubcategory } from "@/app/admin/_actions/categories";
import type { CategoryWithSubs } from "@/lib/database.types";

export function CategoryEditor({ categories }: { categories: CategoryWithSubs[] }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {categories.map((cat) => (
        <CategoryRow key={cat.id} cat={cat} />
      ))}
    </div>
  );
}

function CategoryRow({ cat }: { cat: CategoryWithSubs }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-line)",
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          background: "var(--color-surface-alt, #f5f4f1)",
          borderBottom: "1px solid var(--color-line)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr auto",
          gap: 16,
          alignItems: "center",
        }}
      >
        <InlineField
          label="한국어 레이블"
          value={cat.label}
          onSave={(v) => updateCategory(cat.id, { label: v })}
        />
        <InlineField
          label="영어 레이블"
          value={cat.label_en ?? ""}
          onSave={(v) => updateCategory(cat.id, { label_en: v })}
        />
        <InlineField
          label="설명"
          value={cat.description ?? ""}
          onSave={(v) => updateCategory(cat.id, { description: v })}
        />
        <span
          style={{
            fontSize: 11,
            padding: "3px 8px",
            background: "var(--color-accent, #14756b)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          대분류
        </span>
      </div>

      <div style={{ padding: "12px 24px 16px", display: "grid", gap: 8 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-ink-muted)",
            marginBottom: 4,
          }}
        >
          소분류
        </div>
        {cat.subcategories.map((sub) => (
          <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-ink-muted)",
                minWidth: 120,
                fontFamily: "var(--font-en)",
              }}
            >
              {sub.id}
            </span>
            <div style={{ flex: 1 }}>
              <InlineField
                label=""
                value={sub.label}
                onSave={(v) => updateSubcategory(sub.id, { label: v })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InlineField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<{ error?: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isPending, startTransition] = useTransition();

  const commit = () => {
    if (draft === value) { setEditing(false); return; }
    startTransition(async () => {
      const result = await onSave(draft);
      if (result.error) {
        toast.error(result.error);
        setDraft(value);
      } else {
        toast.success("저장되었습니다.");
      }
      setEditing(false);
    });
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {label && (
          <span style={{ fontSize: 10, color: "var(--color-ink-muted)", letterSpacing: "0.08em" }}>
            {label}
          </span>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            style={{
              flex: 1,
              padding: "6px 10px",
              fontSize: 13,
              border: "1px solid var(--color-accent, #14756b)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={commit}
            disabled={isPending}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              background: "var(--color-accent, #14756b)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            저장
          </button>
          <button
            onClick={cancel}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              background: "transparent",
              border: "1px solid var(--color-line)",
              cursor: "pointer",
            }}
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}
      onClick={() => setEditing(true)}
      title="클릭하여 편집"
    >
      {label && (
        <span style={{ fontSize: 10, color: "var(--color-ink-muted)", letterSpacing: "0.08em" }}>
          {label}
        </span>
      )}
      <div
        style={{
          padding: "6px 10px",
          fontSize: 13,
          border: "1px solid transparent",
          minHeight: 32,
          color: value ? "var(--color-ink)" : "var(--color-ink-muted)",
          borderRadius: 2,
          transition: "border-color 150ms",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-line)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = "transparent")
        }
      >
        {value || <em style={{ color: "var(--color-line)" }}>—</em>}
      </div>
    </div>
  );
}
