-- Migration: 008_create_redo_schedule.sql
-- Description: Create redo_schedule table for spaced repetition tracking

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS redo_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mistake_id UUID NOT NULL REFERENCES mistake_vault_entries(id) ON DELETE CASCADE,
    schedule_type VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    performed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_redo_schedule_mistake_id 
ON redo_schedule(mistake_id);

CREATE INDEX IF NOT EXISTS idx_redo_schedule_due_date 
ON redo_schedule(due_date);

CREATE INDEX IF NOT EXISTS idx_redo_schedule_performed 
ON redo_schedule(performed);

COMMIT;
