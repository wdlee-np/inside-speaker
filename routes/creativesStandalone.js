const express = require('express');
const router = express.Router();
const svc = require('../services/creativeService');

function validateCreative(body) {
  const errors = [];
  if (!body.video_title || body.video_title.length < 1 || body.video_title.length > 100)
    errors.push('영상 제목은 1~100자로 입력해주세요');
  if (!body.mux_playback_id)
    errors.push('Mux Playback ID는 필수입니다');
  if (!body.quiz_question)
    errors.push('퀴즈 문제는 필수입니다');
  if (!body.quiz_answer)
    errors.push('정답은 필수입니다');
  if (!body.quiz_wrong_answers || body.quiz_wrong_answers.trim() === '')
    errors.push('오답은 최소 1개 이상 입력해주세요');
  return errors;
}

// GET /api/creatives/:id
router.get('/:id', async (req, res) => {
  try {
    const data = await svc.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '소재를 찾을 수 없습니다.' } });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// PUT /api/creatives/:id
router.put('/:id', async (req, res) => {
  const errors = validateCreative(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: errors[0], details: errors } });
  }
  try {
    const data = await svc.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '소재를 찾을 수 없습니다.' } });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

// DELETE /api/creatives/:id
router.delete('/:id', async (req, res) => {
  try {
    await svc.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (e) {
    const code = e.code || 'SERVER_ERROR';
    const statusCode = code === 'NOT_FOUND' ? 404 : 500;
    res.status(statusCode).json({ success: false, error: { code, message: e.message } });
  }
});

module.exports = router;
