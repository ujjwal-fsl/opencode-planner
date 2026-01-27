-- Migration: 007_create_streak_system.sql
-- Description: Create StreakLog table and update User table for streak tracking

BEGIN;

-- StreakLog table for daily activity tracking
CREATE TABLE streak_log (
    streak_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- User and date combination must be unique
    UNIQUE(user_id, activity_date)
);

-- Indexes for performance
CREATE INDEX idx_streak_log_user_id ON streak_log(user_id);
CREATE INDEX idx_streak_log_activity_date ON streak_log(activity_date);
CREATE INDEX idx_streak_log_user_date ON streak_log(user_id, activity_date);
CREATE INDEX idx_streak_log_activity_type ON streak_log(activity_type);

-- Add streak_count to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;

-- Add last_active_date to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- Add constraints for activity_type
ALTER TABLE streak_log ADD CONSTRAINT chk_activity_type 
    CHECK (activity_type IN ('redo', 'revision', 'shuffle'));

-- Add constraint for activity_date (should not be in future)
ALTER TABLE streak_log ADD CONSTRAINT chk_activity_date_past 
    CHECK (activity_date <= CURRENT_DATE);

-- Add constraint for streak_count
ALTER TABLE users ADD CONSTRAINT chk_streak_count_non_negative 
    CHECK (streak_count >= 0);

-- Trigger for updated_at timestamp (not needed for streak_log but keeping pattern)
CREATE TRIGGER update_streak_log_created_at BEFORE UPDATE ON streak_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;