import { getSubcategories, getCategoriesWithSubs } from "@/lib/queries";
import { RegisterForm } from "./register-form";

export const metadata = { title: "강사 등록 | Inside Speakers" };

export default async function RegisterPage() {
  const categoriesWithSubs = await getCategoriesWithSubs();
  return <RegisterForm categoriesWithSubs={categoriesWithSubs} />;
}
