"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Trash2, Clock, ImageIcon, Video } from "lucide-react"

interface Media {
  id: number
  url: string
  type: "image" | "video"
  isEphemeral: boolean
  expiresAt?: string
}

interface MediaManagerProps {
  onClose: () => void
  media: Media[]
}

export function MediaManager({ onClose, media: initialMedia }: MediaManagerProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia)
  const [showUploadOptions, setShowUploadOptions] = useState(false)

  const permanentMedia = media.filter((m) => !m.isEphemeral)
  const ephemeralMedia = media.filter((m) => m.isEphemeral)

  const handleDelete = (id: number) => {
    setMedia(media.filter((m) => m.id !== id))
  }

  const handleAddEphemeral = () => {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()
    setMedia([
      ...media,
      {
        id: Date.now(),
        url: "/placeholder.svg",
        type: "image",
        isEphemeral: true,
        expiresAt,
      },
    ])
    setShowUploadOptions(false)
  }

  const handleAddPermanent = () => {
    if (permanentMedia.length >= 6) {
      alert("Maximum 6 permanent media items allowed")
      return
    }
    setMedia([
      ...media,
      {
        id: Date.now(),
        url: "/placeholder.svg",
        type: "image",
        isEphemeral: false,
      },
    ])
    setShowUploadOptions(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Manage Media</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Ephemeral Media Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="text-white font-semibold text-sm">24-Hour Stories</h3>
            </div>
            <button
              onClick={handleAddEphemeral}
              className="text-[#FBBF24] text-xs font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Story
            </button>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            {ephemeralMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {ephemeralMedia.map((item) => (
                  <div key={item.id} className="relative aspect-[9/16] rounded-lg overflow-hidden group">
                    <img src={item.url || "/placeholder.svg"} alt="Ephemeral" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-[10px]">Expires: {item.expiresAt}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60 text-sm">No active stories</p>
                <p className="text-white/40 text-xs">Stories disappear after 24 hours</p>
              </div>
            )}
          </div>
        </div>

        {/* Permanent Media Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#E91E8C]" />
              <h3 className="text-white font-semibold text-sm">Profile Gallery ({permanentMedia.length}/6)</h3>
            </div>
            {permanentMedia.length < 6 && (
              <button
                onClick={handleAddPermanent}
                className="text-[#E91E8C] text-xs font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Photo
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {permanentMedia.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={item.url || "/placeholder.svg"} alt="Profile media" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
                {item.type === "video" && (
                  <div className="absolute bottom-2 left-2">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {permanentMedia.length < 6 && (
              <button
                onClick={handleAddPermanent}
                className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:border-[#E91E8C]/50 transition-colors"
              >
                <Plus className="w-8 h-8 text-white/40" />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#E91E8C]/10 border border-[#E91E8C]/30 rounded-xl p-4 mb-6">
          <p className="text-[#E91E8C] text-xs">
            • Stories are visible for 24 hours and then auto-deleted
            <br />• Profile gallery supports up to 6 photos/videos
            <br />• Gallery media stays on your profile permanently
          </p>
        </div>

        {/* Save Button */}
        <Button onClick={onClose} className="w-full bg-[#E91E8C] text-white rounded-full">
          Done
        </Button>
      </div>
    </div>
  )
}
