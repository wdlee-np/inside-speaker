const express = require('express');
const router = express.Router();
const svc = require('../services/campaignService');

const VALID_FREQUENCY = ['campaign_once', 'creative_once', 'daily_once'];
const VALID_STATUS = ['normal', 'paused', 'inactive'];

function validateCampaign(body) {
  const errors = [];
  if (!body.campaign_name || body.campaign_name.length < 1 || body.campaign_name.length > 50)
    errors.push('캠페인명은 1~50자로 입력해주세요');
  if (!body.advertiser_name || body.advertiser_name.length < 1 || body.advertiser_name.length > 50)
    errors.push('광고주명은 1~50자로 입력해주세요');
  if (body.budget === undefined || body.budget === '' || parseInt(body.budget) < 0)
    errors.push('광고비는 0 이상의 숫자로 입력해주세요');
  const priority = parseInt(body.priority);
  if (isNaN(priority) || priority < 1 || priority > 5)
    errors.push('우선순위는 1~5 사이의 값이어야 합니다');
  if (!body.start_date)
    errors.push('시작일을 올바른 형식으로 입력해주세요');
  if (!body.end_date || body.end_date < body.start_date)
    errors.push('종료일은 시작일 이후여야 합니다');
  if (body.frequency && !VALID_FREQUENCY.includes(body.frequency))
    errors.push('유효한 게재빈도를 선택해주세요');
  return errors;
}

// GET /api/campaigns/active - 리포트용 활성 캠페인 (inactive 제외)
router.get('/active', async (req, res) => {
  try {
    const data = await svc.getActive();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// GET /api/campaigns
router.get('/', async (req, res) => {
  try {
    const data = await svc.getAll({ status: req.query.status, search: req.query.search });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// POST /api/campaigns
router.post('/', async (req, res) => {
  const errors = validateCampaign(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors[0], details: errors } });
  }
  try {
    const data = await svc.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// GET /api/campaigns/:id
router.get('/:id', async (req, res) => {
  try {
    const data = await svc.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '캠페인을 찾을 수 없습니다.' } });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// PUT /api/campaigns/:id
router.put('/:id', async (req, res) => {
  const errors = validateCampaign(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors[0], details: errors } });
  }
  try {
    const data = await svc.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '캠페인을 찾을 수 없습니다.' } });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', async (req, res) => {
  try {
    await svc.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// PATCH /api/campaigns/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status || !VALID_STATUS.includes(status)) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '유효한 상태값을 입력해주세요.' } });
  }
  try {
    const data = await svc.changeStatus(req.params.id, status);
    res.json({ success: true, data });
  } catch (e) {
    const code = e.code || 'SERVER_ERROR';
    const status_code = code === 'BUSINESS_RULE_VIOLATION' ? 422 : 500;
    res.status(status_code).json({ success: false, error: { code, message: e.message } });
  }
});

module.exports = router;
