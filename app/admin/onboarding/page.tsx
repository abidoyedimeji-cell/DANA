"use client"

import { BookOpen, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminOnboardingPage() {
  const steps = [
    { title: "Admin access", desc: "Ensure your profile has user_role = admin or super_admin in Supabase.", done: true },
    { title: "Supabase env", desc: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.", done: true },
    { title: "RLS policies", desc: "Run migrations so profiles, venues, date_invites, verifications have correct RLS.", done: true },
    { title: "Seed data (optional)", desc: "Run seed script for sample venues and users if needed.", done: false },
  ]

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <BookOpen className="w-7 h-7" />
        Admin onboarding
      </h1>
      <p className="text-white/60 text-sm mb-8">
        First-time setup checklist. Complete these so the admin dashboard and exports work correctly.
      </p>

      <ul className="space-y-4">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <CheckCircle className="w-6 h-6 text-white/50 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-white">{step.title}</h3>
              <p className="text-white/60 text-sm mt-1">{step.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
