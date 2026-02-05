"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Camera, ImageIcon, Video, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { createPost } from "@/lib/actions/community-actions"

interface PostComposerProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

export function PostComposer({ isOpen, onClose, onPostCreated }: PostComposerProps) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState("")
  const [mediaType, setMediaType] = useState<"none" | "image" | "carousel" | "video">("none")
  const [images, setImages] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    const maxImages = 7 - images.length

    Array.from(files)
      .slice(0, maxImages)
      .forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          newImages.push(reader.result as string)
          if (newImages.length === Math.min(files.length, maxImages)) {
            setImages((prev) => [...prev, ...newImages].slice(0, 7))
            setMediaType(images.length + newImages.length > 1 ? "carousel" : "image")
          }
        }
        reader.readAsDataURL(file)
      })
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = video.duration

      if (duration > 20) {
        alert("Video must be 20 seconds or less")
        return
      }

      setVideoDuration(Math.round(duration))
      const reader = new FileReader()
      reader.onload = () => {
        setVideoUrl(reader.result as string)
        setMediaType("video")
        setImages([])
      }
      reader.readAsDataURL(file)
    }

    video.src = URL.createObjectURL(file)
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index)
      if (newImages.length === 0) setMediaType("none")
      else if (newImages.length === 1) setMediaType("image")
      return newImages
    })
  }

  const removeVideo = () => {
    setVideoUrl(null)
    setVideoDuration(0)
    setMediaType("none")
  }

  const handleSubmit = async () => {
    if (!user || (!content.trim() && mediaType === "none")) return

    setIsSubmitting(true)
    try {
      await createPost(user.id, {
        content: content.trim(),
        image_url: mediaType === "image" ? images[0] : undefined,
        media_urls: mediaType === "carousel" ? images : undefined,
        video_url: mediaType === "video" ? videoUrl || undefined : undefined,
        video_duration: mediaType === "video" ? videoDuration : undefined,
        media_type: mediaType,
      })

      setContent("")
      setImages([])
      setVideoUrl(null)
      setVideoDuration(0)
      setMediaType("none")
      onPostCreated?.()
      onClose()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
      <div className="bg-background w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <h2 className="font-bold text-lg">Create Post</h2>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && mediaType === "none")}
            size="sm"
            className="bg-[var(--dana-pink)] hover:bg-[var(--dana-pink)]/90 rounded-full"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 p-4">
          <img
            src={profile?.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
            alt={profile?.username || "You"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-semibold">{profile?.display_name || profile?.username || "You"}</span>
        </div>

        {/* Content */}
        <div className="px-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-0 resize-none text-lg min-h-[100px] focus-visible:ring-0 p-0"
          />
        </div>

        {/* Media Preview */}
        {mediaType === "video" && videoUrl && (
          <div className="px-4 py-2">
            <div className="relative rounded-2xl overflow-hidden">
              <video src={videoUrl} className="w-full max-h-64 object-cover" controls />
              <button onClick={removeVideo} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full">
                <Trash2 className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-full text-xs text-white">
                {videoDuration}s / 20s
              </div>
            </div>
          </div>
        )}

        {(mediaType === "image" || mediaType === "carousel") && images.length > 0 && (
          <div className="px-4 py-2">
            <div className={`grid ${images.length === 1 ? "grid-cols-1" : "grid-cols-3"} gap-2`}>
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 7 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{images.length}/7 images</p>
          </div>
        )}

        {/* Media Actions */}
        <div className="p-4 border-t mt-4">
          <p className="text-sm text-muted-foreground mb-3">Add to your post</p>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={mediaType === "video"}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Photo</span>
            </button>

            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={mediaType === "carousel" || mediaType === "image"}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              <Video className="w-5 h-5 text-[var(--dana-pink)]" />
              <span className="text-sm font-medium">Video</span>
            </button>

            <button
              onClick={() => {
                // Could trigger camera directly on mobile
                fileInputRef.current?.click()
              }}
              disabled={mediaType === "video"}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              <Camera className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Camera</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
