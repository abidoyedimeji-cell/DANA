"use client"

import { useState, useEffect } from "react"
import { Download, Loader2, Users, Building2, Calendar, DollarSign, BarChart3 } from "lucide-react"
import Link from "next/link"
import { getAdminStats } from "@/lib/actions/admin-actions"
import { Button } from "@/components/ui/button"

const EXPORT_FORMATS = [
  { label: "CSV", format: "csv" },
  { label: "Excel", format: "xlsx" },
  { label: "PDF", format: "pdf" },
  { label: "Word", format: "docx" },
] as const

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<{
    totalUsers: number
    totalVenues: number
    totalDateInvites: number
    revenuePlaceholder: number
    pendingVerifications: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e?.message ?? "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  const handleExport = (table: string, format: string) => {
    window.open(`/api/admin/export/${table}?format=${format}`, "_blank")
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <Users className="w-10 h-10 text-purple-400" />
          <div>
            <p className="text-white/60 text-sm">Users</p>
            <p className="text-2xl font-bold text-white">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <Building2 className="w-10 h-10 text-pink-400" />
          <div>
            <p className="text-white/60 text-sm">Venues</p>
            <p className="text-2xl font-bold text-white">{stats?.totalVenues ?? 0}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <Calendar className="w-10 h-10 text-orange-400" />
          <div>
            <p className="text-white/60 text-sm">Date requests</p>
            <p className="text-2xl font-bold text-white">{stats?.totalDateInvites ?? 0}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <DollarSign className="w-10 h-10 text-yellow-400" />
          <div>
            <p className="text-white/60 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-white">£{stats?.revenuePlaceholder ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Export section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Export tables
        </h2>
        <p className="text-white/60 text-sm mb-4">
          Download users, venues, dates, or verifications as CSV, Excel, PDF, or Word.
        </p>
        <div className="space-y-4">
          {[
            { table: "users", label: "Users" },
            { table: "venues", label: "Venues" },
            { table: "dates", label: "Date requests" },
            { table: "verifications", label: "Verifications" },
          ].map(({ table, label }) => (
            <div key={table} className="flex flex-wrap items-center gap-2">
              <span className="text-white/80 w-28">{label}</span>
              {EXPORT_FORMATS.map(({ label: fmtLabel, format }) => (
                <Button
                  key={format}
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => handleExport(table, format)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {fmtLabel}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-white/50 text-sm">
        <Link href="/admin" className="hover:text-white">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
