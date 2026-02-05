-- Add scoring fields to quiz questions
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 10;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS category TEXT;

-- Add score to quiz responses
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
