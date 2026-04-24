import { getCategoriesWithSubs, getSpeakers } from "@/lib/queries";
import { SpeakerForm } from "../_form";
import type { SpeakerFormValues } from "@/app/admin/_actions/speakers";

export const metadata = { title: "새 연사 추가 | Admin" };

const EMPTY: SpeakerFormValues = {
  id: "",
  name: "",
  name_en: "",
  title: "",
  tagline: "",
  portrait_url: "",
  hero_color: "#2c2a26",
  fee_level: "A",
  featured: false,
  display_order: 100,
  stats_talks: 0,
  stats_companies: 0,
  stats_years: 0,
  bio: [],
  topics: [],
  subcategory_ids: [],
  recommended_ids: [],
  careers: [],
  videos: [],
  reviews: [],
};

export default async function NewSpeakerPage() {
  const [categoriesWithSubs, allSpeakers] = await Promise.all([
    getCategoriesWithSubs(),
    getSpeakers(),
  ]);

  return (
    <SpeakerForm
      mode="create"
      defaultValues={EMPTY}
      categoriesWithSubs={categoriesWithSubs}
      allSpeakers={allSpeakers}
    />
  );
}
