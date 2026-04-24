/**
 * DB 시드 스크립트
 * 사용법: npx tsx scripts/seed.ts
 * 실행 전 .env.local에 Supabase 환경변수 필요
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { SEED_SPEAKERS } from "../src/lib/seed-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("시드 시작...");

  for (const speaker of SEED_SPEAKERS) {
    const { videos, reviews, careers, subcategory_ids, ...speakerRow } = speaker;

    const { error: spErr } = await supabase
      .from("speakers")
      .upsert(speakerRow, { onConflict: "id" });
    if (spErr) { console.error(`강사 upsert 실패 [${speaker.id}]:`, spErr.message); continue; }

    await supabase.from("speaker_subcategories").delete().eq("speaker_id", speaker.id);
    for (const subId of subcategory_ids) {
      await supabase.from("speaker_subcategories").insert({ speaker_id: speaker.id, subcategory_id: subId });
    }

    await supabase.from("speaker_videos").delete().eq("speaker_id", speaker.id);
    for (let i = 0; i < videos.length; i++) {
      await supabase.from("speaker_videos").insert({ ...videos[i], speaker_id: speaker.id, sort_order: i });
    }

    await supabase.from("speaker_reviews").delete().eq("speaker_id", speaker.id);
    for (let i = 0; i < reviews.length; i++) {
      await supabase.from("speaker_reviews").insert({ ...reviews[i], speaker_id: speaker.id, sort_order: i });
    }

    await supabase.from("speaker_careers").delete().eq("speaker_id", speaker.id);
    for (let i = 0; i < careers.length; i++) {
      await supabase.from("speaker_careers").insert({ ...careers[i], speaker_id: speaker.id, sort_order: i });
    }

    console.log(`  ✓ ${speaker.name} (${speaker.id})`);
  }

  console.log("시드 완료.");
}

seed().catch((e) => { console.error(e); process.exit(1); });
