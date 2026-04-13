const supabase = require('../lib/supabase');

// 랜덤 ID 생성
function generateId(prefix) {
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now()}-${rand}`;
}

// 캠페인 상태 자동 갱신: active 소재가 있으면 normal, 없으면 paused
// inactive 상태는 어드민이 수동으로만 변경하므로 자동 갱신 대상 아님
async function checkAndUpdateCampaignStatus(campaignId) {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status')
    .eq('campaign_id', campaignId)
    .single();

  if (!campaign || campaign.status === 'inactive') return;

  const { data: activeCreatives } = await supabase
    .from('creatives')
    .select('creative_id')
    .eq('campaign_id', campaignId)
    .eq('status', 'active');

  const newStatus = (activeCreatives && activeCreatives.length > 0) ? 'normal' : 'paused';

  await supabase
    .from('campaigns')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('campaign_id', campaignId);
}

// 캠페인 통계 집계 업데이트
async function updateCampaignStats(campaignId) {
  const { data: logs } = await supabase
    .from('report_logs')
    .select('video_impression, completed_impression')
    .eq('campaign_id', campaignId);

  const totals = (logs || []).reduce(
    (acc, row) => ({
      video: acc.video + (row.video_impression || 0),
      completed: acc.completed + (row.completed_impression || 0),
    }),
    { video: 0, completed: 0 }
  );

  await supabase
    .from('campaigns')
    .update({
      total_video_impression: totals.video,
      total_completed_impression: totals.completed,
      updated_at: new Date().toISOString(),
    })
    .eq('campaign_id', campaignId);
}

// 전체 목록 조회
async function getAll({ status, search } = {}) {
  let query = supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`campaign_name.ilike.%${search}%,advertiser_name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  // 소재 수 추가
  const campaignIds = (data || []).map(c => c.campaign_id);
  let creativeCounts = {};
  if (campaignIds.length > 0) {
    const { data: creatives } = await supabase
      .from('creatives')
      .select('campaign_id')
      .in('campaign_id', campaignIds);
    (creatives || []).forEach(c => {
      creativeCounts[c.campaign_id] = (creativeCounts[c.campaign_id] || 0) + 1;
    });
  }

  return (data || []).map(c => ({ ...c, creative_count: creativeCounts[c.campaign_id] || 0 }));
}

// 단건 조회 (소재 포함)
async function getById(campaignId) {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('campaign_id', campaignId)
    .single();

  if (error || !campaign) return null;

  const { data: creatives } = await supabase
    .from('creatives')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  return { ...campaign, creatives: creatives || [] };
}

// 생성
async function create(data) {
  const campaign = {
    campaign_id: generateId('CAM'),
    campaign_name: data.campaign_name,
    advertiser_name: data.advertiser_name,
    budget: parseInt(data.budget) || 0,
    agency_name: data.agency_name || '',
    priority: parseInt(data.priority) || 1,
    start_date: data.start_date,
    end_date: data.end_date,
    target_impression: data.target_impression ? parseInt(data.target_impression) : null,
    gender_target: data.gender_target || '',
    age_target: data.age_target || '',
    daily_limit: data.daily_limit ? parseInt(data.daily_limit) : null,
    frequency: data.frequency || 'campaign_once',
    status: 'paused', // 생성 시 항상 paused
    total_completed_impression: 0,
    total_video_impression: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: created, error } = await supabase
    .from('campaigns')
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return created;
}

// 수정
async function update(campaignId, data) {
  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (data.campaign_name !== undefined) updates.campaign_name = data.campaign_name;
  if (data.advertiser_name !== undefined) updates.advertiser_name = data.advertiser_name;
  if (data.budget !== undefined) updates.budget = parseInt(data.budget) || 0;
  if (data.agency_name !== undefined) updates.agency_name = data.agency_name;
  if (data.priority !== undefined) updates.priority = parseInt(data.priority) || 1;
  if (data.start_date !== undefined) updates.start_date = data.start_date;
  if (data.end_date !== undefined) updates.end_date = data.end_date;
  if (data.target_impression !== undefined) updates.target_impression = data.target_impression ? parseInt(data.target_impression) : null;
  if (data.gender_target !== undefined) updates.gender_target = data.gender_target;
  if (data.age_target !== undefined) updates.age_target = data.age_target;
  if (data.daily_limit !== undefined) updates.daily_limit = data.daily_limit ? parseInt(data.daily_limit) : null;
  if (data.frequency !== undefined) updates.frequency = data.frequency;

  const { data: updated, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// 삭제 (소재 + 리포트 로그 CASCADE)
async function remove(campaignId) {
  // report_logs 삭제
  await supabase.from('report_logs').delete().eq('campaign_id', campaignId);
  // creatives 삭제 (DB FK CASCADE도 있지만 명시적으로)
  await supabase.from('creatives').delete().eq('campaign_id', campaignId);
  // campaign 삭제
  const { error } = await supabase.from('campaigns').delete().eq('campaign_id', campaignId);
  if (error) throw error;
}

// 상태 변경
async function changeStatus(campaignId, newStatus) {
  // normal로 변경 시 active 소재 필요
  if (newStatus === 'normal') {
    const { data: activeCreatives } = await supabase
      .from('creatives')
      .select('creative_id')
      .eq('campaign_id', campaignId)
      .eq('status', 'active');

    if (!activeCreatives || activeCreatives.length === 0) {
      const err = new Error('active 소재가 없으면 normal 상태로 변경할 수 없습니다.');
      err.code = 'BUSINESS_RULE_VIOLATION';
      throw err;
    }
  }

  const { data: updated, error } = await supabase
    .from('campaigns')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// 활성 캠페인 목록 (리포트용, inactive 제외)
async function getActive() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('campaign_id, campaign_name, status')
    .neq('status', 'inactive')
    .order('campaign_name');

  if (error) throw error;
  return data || [];
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  changeStatus,
  getActive,
  checkAndUpdateCampaignStatus,
  updateCampaignStats,
};
