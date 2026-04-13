import { test, expect, Page } from '@playwright/test';

// 테스트용 캠페인 데이터
const testCampaign = {
  name: `E2E테스트캠페인_${Date.now()}`,
  advertiser: 'E2E광고주',
  budget: '1000000',
};

// 생성된 테스트 캠페인 ID 추적
let createdCampaignId = '';

// API 헬퍼 (테스트 데이터 생성/정리)
async function createTestCampaign(page: Page): Promise<string> {
  const res = await page.request.post('/api/campaigns', {
    data: {
      campaign_name: testCampaign.name,
      advertiser_name: testCampaign.advertiser,
      budget: 1000000,
      priority: 1,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      frequency: 'campaign_once',
    },
  });
  const json = await res.json();
  return json.data?.campaign_id || '';
}

async function deleteTestCampaign(page: Page, id: string) {
  if (id) {
    await page.request.delete(`/api/campaigns/${id}`);
  }
}

// ===== 테스트 1: 홈 접속 및 네비게이션 =====
test('1. 홈 접속 시 네비게이션 메뉴 2개 확인', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PPL 광고 관리/);
  await expect(page.locator('a[data-page="campaigns"]')).toBeVisible();
  await expect(page.locator('a[data-page="reports"]')).toBeVisible();
  await expect(page.locator('a[data-page="campaigns"]')).toContainText('캠페인 관리');
  await expect(page.locator('a[data-page="reports"]')).toContainText('캠페인 리포트');
  await page.screenshot({ path: 'test-01-home.png' });
});

// ===== 테스트 2: 캠페인 관리 메뉴 접속 =====
test('2. 캠페인 관리 메뉴 클릭 시 목록 화면 로드', async ({ page }) => {
  await page.goto('/#campaigns');
  await page.waitForSelector('.page-title');
  await expect(page.locator('.page-title')).toContainText('PPL 캠페인 관리');
  await expect(page.locator('a[href="#campaigns/new"]')).toBeVisible();
  await page.screenshot({ path: 'test-02-campaign-list.png' });
});

// ===== 테스트 3: 캠페인 등록 =====
test('3. 캠페인 등록 폼 작성 및 제출', async ({ page }) => {
  const campaignName = `E2E등록테스트_${Date.now()}`;

  await page.goto('/#campaigns/new');
  await page.waitForSelector('#campaign-form');

  await page.fill('#f-name', campaignName);
  await page.fill('#f-advertiser', 'E2E광고주');
  await page.fill('#f-budget', '500000');
  await page.fill('#f-priority', '3');
  await page.fill('#f-start', '2025-01-01');
  await page.fill('#f-end', '2025-06-30');

  await page.screenshot({ path: 'test-03-campaign-form.png' });
  await page.click('#campaign-submit-btn');

  // 목록으로 이동 확인
  await page.waitForURL('**/#campaigns');
  await expect(page.locator('text=' + campaignName)).toBeVisible();
  await page.screenshot({ path: 'test-03-campaign-created.png' });

  // 정리: 생성된 캠페인 찾아 ID 저장
  const res = await page.request.get(`/api/campaigns?search=${encodeURIComponent(campaignName)}`);
  const json = await res.json();
  if (json.data?.[0]) {
    await deleteTestCampaign(page, json.data[0].campaign_id);
  }
});

// ===== 테스트 4: 소재 추가 및 캠페인 상태 자동 변경 =====
test('4. 소재 추가 시 캠페인 상태 paused → normal 자동 전환', async ({ page }) => {
  const campaignId = await createTestCampaign(page);
  createdCampaignId = campaignId;

  // 수정 폼으로 이동
  await page.goto(`/#campaigns/${campaignId}/edit`);
  await page.waitForSelector('#campaign-form');

  // 초기 상태 paused 확인
  await expect(page.locator('.badge-paused')).toBeVisible();
  await page.screenshot({ path: 'test-04-before-creative.png' });

  // 소재 추가 버튼 클릭
  await page.click('#add-creative-btn');
  await page.waitForSelector('#creative-modal', { state: 'visible' });

  await page.fill('#c-video-title', 'E2E테스트소재');
  await page.fill('#c-mux-id', 'test-mux-id-001');
  await page.fill('#c-quiz-question', 'E2E 퀴즈 문제입니까?');
  await page.fill('#c-quiz-answer', '예');
  await page.fill('#c-quiz-wrong', '아니오\n모름');

  await page.click('#creative-submit-btn');
  await page.waitForSelector('#creative-modal', { state: 'hidden' });

  // 소재 추가 후 캠페인 상태 확인 (API)
  await page.waitForTimeout(1000);
  const res = await page.request.get(`/api/campaigns/${campaignId}`);
  const json = await res.json();
  expect(json.data?.status).toBe('normal');
  await page.screenshot({ path: 'test-04-after-creative.png' });

  // 정리
  await deleteTestCampaign(page, campaignId);
});

