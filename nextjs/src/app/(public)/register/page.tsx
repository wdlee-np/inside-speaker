import { getSubcategories, getCategoriesWithSubs } from "@/lib/queries";
import { RegisterForm } from "./register-form";

export const metadata = { title: "강사 등록 | Just 강사" };

export default async function RegisterPage() {
  const categoriesWithSubs = await getCategoriesWithSubs();
  return <RegisterForm categoriesWithSubs={categoriesWithSubs} />;
}
