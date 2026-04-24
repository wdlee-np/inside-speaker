import { getFeaturedSpeakers, getSpeakers, getCategoriesWithSubs, getSpeakerSubcategoryMap } from "@/lib/queries";
import { HomepageClient } from "./homepage-client";

export default async function HomePage() {
  const [categoriesWithSubs, featured, all, subMap] = await Promise.all([
    getCategoriesWithSubs(),
    getFeaturedSpeakers(8),
    getSpeakers(),
    getSpeakerSubcategoryMap(),
  ]);

  const subcategoryMap: Record<string, string> = {};
  categoriesWithSubs.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      subcategoryMap[sub.id] = sub.label;
    });
  });

  return (
    <HomepageClient
      categories={categoriesWithSubs}
      featured={featured}
      all={all}
      subcategoryMap={subcategoryMap}
      speakerSubcategoryMap={subMap}
    />
  );
}
