"use client"

import { Search, Settings } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "connection",
    user: { name: "Sarah", avatar: "/notif-avatar-1.jpg" },
    message: "Sent a connection request to you",
    time: "2m ago",
    action: "Accept",
  },
  {
    id: 2,
    type: "quiz",
    user: { name: "Emma", avatar: "/notif-avatar-2.jpg" },
    message: "Took part in your quiz. See score",
    time: "15m ago",
    action: "View",
  },
  {
    id: 3,
    type: "invite",
    user: { name: "Olivia", avatar: "/notif-avatar-3.jpg" },
    message: "Sent a dating request at Tenpin Bowling. See Details",
    time: "1h ago",
    action: "View",
  },
  {
    id: 4,
    type: "comment",
    user: { name: "Ava", avatar: "/notif-avatar-4.jpg" },
    message: "Commented on your wall post. See interaction",
    time: "2h ago",
    action: "View",
  },
  {
    id: 5,
    type: "invite",
    user: { name: "Mia", avatar: "/notif-avatar-5.jpg" },
    message: "Sent a dating request at Odeon cinema. See Details",
    time: "3h ago",
    action: "View",
  },
  {
    id: 6,
    type: "quiz",
    user: { name: "Isabella", avatar: "/notif-avatar-6.jpg" },
    message: "Shared her quiz results with you. See your score",
    time: "5h ago",
    action: "View",
  },
  {
    id: 7,
    type: "invite",
    user: { name: "Charlotte", avatar: "/notif-avatar-7.jpg" },
    message: "Sent a dating request at Clay Moulding. See Details",
    time: "6h ago",
    action: "View",
  },
  {
    id: 8,
    type: "location",
    user: { name: "Dana App", avatar: "/dana-icon.jpg" },
    message: "New location available for meet ups. Find out more",
    time: "1d ago",
    action: "Explore",
  },
]

export function NotificationsList() {
  return (
    <div className="flex flex-col">
      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
            />
          </div>
          <button className="p-3 bg-white/10 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <img
              src={notif.user.avatar || "/placeholder.svg?height=40&width=40&query=woman avatar"}
              alt={notif.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">{notif.message}</p>
              <p className="text-white/40 text-xs mt-0.5">{notif.time}</p>
            </div>
            <button className="px-4 py-1.5 bg-[#FBBF24] text-black text-xs font-semibold rounded-full hover:bg-[#FBBF24]/90 transition-colors">
              {notif.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