// ===== 테스트 5: 캠페인 수정 =====
test('5. 캠페인 수정 폼에서 데이터 변경 확인', async ({ page }) => {
  const campaignId = await createTestCampaign(page);

  await page.goto(`/#campaigns/${campaignId}/edit`);
  await page.waitForSelector('#campaign-form');

  const newName = `수정된캠페인_${Date.now()}`;
  await page.fill('#f-name', newName);
  await page.fill('#f-budget', '9999999');

  await page.click('#campaign-submit-btn');
  await page.waitForURL('**/#campaigns');

  // 목록에서 수정된 이름 확인
  await expect(page.locator(`text=${newName}`)).toBeVisible();
  await page.screenshot({ path: 'test-05-campaign-updated.png' });

  // 정리
  await deleteTestCampaign(page, campaignId);
});

// ===== 테스트 6: 소재 삭제 시 캠페인 상태 자동 변경 =====
test('6. 소재 전체 삭제 시 캠페인 상태 normal → paused 자동 전환', async ({ page }) => {
  const campaignId = await createTestCampaign(page);

  // API로 소재 생성
  await page.request.post(`/api/campaigns/${campaignId}/creatives`, {
    data: {
      video_title: '삭제테스트소재',
      mux_playback_id: 'test-mux-delete',
      quiz_question: '삭제 테스트?',
      quiz_answer: '예',
      quiz_wrong_answers: '아니오',
    },
  });

  // 상태 확인 (normal)
  let res = await page.request.get(`/api/campaigns/${campaignId}`);
  let json = await res.json();
  expect(json.data?.status).toBe('normal');

  // 소재 조회 후 삭제
  const creativesRes = await page.request.get(`/api/campaigns/${campaignId}/creatives`);
  const creativesJson = await creativesRes.json();
  const creativeId = creativesJson.data?.[0]?.creative_id;

  if (creativeId) {
    await page.request.delete(`/api/creatives/${creativeId}`);
    await page.waitForTimeout(500);

    // 상태 확인 (paused로 자동 변경)
    res = await page.request.get(`/api/campaigns/${campaignId}`);
    json = await res.json();
    expect(json.data?.status).toBe('paused');
  }

  await page.screenshot({ path: 'test-06-creative-deleted.png' });
  await deleteTestCampaign(page, campaignId);
});

// ===== 테스트 7: 리포트 메뉴 =====
test('7. 리포트 메뉴 접속 및 캠페인 드롭다운 표시', async ({ page }) => {
  await page.goto('/#reports');
  await page.waitForSelector('#report-campaign-select');
  await expect(page.locator('#report-campaign-select')).toBeVisible();
  await expect(page.locator('.page-title')).toContainText('PPL 캠페인 리포트');
  await page.screenshot({ path: 'test-07-report-menu.png' });
});

// ===== 테스트 8: 캠페인 삭제 =====
test('8. 캠페인 삭제 후 목록에서 제거 확인', async ({ page }) => {
  const campaignId = await createTestCampaign(page);

  await page.goto('/#campaigns');
  await page.waitForSelector('table');

  // 캠페인 ID가 목록에 있는지 확인
  await expect(page.locator(`text=${testCampaign.name}`).first()).toBeVisible();

  // API로 삭제
  await page.request.delete(`/api/campaigns/${campaignId}`);
  await page.reload();
  await page.waitForSelector('table');

  // 목록에서 제거됨 확인
  const rows = page.locator(`text=${testCampaign.name}`);
  expect(await rows.count()).toBe(0);
  await page.screenshot({ path: 'test-08-campaign-deleted.png' });
});

// ===== 테스트 9: 필터 기능 =====
test('9. 상태 필터 및 검색 기능', async ({ page }) => {
  const campaignId = await createTestCampaign(page);

  await page.goto('/#campaigns');
  await page.waitForSelector('#status-filter');

  // 상태 필터: paused
  await page.selectOption('#status-filter', 'paused');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-09-filter-paused.png' });

  // 검색: E2E
  await page.fill('#search-input', 'E2E테스트캠페인');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  await expect(page.locator(`text=${testCampaign.name}`)).toBeVisible();
  await page.screenshot({ path: 'test-09-search.png' });

  await deleteTestCampaign(page, campaignId);
});
