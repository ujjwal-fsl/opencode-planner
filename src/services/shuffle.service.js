const pool = require('../config/database');

class ShuffleService {
  static async getShuffleQuestions(userId, limit = 10) {
    try {
      // Enforce limits
      const finalLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 20);
      
      // Get user's mistakes with topic strength levels
      const query = `
        SELECT 
          m.id as mistake_id,
          m.question_text,
          m.source,
          m.subject_id,
          m.chapter_id,
          m.topic_id,
          COALESCE(th.strength_level, 'Strong') as topic_strength
        FROM mistake_vault_entries m
        LEFT JOIN topic_heatmap th ON m.topic_id = th.topic_id AND m.user_id = th.user_id
        WHERE m.user_id = $1
        ORDER BY 
          CASE 
            WHEN COALESCE(th.strength_level, 'Strong') = 'Weak' THEN 1
            WHEN COALESCE(th.strength_level, 'Strong') = 'Medium' THEN 2
            ELSE 3
          END,
          RANDOM()
        LIMIT $2
      `;

      const result = await pool.query(query, [userId, finalLimit * 2]); // Get more for better distribution
      
      if (result.rows.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No questions available for shuffle',
        };
      }

      // Apply 60/30/10 priority distribution
      const prioritizedQuestions = this.applyPriorityDistribution(result.rows, finalLimit);
      
      // Shuffle the final selection
      const shuffledQuestions = this.shuffleArray(prioritizedQuestions);

      const formattedQuestions = shuffledQuestions.map(q => ({
        mistake_id: q.mistake_id,
        question_text: q.question_text,
        source: q.source,
        subject_id: q.subject_id,
        chapter_id: q.chapter_id,
        topic_id: q.topic_id,
        topic_strength: q.topic_strength,
      }));

      return {
        success: true,
        data: formattedQuestions,
        meta: {
          requested_limit: limit,
          actual_limit: finalLimit,
          total_available: result.rows.length,
          distribution: this.getDistributionStats(prioritizedQuestions),
        },
      };
    } catch (error) {
      console.error('Get shuffle questions error:', error);
      return {
        success: false,
        message: 'Failed to retrieve shuffle questions',
        error: error.message,
      };
    }
  }

  static applyPriorityDistribution(questions, targetCount) {
    if (questions.length <= targetCount) {
      return questions;
    }

    // Group by strength level
    const grouped = {
      Weak: questions.filter(q => q.topic_strength === 'Weak'),
      Medium: questions.filter(q => q.topic_strength === 'Medium'),
      Strong: questions.filter(q => q.topic_strength === 'Strong'),
    };

    // Calculate target counts based on 60/30/10 distribution
    const targetCounts = {
      Weak: Math.ceil(targetCount * 0.6),
      Medium: Math.ceil(targetCount * 0.3),
      Strong: Math.ceil(targetCount * 0.1),
    };

    // Select questions from each group
    const selected = [];

    // Select Weak questions (highest priority)
    const weakCount = Math.min(grouped.Weak.length, targetCounts.Weak);
    for (let i = 0; i < weakCount; i++) {
      selected.push(grouped.Weak[i]);
    }

    // Select Medium questions
    const mediumCount = Math.min(grouped.Medium.length, targetCounts.Medium);
    for (let i = 0; i < mediumCount; i++) {
      selected.push(grouped.Medium[i]);
    }

    // Select Strong questions
    const strongCount = Math.min(grouped.Strong.length, targetCounts.Strong);
    for (let i = 0; i < strongCount; i++) {
      selected.push(grouped.Strong[i]);
    }

    // If we need more questions to reach targetCount, fill from remaining questions
    const remainingCount = targetCount - selected.length;
    if (remainingCount > 0) {
      const allQuestions = [...grouped.Weak, ...grouped.Medium, ...grouped.Strong];
      const usedIds = new Set(selected.map(q => q.mistake_id));
      const remainingQuestions = allQuestions.filter(q => !usedIds.has(q.mistake_id));
      
      const additionalCount = Math.min(remainingCount, remainingQuestions.length);
      for (let i = 0; i < additionalCount; i++) {
        selected.push(remainingQuestions[i]);
      }
    }

    return selected.slice(0, targetCount);
  }

  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static getDistributionStats(questions) {
    const stats = {
      Weak: 0,
      Medium: 0,
      Strong: 0,
    };

    questions.forEach(q => {
      if (stats[q.topic_strength] !== undefined) {
        stats[q.topic_strength]++;
      }
    });

    const total = questions.length;
    return {
      ...stats,
      percentages: {
        Weak: total > 0 ? Math.round((stats.Weak / total) * 100) : 0,
        Medium: total > 0 ? Math.round((stats.Medium / total) * 100) : 0,
        Strong: total > 0 ? Math.round((stats.Strong / total) * 100) : 0,
      },
    };
  }

  static async getShuffleStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_questions,
          COUNT(CASE WHEN m.source = 'mistake' THEN 1 END) as mistake_questions,
          COUNT(CASE WHEN m.source = 'self_added' THEN 1 END) as self_added_questions,
          COUNT(CASE WHEN COALESCE(th.strength_level, 'Strong') = 'Weak' THEN 1 END) as weak_topics,
          COUNT(CASE WHEN COALESCE(th.strength_level, 'Strong') = 'Medium' THEN 1 END) as medium_topics,
          COUNT(CASE WHEN COALESCE(th.strength_level, 'Strong') = 'Strong' THEN 1 END) as strong_topics
        FROM mistake_vault_entries m
        LEFT JOIN topic_heatmap th ON m.topic_id = th.topic_id AND m.user_id = th.user_id
        WHERE m.user_id = $1
      `;

      const result = await pool.query(query, [userId]);
      const stats = result.rows[0];

      return {
        success: true,
        data: {
          total_questions: parseInt(stats.total_questions),
          mistake_questions: parseInt(stats.mistake_questions),
          self_added_questions: parseInt(stats.self_added_questions),
          weak_topics: parseInt(stats.weak_topics),
          medium_topics: parseInt(stats.medium_topics),
          strong_topics: parseInt(stats.strong_topics),
        },
      };
    } catch (error) {
      console.error('Get shuffle stats error:', error);
      return {
        success: false,
        message: 'Failed to retrieve shuffle stats',
        error: error.message,
      };
    }
  }

  static validateUserHasQuestions(userId) {
    return pool.query(
      'SELECT 1 FROM mistake_vault_entries WHERE user_id = $1 LIMIT 1',
      [userId]
    );
  }
}

module.exports = ShuffleService;