import { notFound } from "next/navigation";
import { getSpeakerById, getRecommendedSpeakers, getCategoriesWithSubs, getSpeakerSubcategoryMap } from "@/lib/queries";
import { SpeakerDetailClient } from "./speaker-detail-client";

interface Props {
  params: Promise<{ speakerId: string }>;
}

export default async function SpeakerDetailPage({ params }: Props) {
  const { speakerId } = await params;

  const speaker = await getSpeakerById(speakerId);
  if (!speaker) notFound();

  const [related, categoriesWithSubs, subMap] = await Promise.all([
    getRecommendedSpeakers(speaker, 4),
    getCategoriesWithSubs(),
    getSpeakerSubcategoryMap(),
  ]);

  const subcategoryMap: Record<string, string> = {};
  categoriesWithSubs.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      subcategoryMap[sub.id] = sub.label;
    });
  });

  const firstSubId = speaker.subcategory_ids[0];
  const parentCategory = categoriesWithSubs.find((cat) =>
    cat.subcategories.some((s) => s.id === firstSubId)
  );

  return (
    <SpeakerDetailClient
      speaker={speaker}
      related={related}
      subcategoryMap={subcategoryMap}
      speakerSubcategoryMap={subMap}
      parentCategory={parentCategory ?? null}
    />
  );
}
