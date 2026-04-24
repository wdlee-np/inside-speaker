"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

const DEV_ERROR = "개발 모드에서는 저장이 지원되지 않습니다.";

export type SpeakerFormValues = {
  id: string;
  name: string;
  name_en: string;
  title: string;
  tagline: string;
  portrait_url: string;
  hero_color: string;
  fee_level: "S" | "A" | "B" | "C";
  featured: boolean;
  display_order: number;
  stats_talks: number;
  stats_companies: number;
  stats_years: number;
  bio: string[];
  topics: string[];
  subcategory_ids: string[];
  recommended_ids: string[];
  careers: { year: string; role: string }[];
  videos: { title: string; duration: string; video_url: string; thumb_url: string }[];
  reviews: { company: string; author: string; quote: string }[];
};

type SbClient = Awaited<ReturnType<typeof createClient>>;

// The custom Database type has insert/update types that don't satisfy Supabase v2's
// GenericTable constraint, so mutation calls use (sb as any) — same pattern as
// queries.ts which casts all select results.
async function syncRelations(sb: SbClient, speakerId: string, values: SpeakerFormValues) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  await Promise.all([
    q.from("speaker_subcategories").delete().eq("speaker_id", speakerId),
    q.from("speaker_videos").delete().eq("speaker_id", speakerId),
    q.from("speaker_reviews").delete().eq("speaker_id", speakerId),
    q.from("speaker_careers").delete().eq("speaker_id", speakerId),
  ]);

  const inserts: Promise<unknown>[] = [];

  if (values.subcategory_ids.length > 0) {
    inserts.push(
      q.from("speaker_subcategories").insert(
        values.subcategory_ids.map((subId: string) => ({
          speaker_id: speakerId,
          subcategory_id: subId,
        }))
      )
    );
  }

  const videoRows = values.videos
    .filter((v) => v.title && v.video_url)
    .map((v, i) => ({
      speaker_id: speakerId,
      title: v.title,
      duration: v.duration || null,
      video_url: v.video_url,
      thumb_url: v.thumb_url || null,
      sort_order: i,
    }));
  if (videoRows.length > 0) inserts.push(q.from("speaker_videos").insert(videoRows));

  const reviewRows = values.reviews
    .filter((r) => r.company && r.quote)
    .map((r, i) => ({
      speaker_id: speakerId,
      company: r.company,
      author: r.author || null,
      quote: r.quote,
      sort_order: i,
    }));
  if (reviewRows.length > 0) inserts.push(q.from("speaker_reviews").insert(reviewRows));

  const careerRows = values.careers
    .filter((c) => c.year && c.role)
    .map((c, i) => ({
      speaker_id: speakerId,
      year: c.year,
      role: c.role,
      sort_order: i,
    }));
  if (careerRows.length > 0) inserts.push(q.from("speaker_careers").insert(careerRows));

  await Promise.all(inserts);
}

export async function createSpeaker(values: SpeakerFormValues): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q.from("speakers").insert({
    id: values.id,
    name: values.name,
    name_en: values.name_en || null,
    title: values.title,
    tagline: values.tagline || null,
    portrait_url: values.portrait_url || null,
    hero_color: values.hero_color || "#2c2a26",
    fee_level: values.fee_level,
    featured: values.featured,
    display_order: values.display_order,
    stats_talks: values.stats_talks,
    stats_companies: values.stats_companies,
    stats_years: values.stats_years,
    bio: values.bio.filter(Boolean),
    topics: values.topics.filter(Boolean),
    recommended_ids: values.recommended_ids,
  });

  if (error) return { error: (error as { message: string }).message };

  await syncRelations(sb, values.id, values);

  revalidatePath("/admin/speakers");
  revalidatePath("/");

  return {};
}

export async function updateSpeaker(
  id: string,
  values: SpeakerFormValues
): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q
    .from("speakers")
    .update({
      name: values.name,
      name_en: values.name_en || null,
      title: values.title,
      tagline: values.tagline || null,
      portrait_url: values.portrait_url || null,
      hero_color: values.hero_color || "#2c2a26",
      fee_level: values.fee_level,
      featured: values.featured,
      display_order: values.display_order,
      stats_talks: values.stats_talks,
      stats_companies: values.stats_companies,
      stats_years: values.stats_years,
      bio: values.bio.filter(Boolean),
      topics: values.topics.filter(Boolean),
      recommended_ids: values.recommended_ids,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  await syncRelations(sb, id, values);

  revalidatePath("/admin/speakers");
  revalidatePath(`/speakers/${id}`);
  revalidatePath("/");

  return {};
}

export async function deleteSpeaker(id: string): Promise<{ error?: string }> {
  if (isDev()) return { error: DEV_ERROR };

  const sb = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q
    .from("speakers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/speakers");
  revalidatePath("/");

  return {};
}
