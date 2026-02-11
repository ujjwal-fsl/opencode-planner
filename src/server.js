const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Safe dotenv loading
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (process.env.NODE_ENV === "production") {
  console.log("🚀 Running in PRODUCTION mode");
}

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const mistakeRoutes = require('./routes/mistake.routes');
const redoRoutes = require('./routes/redo.routes');
const heatmapRoutes = require('./routes/heatmap.routes');
const revisionRoutes = require('./routes/revision.routes');
const shuffleRoutes = require('./routes/shuffle.routes');
const streakRoutes = require('./routes/streak.routes');
const homeRoutes = require('./routes/home.routes');

const indexRoutes = require('./routes/index');

// Middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/redo', redoRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/shuffle', shuffleRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/home', homeRoutes);
app.use('/api', indexRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5000;

// Fail-fast environment validation
if (!process.env.DATABASE_URL) {
  console.error("❌ FATAL: DATABASE_URL is missing in environment variables.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET is missing in environment variables.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start HeatMap background job (every 6 hours)
  const HeatMapJob = require('./jobs/heatmap.job');
  setTimeout(() => {
    HeatMapJob.startScheduler(6);
  }, 10000);
});

module.exports = app;