"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  updateCategory,
  updateSubcategory,
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
} from "@/app/admin/_actions/categories";
import type { CategoryWithSubs } from "@/lib/database.types";

export function CategoryEditor({ categories: initialCategories }: { categories: CategoryWithSubs[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleCategoryDeleted = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCategoryAdded = (cat: CategoryWithSubs) => {
    setCategories((prev) => [...prev, cat]);
    setShowAddCategory(false);
  };

  const handleSubAdded = (catId: string, sub: CategoryWithSubs["subcategories"][number]) => {
    setCategories((prev) =>
      prev.map((c) => c.id === catId ? { ...c, subcategories: [...c.subcategories, sub] } : c)
    );
  };

  const handleSubDeleted = (catId: string, subId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subId) }
          : c
      )
    );
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          cat={cat}
          onDeleted={() => handleCategoryDeleted(cat.id)}
          onSubAdded={(sub) => handleSubAdded(cat.id, sub)}
          onSubDeleted={(subId) => handleSubDeleted(cat.id, subId)}
        />
      ))}

      {showAddCategory ? (
        <AddCategoryForm
          onAdded={handleCategoryAdded}
          onCancel={() => setShowAddCategory(false)}
          nextSortOrder={categories.length + 1}
        />
      ) : (
        <button
          onClick={() => setShowAddCategory(true)}
          style={{
            padding: "12px 20px", fontSize: 13, fontWeight: 600,
            color: "var(--color-accent)",
            background: "transparent",
            border: "1px dashed var(--color-accent)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          + 대분류 추가
        </button>
      )}
    </div>
  );
}

