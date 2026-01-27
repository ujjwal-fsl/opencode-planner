-- Migration: 005_create_topic_heatmap.sql
-- Description: Create TopicHeatMap table for caching heat map calculations

BEGIN;

-- TopicHeatMap table (cached view)
CREATE TABLE topic_heatmap (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    mistake_freq INTEGER DEFAULT 0,
    redo_success_rate DECIMAL(3,2) DEFAULT 0.00,
    strength_level VARCHAR(20) NOT NULL DEFAULT 'Strong',
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- User and topic combination must be unique
    UNIQUE(user_id, topic_id)
);

-- Indexes for performance
CREATE INDEX idx_topic_heatmap_user_id ON topic_heatmap(user_id);
CREATE INDEX idx_topic_heatmap_topic_id ON topic_heatmap(topic_id);
CREATE INDEX idx_topic_heatmap_strength ON topic_heatmap(strength_level);
CREATE INDEX idx_topic_heatmap_last_calculated ON topic_heatmap(last_calculated);

-- Trigger for updated_at timestamp
CREATE TRIGGER update_topic_heatmap_updated_at BEFORE UPDATE ON topic_heatmap
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for strength_level
ALTER TABLE topic_heatmap ADD CONSTRAINT chk_strength_level 
    CHECK (strength_level IN ('Weak', 'Medium', 'Strong'));

-- Add constraint for redo_success_rate
ALTER TABLE topic_heatmap ADD CONSTRAINT chk_redo_success_rate 
    CHECK (redo_success_rate >= 0.00 AND redo_success_rate <= 1.00);

-- Add constraint for mistake_freq
ALTER TABLE topic_heatmap ADD CONSTRAINT chk_mistake_freq_non_negative 
    CHECK (mistake_freq >= 0);

COMMIT;