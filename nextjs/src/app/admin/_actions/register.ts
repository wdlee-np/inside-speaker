"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { generateSpeakerCode } from "@/lib/queries";
import type { TopicGroup } from "@/app/admin/_actions/speakers";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export type PublicRegisterValues = {
  name: string;
  name_en: string;
  title: string;
  tagline: string;
  portrait_url: string;
  phone: string;
  email: string;
  desired_fee: string;
  stats_talks: number;
  stats_companies: number;
  stats_years: number;
  bio: string[];
  topicGroups: TopicGroup[];
  careers: { year: string; role: string }[];
  media_files: { path: string; name: string; size: number }[];
  lecture_files: { path: string; name: string; size: number }[];
  career_cert: { path: string; name: string; size: number } | null;
  edu_cert: { path: string; name: string; size: number } | null;
};

function generateId(): string {
  return `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function publicRegisterSpeaker(
  values: PublicRegisterValues
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 저장이 지원되지 않습니다." };

  const sb = await createAdminClient();
  const q = sb as any;
  const id = generateId();

  const flatTopics = values.topicGroups.flatMap((g) => g.topics.filter(Boolean));
  const subcategoryIds = [
    ...new Set(
      values.topicGroups.filter((g) => g.subcategoryId).map((g) => g.subcategoryId!)
    ),
  ];

  const { error } = await q.from("speakers").insert({
    id,
    name: values.name,
    name_en: values.name_en || null,
    title: values.title,
    tagline: values.tagline || null,
    portrait_url: values.portrait_url || null,
    hero_color: "#2c2a26",
    fee_level: "B",
    featured: false,
    display_order: 999,
    stats_talks: values.stats_talks || 0,
    stats_companies: values.stats_companies || 0,
    stats_years: values.stats_years || 0,
    bio: values.bio.filter(Boolean),
    topics: flatTopics,
    topic_groups: values.topicGroups.map((g) => ({
      subcategoryId: g.subcategoryId,
      topics: g.topics.filter(Boolean),
    })),
    recommended_ids: [],
    speaker_status: "등록요청",
  });

  if (error) return { error: (error as { message: string }).message };

  const speakerCode = generateSpeakerCode(values.phone);
  const privatePayload = {
    speaker_id: id,
    speaker_code: speakerCode,
    phone: values.phone || null,
    email: values.email || null,
    desired_fee: values.desired_fee || null,
  };
  let { error: privateError } = await q.from("speaker_private").insert(privatePayload);

  // speaker_code UNIQUE 충돌 시 접미사 추가 후 재시도
  if (privateError && (privateError.code === "23505" || String(privateError.message).toLowerCase().includes("unique"))) {
    const suffix = Math.random().toString(36).slice(2, 5);
    ({ error: privateError } = await q.from("speaker_private").insert({
      ...privatePayload,
      speaker_code: generateSpeakerCode(values.phone, undefined, suffix),
    }));
  }

  if (subcategoryIds.length > 0) {
    await q.from("speaker_subcategories").insert(
      subcategoryIds.map((subId: string) => ({
        speaker_id: id,
        subcategory_id: subId,
      }))
    );
  }

  const topicRows = values.topicGroups.flatMap((g, gi) =>
    g.topics
      .filter(Boolean)
      .map((t, ti) => ({
        speaker_id: id,
        subcategory_id: g.subcategoryId ?? null,
        topic_text: t,
        sort_order: gi * 100 + ti,
      }))
  );
  if (topicRows.length > 0) {
    const { error: topicErr } = await q.from("speaker_topics").insert(topicRows);
    if (topicErr) {
      const msg = (topicErr as { message: string; code?: string }).message ?? "";
      const code = (topicErr as { code?: string }).code ?? "";
      if (code === "42P01" || msg.includes("does not exist")) {
        return { error: "speaker_topics 테이블이 없습니다. Supabase SQL Editor에서 migration.sql 4번 항목을 실행해 주세요." };
      }
      return { error: `주제 저장 오류: ${msg}` };
    }
  }

  const careerRows = values.careers
    .filter((c) => c.year && c.role)
    .map((c, i) => ({
      speaker_id: id,
      year: c.year,
      role: c.role,
      sort_order: i,
    }));
  if (careerRows.length > 0) {
    await q.from("speaker_careers").insert(careerRows);
  }

  type FileRow = {
    speaker_id: string;
    file_type: string;
    file_url: string;
    file_name: string;
    file_size: number;
    sort_order: number;
  };
  const fileRows: FileRow[] = [
    ...values.media_files.map((f, i) => ({
      speaker_id: id,
      file_type: "media",
      file_url: f.path,
      file_name: f.name,
      file_size: f.size,
      sort_order: i,
    })),
    ...values.lecture_files.map((f, i) => ({
      speaker_id: id,
      file_type: "lecture_material",
      file_url: f.path,
      file_name: f.name,
      file_size: f.size,
      sort_order: i,
    })),
    ...(values.career_cert
      ? [{
          speaker_id: id,
          file_type: "career_cert",
          file_url: values.career_cert.path,
          file_name: values.career_cert.name,
          file_size: values.career_cert.size,
          sort_order: 0,
        }]
      : []),
    ...(values.edu_cert
      ? [{
          speaker_id: id,
          file_type: "edu_cert",
          file_url: values.edu_cert.path,
          file_name: values.edu_cert.name,
          file_size: values.edu_cert.size,
          sort_order: 0,
        }]
      : []),
  ];
  if (fileRows.length > 0) {
    await q.from("speaker_files").insert(fileRows);
  }

  revalidatePath("/admin/speakers");
  return {};
}
