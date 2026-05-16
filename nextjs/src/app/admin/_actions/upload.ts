"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SpeakerFileType } from "@/lib/database.types";

const DOC_BUCKET = "speaker-docs";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export async function getSignedUploadUrl(
  bucket: "speaker-images" | "speaker-docs",
  fileName: string,
  folder: string
): Promise<{ signedUrl?: string; token?: string; path?: string; publicUrl?: string; error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 업로드가 지원되지 않습니다." };

  const sb = await createAdminClient();
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(path);
  if (error) return { error: error.message };

  const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path);

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl: urlData.publicUrl,
  };
}

export async function saveSpeakerFileRecord(
  speakerId: string,
  fileType: SpeakerFileType,
  fileUrl: string,
  fileName: string,
  fileSize: number
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };

  const sb = await createClient();

  const { data: existing } = await (sb as any)
    .from("speaker_files")
    .select("id")
    .eq("speaker_id", speakerId)
    .eq("file_type", fileType)
    .order("sort_order", { ascending: false });

  const count = (existing ?? []).length;

  const { error } = await (sb as any).from("speaker_files").insert({
    speaker_id: speakerId,
    file_type: fileType,
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,
    sort_order: count,
  });

  if (error) return { error: (error as { message: string }).message };
  return {};
}

export async function getFileSignedUrl(
  fileUrl: string
): Promise<{ url?: string; error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };
  if (!fileUrl) return { error: "파일 URL이 없습니다." };

  const sb = await createAdminClient();
  let path: string;

  if (fileUrl.startsWith("http")) {
    const marker = `/storage/v1/object/public/${DOC_BUCKET}/`;
    if (fileUrl.includes(marker)) {
      path = fileUrl.split(marker)[1];
    } else {
      try {
        const urlObj = new URL(fileUrl);
        const parts = urlObj.pathname.split(`/${DOC_BUCKET}/`);
        if (parts.length < 2) return { error: "파일 경로를 추출할 수 없습니다." };
        path = parts.slice(1).join(`/${DOC_BUCKET}/`);
      } catch {
        return { error: "잘못된 파일 URL입니다." };
      }
    }
  } else {
    path = fileUrl;
  }

  path = decodeURIComponent(path.split("?")[0]);

  const { data, error } = await sb.storage.from(DOC_BUCKET).createSignedUrl(path, 120);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
