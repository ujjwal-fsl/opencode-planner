-- Key Indexes Summary
-- Critical indexes for API performance and query optimization

-- Core user-based queries (most frequent)
CREATE INDEX CONCURRENTLY idx_mistake_vault_entries_user_created 
ON mistake_vault_entries(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_redo_attempts_user_attempted 
ON redo_attempts(user_id, attempted_at DESC);

CREATE INDEX CONCURRENTLY idx_revision_slots_user_scheduled_completed 
ON revision_slots(user_id, scheduled_for, is_completed);

-- Topic-based queries (heat map, topic analysis)
CREATE INDEX CONCURRENTLY idx_mistake_vault_entries_topic_user 
ON mistake_vault_entries(topic_id, user_id);

CREATE INDEX CONCURRENTLY idx_redo_attempts_mistake_user 
ON redo_attempts(mistake_id, user_id);

CREATE INDEX CONCURRENTLY idx_revision_slots_topic_scheduled 
ON revision_slots(topic_id, scheduled_for);

-- Activity tracking (streaks)
CREATE INDEX CONCURRENTLY idx_user_activities_user_type_date 
ON user_activities(user_id, activity_type, activity_date DESC);

-- Content hierarchy queries
CREATE INDEX CONCURRENTLY idx_chapters_subject_order 
ON chapters(subject_id, order_index);

CREATE INDEX CONCURRENTLY idx_topics_chapter_order 
ON topics(chapter_id, order_index);

-- Question lookups for shuffle
CREATE INDEX CONCURRENTLY idx_questions_topic_difficulty 
ON questions(topic_id, difficulty);

-- Cascade Delete Rules Summary:
/*
1. users → cascade to:
   - mistake_vault_entries
   - redo_attempts  
   - revision_slots
   - streaks
   - user_activities

2. subjects → cascade to:
   - chapters
   - (cascade continues through hierarchy)

3. chapters → cascade to:
   - topics
   - (cascade continues)

4. topics → cascade to:
   - questions
   - mistake_vault_entries
   - revision_slots

5. questions → cascade to:
   - mistake_vault_entries

6. mistake_vault_entries → cascade to:
   - redo_attempts
*/