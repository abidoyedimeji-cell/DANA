"use client"

import { useState, useEffect } from "react"
import { Download, Upload, Loader2 } from "lucide-react"
import { getAdminUsers } from "@/lib/actions/admin-actions"
import { Button } from "@/components/ui/button"

const EXPORT_FORMATS = [
  { label: "CSV", format: "csv" },
  { label: "Excel", format: "xlsx" },
  { label: "PDF", format: "pdf" },
  { label: "Word", format: "docx" },
] as const

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminUsers()
      .then(setRows)
      .catch((e) => setError(e?.message ?? "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  const handleExport = (format: string) => {
    window.open(`/api/admin/export/users?format=${format}`, "_blank")
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <div className="flex gap-2">
          {EXPORT_FORMATS.map(({ label, format }) => (
            <Button
              key={format}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => handleExport(format)}
            >
              <Download className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-white/60 text-sm mb-4">Import: use Venues page pattern (CSV) or add in a later iteration.</p>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/90">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {rows.length > 0 &&
                  Object.keys(rows[0] as Record<string, unknown>).map((key) => (
                    <th key={key} className="px-4 py-3 font-medium">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  {row &&
                    Object.values(row as Record<string, unknown>).map((val, j) => (
                      <td key={j} className="px-4 py-2">
                        {val != null ? String(val) : "—"}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-white/50 text-xs mt-4">{rows.length} rows</p>
    </div>
  )
}
