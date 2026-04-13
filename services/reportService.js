const supabase = require('../lib/supabase');

// 캠페인 리포트 조회: 누적 + 일별 + 소재/일별
async function getReport(campaignId) {
  const { data: logs, error } = await supabase
    .from('report_logs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('log_date', { ascending: true });

  if (error) throw error;

  // 소재 정보 조회
  const { data: creatives } = await supabase
    .from('creatives')
    .select('creative_id, video_title')
    .eq('campaign_id', campaignId);

  const creativeMap = {};
  (creatives || []).forEach(c => { creativeMap[c.creative_id] = c.video_title; });

  // (1) 누적 지표
  const summary = (logs || []).reduce(
    (acc, row) => ({
      total_video_impression: acc.total_video_impression + (row.video_impression || 0),
      total_completed_impression: acc.total_completed_impression + (row.completed_impression || 0),
      total_video_unique_users: acc.total_video_unique_users + (row.video_unique_users || 0),
      total_completed_unique_users: acc.total_completed_unique_users + (row.completed_unique_users || 0),
    }),
    {
      total_video_impression: 0,
      total_completed_impression: 0,
      total_video_unique_users: 0,
      total_completed_unique_users: 0,
    }
  );

  // (2) 일별 지표 (log_date 기준 GROUP BY)
  const dailyMap = {};
  (logs || []).forEach(row => {
    const d = row.log_date;
    if (!dailyMap[d]) {
      dailyMap[d] = {
        log_date: d,
        video_impression: 0,
        completed_impression: 0,
        video_unique_users: 0,
        completed_unique_users: 0,
      };
    }
    dailyMap[d].video_impression += row.video_impression || 0;
    dailyMap[d].completed_impression += row.completed_impression || 0;
    dailyMap[d].video_unique_users += row.video_unique_users || 0;
    dailyMap[d].completed_unique_users += row.completed_unique_users || 0;
  });
  const daily = Object.values(dailyMap).sort((a, b) => a.log_date.localeCompare(b.log_date));

  // (3) 소재/일별 지표
  const byCreative = (logs || []).map(row => ({
    creative_id: row.creative_id,
    video_title: creativeMap[row.creative_id] || row.creative_id,
    log_date: row.log_date,
    video_impression: row.video_impression || 0,
    completed_impression: row.completed_impression || 0,
    video_unique_users: row.video_unique_users || 0,
    completed_unique_users: row.completed_unique_users || 0,
  }));

  return { summary, daily, byCreative };
}

module.exports = { getReport };
