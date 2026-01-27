-- Migration: 004_create_triggers_and_constraints.sql
-- Description: Create triggers for updated_at timestamps and add constraints

BEGIN;

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mistake_vault_entries_updated_at BEFORE UPDATE ON mistake_vault_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE mistake_vault_entries ADD CONSTRAINT chk_confidence_level 
    CHECK (confidence_level >= 1 AND confidence_level <= 5);

ALTER TABLE questions ADD CONSTRAINT chk_difficulty 
    CHECK (difficulty >= 1 AND difficulty <= 5);

ALTER TABLE revision_slots ADD CONSTRAINT chk_scheduled_for_future 
    CHECK (scheduled_for >= CURRENT_DATE);

ALTER TABLE streaks ADD CONSTRAINT chk_current_streak_non_negative 
    CHECK (current_streak >= 0);

ALTER TABLE streaks ADD CONSTRAINT chk_longest_streak_non_negative 
    CHECK (longest_streak >= 0);

COMMIT;