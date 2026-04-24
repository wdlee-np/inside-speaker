import { notFound } from "next/navigation";
import { getSpeakerById, getCategoriesWithSubs, getSpeakers } from "@/lib/queries";
import { SpeakerForm } from "../../_form";
import type { SpeakerFormValues } from "@/app/admin/_actions/speakers";
import type { SpeakerWithRelations } from "@/lib/database.types";

export const dynamic = "force-dynamic";

function toFormValues(s: SpeakerWithRelations): SpeakerFormValues {
  return {
    id: s.id,
    name: s.name,
    name_en: s.name_en ?? "",
    title: s.title,
    tagline: s.tagline ?? "",
    portrait_url: s.portrait_url ?? "",
    hero_color: s.hero_color,
    fee_level: s.fee_level,
    featured: s.featured,
    display_order: s.display_order,
    stats_talks: s.stats_talks,
    stats_companies: s.stats_companies,
    stats_years: s.stats_years,
    bio: s.bio,
    topics: s.topics,
    subcategory_ids: s.subcategory_ids,
    recommended_ids: s.recommended_ids,
    careers: s.careers.map((c) => ({ year: c.year, role: c.role })),
    videos: s.videos.map((v) => ({
      title: v.title,
      duration: v.duration ?? "",
      video_url: v.video_url,
      thumb_url: v.thumb_url ?? "",
    })),
    reviews: s.reviews.map((r) => ({
      company: r.company,
      author: r.author ?? "",
      quote: r.quote,
    })),
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSpeakerPage({ params }: Props) {
  const { id } = await params;

  const [speaker, categoriesWithSubs, allSpeakers] = await Promise.all([
    getSpeakerById(id),
    getCategoriesWithSubs(),
    getSpeakers(),
  ]);

  if (!speaker) notFound();

  return (
    <SpeakerForm
      mode="edit"
      defaultValues={toFormValues(speaker)}
      categoriesWithSubs={categoriesWithSubs}
      allSpeakers={allSpeakers}
    />
  );
}
