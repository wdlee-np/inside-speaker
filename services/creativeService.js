const supabase = require('../lib/supabase');
const { checkAndUpdateCampaignStatus } = require('./campaignService');

function generateId() {
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `CRE-${Date.now()}-${rand}`;
}

// 캠페인 소재 목록
async function getByCampaign(campaignId) {
  const { data, error } = await supabase
    .from('creatives')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// 소재 단건 조회
async function getById(creativeId) {
  const { data, error } = await supabase
    .from('creatives')
    .select('*')
    .eq('creative_id', creativeId)
    .single();

  if (error || !data) return null;
  return data;
}

// 소재 생성
async function create(campaignId, data) {
  // 최대 10개 검증
  const { data: existing } = await supabase
    .from('creatives')
    .select('creative_id')
    .eq('campaign_id', campaignId);

  if (existing && existing.length >= 10) {
    const err = new Error('소재는 캠페인당 최대 10개까지 등록 가능합니다.');
    err.code = 'MAX_LIMIT_EXCEEDED';
    throw err;
  }

  const creative = {
    creative_id: generateId(),
    campaign_id: campaignId,
    video_title: data.video_title,
    mux_playback_id: data.mux_playback_id,
    tags: data.tags || '',
    quiz_question: data.quiz_question || '',
    quiz_answer: data.quiz_answer || '',
    quiz_wrong_answers: data.quiz_wrong_answers || '',
    status: data.status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: created, error } = await supabase
    .from('creatives')
    .insert([creative])
    .select()
    .single();

  if (error) throw error;

  // 캠페인 상태 자동 갱신
  await checkAndUpdateCampaignStatus(campaignId);

  return created;
}

// 소재 수정
async function update(creativeId, data) {
  const updates = { updated_at: new Date().toISOString() };

  if (data.video_title !== undefined) updates.video_title = data.video_title;
  if (data.mux_playback_id !== undefined) updates.mux_playback_id = data.mux_playback_id;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.quiz_question !== undefined) updates.quiz_question = data.quiz_question;
  if (data.quiz_answer !== undefined) updates.quiz_answer = data.quiz_answer;
  if (data.quiz_wrong_answers !== undefined) updates.quiz_wrong_answers = data.quiz_wrong_answers;
  if (data.status !== undefined) updates.status = data.status;

  const { data: updated, error } = await supabase
    .from('creatives')
    .update(updates)
    .eq('creative_id', creativeId)
    .select()
    .single();

  if (error) throw error;

  // 캠페인 상태 자동 갱신
  await checkAndUpdateCampaignStatus(updated.campaign_id);

  return updated;
}

// 소재 삭제
async function remove(creativeId) {
  // 소재 정보 먼저 조회 (캠페인ID 필요)
  const { data: creative } = await supabase
    .from('creatives')
    .select('campaign_id')
    .eq('creative_id', creativeId)
    .single();

  if (!creative) {
    const err = new Error('소재를 찾을 수 없습니다.');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const campaignId = creative.campaign_id;

  // 관련 report_logs 삭제
  await supabase.from('report_logs').delete().eq('creative_id', creativeId);

  // 소재 삭제
  const { error } = await supabase.from('creatives').delete().eq('creative_id', creativeId);
  if (error) throw error;

  // 캠페인 상태 자동 갱신
  await checkAndUpdateCampaignStatus(campaignId);
}

module.exports = { getByCampaign, getById, create, update, remove };
