"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { InquiryStatus } from "@/lib/database.types";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 저장이 지원되지 않습니다." };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q
    .from("inquiries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/inquiries");
  return {};
}

export async function updateInquiryMemo(
  id: string,
  memo: string
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 저장이 지원되지 않습니다." };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q
    .from("inquiries")
    .update({ internal_memo: memo || null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/inquiries");
  return {};
}
