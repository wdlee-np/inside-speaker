const express = require('express');
const router = express.Router();
const svc = require('../services/reportService');

// GET /api/reports/campaigns/:id
router.get('/campaigns/:id', async (req, res) => {
  try {
    const data = await svc.getReport(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e.message } });
  }
});

module.exports = router;
