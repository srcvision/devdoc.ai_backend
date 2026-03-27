const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  codeReview,
  bugDetect,
  securityScan,
  performanceAnalyze,
  codeQuality,
  architectureAnalyze,
  githubAnalyze,
  debugAssist,
  codeExplain,
  getReports,
  getReport,
  deleteReport,
  getDashboardStats,
} = require('../controllers/toolsController');

// AI Tool Routes (all protected)
router.post('/code-review', protect, codeReview);
router.post('/bug-detect', protect, bugDetect);
router.post('/security-scan', protect, securityScan);
router.post('/performance', protect, performanceAnalyze);
router.post('/code-quality', protect, codeQuality);
router.post('/architecture', protect, architectureAnalyze);
router.post('/github-analyze', protect, githubAnalyze);
router.post('/debug', protect, debugAssist);
router.post('/explain', protect, codeExplain);

// Report routes
router.get('/reports', protect, getReports);
router.get('/reports/:id', protect, getReport);
router.delete('/reports/:id', protect, deleteReport);
router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;
