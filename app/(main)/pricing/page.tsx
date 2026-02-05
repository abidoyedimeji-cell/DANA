import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PricingPlans } from "@/components/pricing/pricing-plans"

export const metadata = {
  title: "Pricing - DANA",
  description: "Choose your DANA Premium plan",
}

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Upgrade to DANA Premium</h1>
          <p className="text-lg text-gray-600">Get exclusive access, credits, and discounts</p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <PricingPlans />
        </Suspense>
      </div>
    </div>
  )
}
