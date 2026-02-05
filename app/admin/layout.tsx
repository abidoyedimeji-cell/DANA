import type React from "react"
import Link from "next/link"
import { checkAdmin } from "@/lib/auth/check-admin"
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  BarChart3,
  CheckCircle,
  Ticket,
  Image,
  Settings,
  BookOpen,
  ArrowLeft,
} from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdmin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="text-white font-bold text-lg">
            DANA Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <NavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/onboarding" icon={<BookOpen className="w-5 h-5" />}>
            Onboarding
          </NavLink>
          <NavLink href="/admin/users" icon={<Users className="w-5 h-5" />}>
            Users
          </NavLink>
          <NavLink href="/admin/venues" icon={<Building2 className="w-5 h-5" />}>
            Venues
          </NavLink>
          <NavLink href="/admin/bookings" icon={<Calendar className="w-5 h-5" />}>
            Bookings / Dates
          </NavLink>
          <NavLink href="/admin/analytics" icon={<BarChart3 className="w-5 h-5" />}>
            Analytics
          </NavLink>
          <NavLink href="/admin/verifications" icon={<CheckCircle className="w-5 h-5" />}>
            Verifications
          </NavLink>
          <NavLink href="/admin/deals" icon={<Ticket className="w-5 h-5" />}>
            Deals
          </NavLink>
          <NavLink href="/admin/splash-config" icon={<Image className="w-5 h-5" />}>
            Splash Config
          </NavLink>
          <NavLink href="/admin/settings" icon={<Settings className="w-5 h-5" />}>
            Settings
          </NavLink>
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link
            href="/app"
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{children}</span>
    </Link>
  )
}
