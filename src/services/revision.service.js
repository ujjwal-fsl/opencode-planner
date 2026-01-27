const RevisionSlotModel = require('../models/revisionSlot.model');
const pool = require('../config/database');

class RevisionService {
  static async scheduleRevision(userId, topicId, difficulty) {
    try {
      // Validate topic exists
      const topicCheck = await pool.query('SELECT 1 FROM topics WHERE id = $1', [topicId]);
      if (topicCheck.rows.length === 0) {
        return {
          success: false,
          message: 'Topic not found',
        };
      }

      // Calculate slot type and scheduled date
      const slotType = RevisionSlotModel.getSlotType(difficulty);
      const scheduledFor = RevisionSlotModel.calculateScheduledDate(difficulty);

      // Check if a revision already exists for this topic and date
      const existingSlot = await RevisionSlotModel.existsForTopicAndDate(userId, topicId, scheduledFor);
      if (existingSlot) {
        return {
          success: false,
          message: 'Revision already scheduled for this topic on the same date',
        };
      }

      // Create new revision slot
      const revisionSlot = await RevisionSlotModel.create(userId, topicId, slotType, scheduledFor);

      return {
        success: true,
        data: revisionSlot,
      };
    } catch (error) {
      console.error('Schedule revision error:', error);
      return {
        success: false,
        message: error.message || 'Failed to schedule revision',
      };
    }
  }

  static async getRevisionSlots(userId, includeCompleted = false) {
    try {
      const slots = await RevisionSlotModel.findByUserId(userId, includeCompleted);
      
      const formattedSlots = slots.map(slot => ({
        revision_id: slot.revision_id,
        topic_id: slot.topic_id,
        topic_name: slot.topic_name,
        chapter_name: slot.chapter_name,
        subject_name: slot.subject_name,
        scheduled_for: slot.scheduled_for,
        slot_type: slot.slot_type,
        completed: slot.completed,
        created_at: slot.created_at,
      }));

      return {
        success: true,
        data: formattedSlots,
      };
    } catch (error) {
      console.error('Get revision slots error:', error);
      return {
        success: false,
        message: 'Failed to retrieve revision slots',
        error: error.message,
      };
    }
  }

  static async getPendingRevisionSlots(userId) {
    try {
      const slots = await RevisionSlotModel.getPendingSlots(userId);
      
      const formattedSlots = slots.map(slot => ({
        revision_id: slot.revision_id,
        topic_id: slot.topic_id,
        topic_name: slot.topic_name,
        scheduled_for: slot.scheduled_for,
        slot_type: slot.slot_type,
      }));

      return {
        success: true,
        data: formattedSlots,
      };
    } catch (error) {
      console.error('Get pending revision slots error:', error);
      return {
        success: false,
        message: 'Failed to retrieve pending revision slots',
        error: error.message,
      };
    }
  }

  static async completeRevision(userId, revisionId) {
    try {
      // Check if revision exists and belongs to user
      const exists = await RevisionSlotModel.exists(userId, revisionId);
      if (!exists) {
        return {
          success: false,
          message: 'Revision slot not found',
        };
      }

      // Get current slot info before marking as completed
      const slot = await RevisionSlotModel.findById(userId, revisionId);
      if (!slot) {
        return {
          success: false,
          message: 'Revision slot not found',
        };
      }

      if (slot.completed) {
        return {
          success: false,
          message: 'Revision already completed',
        };
      }

      // Mark as completed
      const completedSlot = await RevisionSlotModel.markAsCompleted(userId, revisionId);
      
      if (!completedSlot) {
        return {
          success: false,
          message: 'Failed to mark revision as completed',
        };
      }

      return {
        success: true,
        data: completedSlot,
      };
    } catch (error) {
      console.error('Complete revision error:', error);
      return {
        success: false,
        message: error.message || 'Failed to complete revision',
      };
    }
  }

  static async validateTopicOwnership(userId, topicId) {
    try {
      // Since topics are global, we just check if the topic exists
      const query = 'SELECT 1 FROM topics WHERE id = $1 LIMIT 1';
      const result = await pool.query(query, [topicId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Validate topic ownership error:', error);
      return false;
    }
  }

  static async validateRevisionOwnership(userId, revisionId) {
    try {
      const exists = await RevisionSlotModel.exists(userId, revisionId);
      return exists;
    } catch (error) {
      console.error('Validate revision ownership error:', error);
      return false;
    }
  }

  static async getRevisionStats(userId) {
    try {
      const pendingCount = await RevisionSlotModel.countPendingByUserId(userId);
      const completedCount = await pool.query(
        'SELECT COUNT(*) as count FROM revision_slots WHERE user_id = $1 AND completed = TRUE',
        [userId]
      );

      return {
        success: true,
        data: {
          pending: parseInt(pendingCount.rows[0].count),
          completed: parseInt(completedCount.rows[0].count),
        },
      };
    } catch (error) {
      console.error('Get revision stats error:', error);
      return {
        success: false,
        message: 'Failed to retrieve revision stats',
        error: error.message,
      };
    }
  }
}

module.exports = RevisionService;