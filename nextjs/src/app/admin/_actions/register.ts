"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export type PublicRegisterValues = {
  name: string;
  name_en: string;
  title: string;
  tagline: string;
  portrait_url: string;
  stats_talks: number;
  stats_companies: number;
  stats_years: number;
  bio: string[];
  topics: string[];
  subcategory_ids: string[];
  careers: { year: string; role: string }[];
};

function generateId(): string {
  return `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function publicRegisterSpeaker(
  values: PublicRegisterValues
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 저장이 지원되지 않습니다." };

  const sb = await createClient();
  const q = sb as any;
  const id = generateId();

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
    topics: values.topics.filter(Boolean),
    recommended_ids: [],
    speaker_status: "등록요청",
  });

  if (error) return { error: (error as { message: string }).message };

  if (values.subcategory_ids.length > 0) {
    await q.from("speaker_subcategories").insert(
      values.subcategory_ids.map((subId: string) => ({
        speaker_id: id,
        subcategory_id: subId,
      }))
    );
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

  revalidatePath("/admin/speakers");
  return {};
}
