"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "speaker-images";
const FOLDER = "images";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export async function uploadSpeakerImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 업로드가 지원되지 않습니다." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "파일이 없습니다." };
  if (!file.type.startsWith("image/")) return { error: "이미지 파일만 업로드 가능합니다." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const sb = await createClient();
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = sb.storage.from(BUCKET).getPublicUrl(filename);
  return { url: data.publicUrl };
}
