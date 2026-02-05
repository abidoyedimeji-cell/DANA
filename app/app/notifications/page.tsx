"use client"

import { useState, useEffect } from "react"
import { Bell, Heart, MessageCircle, UserPlus, Tag, Calendar, Eye, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  type: string
  title: string
  message?: string
  is_read: boolean
  created_at: string
  related_user_id?: string
  related_entity_id?: string
  action_url?: string
  action_type?: string
  action_label?: string
  related_user?: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
  }
}

// Sample notifications for visual representation
const sampleNotifications: Notification[] = [
  {
    id: "sample-1",
    type: "connection_request",
    title: "New Connection Request",
    message: "Sarah would like to connect with you",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    related_user_id: "user-1",
    action_type: "view_profile",
    action_url: "/app/profile/user-1",
    action_label: "Accept",
    related_user: {
      id: "user-1",
      username: "sarah_designs",
      display_name: "Sarah Chen",
      avatar_url: "/professional-woman.png",
    },
  },
  {
    id: "sample-2",
    type: "post_like",
    title: "Your post got some love!",
    message: "James and 5 others liked your post",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    related_user_id: "user-2",
    related_entity_id: "post-1",
    action_type: "view_content",
    action_url: "/app/community/post-1",
    action_label: "View Post",
    related_user: {
      id: "user-2",
      username: "james_creative",
      display_name: "James Wilson",
      avatar_url: "/creative-man.png",
    },
  },
  {
    id: "sample-3",
    type: "deal_expiring",
    title: "Deal Expiring Soon!",
    message: "Your 20% off at The Ivy Chelsea expires tomorrow",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    action_type: "take_action",
    action_url: "/app/spots",
    action_label: "Book Now",
  },
  {
    id: "sample-4",
    type: "post_comment",
    title: "New Comment",
    message: 'Emma replied to your post: "This looks amazing!"',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    related_user_id: "user-3",
    related_entity_id: "post-2",
    action_type: "view_content",
    action_url: "/app/community/post-2",
    action_label: "Reply",
    related_user: {
      id: "user-3",
      username: "emma_style",
      display_name: "Emma Thompson",
      avatar_url: "/woman-stylish.jpg",
    },
  },
  {
    id: "sample-5",
    type: "date_invite",
    title: "Date Invitation",
    message: "Michael invited you to dinner at Cecconi's",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    related_user_id: "user-4",
    related_entity_id: "invite-1",
    action_type: "take_action",
    action_url: "/app/bookings",
    action_label: "Respond",
    related_user: {
      id: "user-4",
      username: "michael_london",
      display_name: "Michael Brooks",
      avatar_url: "/man-professional-suit.png",
    },
  },
  {
    id: "sample-6",
    type: "new_match",
    title: "New Match!",
    message: "You and Olivia have mutual interests",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    related_user_id: "user-5",
    action_type: "view_profile",
    action_url: "/app/profile/user-5",
    action_label: "Say Hello",
    related_user: {
      id: "user-5",
      username: "olivia_art",
      display_name: "Olivia Martinez",
      avatar_url: "/woman-artistic.jpg",
    },
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "connection_request":
    case "new_match":
      return <UserPlus className="w-4 h-4" />
    case "post_like":
      return <Heart className="w-4 h-4" />
    case "post_comment":
      return <MessageCircle className="w-4 h-4" />
    case "deal_expiring":
    case "new_deal":
      return <Tag className="w-4 h-4" />
    case "date_invite":
      return <Calendar className="w-4 h-4" />
    default:
      return <Bell className="w-4 h-4" />
  }
}

const getIconBgColor = (type: string) => {
  switch (type) {
    case "connection_request":
    case "new_match":
      return "bg-blue-500"
    case "post_like":
      return "bg-[var(--dana-pink)]"
    case "post_comment":
      return "bg-green-500"
    case "deal_expiring":
    case "new_deal":
      return "bg-[var(--dana-orange)]"
    case "date_invite":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (!error && data && data.length > 0) {
      setNotifications([...data, ...sampleNotifications])
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))

    if (!notificationId.startsWith("sample-") && user) {
      const supabase = createClient()
      await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

    if (user) {
      const supabase = createClient()
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)
    }
  }

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-[var(--dana-pink)] text-sm">
                Mark all read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === "unread" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="bg-[var(--dana-pink)] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center text-sm">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.action_url || "#"}
              className={`block p-3 ${!notification.is_read ? "bg-muted/30" : ""}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex gap-2">
                {/* Left column: Avatar with time underneath */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {notification.related_user ? (
                    <Link href={`/app/discover/${notification.related_user.id}`} onClick={(e) => e.stopPropagation()}>
                      <img
                        src={notification.related_user.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                        alt={notification.related_user.display_name || notification.related_user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </Link>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full ${getIconBgColor(notification.type)} flex items-center justify-center text-white`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                </div>

                {/* Right column: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full ${getIconBgColor(notification.type)} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <p
                      className={`font-semibold text-sm flex-1 ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-[var(--dana-pink)] rounded-full flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Primary Action Button */}
                    {notification.action_url && (
                      <Button
                        size="sm"
                        className="rounded-full text-xs h-7 bg-[var(--dana-pink)] hover:bg-[var(--dana-pink)]/90 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {notification.action_label === "Book Now" ? "Get Offer" : notification.action_label || "View"}
                      </Button>
                    )}

                    {/* Secondary Action: View Content if applicable */}
                    {notification.action_type === "view_content" && notification.related_entity_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs h-7 bg-transparent px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>

                  {notification.message && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
