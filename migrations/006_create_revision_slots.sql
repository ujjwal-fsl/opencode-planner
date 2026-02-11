-- Migration: 006_create_revision_slots.sql
-- Description: Create RevisionSlot table for spaced revision scheduling

BEGIN;

-- RevisionSlot table
CREATE TABLE revision_slots (
    revision_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    slot_type VARCHAR(20) NOT NULL,
    scheduled_for DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partial unique index: only one active (not completed) slot per user/topic/date
-- This replaces the invalid inline UNIQUE...WHERE constraint
CREATE UNIQUE INDEX unique_active_revision_slot
ON revision_slots(user_id, topic_id, scheduled_for)
WHERE completed = FALSE;

-- Indexes for performance
CREATE INDEX idx_revision_slots_user_id ON revision_slots(user_id);
CREATE INDEX idx_revision_slots_topic_id ON revision_slots(topic_id);
CREATE INDEX idx_revision_slots_scheduled_for ON revision_slots(scheduled_for);
CREATE INDEX idx_revision_slots_user_pending ON revision_slots(user_id, scheduled_for) WHERE completed = FALSE;
CREATE INDEX idx_revision_slots_completed ON revision_slots(completed);

-- Trigger for updated_at timestamp
CREATE TRIGGER update_revision_slots_updated_at BEFORE UPDATE ON revision_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for slot_type
ALTER TABLE revision_slots ADD CONSTRAINT chk_slot_type 
    CHECK (slot_type IN ('easy_7d', 'medium_3d', 'hard_tom'));

-- Add constraint for scheduled_for (should be today or future)
ALTER TABLE revision_slots ADD CONSTRAINT chk_scheduled_for_future 
    CHECK (scheduled_for >= CURRENT_DATE);

COMMIT;