function CategoryRow({
  cat,
  onDeleted,
  onSubAdded,
  onSubDeleted,
}: {
  cat: CategoryWithSubs;
  onDeleted: () => void;
  onSubAdded: (sub: CategoryWithSubs["subcategories"][number]) => void;
  onSubDeleted: (subId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showAddSub, setShowAddSub] = useState(false);

  const handleDelete = () => {
    if (!confirm(`'${cat.label}' 대분류와 모든 소분류를 삭제하시겠습니까?\n강사의 해당 카테고리 매핑도 함께 삭제됩니다.`)) return;
    startTransition(async () => {
      const result = await deleteCategory(cat.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("대분류가 삭제되었습니다.");
        onDeleted();
      }
    });
  };

  return (
    <div style={{ border: "1px solid var(--color-line)", background: "var(--color-surface)" }}>
      <div
        style={{
          padding: "16px 24px",
          background: "var(--color-surface-alt, #f5f4f1)",
          borderBottom: "1px solid var(--color-line)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr auto auto",
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
            fontSize: 11, padding: "3px 8px",
            background: "var(--color-accent, #14756b)",
            color: "#fff", fontWeight: 600,
          }}
        >
          대분류
        </span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          style={{
            padding: "4px 10px", fontSize: 11, fontWeight: 500,
            color: "var(--color-semantic-error, #dc2626)",
            background: "transparent",
            border: "1px solid var(--color-line)",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
        >
          삭제
        </button>
      </div>

      <div style={{ padding: "12px 24px 16px", display: "grid", gap: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink-muted)", marginBottom: 4 }}>
          소분류
        </div>
        {cat.subcategories.map((sub) => (
          <SubcategoryRow
            key={sub.id}
            sub={sub}
            onDeleted={() => onSubDeleted(sub.id)}
          />
        ))}

        {showAddSub ? (
          <AddSubcategoryForm
            categoryId={cat.id}
            nextSortOrder={cat.subcategories.length + 1}
            onAdded={(sub) => { onSubAdded(sub); setShowAddSub(false); }}
            onCancel={() => setShowAddSub(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddSub(true)}
            style={{
              marginTop: 4, padding: "6px 12px", fontSize: 12,
              color: "var(--color-accent)",
              background: "transparent",
              border: "1px dashed var(--color-accent)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            + 소분류 추가
          </button>
        )}
      </div>
    </div>
  );
}

function SubcategoryRow({
  sub,
  onDeleted,
}: {
  sub: CategoryWithSubs["subcategories"][number];
  onDeleted: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`'${sub.label}' 소분류를 삭제하시겠습니까?\n강사의 해당 카테고리 매핑도 함께 삭제됩니다.`)) return;
    startTransition(async () => {
      const result = await deleteSubcategory(sub.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("소분류가 삭제되었습니다.");
        onDeleted();
      }
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 11, color: "var(--color-ink-muted)", minWidth: 120, fontFamily: "var(--font-en)" }}>
        {sub.id}
      </span>
      <div style={{ flex: 1 }}>
        <InlineField
          label=""
          value={sub.label}
          onSave={(v) => updateSubcategory(sub.id, { label: v })}
        />
      </div>
      <div style={{ width: 120 }}>
        <InlineField
          label=""
          value={sub.label_en ?? ""}
          placeholder="EN label"
          onSave={(v) => updateSubcategory(sub.id, { label_en: v })}
        />
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        style={{
          padding: "4px 8px", fontSize: 11,
          color: "var(--color-semantic-error, #dc2626)",
          background: "transparent",
          border: "1px solid var(--color-line)",
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        삭제
      </button>
    </div>
  );
}

function AddCategoryForm({
  onAdded,
  onCancel,
  nextSortOrder,
}: {
  onAdded: (cat: CategoryWithSubs) => void;
  onCancel: () => void;
  nextSortOrder: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!id || !label) { toast.error("ID와 한국어 레이블은 필수입니다."); return; }
    startTransition(async () => {
      const result = await createCategory({ id, label, label_en: labelEn || undefined, description: description || undefined, sort_order: nextSortOrder });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("대분류가 추가되었습니다.");
        onAdded({ id, label, label_en: labelEn || null, description: description || null, sort_order: nextSortOrder, subcategories: [] });
      }
    });
  };

  const inp: React.CSSProperties = { padding: "6px 10px", fontSize: 13, border: "1px solid var(--color-accent)", outline: "none", fontFamily: "inherit", width: "100%" };

  return (
    <div style={{ border: "1px dashed var(--color-accent)", padding: 16, display: "grid", gap: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-accent)" }}>새 대분류</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 12 }}>
        <div>
          <label style={labelS}>ID (영문)</label>
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="leadership" style={inp} />
        </div>
        <div>
          <label style={labelS}>한국어 레이블</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="리더십" style={inp} />
        </div>
        <div>
          <label style={labelS}>영어 레이블</label>
          <input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder="Leadership" style={inp} />
        </div>
        <div>
          <label style={labelS}>설명</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="카테고리 설명" style={inp} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={isPending} style={{ ...saveBtn, opacity: isPending ? 0.6 : 1 }}>저장</button>
        <button onClick={onCancel} style={cancelBtn}>취소</button>
      </div>
    </div>
  );
}

function AddSubcategoryForm({
  categoryId,
  nextSortOrder,
  onAdded,
  onCancel,
}: {
  categoryId: string;
  nextSortOrder: number;
  onAdded: (sub: CategoryWithSubs["subcategories"][number]) => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const [labelEn, setLabelEn] = useState("");

  const handleSave = () => {
    if (!id || !label) { toast.error("ID와 한국어 레이블은 필수입니다."); return; }
    startTransition(async () => {
      const result = await createSubcategory({ id, category_id: categoryId, label, label_en: labelEn || undefined, sort_order: nextSortOrder });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("소분류가 추가되었습니다.");
        onAdded({ id, category_id: categoryId, label, label_en: labelEn || null, sort_order: nextSortOrder, created_at: new Date().toISOString() });
      }
    });
  };

  const inp: React.CSSProperties = { padding: "6px 10px", fontSize: 13, border: "1px solid var(--color-accent)", outline: "none", fontFamily: "inherit", width: "100%" };

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 4 }}>
      <div>
        <label style={labelS}>ID</label>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="hr-org" style={{ ...inp, width: 120 }} />
      </div>
      <div>
        <label style={labelS}>한국어 레이블</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="인사/조직관리" style={{ ...inp, width: 160 }} />
      </div>
      <div>
        <label style={labelS}>영어 레이블</label>
        <input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder="HR / Org" style={{ ...inp, width: 120 }} />
      </div>
      <button onClick={handleSave} disabled={isPending} style={{ ...saveBtn, opacity: isPending ? 0.6 : 1 }}>저장</button>
      <button onClick={onCancel} style={cancelBtn}>취소</button>
    </div>
  );
}

function InlineField({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  placeholder?: string;
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
        {label && <span style={{ fontSize: 10, color: "var(--color-ink-muted)", letterSpacing: "0.08em" }}>{label}</span>}
        <div style={{ display: "flex", gap: 6 }}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
            style={{ flex: 1, padding: "6px 10px", fontSize: 13, border: "1px solid var(--color-accent, #14756b)", outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={commit} disabled={isPending} style={saveBtn}>저장</button>
          <button onClick={cancel} style={cancelBtn}>취소</button>
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
      {label && <span style={{ fontSize: 10, color: "var(--color-ink-muted)", letterSpacing: "0.08em" }}>{label}</span>}
      <div
        style={{
          padding: "6px 10px", fontSize: 13,
          border: "1px solid transparent", minHeight: 32,
          color: value ? "var(--color-ink)" : "var(--color-ink-muted)",
          borderRadius: 2, transition: "border-color 150ms",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-line)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "transparent")}
      >
        {value || <em style={{ color: "var(--color-line)", fontStyle: "normal" }}>{placeholder ?? "—"}</em>}
      </div>
    </div>
  );
}

const labelS: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: "var(--color-ink-muted)", marginBottom: 4,
  textTransform: "uppercase", letterSpacing: "0.08em",
};

const saveBtn: React.CSSProperties = {
  padding: "6px 12px", fontSize: 12, fontWeight: 600,
  background: "var(--color-accent, #14756b)", color: "#fff",
  border: "none", cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  padding: "6px 10px", fontSize: 12,
  background: "transparent", border: "1px solid var(--color-line)",
  cursor: "pointer",
};
