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

export async function updateSubcategory(
  id: string,
  patch: { label?: string; sort_order?: number }
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
