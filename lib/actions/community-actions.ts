"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCommunityPosts(limit = 20, offset = 0) {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("[v0] Error fetching community posts:", error)
    return { posts: [], error: error.message }
  }

  if (!posts || posts.length === 0) {
    return { posts: [] }
  }

  // Get unique author IDs
  const authorIds = [...new Set(posts.map((p) => p.author_id).filter(Boolean))]

  // Fetch author profiles separately
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified")
    .in("id", authorIds)

  // Create a map of profiles by ID
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // Merge posts with author data
  const postsWithAuthors = posts.map((post) => ({
    ...post,
    author: profileMap.get(post.author_id) || null,
  }))

  return { posts: postsWithAuthors }
}

export async function createPost(
  authorId: string,
  data: {
    content: string
    title?: string
    description?: string
    location?: string
    post_type?: "general" | "event" | "venue_review" | "question" | "activity"
    image_url?: string
    media_urls?: string[]
    video_url?: string
    video_duration?: number
    media_type?: "none" | "image" | "carousel" | "video"
    venue_id?: string
  },
) {
  const supabase = await createClient()

  console.log("[v0] Creating post with data:", data)

  const { error } = await supabase.from("community_posts").insert({
    user_id: authorId,
    content: data.content,
    title: data.title,
    description: data.description,
    location: data.location,
    post_type: data.post_type || "general",
    image_url: data.image_url,
    media_urls: data.media_urls,
    video_url: data.video_url,
    video_duration: data.video_duration,
    media_type: data.media_type || "none",
  })

  if (error) {
    console.error("[v0] Error creating post:", error)
    return { error: error.message }
  }

  console.log("[v0] Post created successfully")
  revalidatePath("/community")
  return { success: true }
}

export async function likePost(postId: string, userId: string) {
  const supabase = await createClient()

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase.from("post_likes").delete().eq("id", existingLike.id)

    if (error) {
      return { error: error.message }
    }

    // Decrement likes count
    await supabase.rpc("decrement_post_likes", { post_id: postId })
  } else {
    // Like
    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: userId,
    })

    if (error) {
      return { error: error.message }
    }

    // Increment likes count
    await supabase.rpc("increment_post_likes", { post_id: postId })

    // Get post author for notification
    const { data: post } = await supabase.from("community_posts").select("author_id").eq("id", postId).single()

    if (post && post.author_id !== userId) {
      await supabase.from("notifications").insert({
        user_id: post.author_id,
        type: "post_like",
        title: "Someone liked your post",
        related_user_id: userId,
        related_entity_id: postId,
      })
    }
  }

  revalidatePath("/community")
  return { success: true }
}

export async function addComment(postId: string, authorId: string, content: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    author_id: authorId,
    content,
  })

  if (error) {
    console.error("[v0] Error adding comment:", error)
    return { error: error.message }
  }

  // Increment comments count
  await supabase.rpc("increment_post_comments", { post_id: postId })

  // Get post author for notification
  const { data: post } = await supabase.from("community_posts").select("author_id").eq("id", postId).single()

  if (post && post.author_id !== authorId) {
    await supabase.from("notifications").insert({
      user_id: post.author_id,
      type: "post_comment",
      title: "Someone commented on your post",
      body: content.substring(0, 50),
      related_user_id: authorId,
      related_entity_id: postId,
    })
  }

  revalidatePath("/community")
  return { success: true }
}

export async function getPostComments(postId: string) {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching comments:", error)
    return { comments: [], error: error.message }
  }

  if (!comments || comments.length === 0) {
    return { comments: [] }
  }

  // Get unique author IDs
  const authorIds = [...new Set(comments.map((c) => c.author_id).filter(Boolean))]

  // Fetch author profiles separately
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", authorIds)

  // Create a map of profiles by ID
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // Merge comments with author data
  const commentsWithAuthors = comments.map((comment) => ({
    ...comment,
    author: profileMap.get(comment.author_id) || null,
  }))

  return { comments: commentsWithAuthors }
}
