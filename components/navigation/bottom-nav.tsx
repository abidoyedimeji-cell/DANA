"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageCircle, Home, MapPin, Search, User, Bell } from "lucide-react"
import { useEffect, useState } from "react"

const navItems = [
  {
    href: "/community",
    label: "Chat",
    icon: MessageCircle,
  },
  {
    href: "/dashboard",
    label: "Feed",
    isHome: true,
  },
  {
    href: "/spots",
    label: "Spots",
    icon: MapPin,
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else if (lastScrollY - currentScrollY > 5) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
          isVisible ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0",
        )}
      >
        <div className="flex items-center gap-2 bg-black/90 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 shadow-lg shadow-black/50">
          <Link
            href="/dashboard"
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              pathname === "/dashboard" ? "bg-[#FF6B35]" : "bg-white/10 hover:bg-white/20",
            )}
          >
            <Home className="w-5 h-5 text-white" />
          </Link>
          <Link
            href="/notifications"
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              pathname === "/notifications" ? "bg-[#FF6B35]" : "bg-white/10 hover:bg-white/20",
            )}
          >
            <Bell className="w-5 h-5 text-white" />
          </Link>
          <Link
            href="/profile"
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              pathname.startsWith("/profile") ? "bg-[#FF6B35]" : "bg-white/10 hover:bg-white/20",
            )}
          >
            <User className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>

      {/* Main navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 safe-area-pb transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = item.isHome ? pathname === "/dashboard" : pathname.startsWith(item.href)

            if (item.isHome) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-w-[56px]"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isActive ? "bg-[#FF6B35]" : "bg-[#FF6B35]/70",
                    )}
                  >
                    <Home className="w-5 h-5 text-white" />
                  </div>
                </Link>
              )
            }

            const Icon = item.icon!

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-w-[56px]"
              >
                <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-[#FF6B35]" : "text-white/60")} />
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
