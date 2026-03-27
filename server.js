require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tools');
const { errorHandler } = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(cors({
  origin: 'https://devdoc-ai-frontend.vercel.app/',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DevDoctor AI API is running 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
