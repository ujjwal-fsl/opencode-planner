-- Migration: 002_create_learning_tables.sql
-- Description: Create tables for mistake tracking, redo attempts, and revision

BEGIN;

-- Mistake Vault Entries
CREATE TABLE mistake_vault_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    wrong_answer TEXT NOT NULL,
    confidence_level INTEGER,
    mistake_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Redo Attempts
CREATE TABLE redo_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mistake_id UUID NOT NULL REFERENCES mistake_vault_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    answer TEXT,
    time_spent_seconds INTEGER,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Revision Slots
CREATE TABLE revision_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    scheduled_for DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Core indexes for API queries
CREATE INDEX idx_mistake_vault_entries_user_id ON mistake_vault_entries(user_id);
CREATE INDEX idx_mistake_vault_entries_topic_id ON mistake_vault_entries(topic_id);
CREATE INDEX idx_mistake_vault_entries_created_at ON mistake_vault_entries(created_at);

CREATE INDEX idx_redo_attempts_mistake_id ON redo_attempts(mistake_id);
CREATE INDEX idx_redo_attempts_user_id ON redo_attempts(user_id);
CREATE INDEX idx_redo_attempts_attempted_at ON redo_attempts(attempted_at);

CREATE INDEX idx_revision_slots_user_id ON revision_slots(user_id);
CREATE INDEX idx_revision_slots_topic_id ON revision_slots(topic_id);
CREATE INDEX idx_revision_slots_scheduled_for ON revision_slots(scheduled_for);
CREATE INDEX idx_revision_slots_user_scheduled ON revision_slots(user_id, scheduled_for);

COMMIT;