import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./admin-shell";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  if (!isDev()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");
  }

  return (
    <>
      <AdminShell>{children}</AdminShell>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
