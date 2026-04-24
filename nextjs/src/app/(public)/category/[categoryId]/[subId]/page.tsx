import { notFound } from "next/navigation";
import {
  getCategoryById,
  getCategoriesWithSubs,
  getSpeakers,
  getSpeakerSubcategoryMap,
} from "@/lib/queries";
import { CategoryContent } from "../category-content";

interface Props {
  params: Promise<{ categoryId: string; subId: string }>;
}

export default async function SubCategoryPage({ params }: Props) {
  const { categoryId, subId } = await params;

  const [category, categoriesWithSubs, speakers, subMap] = await Promise.all([
    getCategoryById(categoryId),
    getCategoriesWithSubs(),
    getSpeakers({ subcategoryId: subId }),
    getSpeakerSubcategoryMap(),
  ]);

  if (!category) notFound();

  const catWithSubs = categoriesWithSubs.find((c) => c.id === categoryId);
  if (!catWithSubs) notFound();

  const validSub = catWithSubs.subcategories.find((s) => s.id === subId);
  if (!validSub) notFound();

  const subcategoryMap: Record<string, string> = {};
  categoriesWithSubs.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      subcategoryMap[sub.id] = sub.label;
    });
  });

  return (
    <CategoryContent
      category={catWithSubs}
      speakers={speakers}
      subcategoryMap={subcategoryMap}
      speakerSubcategoryMap={subMap}
      activeSub={subId}
    />
  );
}
