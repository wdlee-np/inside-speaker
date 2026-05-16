import { notFound } from "next/navigation";
import { getSpeakerWithPrivate, getCategoriesWithSubs, getSpeakers, getSpeakerTopics } from "@/lib/queries";
import { SpeakerForm } from "../../_form";
import type { SpeakerFormValues, TopicGroup } from "@/app/admin/_actions/speakers";
import type { SpeakerWithPrivate, SpeakerTopic } from "@/lib/database.types";

export const dynamic = "force-dynamic";

function buildTopicGroups(
  topicRows: SpeakerTopic[],
  subcategoryIds: string[],
  flatTopics: string[]
): TopicGroup[] {
  if (topicRows.length > 0) {
    const map = new Map<string, TopicGroup>();
    for (const row of topicRows) {
      const key = row.subcategory_id ?? "__null__";
      if (!map.has(key)) {
        map.set(key, { subcategoryId: row.subcategory_id, topics: [] });
      }
      map.get(key)!.topics.push(row.topic_text);
    }
    return [...map.values()];
  }
  // 기존 데이터 폴백: subcategoryIds를 빈 그룹으로, topics를 기타 그룹으로
  const result: TopicGroup[] = subcategoryIds.map((subId) => ({
    subcategoryId: subId,
    topics: [],
  }));
  if (flatTopics.length > 0) {
    result.push({ subcategoryId: null, topics: [...flatTopics] });
  }
  return result;
}

function toFormValues(s: SpeakerWithPrivate, topicRows: SpeakerTopic[]): SpeakerFormValues {
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
    topicGroups: buildTopicGroups(topicRows, s.subcategory_ids, s.topics),
    recommended_ids: s.recommended_ids,
    careers: s.careers.map((c) => ({ year: c.year, role: c.role })),
    videos: s.videos.map((v) => ({
      title: v.title,
      duration: v.duration ?? "",
      video_url: v.video_url,
      thumb_url: v.thumb_url ?? "",
      media_type: v.media_type ?? "video",
    })),
    reviews: s.reviews.map((r) => ({
      company: r.company,
      author: r.author ?? "",
      quote: r.quote,
    })),
    speaker_status: s.speaker_status,
    phone: s.private?.phone ?? "",
    email: s.private?.email ?? "",
    admin_memo: s.private?.admin_memo ?? "",
    desired_fee: s.private?.desired_fee ?? "",
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSpeakerPage({ params }: Props) {
  const { id } = await params;

  const [speaker, categoriesWithSubs, allSpeakers, topicRows] = await Promise.all([
    getSpeakerWithPrivate(id),
    getCategoriesWithSubs(),
    getSpeakers(),
    getSpeakerTopics(id),
  ]);

  if (!speaker) notFound();

  return (
    <SpeakerForm
      mode="edit"
      defaultValues={toFormValues(speaker, topicRows)}
      categoriesWithSubs={categoriesWithSubs}
      allSpeakers={allSpeakers}
      speakerCode={speaker.private?.speaker_code ?? null}
      existingFiles={speaker.files ?? []}
    />
  );
}
