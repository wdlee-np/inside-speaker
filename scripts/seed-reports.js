/**
 * 리포트 시드 데이터 생성 스크립트
 * 실행: node scripts/seed-reports.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLogId() {
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `LOG-${Date.now()}-${rand}`;
}

function getDatesInRange(start, end) {
  const dates = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  const today = new Date();
  const limitEnd = endDate < today ? endDate : today;

  const cur = new Date(startDate);
  while (cur <= limitEnd) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates.slice(0, 30); // 최대 30일
}

async function seed() {
  console.log('시드 데이터 생성 시작...');

  // 기존 report_logs 삭제
  await supabase.from('report_logs').delete().neq('log_id', 'none');
  console.log('기존 리포트 로그 삭제 완료');

  // 캠페인 조회
  const { data: campaigns, error: campErr } = await supabase
    .from('campaigns')
    .select('campaign_id, campaign_name, start_date, end_date');

  if (campErr) { console.error('캠페인 조회 실패:', campErr.message); process.exit(1); }
  if (!campaigns || campaigns.length === 0) {
    console.log('캠페인이 없습니다. 먼저 캠페인을 등록해주세요.');
    process.exit(0);
  }

  console.log(`${campaigns.length}개 캠페인 발견`);

  let totalLogs = 0;

  for (const campaign of campaigns) {
    // 소재 조회
    const { data: creatives } = await supabase
      .from('creatives')
      .select('creative_id')
      .eq('campaign_id', campaign.campaign_id);

    if (!creatives || creatives.length === 0) {
      console.log(`  [${campaign.campaign_name}] 소재 없음, 스킵`);
      continue;
    }

    const dates = getDatesInRange(campaign.start_date, campaign.end_date);
    if (dates.length === 0) {
      console.log(`  [${campaign.campaign_name}] 유효한 날짜 범위 없음, 스킵`);
      continue;
    }

    const logs = [];
    for (const date of dates) {
      for (const creative of creatives) {
        const videoImp = randInt(500, 5000);
        const completedImp = Math.floor(videoImp * (randInt(40, 90) / 100));
        const videoUniq = Math.floor(videoImp * (randInt(60, 90) / 100));
        const completedUniq = Math.floor(completedImp * (randInt(70, 95) / 100));

        logs.push({
          log_id: generateLogId(),
          campaign_id: campaign.campaign_id,
          creative_id: creative.creative_id,
          log_date: date,
          video_impression: videoImp,
          completed_impression: completedImp,
          video_unique_users: videoUniq,
          completed_unique_users: completedUniq,
        });
      }
    }

    // 배치 INSERT (100개씩)
    for (let i = 0; i < logs.length; i += 100) {
      const batch = logs.slice(i, i + 100);
      const { error } = await supabase.from('report_logs').insert(batch);
      if (error) console.error('  INSERT 오류:', error.message);
      else totalLogs += batch.length;
      // log_id 중복 방지를 위한 짧은 대기
      await new Promise(r => setTimeout(r, 10));
    }

    // 캠페인 통계 업데이트
    const totalVideo = logs.reduce((s, r) => s + r.video_impression, 0);
    const totalCompleted = logs.reduce((s, r) => s + r.completed_impression, 0);
    await supabase
      .from('campaigns')
      .update({ total_video_impression: totalVideo, total_completed_impression: totalCompleted })
      .eq('campaign_id', campaign.campaign_id);

    console.log(`  [${campaign.campaign_name}] ${logs.length}개 로그 생성 (${dates.length}일 × ${creatives.length}소재)`);
  }

  console.log(`\n시드 완료: 총 ${totalLogs}개 로그 생성`);
  process.exit(0);
}

seed().catch(e => { console.error('오류:', e.message); process.exit(1); });
