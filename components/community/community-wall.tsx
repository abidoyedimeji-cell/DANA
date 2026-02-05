"use client"

import { useState, useEffect } from "react"
import { Search, Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react"
import { getCommunityPosts, likePost } from "@/lib/actions/community-actions"
import { useAuth } from "@/lib/auth-context"

export function CommunityWall() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    const { posts: fetchedPosts } = await getCommunityPosts(20, 0)
    setPosts(fetchedPosts)
    setLoading(false)
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = post.user_liked
          return {
            ...post,
            user_liked: !isLiked,
            likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
          }
        }
        return post
      }),
    )

    await likePost(postId, user.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search community..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
          />
        </div>
      </div>

      {/* Posts */}
      <div className="px-4 space-y-4 pb-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => {
            if (post.post_type === "question") {
              return (
                <div key={post.id} className="bg-[#FBBF24] rounded-2xl p-4">
                  <p className="text-black font-bold text-sm mb-2">DANA SUGGESTED TOPICS</p>
                  <p className="text-black text-lg font-medium mb-3">{post.content}</p>
                  <div className="flex gap-2">
                    <div className="flex -space-x-2">
                      <Heart className="w-5 h-5 text-[#E91E8C]" />
                      <MessageCircle className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div className="flex-1 bg-white/30 rounded-full h-8" />
                    <Send className="w-5 h-5 text-black/60" />
                  </div>
                </div>
              )
            }

            return (
              <div key={post.id} className="bg-[#FBBF24] rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-3 flex items-center gap-2">
                  <img
                    src={post.author?.avatar_url || "/placeholder.svg?height=32&width=32&query=avatar"}
                    alt={post.author?.username || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-black font-bold text-sm">{post.author?.username || "Anonymous"}</span>
                      {post.author?.is_verified && (
                        <svg className="w-4 h-4 text-[#3B82F6]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-black/70 text-xs">{post.content}</p>
                  </div>
                  <button>
                    <MoreHorizontal className="w-5 h-5 text-black/60" />
                  </button>
                </div>

                {/* Image */}
                {post.image_url && (
                  <div className="relative">
                    <img
                      src={post.image_url || "/placeholder.svg?height=200&width=400&query=social post"}
                      alt=""
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="p-3 flex items-center gap-4">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1">
                    <Heart
                      className={`w-5 h-5 ${post.user_liked ? "text-[#E91E8C] fill-[#E91E8C]" : "text-black/60"}`}
                    />
                    <span className="text-black/60 text-sm">{post.likes_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5 text-black/60" />
                    <span className="text-black/60 text-sm">{post.comments_count || 0}</span>
                  </button>
                  <div className="flex-1" />
                  <button>
                    <Send className="w-5 h-5 text-black/60" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
