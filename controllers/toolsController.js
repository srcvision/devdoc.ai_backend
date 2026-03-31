const Report = require('../models/Report');
const { generateContent, prompts } = require('../services/geminiService');
const axios = require('axios');

// Helper to extract scores from AI response text
const extractScores = (text, toolType) => {
  const score = {};
  const match = (label) => {
    const re = new RegExp(`${label}[:\\s]+([0-9]+)`, 'i');
    const m = text.match(re);
    return m ? parseInt(m[1]) : null;
  };

  switch (toolType) {
    case 'code-review':
      score.readability = match('Readability');
      score.maintainability = match('Maintainability');
      score.overall = match('Overall');
      break;
    case 'security-scan':
      score.security = match('Overall Security');
      score.overall = match('Overall Security');
      break;
    case 'performance':
      score.performance = match('Overall Performance');
      score.overall = match('Overall Performance');
      break;
    case 'code-quality':
      score.readability = match('Readability');
      score.maintainability = match('Maintainability');
      score.complexity = match('Complexity');
      score.overall = match('Overall Quality');
      break;
    case 'architecture':
      score.maintainability = match('Maintainability');
      score.overall = match('Overall Architecture');
      break;
    case 'github-analyze':
      score.overall = match('Overall');
      score.security = match('Security');
      score.performance = match('Performance');
      break;
    default:
      score.overall = null;
  }
  return score;
};

// Generic handler factory
const createToolHandler = (toolType) => async (req, res) => {
  try{
  const { code, language = 'unknown' } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ message: 'Code input is required' });
  }

  const prompt = prompts[toolType](code);
  const aiResponse = await generateContent(prompt);

  // Check if AI detected non-technical input
  if (aiResponse.includes('No valid code or technical input provided')) {
    return res.json({ 
      aiResponse, 
      score: null, 
      isInvalid: true,
      message: 'The input provided does not appear to be code or technical content.' 
    });
  }

  const score = extractScores(aiResponse, toolType);

  const report = await Report.create({
    userId: req.user._id,
    toolType,
    inputCode: code,
    aiResponse,
    score,
    language,
  });

  res.json({ aiResponse, score, reportId: report._id });
}
catch(error){
  console.error('Error in createToolHandler:', error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
} 
};

// Code Review
const codeReview = createToolHandler('code-review');

// Bug Detection
const bugDetect = createToolHandler('bug-detect');

// Security Scan
const securityScan = createToolHandler('security-scan');

// Performance Analysis
const performanceAnalyze = createToolHandler('performance');

// Code Quality
const codeQuality = createToolHandler('code-quality');

// Architecture Analysis
const architectureAnalyze = createToolHandler('architecture');

// AI Debug Assistant
const debugAssist = createToolHandler('debug');

// Code Explanation
const codeExplain = createToolHandler('explain');

// GitHub Repository Analyzer
const githubAnalyze = async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ message: 'GitHub repository URL is required' });
  }

  // Parse GitHub URL to get owner/repo
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return res.status(400).json({ message: 'Invalid GitHub repository URL' });
  }

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');

  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  // Fetch repo info
  const repoInfo = await axios.get(
    `https://api.github.com/repos/${owner}/${cleanRepo}`,
    { headers }
  );

  // Fetch file tree
  const treeRes = await axios.get(
    `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/HEAD?recursive=1`,
    { headers }
  );

  const files = treeRes.data.tree
    .filter((f) => f.type === 'blob')
    .slice(0, 30);

  // Fetch content of key files (max 5 to stay within token limits)
  const codeFiles = files
    .filter((f) =>
      /\.(js|ts|jsx|tsx|py|java|go|rs|rb|php|cs)$/.test(f.path)
    )
    .slice(0, 5);

  const fileContents = await Promise.allSettled(
    codeFiles.map(async (f) => {
      const res = await axios.get(
        `https://api.github.com/repos/${owner}/${cleanRepo}/contents/${f.path}`,
        { headers }
      );
      const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
      return `\n\n### File: ${f.path}\n\`\`\`\n${content.slice(0, 1500)}\n\`\`\``;
    })
  );

  const fileTree = files.map((f) => f.path).join('\n');
  const codeSnippets = fileContents
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .join('\n');

  const repoContent = `
Repository: ${repoInfo.data.full_name}
Description: ${repoInfo.data.description || 'N/A'}
Language: ${repoInfo.data.language || 'Multiple'}
Stars: ${repoInfo.data.stargazers_count}
Forks: ${repoInfo.data.forks_count}
Open Issues: ${repoInfo.data.open_issues_count}

## File Structure (first 30 files)
${fileTree}

## Code Samples
${codeSnippets}
`;

  const prompt = prompts['github-analyze'](repoContent);
  const aiResponse = await generateContent(prompt);
  const score = extractScores(aiResponse, 'github-analyze');

  const report = await Report.create({
    userId: req.user._id,
    toolType: 'github-analyze',
    inputCode: repoUrl,
    aiResponse,
    score,
    language: repoInfo.data.language || 'multiple',
  });

  res.json({ aiResponse, score, reportId: report._id, repoInfo: repoInfo.data });
};

// Get all reports for current user
const getReports = async (req, res) => {
  const reports = await Report.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('-__v');
  res.json(reports);
};

// Get single report
const getReport = async (req, res) => {
  const report = await Report.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }
  res.json(report);
};

// Delete report
const deleteReport = async (req, res) => {
  const report = await Report.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }
  res.json({ message: 'Report deleted' });
};

// Dashboard stats
const getDashboardStats = async (req, res) => {
  const reports = await Report.find({ userId: req.user._id });

  const totalScans = reports.length;
  const avgQuality =
    reports.filter((r) => r.score?.overall).length > 0
      ? Math.round(
          reports
            .filter((r) => r.score?.overall)
            .reduce((acc, r) => acc + (r.score.overall || 0), 0) /
            reports.filter((r) => r.score?.overall).length
        )
      : 0;

  const toolCounts = reports.reduce((acc, r) => {
    acc[r.toolType] = (acc[r.toolType] || 0) + 1;
    return acc;
  }, {});

  const recentReports = reports.slice(0, 5);

  res.json({
    totalScans,
    avgQuality,
    toolCounts,
    recentReports,
  });
};

module.exports = {
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
};
