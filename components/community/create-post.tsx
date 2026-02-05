"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createPost } from "@/lib/actions/community-actions"
import { Button } from "@/components/ui/button"
import { ImageIcon, Loader2, MapPin, X } from "lucide-react"
import Link from "next/link"

export function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const { user, isGuest } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user || !content.trim()) return

    setIsSubmitting(true)
    try {
      console.log("[v0] Creating post with data:", { title, content, description, location })

      await createPost(user.id, {
        content: content.trim(),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        post_type: "general",
      })

      console.log("[v0] Post created successfully")
      setTitle("")
      setContent("")
      setDescription("")
      setLocation("")
      setIsOpen(false)
      // Refresh the feed
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("[v0] Error creating post:", error)
      alert("Error creating post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isGuest) {
    return (
      <Link href="/auth">
        <div className="sticky top-0 z-10 w-full px-4 py-3 bg-[#FBBF24] text-black font-semibold hover:bg-[#FBBF24]/90 transition-colors text-center">
          Sign in to share what's on your mind
        </div>
      </Link>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="sticky top-0 z-10 w-full px-4 py-3 bg-[#FBBF24] text-black font-semibold hover:bg-[#FBBF24]/90 transition-colors"
      >
        What's on your mind?
      </button>
    )
  }

  return (
    <div className="sticky top-0 z-20 bg-black border-b border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">Create Post</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsOpen(false)
              setTitle("")
              setContent("")
              setDescription("")
              setLocation("")
            }}
            className="bg-transparent border-white/20 text-white/60"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="bg-[#FBBF24] text-black hover:bg-[#FBBF24]/90"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{(user?.email || "U")[0].toUpperCase()}</span>
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#FBBF24] focus:outline-none"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            autoFocus
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#FBBF24] focus:outline-none resize-none"
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#FBBF24] focus:outline-none"
          />

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (optional)"
              className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#FBBF24] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ImageIcon className="w-5 h-5 text-white/60" />
            </button>
            <span className="text-xs text-white/40">Add image (coming soon)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
