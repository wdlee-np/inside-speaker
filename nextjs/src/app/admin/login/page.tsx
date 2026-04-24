import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export const metadata = { title: "로그인 | Admin" };

export default function LoginPage() {
  if (isDev()) redirect("/admin");
  return <LoginForm />;
}
