-- Create quiz_results table for Kahoot clone persistence
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS quiz_results (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_code TEXT NOT NULL,
  player_nickname TEXT NOT NULL,
  player_email TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (quiz results are public data)
CREATE POLICY "Anyone can insert quiz results"
  ON quiz_results
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read quiz results (for leaderboards, etc.)
CREATE POLICY "Anyone can read quiz results"
  ON quiz_results
  FOR SELECT
  TO anon, authenticated
  USING (true);