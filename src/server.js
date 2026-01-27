const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const mistakeRoutes = require('./routes/mistake');
const redoRoutes = require('./routes/redo');
const heatmapRoutes = require('./routes/heatmap');
const revisionRoutes = require('./routes/revision');
const shuffleRoutes = require('./routes/shuffle');
const streakRoutes = require('./routes/streak');
const homeRoutes = require('./routes/home');
const indexRoutes = require('./routes/index');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start HeatMap scheduler (runs every 6 hours)
  const HeatMapJob = require('./jobs/heatmap.job');
  HeatMapJob.startScheduler(6);
});

module.exports = app;