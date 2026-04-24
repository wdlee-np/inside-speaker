import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Speaker,
  SpeakerVideo,
  SpeakerReview,
  SpeakerCareer,
  SpeakerSubcategory,
  SpeakerWithRelations,
  Category,
  CategoryWithSubs,
  Subcategory,
  Inquiry,
  InquiryStatus,
} from "@/lib/database.types";
import {
  SEED_SPEAKERS,
  SEED_CATEGORIES,
  SEED_SUBCATEGORIES,
  SEED_INQUIRIES,
  type SeedSpeaker,
} from "@/lib/seed-data";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

function seedToSpeaker(s: SeedSpeaker): Speaker {
  return {
    id: s.id,
    name: s.name,
    name_en: s.name_en,
    title: s.title,
    tagline: s.tagline,
    portrait_url: s.portrait_url,
    hero_color: s.hero_color,
    fee_level: s.fee_level,
    featured: s.featured,
    display_order: s.display_order,
    stats_talks: s.stats_talks,
    stats_companies: s.stats_companies,
    stats_years: s.stats_years,
    topics: s.topics,
    bio: s.bio,
    recommended_ids: [],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    deleted_at: null,
  };
}

export const getSpeakers = cache(async (opts?: {
  categoryId?: string;
  subcategoryId?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Speaker[]> => {
  if (isDev()) {
    let seeds = SEED_SPEAKERS;
    if (opts?.featured !== undefined) seeds = seeds.filter((s) => s.featured === opts.featured);
    if (opts?.subcategoryId) seeds = seeds.filter((s) => s.subcategory_ids.includes(opts.subcategoryId!));
    if (opts?.categoryId) {
      const subIds = SEED_SUBCATEGORIES
        .filter((s) => s.category_id === opts.categoryId)
        .map((s) => s.id);
      seeds = seeds.filter((s) => s.subcategory_ids.some((id) => subIds.includes(id)));
    }
    if (opts?.limit) seeds = seeds.slice(0, opts.limit);
    return seeds.map(seedToSpeaker);
  }

  const supabase = await createClient();
  let query = supabase
    .from("speakers")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (opts?.featured !== undefined) query = query.eq("featured", opts.featured);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;

  const speakers = (data ?? []) as Speaker[];

  if (opts?.subcategoryId) {
    const supabase2 = await createClient();
    const { data: subs } = await supabase2
      .from("speaker_subcategories")
      .select("*")
      .eq("subcategory_id", opts.subcategoryId);
    const ids = ((subs ?? []) as SpeakerSubcategory[]).map((s) => s.speaker_id);
    return speakers.filter((sp) => ids.includes(sp.id));
  }

  if (opts?.categoryId) {
    const supabase2 = await createClient();
    const { data: subcats } = await supabase2
      .from("subcategories")
      .select("*")
      .eq("category_id", opts.categoryId);
    const subIds = ((subcats ?? []) as Subcategory[]).map((s) => s.id);
    const { data: subs } = await supabase2
      .from("speaker_subcategories")
      .select("*")
      .in("subcategory_id", subIds);
    const speakerIds = [
      ...new Set(((subs ?? []) as SpeakerSubcategory[]).map((s) => s.speaker_id)),
    ];
    return speakers.filter((sp) => speakerIds.includes(sp.id));
  }

  return speakers;
});

export const getFeaturedSpeakers = cache(async (limit = 6): Promise<Speaker[]> => {
  return getSpeakers({ featured: true, limit });
});

export const getSpeakerById = cache(async (
  id: string
): Promise<SpeakerWithRelations | null> => {
  if (isDev()) {
    const seed = SEED_SPEAKERS.find((s) => s.id === id);
    if (!seed) return null;
    return {
      ...seedToSpeaker(seed),
      subcategory_ids: seed.subcategory_ids,
      videos: seed.videos.map((v, i) => ({
        id: `${seed.id}-v${i}`,
        speaker_id: seed.id,
        title: v.title,
        duration: v.duration,
        thumb_url: v.thumb_url,
        video_url: v.video_url,
        sort_order: i,
      })) as SpeakerVideo[],
      reviews: seed.reviews.map((r, i) => ({
        id: `${seed.id}-r${i}`,
        speaker_id: seed.id,
        company: r.company,
        author: r.author,
        quote: r.quote,
        sort_order: i,
      })) as SpeakerReview[],
      careers: seed.careers.map((c, i) => ({
        id: `${seed.id}-c${i}`,
        speaker_id: seed.id,
        year: c.year,
        role: c.role,
        sort_order: i,
      })) as SpeakerCareer[],
    };
  }

  const supabase = await createClient();

  const [
    { data: speakerData, error },
    { data: subcatRows },
    { data: videoRows },
    { data: reviewRows },
    { data: careerRows },
  ] = await Promise.all([
    supabase.from("speakers").select("*").eq("id", id).is("deleted_at", null).single(),
    supabase.from("speaker_subcategories").select("*").eq("speaker_id", id),
    supabase.from("speaker_videos").select("*").eq("speaker_id", id).order("sort_order"),
    supabase.from("speaker_reviews").select("*").eq("speaker_id", id).order("sort_order"),
    supabase.from("speaker_careers").select("*").eq("speaker_id", id).order("sort_order"),
  ]);

  if (error || !speakerData) return null;

  const speaker = speakerData as Speaker;

  return {
    ...speaker,
    subcategory_ids: ((subcatRows ?? []) as SpeakerSubcategory[]).map((r) => r.subcategory_id),
    videos: (videoRows ?? []) as SpeakerVideo[],
    reviews: (reviewRows ?? []) as SpeakerReview[],
    careers: (careerRows ?? []) as SpeakerCareer[],
  };
});

export const getRecommendedSpeakers = cache(async (
  speaker: SpeakerWithRelations,
  limit = 3
): Promise<Speaker[]> => {
  if (isDev()) {
    const relatedIds = speaker.recommended_ids.length > 0
      ? speaker.recommended_ids.slice(0, limit)
      : SEED_SPEAKERS
          .filter((s) => s.id !== speaker.id && s.subcategory_ids.some((id) => speaker.subcategory_ids.includes(id)))
          .slice(0, limit)
          .map((s) => s.id);
    return SEED_SPEAKERS.filter((s) => relatedIds.includes(s.id)).map(seedToSpeaker);
  }

  const supabase = await createClient();

  if (speaker.recommended_ids.length > 0) {
    const { data } = await supabase
      .from("speakers")
      .select("*")
      .in("id", speaker.recommended_ids.slice(0, limit))
      .is("deleted_at", null);
    return (data ?? []) as Speaker[];
  }

  const { data: subs } = await supabase
    .from("speaker_subcategories")
    .select("*")
    .in("subcategory_id", speaker.subcategory_ids)
    .neq("speaker_id", speaker.id);

  const relatedIds = [
    ...new Set(((subs ?? []) as SpeakerSubcategory[]).map((s) => s.speaker_id)),
  ].slice(0, limit * 3);

  if (relatedIds.length === 0) return [];

  const { data } = await supabase
    .from("speakers")
    .select("*")
    .in("id", relatedIds)
    .is("deleted_at", null)
    .limit(limit);

  return (data ?? []) as Speaker[];
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (isDev()) return SEED_CATEGORIES;
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
});

export const getCategoryById = cache(async (id: string): Promise<Category | null> => {
  if (isDev()) return SEED_CATEGORIES.find((c) => c.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("id", id).single();
  return data ? (data as Category) : null;
});

export const getSubcategories = cache(async (categoryId?: string): Promise<Subcategory[]> => {
  if (isDev()) {
    return categoryId
      ? SEED_SUBCATEGORIES.filter((s) => s.category_id === categoryId)
      : SEED_SUBCATEGORIES;
  }
  const supabase = await createClient();
  let query = supabase.from("subcategories").select("*").order("sort_order");
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Subcategory[];
});

export const getSubcategoryById = cache(async (id: string): Promise<Subcategory | null> => {
  if (isDev()) return SEED_SUBCATEGORIES.find((s) => s.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("subcategories").select("*").eq("id", id).single();
  return data ? (data as Subcategory) : null;
});

export const getSpeakerSubcategoryMap = cache(async (): Promise<Record<string, string[]>> => {
  if (isDev()) {
    return Object.fromEntries(SEED_SPEAKERS.map((s) => [s.id, s.subcategory_ids]));
  }
  const supabase = await createClient();
  const { data } = await supabase.from("speaker_subcategories").select("*");
  const rows = (data ?? []) as SpeakerSubcategory[];
  const map: Record<string, string[]> = {};
  rows.forEach((r) => {
    if (!map[r.speaker_id]) map[r.speaker_id] = [];
    map[r.speaker_id].push(r.subcategory_id);
  });
  return map;
});

export const getCategoriesWithSubs = cache(async (): Promise<CategoryWithSubs[]> => {
  if (isDev()) {
    return SEED_CATEGORIES.map((c) => ({
      ...c,
      subcategories: SEED_SUBCATEGORIES.filter((s) => s.category_id === c.id),
    }));
  }
  const [cats, subs] = await Promise.all([getCategories(), getSubcategories()]);
  return cats.map((c) => ({
    ...c,
    subcategories: subs.filter((s) => s.category_id === c.id),
  }));
});

export const getInquiries = cache(async (opts?: {
  status?: InquiryStatus;
  limit?: number;
}): Promise<Inquiry[]> => {
  if (isDev()) {
    let items = SEED_INQUIRIES;
    if (opts?.status) items = items.filter((i) => i.status === opts.status);
    if (opts?.limit) items = items.slice(0, opts.limit);
    return items;
  }

  const supabase = await createClient();
  let query = (supabase as any)
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Inquiry[];
});
