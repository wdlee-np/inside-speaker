import { getCategoriesWithSubs } from "@/lib/queries";
import { CategoryEditor } from "./_components/category-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "카테고리 | Admin" };

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithSubs();

  return (
    <div style={{ padding: "40px 48px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--color-ink)", margin: 0 }}>
          카테고리
        </h1>
        <p style={{ marginTop: 8, color: "var(--color-ink-muted)", fontSize: 14, margin: "8px 0 0" }}>
          셀을 클릭하면 인라인 편집할 수 있습니다.
        </p>
      </div>

      <CategoryEditor categories={categories} />
    </div>
  );
}
