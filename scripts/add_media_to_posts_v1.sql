-- Add media support columns to community_posts table
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS video_duration INTEGER; -- Duration in seconds (max 20)
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS media_urls TEXT[]; -- Array of image URLs for carousel (max 7)
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'none'; -- 'none', 'image', 'carousel', 'video'

-- Add action_url and action_type to notifications for actionable notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_type TEXT; -- 'view_profile', 'view_content', 'take_action'
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_label TEXT;
