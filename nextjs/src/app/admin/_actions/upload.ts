"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SpeakerFileType } from "@/lib/database.types";

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

const DOC_BUCKET = "speaker-docs";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadSpeakerFile(
  speakerId: string,
  fileType: SpeakerFileType,
  formData: FormData
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 업로드가 지원되지 않습니다." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "파일이 없습니다." };
  if (file.size > MAX_FILE_BYTES) return { error: "파일 크기는 10MB 이하여야 합니다." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filename = `${speakerId}/${fileType}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const sb = await createClient();
  const { error: storageError } = await sb.storage
    .from(DOC_BUCKET)
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (storageError) return { error: storageError.message };

  const { data: urlData } = sb.storage.from(DOC_BUCKET).getPublicUrl(filename);

  const { data: existing } = await (sb as any)
    .from("speaker_files")
    .select("id")
    .eq("speaker_id", speakerId)
    .eq("file_type", fileType)
    .order("sort_order", { ascending: false });

  const count = (existing ?? []).length;

  const { error: dbError } = await (sb as any).from("speaker_files").insert({
    speaker_id: speakerId,
    file_type: fileType,
    file_url: urlData.publicUrl,
    file_name: file.name,
    file_size: file.size,
    sort_order: count,
  });

  if (dbError) return { error: dbError.message };
  return {};
}

export async function uploadPublicRegistrationFile(
  fileType: "portrait" | SpeakerFileType,
  formData: FormData
): Promise<{ url?: string; path?: string; name?: string; size?: number; error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 업로드가 지원되지 않습니다." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "파일이 없습니다." };

  const sb = await createAdminClient();

  if (fileType === "portrait") {
    if (!file.type.startsWith("image/")) return { error: "이미지 파일만 업로드 가능합니다." };
    if (file.size > 5 * 1024 * 1024) return { error: "이미지 크기는 5MB 이하여야 합니다." };
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(filename, file, { contentType: file.type, upsert: false });
    if (error) return { error: error.message };
    const { data } = sb.storage.from(BUCKET).getPublicUrl(filename);
    return { url: data.publicUrl };
  } else {
    if (file.size > MAX_FILE_BYTES) return { error: "파일 크기는 10MB 이하여야 합니다." };
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const filename = `reg/${fileType}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await sb.storage.from(DOC_BUCKET).upload(filename, file, { contentType: file.type, upsert: false });
    if (error) return { error: error.message };
    return { path: filename, name: file.name, size: file.size };
  }
}
