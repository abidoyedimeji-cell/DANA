"use client"

import { useState } from "react"
import { CommunityWall } from "@/components/community/community-wall"
import { NotificationsList } from "@/components/community/notifications-list"

export function CommunityPageClient({ initialUnreadCount }: { initialUnreadCount: number }) {
  const [activeTab, setActiveTab] = useState<"wall" | "notifications">("wall")
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Tab Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-white/10">
        <div className="flex">
          <button
            onClick={() => setActiveTab("wall")}
            className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === "wall" ? "text-[#FBBF24] border-b-2 border-[#FBBF24]" : "text-white/60"
            }`}
          >
            Explore New Connections
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wide transition-colors relative ${
              activeTab === "notifications" ? "text-[#FBBF24] border-b-2 border-[#FBBF24]" : "text-white/60"
            }`}
          >
            Latest Notifications
            {unreadCount > 0 && (
              <span className="absolute top-3 right-8 w-5 h-5 bg-[#E91E8C] rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "wall" ? <CommunityWall /> : <NotificationsList onMarkAsRead={() => setUnreadCount(0)} />}
    </div>
  )
}
