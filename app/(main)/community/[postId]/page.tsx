"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, Send } from "lucide-react"
import { getCommunityPosts, getPostComments, addComment, likePost } from "@/lib/actions/community-actions"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const postId = params.postId as string

  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPostAndComments()
  }, [postId])

  const loadPostAndComments = async () => {
    setLoading(true)
    const { posts } = await getCommunityPosts(100, 0)
    const foundPost = posts.find((p) => p.id === postId)
    setPost(foundPost)

    if (foundPost) {
      const { comments: fetchedComments } = await getPostComments(postId)
      setComments(fetchedComments)
    }
    setLoading(false)
  }

  const handleLike = async () => {
    if (!user) return
    setPost((prev: any) => {
      const isLiked = prev.user_liked
      return {
        ...prev,
        user_liked: !isLiked,
        likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1,
      }
    })
    await likePost(postId, user.id)
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return
    setSubmitting(true)

    const result = await addComment(postId, user.id, newComment)
    if (!result.error) {
      setNewComment("")
      await loadPostAndComments()
    }
    setSubmitting(false)
  }

  if (loading || !post) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-[var(--dana-yellow)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-white font-semibold">Post</span>
        </div>
      </div>

      {/* Post */}
      <div className="border-b border-white/10 pb-6">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={post.author?.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
              alt={post.author?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{post.author?.username || "Anonymous"}</span>
                {post.author?.is_verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-white/60 text-sm">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <p className="text-white text-lg mb-4">{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url || "/placeholder.svg"}
              alt="Post"
              className="w-full rounded-2xl object-cover max-h-96 mb-4"
            />
          )}

          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-2">
              <Heart
                className={`w-6 h-6 ${post.user_liked ? "text-[var(--dana-pink)] fill-[var(--dana-pink)]" : "text-white"}`}
              />
              <span className="text-white">{post.likes_count || 0}</span>
            </button>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-white">{post.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="p-4 space-y-4">
        <h3 className="text-white font-semibold mb-4">Comments</h3>

        {comments.length === 0 ? (
          <p className="text-white/60 text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.author?.avatar_url || "/placeholder.svg?height=32&width=32&query=avatar"}
                alt={comment.author?.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="bg-white/5 rounded-2xl px-4 py-3">
                  <p className="text-white font-semibold text-sm mb-1">{comment.author?.username || "Anonymous"}</p>
                  <p className="text-white/90">{comment.content}</p>
                </div>
                <p className="text-white/40 text-xs mt-1 px-4">
                  {new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-black border-t border-white/10 p-4">
        {user ? (
          <div className="flex items-center gap-3">
            <img
              src={profile?.avatar_url || "/placeholder.svg?height=32&width=32&query=avatar"}
              alt="You"
              className="w-8 h-8 rounded-full object-cover"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/10 text-white placeholder:text-white/40 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--dana-yellow)]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitComment()
                }
              }}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              size="icon"
              className="bg-[var(--dana-yellow)] text-black hover:bg-[var(--dana-gold)] rounded-full"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => router.push("/auth")}
            className="w-full bg-[var(--dana-yellow)] text-black hover:bg-[var(--dana-gold)] rounded-full font-semibold"
          >
            Sign in to comment
          </Button>
        )}
      </div>
    </div>
  )
}
