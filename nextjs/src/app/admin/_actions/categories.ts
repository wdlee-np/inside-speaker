"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

const DEV_ERROR = "개발 모드에서는 저장이 지원되지 않습니다.";

export async function updateCategory(
  id: string,
  patch: { label?: string; label_en?: string; description?: string }
): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("categories").update(patch).eq("id", id);
  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

// REQ-7: 대분류 추가
export async function createCategory(data: {
  id: string;
  label: string;
  label_en?: string;
  description?: string;
  sort_order: number;
}): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("categories").insert({
    id: data.id,
    label: data.label,
    label_en: data.label_en || null,
    description: data.description || null,
    sort_order: data.sort_order,
  });

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

// REQ-7: 대분류 삭제 (소분류, 강사-소분류 매핑 CASCADE 처리)
export async function deleteCategory(id: string): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("categories").delete().eq("id", id);
  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

export async function updateSubcategory(
  id: string,
  patch: { label?: string; label_en?: string; sort_order?: number }
): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("subcategories").update(patch).eq("id", id);
  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

// REQ-7: 소분류 추가
export async function createSubcategory(data: {
  id: string;
  category_id: string;
  label: string;
  label_en?: string;
  sort_order: number;
}): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("subcategories").insert({
    id: data.id,
    category_id: data.category_id,
    label: data.label,
    label_en: data.label_en || null,
    sort_order: data.sort_order,
  });

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

// REQ-7: 소분류 삭제 (강사-소분류 매핑 CASCADE 처리)
export async function deleteSubcategory(id: string): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("subcategories").delete().eq("id", id);
  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}
