require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트
const campaignRoutes = require('./routes/campaigns');
const creativeNestedRoutes = require('./routes/creatives');
const creativeRoutes = require('./routes/creativesStandalone');
const reportRoutes = require('./routes/reports');

app.use('/api/campaigns', campaignRoutes);
app.use('/api/campaigns/:campaignId/creatives', creativeNestedRoutes);
app.use('/api/creatives', creativeRoutes);
app.use('/api/reports', reportRoutes);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
});

// SPA 폴백: 모든 비API 요청은 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vercel 서버리스 환경에서는 listen 호출 스킵
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PPL 광고 관리 서버 실행: http://localhost:${PORT}`);
  });
}

module.exports = app;
