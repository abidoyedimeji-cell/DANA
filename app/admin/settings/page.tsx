"use client"

import { Settings } from "lucide-react"
import Link from "next/link"

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Settings className="w-7 h-7" />
        Admin settings
      </h1>
      <p className="text-white/60 text-sm mb-8">
        Platform configuration. More options can be added here (e.g. feature flags, defaults).
      </p>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div>
          <h3 className="font-medium text-white">Environment</h3>
          <p className="text-white/60 text-sm">Supabase URL and anon key are read from env. Restart dev server after changing .env.local.</p>
        </div>
        <div>
          <h3 className="font-medium text-white">Admin roles</h3>
          <p className="text-white/60 text-sm">Only profiles with user_role = &quot;admin&quot; or &quot;super_admin&quot; can access /admin. Set in Supabase (profiles table) or via SQL.</p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/admin" className="text-white/70 hover:text-white text-sm">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
