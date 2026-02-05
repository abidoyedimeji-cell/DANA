-- Helper functions for incrementing/decrementing counts

CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_posts 
  SET likes_count = likes_count + 1 
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_posts 
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$;
