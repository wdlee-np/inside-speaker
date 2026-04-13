// ===== 캠페인 목록 =====
async function renderCampaigns(filterStatus = 'all', searchQuery = '') {
  const app = document.getElementById('app');

  let url = '/api/campaigns?';
  if (filterStatus && filterStatus !== 'all') url += `status=${filterStatus}&`;
  if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

  let campaigns = [];
  try {
    campaigns = await apiGet(url) || [];
  } catch (e) {
    app.innerHTML = `<div class="form-error">데이터 로드 실패: ${e.message}</div>`;
    return;
  }

  const statusLabel = { normal: '정상', paused: '일시정지', inactive: '비활성' };

  app.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">PPL 캠페인 관리</h1>
      <a href="#campaigns/new" class="btn btn-primary">+ 캠페인 등록</a>
    </div>

    <div class="filter-bar">
      <select id="status-filter" onchange="applyFilter()">
        <option value="all" ${filterStatus==='all'?'selected':''}>전체 상태</option>
        <option value="normal" ${filterStatus==='normal'?'selected':''}>정상</option>
        <option value="paused" ${filterStatus==='paused'?'selected':''}>일시정지</option>
        <option value="inactive" ${filterStatus==='inactive'?'selected':''}>비활성</option>
      </select>
      <input type="text" id="search-input" placeholder="캠페인명 또는 광고주 검색"
        value="${searchQuery}" onkeydown="if(event.key==='Enter') applyFilter()">
      <button class="btn btn-secondary" onclick="applyFilter()">검색</button>
    </div>

    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>캠페인 ID</th>
            <th>캠페인명</th>
            <th>광고주</th>
            <th>상태</th>
            <th>우선순위</th>
            <th>시작일</th>
            <th>종료일</th>
            <th>완료 노출수</th>
            <th>영상 노출수</th>
            <th>소재수</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          ${campaigns.length === 0
            ? `<tr><td colspan="11" class="table-empty">등록된 캠페인이 없습니다.</td></tr>`
            : campaigns.map(c => `
              <tr>
                <td><small>${c.campaign_id}</small></td>
                <td><strong>${escHtml(c.campaign_name)}</strong></td>
                <td>${escHtml(c.advertiser_name)}</td>
                <td><span class="badge badge-${c.status}">${statusLabel[c.status] || c.status}</span></td>
                <td>${c.priority}</td>
                <td>${c.start_date}</td>
                <td>${c.end_date}</td>
                <td>${(c.total_completed_impression||0).toLocaleString()}</td>
                <td>${(c.total_video_impression||0).toLocaleString()}</td>
                <td>${c.creative_count || 0}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <a href="#campaigns/${c.campaign_id}/edit" class="btn btn-secondary btn-sm">수정</a>
                    <button class="btn btn-danger btn-sm" onclick="deleteCampaign('${c.campaign_id}', '${escHtml(c.campaign_name)}')">삭제</button>
                  </div>
                </td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
  `;
}

function applyFilter() {
  const status = document.getElementById('status-filter')?.value || 'all';
  const search = document.getElementById('search-input')?.value || '';
  renderCampaigns(status, search);
}

async function deleteCampaign(id, name) {
  if (!confirm(`"${name}" 캠페인을 삭제하시겠습니까?\n관련 소재와 리포트 데이터도 모두 삭제됩니다.`)) return;
  try {
    await apiDelete(`/api/campaigns/${id}`);
    showToast('캠페인이 삭제되었습니다.');
    await renderCampaigns();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ===== 캠페인 등록/수정 폼 =====
async function renderCampaignForm(campaignId) {
  const app = document.getElementById('app');
  const isEdit = !!campaignId;
  let campaign = null;
  let creatives = [];

  if (isEdit) {
    try {
      campaign = await apiGet(`/api/campaigns/${campaignId}`);
      creatives = campaign.creatives || [];
    } catch (e) {
      app.innerHTML = `<div class="form-error">캠페인 로드 실패: ${e.message}</div>`;
      return;
    }
  }

  const c = campaign || {};
  const today = new Date().toISOString().split('T')[0];

  app.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${isEdit ? '캠페인 수정' : '캠페인 등록'}</h1>
      <a href="#campaigns" class="btn btn-secondary">← 목록으로</a>
    </div>

    <div class="form-container">
      <form id="campaign-form">
        <!-- (1) 메타 정보 -->
        <div class="form-section">
          <div class="form-section-title">(1) 기본 정보</div>
          <div class="form-group">
            <label>캠페인명 <span class="required">*</span></label>
            <input type="text" id="f-name" maxlength="50" value="${escHtml(c.campaign_name||'')}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>광고주명 <span class="required">*</span></label>
              <input type="text" id="f-advertiser" maxlength="50" value="${escHtml(c.advertiser_name||'')}" required>
            </div>
            <div class="form-group">
              <label>대행사명</label>
              <input type="text" id="f-agency" maxlength="50" value="${escHtml(c.agency_name||'')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>광고비 <span class="required">*</span></label>
              <input type="number" id="f-budget" min="0" value="${c.budget||0}" required>
            </div>
            <div class="form-group">
              <label>우선순위 (1~5)</label>
              <input type="number" id="f-priority" min="1" max="5" value="${c.priority||1}">
            </div>
          </div>
        </div>

        <!-- (2) 타겟팅 -->
        <div class="form-section">
          <div class="form-section-title">(2) 타겟팅</div>
          <div class="form-row">
            <div class="form-group">
              <label>시작일 <span class="required">*</span></label>
              <input type="date" id="f-start" value="${c.start_date||today}" required>
            </div>
            <div class="form-group">
              <label>종료일 <span class="required">*</span></label>
              <input type="date" id="f-end" value="${c.end_date||today}" required>
            </div>
          </div>
          <div class="form-group">
            <label>목표 노출수</label>
            <input type="number" id="f-target-imp" min="1" value="${c.target_impression||''}" placeholder="빈칸 = 무제한">
            <div class="form-hint">빈칸으로 두면 무제한입니다.</div>
          </div>
          <div class="form-group">
            <label>성별 타겟팅</label>
            <select id="f-gender">
              <option value="" ${!c.gender_target?'selected':''}>전체</option>
              <option value="male" ${c.gender_target==='male'?'selected':''}>남성</option>
              <option value="female" ${c.gender_target==='female'?'selected':''}>여성</option>
            </select>
          </div>
          <div class="form-group">
            <label>나이 타겟팅</label>
            <input type="text" id="f-age" value="${escHtml(c.age_target||'')}" placeholder="예: 20-30">
          </div>
        </div>

        <!-- (3) 전략 설정 -->
        <div class="form-section">
          <div class="form-section-title">(3) 전략 설정</div>
          <div class="form-group">
            <label>일 노출 제한</label>
            <input type="number" id="f-daily" min="1" value="${c.daily_limit||''}" placeholder="빈칸 = 무제한">
          </div>
          <div class="form-group">
            <label>게재빈도</label>
            <select id="f-frequency">
              <option value="campaign_once" ${(c.frequency||'campaign_once')==='campaign_once'?'selected':''}>캠페인 당 1회</option>
              <option value="creative_once" ${c.frequency==='creative_once'?'selected':''}>소재 당 1회</option>
              <option value="daily_once" ${c.frequency==='daily_once'?'selected':''}>하루 1회</option>
            </select>
          </div>
        </div>

        ${isEdit ? `
        <!-- (4) 상태 관리 -->
        <div class="form-section">
          <div class="form-section-title">(4) 상태 관리</div>
          <div class="form-group">
            <label>현재 상태: <span class="badge badge-${c.status}">${{normal:'정상',paused:'일시정지',inactive:'비활성'}[c.status]||c.status}</span></label>
          </div>
          <div class="form-group">
            <label>상태 변경</label>
            <select id="f-status">
              <option value="normal" ${c.status==='normal'?'selected':''}>정상</option>
              <option value="paused" ${c.status==='paused'?'selected':''}>일시정지</option>
              <option value="inactive" ${c.status==='inactive'?'selected':''}>비활성</option>
            </select>
            <div class="form-hint">normal로 변경하려면 active 소재가 1개 이상 필요합니다.</div>
          </div>
        </div>

        <!-- (5) 소재 관리 -->
        <div class="form-section">
          <div class="form-section-title">(5) 소재 관리 <small style="font-weight:normal;color:#64748b;">(${creatives.length}/10)</small></div>
          <div id="creatives-list">
            ${renderCreativesList(creatives, campaignId)}
          </div>
          <button type="button" class="add-creative-btn" id="add-creative-btn"
            onclick="openCreativeModal('${campaignId}', null)"
            ${creatives.length >= 10 ? 'disabled' : ''}>
            + 소재 추가 ${creatives.length >= 10 ? '(최대 10개)' : ''}
          </button>
        </div>
        ` : ''}

        <div id="campaign-form-error" class="form-error" style="display:none;"></div>

        <div class="form-actions">
          <a href="#campaigns" class="btn btn-secondary">취소</a>
          <button type="submit" class="btn btn-primary" id="campaign-submit-btn">
            ${isEdit ? '수정 저장' : '캠페인 등록'}
          </button>
        </div>
      </form>
    </div>
  `;

  // 폼 제출 이벤트
  document.getElementById('campaign-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitCampaignForm(campaignId, isEdit);
  });
}

function renderCreativesList(creatives, campaignId) {
  if (creatives.length === 0) {
    return '<p style="color:#94a3b8;padding:12px 0;">등록된 소재가 없습니다.</p>';
  }
  return creatives.map(cr => `
    <div class="creative-item" id="creative-item-${cr.creative_id}">
      <div class="creative-item-info">
        <span class="badge badge-${cr.status}">${cr.status === 'active' ? '활성' : '비활성'}</span>
        <span>${escHtml(cr.video_title)}</span>
      </div>
      <div class="creative-item-actions">
        <button type="button" class="btn btn-secondary btn-sm" onclick="openCreativeModal('${campaignId}', '${cr.creative_id}')">수정</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteCreative('${cr.creative_id}', '${campaignId}', '${escHtml(cr.video_title)}')">삭제</button>
      </div>
    </div>
  `).join('');
}

async function submitCampaignForm(campaignId, isEdit) {
  const errorEl = document.getElementById('campaign-form-error');
  const submitBtn = document.getElementById('campaign-submit-btn');
  errorEl.style.display = 'none';

  const startDate = document.getElementById('f-start').value;
  const endDate = document.getElementById('f-end').value;
  if (endDate < startDate) {
    errorEl.textContent = '종료일은 시작일 이후여야 합니다.';
    errorEl.style.display = 'block';
    return;
  }

  const payload = {
    campaign_name: document.getElementById('f-name').value.trim(),
    advertiser_name: document.getElementById('f-advertiser').value.trim(),
    budget: document.getElementById('f-budget').value,
    agency_name: document.getElementById('f-agency').value.trim(),
    priority: document.getElementById('f-priority').value,
    start_date: startDate,
    end_date: endDate,
    target_impression: document.getElementById('f-target-imp').value || null,
    gender_target: document.getElementById('f-gender').value,
    age_target: document.getElementById('f-age').value.trim(),
    daily_limit: document.getElementById('f-daily').value || null,
    frequency: document.getElementById('f-frequency').value,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중...';

  try {
    if (isEdit) {
      // 캠페인 기본 정보 수정
      await apiPut(`/api/campaigns/${campaignId}`, payload);
      // 상태 변경 (별도)
      const newStatus = document.getElementById('f-status')?.value;
      if (newStatus) {
        try {
          await apiPatch(`/api/campaigns/${campaignId}/status`, { status: newStatus });
        } catch (se) {
          showToast(`상태 변경 실패: ${se.message}`, 'error');
        }
      }
      showToast('캠페인이 수정되었습니다.');
    } else {
      await apiPost('/api/campaigns', payload);
      showToast('캠페인이 등록되었습니다.');
    }
    location.hash = '#campaigns';
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = isEdit ? '수정 저장' : '캠페인 등록';
  }
}

// ===== 소재 모달 =====
async function openCreativeModal(campaignId, creativeId) {
  const modal = document.getElementById('creative-modal');
  const title = document.getElementById('modal-title');
  const errEl = document.getElementById('creative-modal-error');
  errEl.style.display = 'none';
  // 미리보기 초기화
  const previewEl = document.getElementById('mux-preview');
  const videoEl = document.getElementById('mux-preview-video');
  if (previewEl) previewEl.style.display = 'none';
  if (videoEl) { videoEl.pause(); videoEl.src = ''; }

  document.getElementById('creative-campaign-id').value = campaignId;
  document.getElementById('creative-id').value = creativeId || '';

  if (creativeId) {
    title.textContent = '소재 수정';
    try {
      const cr = await apiGet(`/api/creatives/${creativeId}`);
      document.getElementById('c-video-title').value = cr.video_title || '';
      document.getElementById('c-mux-id').value = cr.mux_playback_id || '';
      document.getElementById('c-tags').value = cr.tags || '';
      document.getElementById('c-quiz-question').value = cr.quiz_question || '';
      document.getElementById('c-quiz-answer').value = cr.quiz_answer || '';
      document.getElementById('c-quiz-wrong').value = (cr.quiz_wrong_answers || '').replace(/\|/g, '\n');
      document.getElementById('c-status').value = cr.status || 'active';
    } catch (e) {
      showToast('소재 로드 실패: ' + e.message, 'error');
      return;
    }
  } else {
    title.textContent = '소재 추가';
    document.getElementById('creative-form').reset();
    document.getElementById('c-status').value = 'active';
  }

  modal.style.display = 'flex';
}

function closeCreativeModal() {
  document.getElementById('creative-modal').style.display = 'none';
  // 미리보기 초기화
  const previewEl = document.getElementById('mux-preview');
  const videoEl = document.getElementById('mux-preview-video');
  if (previewEl) previewEl.style.display = 'none';
  if (videoEl) { videoEl.pause(); videoEl.src = ''; }
}

function previewMuxVideo() {
  const muxId = document.getElementById('c-mux-id').value.trim();
  const previewEl = document.getElementById('mux-preview');
  const videoEl = document.getElementById('mux-preview-video');
  const hintEl = document.getElementById('mux-preview-hint');

  if (!muxId) {
    showToast('Mux Playback ID를 먼저 입력해주세요.', 'error');
    return;
  }

  // Mux는 HLS(.m3u8) 스트림을 제공하지만 브라우저 기본 video 태그로는
  // Safari(iOS/macOS)만 HLS를 직접 재생 가능합니다.
  // 크로스 브라우저를 위해 MP4 low 버전 URL을 시도하고,
  // 썸네일 링크로 fallback 안내를 제공합니다.
  const mp4Url = `https://stream.mux.com/${muxId}/low.mp4`;
  const thumbUrl = `https://image.mux.com/${muxId}/thumbnail.png?time=1`;
  const streamUrl = `https://stream.mux.com/${muxId}.m3u8`;

  videoEl.src = mp4Url;
  videoEl.load();
  previewEl.style.display = 'block';
  hintEl.innerHTML = `썸네일: <a href="${thumbUrl}" target="_blank">${thumbUrl}</a> &nbsp;|&nbsp; HLS: <a href="${streamUrl}" target="_blank">${streamUrl}</a>`;
}

// 소재 폼 제출
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('creative-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('creative-modal-error');
    const submitBtn = document.getElementById('creative-submit-btn');
    errEl.style.display = 'none';

    const campaignId = document.getElementById('creative-campaign-id').value;
    const creativeId = document.getElementById('creative-id').value;

    const wrongAnswers = document.getElementById('c-quiz-wrong').value
      .split('\n').map(s => s.trim()).filter(Boolean).join('|');

    const payload = {
      video_title: document.getElementById('c-video-title').value.trim(),
      mux_playback_id: document.getElementById('c-mux-id').value.trim(),
      tags: document.getElementById('c-tags').value.trim(),
      quiz_question: document.getElementById('c-quiz-question').value.trim(),
      quiz_answer: document.getElementById('c-quiz-answer').value.trim(),
      quiz_wrong_answers: wrongAnswers,
      status: document.getElementById('c-status').value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
      if (creativeId) {
        await apiPut(`/api/creatives/${creativeId}`, payload);
        showToast('소재가 수정되었습니다.');
      } else {
        await apiPost(`/api/campaigns/${campaignId}/creatives`, payload);
        showToast('소재가 추가되었습니다.');
      }
      closeCreativeModal();
      // 소재 목록 새로고침
      await refreshCreativesList(campaignId);
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '저장';
    }
  });
});

async function refreshCreativesList(campaignId) {
  try {
    const campaign = await apiGet(`/api/campaigns/${campaignId}`);
    const creatives = campaign.creatives || [];
    const listEl = document.getElementById('creatives-list');
    if (listEl) listEl.innerHTML = renderCreativesList(creatives, campaignId);
    const addBtn = document.getElementById('add-creative-btn');
    if (addBtn) {
      addBtn.disabled = creatives.length >= 10;
      addBtn.textContent = `+ 소재 추가 ${creatives.length >= 10 ? '(최대 10개)' : ''}`;
    }
    // 소재수 헤더 갱신
    const sectionTitle = document.querySelector('.form-section-title small');
    if (sectionTitle) sectionTitle.textContent = `(${creatives.length}/10)`;
  } catch (e) {
    showToast('소재 목록 갱신 실패', 'error');
  }
}

async function deleteCreative(creativeId, campaignId, title) {
  if (!confirm(`"${title}" 소재를 삭제하시겠습니까?`)) return;
  try {
    await apiDelete(`/api/creatives/${creativeId}`);
    showToast('소재가 삭제되었습니다.');
    await refreshCreativesList(campaignId);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// XSS 방지 유틸
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
