const TopicHeatMapModel = require('../models/topicHeatMap.model');

class HeatMapService {
  static calculateStrengthLevel(mistakeFreq, redoSuccessRate) {
    // V1 simple rules:
    // If mistake_freq >= 5 AND redo_success_rate < 0.4 → Weak (🔴)
    // Else if mistake_freq >= 3 AND redo_success_rate < 0.7 → Medium (🟠)
    // Else → Strong (🟢)

    if (mistakeFreq >= 5 && redoSuccessRate < 0.4) {
      return 'Weak';
    } else if (mistakeFreq >= 3 && redoSuccessRate < 0.7) {
      return 'Medium';
    } else {
      return 'Strong';
    }
  }

  static async getHeatMapForUser(userId) {
    try {
      const heatmapData = await TopicHeatMapModel.findByUserId(userId);
      
      // If no heatmap data exists, return all topics as Strong
      if (heatmapData.length === 0) {
        const allTopics = await TopicHeatMapModel.getAllTopicsForUser(userId);
        return allTopics.map(topic => ({
          topic_id: topic.topic_id,
          topic_name: topic.topic_name,
          chapter_name: topic.chapter_name,
          subject_name: topic.subject_name,
          strength_level: 'Strong',
          mistake_freq: 0,
          redo_success_rate: 0.00,
        }));
      }

      return heatmapData.map(row => ({
        topic_id: row.topic_id,
        topic_name: row.topic_name,
        chapter_name: row.chapter_name,
        subject_name: row.subject_name,
        strength_level: row.strength_level,
        mistake_freq: row.mistake_freq,
        redo_success_rate: parseFloat(row.redo_success_rate) || 0.00,
      }));
    } catch (error) {
      console.error('Get heatmap for user error:', error);
      throw error;
    }
  }

  static async getHeatMapForTopic(userId, topicId) {
    try {
      let heatmapData = await TopicHeatMapModel.findByUserIdAndTopicId(userId, topicId);
      
      // If no heatmap data exists, return topic details as Strong
      if (!heatmapData) {
        heatmapData = await TopicHeatMapModel.getTopicDetailsWithoutHeatMap(userId, topicId);
        if (!heatmapData) {
          return null;
        }
      }

      return {
        topic_id: heatmapData.topic_id,
        topic_name: heatmapData.topic_name,
        chapter_name: heatmapData.chapter_name,
        subject_name: heatmapData.subject_name,
        mistake_freq: heatmapData.mistake_freq,
        redo_success_rate: parseFloat(heatmapData.redo_success_rate) || 0.00,
        strength_level: heatmapData.strength_level,
        last_calculated: heatmapData.last_calculated,
      };
    } catch (error) {
      console.error('Get heatmap for topic error:', error);
      throw error;
    }
  }

  static async computeHeatMapForUser(userId) {
    try {
      const pool = require('../config/database');
      
      // Get all topics with mistake counts and redo success rates
      const query = `
        SELECT 
          t.id as topic_id,
          COUNT(DISTINCT m.id) as mistake_freq,
          COALESCE(
            COUNT(DISTINCT ra.id) FILTER (WHERE ra.is_correct = true), 0
          ) * 1.0 / NULLIF(COUNT(DISTINCT ra.id), 0) as redo_success_rate
        FROM topics t
        LEFT JOIN mistake_vault_entries m ON t.id = m.topic_id AND m.user_id = $1
        LEFT JOIN redo_schedule rs ON m.id = rs.mistake_id
        LEFT JOIN redo_attempts ra ON rs.id = ra.redo_id
        GROUP BY t.id
      `;

      const result = await pool.query(query, [userId]);
      
      // Update heatmap for each topic
      for (const topic of result.rows) {
        const mistakeFreq = parseInt(topic.mistake_freq) || 0;
        const redoSuccessRate = parseFloat(topic.redo_success_rate) || 0.00;
        const strengthLevel = this.calculateStrengthLevel(mistakeFreq, redoSuccessRate);
        
        await TopicHeatMapModel.upsert(
          userId,
          topic.topic_id,
          mistakeFreq,
          redoSuccessRate,
          strengthLevel
        );
      }

      return {
        success: true,
        topicsProcessed: result.rows.length,
      };
    } catch (error) {
      console.error('Compute heatmap for user error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async computeHeatMapForAllUsers() {
    try {
      const pool = require('../config/database');
      
      // Get all users
      const usersQuery = 'SELECT id FROM users';
      const usersResult = await pool.query(usersQuery);
      
      const results = [];
      
      for (const user of usersResult.rows) {
        const result = await this.computeHeatMapForUser(user.id);
        results.push({
          userId: user.id,
          ...result,
        });
      }

      return {
        success: true,
        results,
        totalUsers: usersResult.rows.length,
      };
    } catch (error) {
      console.error('Compute heatmap for all users error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async validateTopicOwnership(userId, topicId) {
    try {
      const pool = require('../config/database');
      const query = `
        SELECT 1
        FROM topics t
        JOIN chapters c ON t.chapter_id = c.id
        JOIN subjects s ON c.subject_id = s.id
        WHERE t.id = $1
        LIMIT 1
      `;

      const result = await pool.query(query, [topicId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Validate topic ownership error:', error);
      return false;
    }
  }
}

module.exports = HeatMapService;