import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminMembers } from "@/app/admin/_actions/members";
import { MembersClient } from "./_components/members-client";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export default async function MembersPage() {
  let currentUserId: string | null = null;

  if (!isDev()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");
    currentUserId = user.id;
  }

  const members = await getAdminMembers();

  return (
    <div style={{ padding: "40px 48px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-ink)",
            marginBottom: 4,
          }}
        >
          회원 관리
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
          어드민 계정을 등록·수정·비활성화합니다.
        </p>
      </div>
      <MembersClient members={members} currentUserId={currentUserId} />
    </div>
  );
}
