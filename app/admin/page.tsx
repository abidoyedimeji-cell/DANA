"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Users, Building2, Calendar, DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalVenues: 0,
    totalBookings: 0,
    pendingVerifications: 0,
    revenue: 0,
  })

  useEffect(() => {
    async function checkAccess() {
      console.log("[v0] Starting admin access check...")
      const supabase = createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      console.log("[v0] Auth check result:", { user: user?.email, authError })

      if (!user || authError) {
        console.log("[v0] No user found, redirecting to auth")
        router.push("/auth")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_role")
        .eq("id", user.id)
        .single()

      console.log("[v0] Profile check result:", { profile, profileError })

      if (!profile || profile.user_role !== "super_admin") {
        console.log("[v0] Not super admin, redirecting to profile")
        router.push("/app/profile")
        return
      }

      console.log("[v0] Super admin verified, loading dashboard")
      setIsLoading(false)

      loadStats(supabase)
    }

    async function loadStats(supabase: any) {
      try {
        const [usersResult, venuesResult, bookingsResult] = await Promise.all([
          supabase.from("profiles").select("id, email_verified", { count: "exact" }),
          supabase.from("venues").select("id", { count: "exact" }),
          supabase.from("bookings").select("id, amount", { count: "exact" }),
        ])

        setStats({
          totalUsers: usersResult.count || 0,
          verifiedUsers: usersResult.data?.filter((u: any) => u.email_verified).length || 0,
          totalVenues: venuesResult.count || 0,
          totalBookings: bookingsResult.count || 0,
          pendingVerifications: 0,
          revenue: bookingsResult.data?.reduce((sum: number, b: any) => sum + (b.amount || 0), 0) || 0,
        })
      } catch (error) {
        console.error("[v0] Error loading stats:", error)
      }
    }

    checkAccess()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Verifying access...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dana Admin Dashboard</h1>
          <p className="text-white/60">Internal operations and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.verifiedUsers} verified`}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<Building2 className="w-8 h-8" />}
            title="Partner Venues"
            value={stats.totalVenues}
            subtitle="Active partnerships"
            color="from-[var(--dana-pink)] to-pink-600"
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            subtitle="All time"
            color="from-[var(--dana-orange)] to-orange-600"
          />
          <StatCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Revenue"
            value={`£${stats.revenue.toLocaleString()}`}
            subtitle="Total earned"
            color="from-[var(--dana-yellow)] to-yellow-600"
          />
          <StatCard
            icon={<AlertCircle className="w-8 h-8" />}
            title="Pending Verifications"
            value={stats.pendingVerifications}
            subtitle="Requires review"
            color="from-red-500 to-red-600"
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Active Today"
            value="347"
            subtitle="Users online"
            color="from-green-500 to-green-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="User Management"
            description="View, verify, and moderate users"
            href="/admin/users"
            icon="👥"
          />
          <ActionCard
            title="Venue Management"
            description="Add and manage partner venues"
            href="/admin/venues"
            icon="🏢"
          />
          <ActionCard
            title="Deals Management"
            description="Create and manage venue deals"
            href="/admin/deals"
            icon="🎟️"
          />
          <ActionCard
            title="Splash Screen Config"
            description="Customize loading screen venues"
            href="/admin/splash-config"
            icon="🎨"
          />
          <ActionCard
            title="Verification Queue"
            description="Review ID and selfie verifications"
            href="/admin/verifications"
            icon="✅"
          />
          <ActionCard
            title="Bookings & Transactions"
            description="Monitor and manage bookings"
            href="/admin/bookings"
            icon="📅"
          />
          <ActionCard
            title="Reports & Analytics"
            description="View performance metrics"
            href="/admin/analytics"
            icon="📊"
          />
          <ActionCard title="Settings & Config" description="Platform configuration" href="/admin/settings" icon="⚙️" />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  color: string
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} text-white mb-4`}>{icon}</div>
      <h3 className="text-white/60 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-3xl font-bold mb-1">{value}</p>
      <p className="text-white/40 text-sm">{subtitle}</p>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <Link href={href}>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[var(--dana-yellow)]/50 transition-all cursor-pointer group">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[var(--dana-yellow)] transition-colors">
          {title}
        </h3>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
    </Link>
  )
}
