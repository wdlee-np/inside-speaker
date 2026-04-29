"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

const isDev = () =>
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").includes("placeholder");

export type AdminMember = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  disabled_at: string | null;
};

export async function getAdminMembers(): Promise<AdminMember[]> {
  if (isDev()) return [];

  const sb = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { data: adminRows, error } = await q.from("admin_users").select("*");
  if (error || !adminRows) return [];

  const {
    data: { users },
    error: authError,
  } = await sb.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailMap = new Map(users.map((u: any) => [u.id, u.email as string]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adminRows.map((row: any) => ({
    id: row.id,
    email: emailMap.get(row.id) ?? "(알 수 없음)",
    display_name: row.display_name ?? null,
    created_at: row.created_at,
    disabled_at: row.disabled_at ?? null,
  }));
}

export async function createAdminMember(
  email: string,
  password: string,
  displayName: string
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };

  const sb = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return { error: (error as { message: string }).message };
  if (!data.user) return { error: "사용자 생성 실패" };

  const { error: insertError } = await q.from("admin_users").insert({
    id: data.user.id,
    display_name: displayName || null,
  });

  if (insertError) {
    // 롤백: auth 사용자 삭제
    await sb.auth.admin.deleteUser(data.user.id);
    return { error: (insertError as { message: string }).message };
  }

  revalidatePath("/admin/members");
  return {};
}

export async function updateAdminMember(
  id: string,
  displayName: string
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };

  const sb = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q
    .from("admin_users")
    .update({ display_name: displayName || null })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/members");
  return {};
}

export async function disableAdminMember(
  id: string,
  currentUserId: string
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };
  if (id === currentUserId) return { error: "자기 자신을 비활성화할 수 없습니다." };

  const sb = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  // 마지막 활성 관리자 보호
  const { data: activeAdmins } = await q
    .from("admin_users")
    .select("id")
    .is("disabled_at", null);

  if (!activeAdmins || activeAdmins.length <= 1) {
    return { error: "최소 1명의 활성 관리자가 필요합니다." };
  }

  const { error } = await q
    .from("admin_users")
    .update({ disabled_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/members");
  return {};
}

export async function enableAdminMember(id: string): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };

  const sb = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  const { error } = await q
    .from("admin_users")
    .update({ disabled_at: null })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/members");
  return {};
}

export async function resetAdminPassword(
  id: string,
  newPassword: string
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };
  if (newPassword.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };

  const sb = await createAdminClient();

  const { error } = await sb.auth.admin.updateUserById(id, { password: newPassword });

  if (error) return { error: (error as { message: string }).message };

  return {};
}

export async function deleteAdminMember(
  id: string,
  currentUserId: string
): Promise<{ error?: string }> {
  if (isDev()) return { error: "개발 모드에서는 지원되지 않습니다." };
  if (id === currentUserId) return { error: "자기 자신을 삭제할 수 없습니다." };

  const sb = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = sb as any;

  // 마지막 활성 관리자 보호
  const { data: activeAdmins } = await q
    .from("admin_users")
    .select("id")
    .is("disabled_at", null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isActive = activeAdmins?.some((a: any) => a.id === id);
  if (isActive && (!activeAdmins || activeAdmins.length <= 1)) {
    return { error: "최소 1명의 활성 관리자가 필요합니다." };
  }

  const { error } = await q.from("admin_users").delete().eq("id", id);

  if (error) return { error: (error as { message: string }).message };

  revalidatePath("/admin/members");
  return {};
}
