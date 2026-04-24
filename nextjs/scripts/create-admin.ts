/**
 * 어드민 계정 생성 스크립트
 * 사용법: npx tsx scripts/create-admin.ts
 * 실행 전 .env.local에 SUPABASE_SERVICE_ROLE_KEY 설정 필요
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = process.argv[2] ?? "admin@insidecompany.co.kr";
const PASSWORD = process.argv[3];

if (!PASSWORD) {
  console.error("사용법: npx tsx scripts/create-admin.ts <email> <password>");
  console.error("비밀번호 조건: 최소 12자, 영문 대소문자/숫자/특수문자 혼합");
  process.exit(1);
}

if (PASSWORD.length < 12) {
  console.error("비밀번호는 최소 12자 이상이어야 합니다.");
  process.exit(1);
}

async function createAdmin() {
  const { data: userData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });

  if (createError) {
    console.error("auth.users 생성 실패:", createError.message);
    process.exit(1);
  }

  const userId = userData.user.id;

  const { error: insertError } = await supabaseAdmin
    .from("admin_users")
    .insert({ id: userId, display_name: "관리자", role: "owner" });

  if (insertError) {
    console.error("admin_users 삽입 실패:", insertError.message);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log(`어드민 계정 생성 완료`);
  console.log(`  이메일: ${EMAIL}`);
  console.log(`  UUID:  ${userId}`);
  console.log(`  역할:  owner`);
}

createAdmin().catch((e) => {
  console.error("예기치 않은 오류:", e);
  process.exit(1);
});
