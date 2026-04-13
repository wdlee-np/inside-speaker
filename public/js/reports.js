// ===== 리포트 화면 =====
async function renderReports() {
  const app = document.getElementById('app');

  let campaigns = [];
  try {
    campaigns = await apiGet('/api/campaigns/active') || [];
  } catch (e) {
    app.innerHTML = `<div class="form-error">캠페인 로드 실패: ${e.message}</div>`;
    return;
  }

  app.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">PPL 캠페인 리포트</h1>
    </div>

    <div class="report-select-section">
      <label style="font-weight:600;margin-bottom:8px;display:block;">캠페인 선택</label>
      <select id="report-campaign-select" onchange="loadReport(this.value)">
        <option value="">-- 캠페인을 선택하세요 --</option>
        ${campaigns.map(c => { const statusLabel = { normal: '정상', paused: '일시정지', inactive: '비활성' }; return `<option value="${c.campaign_id}">${escHtml(c.campaign_name)} [${statusLabel[c.status] || c.status}]</option>`; }).join('')}
      </select>
    </div>

    <div id="report-content">
      <div class="report-empty">캠페인을 선택하면 리포트가 표시됩니다.</div>
    </div>
  `;
}

async function loadReport(campaignId) {
  const reportContent = document.getElementById('report-content');
  if (!campaignId) {
    reportContent.innerHTML = '<div class="report-empty">캠페인을 선택하면 리포트가 표시됩니다.</div>';
    return;
  }

  reportContent.innerHTML = '<div class="loading-spinner">리포트 로딩 중...</div>';

  try {
    const report = await apiGet(`/api/reports/campaigns/${campaignId}`);
    const { summary, daily, byCreative } = report;

    if (daily.length === 0) {
      reportContent.innerHTML = '<div class="report-empty">해당 캠페인의 리포트 데이터가 없습니다.<br><small>seed-reports 스크립트를 실행하면 데모 데이터가 생성됩니다.</small></div>';
      return;
    }

    reportContent.innerHTML = `
      <!-- (1) 누적 지표 - 항상 상단 고정 -->
      <div class="report-section">
        <div class="report-section-title">누적 지표</div>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-card-label">완료 노출수</div>
            <div class="summary-card-value">${summary.total_completed_impression.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label">영상 노출수</div>
            <div class="summary-card-value">${summary.total_video_impression.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label">완료 노출 고객수</div>
            <div class="summary-card-value">${summary.total_completed_unique_users.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label">영상 노출 고객수</div>
            <div class="summary-card-value">${summary.total_video_unique_users.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- (2) 탭 전환 영역 -->
      <div class="report-tabs-container">
        <div class="report-tabs">
          <button class="report-tab active" onclick="switchReportTab('daily', this)">일별 지표</button>
          <button class="report-tab" onclick="switchReportTab('creative', this)">소재/일별 지표</button>
        </div>

        <!-- 일별 지표 탭 -->
        <div id="tab-daily" class="report-tab-panel">
          <div class="report-tab-header">
            <span></span>
            <button class="btn btn-sm btn-secondary" onclick="downloadReportCsv('daily')">CSV 다운로드</button>
          </div>
          <div class="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>완료 노출수</th>
                  <th>영상 노출수</th>
                  <th>완료 고객수</th>
                  <th>영상 고객수</th>
                </tr>
              </thead>
              <tbody>
                ${daily.map(row => `
                  <tr>
                    <td>${row.log_date}</td>
                    <td>${row.completed_impression.toLocaleString()}</td>
                    <td>${row.video_impression.toLocaleString()}</td>
                    <td>${row.completed_unique_users.toLocaleString()}</td>
                    <td>${row.video_unique_users.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 소재/일별 지표 탭 -->
        <div id="tab-creative" class="report-tab-panel" style="display:none;">
          <div class="report-tab-header">
            <span></span>
            <button class="btn btn-sm btn-secondary" onclick="downloadReportCsv('creative')">CSV 다운로드</button>
          </div>
          <div class="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>영상 제목</th>
                  <th>날짜</th>
                  <th>완료 노출수</th>
                  <th>영상 노출수</th>
                  <th>완료 고객수</th>
                  <th>영상 고객수</th>
                </tr>
              </thead>
              <tbody>
                ${byCreative.map(row => `
                  <tr>
                    <td>${escHtml(row.video_title)}</td>
                    <td>${row.log_date}</td>
                    <td>${row.completed_impression.toLocaleString()}</td>
                    <td>${row.video_impression.toLocaleString()}</td>
                    <td>${row.completed_unique_users.toLocaleString()}</td>
                    <td>${row.video_unique_users.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // 리포트 데이터를 전역 변수에 저장 (CSV 다운로드용)
    window._reportData = { daily, byCreative, campaignId };
  } catch (e) {
    reportContent.innerHTML = `<div class="form-error">리포트 로드 실패: ${e.message}</div>`;
  }
}

function switchReportTab(tabName, btnEl) {
  // 탭 버튼 활성화 전환
  document.querySelectorAll('.report-tab').forEach(btn => btn.classList.remove('active'));
  btnEl.classList.add('active');

  // 패널 표시 전환
  document.getElementById('tab-daily').style.display = tabName === 'daily' ? '' : 'none';
  document.getElementById('tab-creative').style.display = tabName === 'creative' ? '' : 'none';
}

function downloadReportCsv(type) {
  if (!window._reportData) return;

  const { daily, byCreative, campaignId } = window._reportData;
  let csvRows = [];
  let filename = '';

  if (type === 'daily') {
    csvRows.push(['날짜', '완료 노출수', '영상 노출수', '완료 고객수', '영상 고객수']);
    daily.forEach(row => {
      csvRows.push([row.log_date, row.completed_impression, row.video_impression, row.completed_unique_users, row.video_unique_users]);
    });
    filename = `report_daily_${campaignId}.csv`;
  } else {
    csvRows.push(['영상 제목', '날짜', '완료 노출수', '영상 노출수', '완료 고객수', '영상 고객수']);
    byCreative.forEach(row => {
      csvRows.push([row.video_title, row.log_date, row.completed_impression, row.video_impression, row.completed_unique_users, row.video_unique_users]);
    });
    filename = `report_creative_${campaignId}.csv`;
  }

  // BOM 추가 (Excel 한글 깨짐 방지)
  const bom = '\uFEFF';
  const csvContent = bom + csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
