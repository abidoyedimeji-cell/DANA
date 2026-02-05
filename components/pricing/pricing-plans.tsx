"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Sparkles, Crown } from "lucide-react"
import { createCheckoutSession } from "@/app/actions/stripe"
import { useRouter } from "next/navigation"

export function PricingPlans() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null)
  const router = useRouter()

  const handleSubscribe = async (planType: "monthly" | "yearly") => {
    setLoading(planType)
    const result = await createCheckoutSession(planType)

    if (result.error) {
      alert(result.error)
      setLoading(null)
      return
    }

    if (result.url) {
      window.location.href = result.url
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Free Plan */}
      <Card className="relative overflow-hidden border-2 border-gray-200 bg-white p-8">
        <div className="mb-6">
          <h3 className="mb-2 text-2xl font-bold text-gray-900">Free</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">£0</span>
            <span className="text-gray-600">/month</span>
          </div>
        </div>

        <ul className="mb-8 space-y-4">
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
            <span className="text-gray-700">Browse all profiles</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
            <span className="text-gray-700">Send date invitations</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
            <span className="text-gray-700">Access to partner venues</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
            <span className="text-gray-700">Standard booking credits</span>
          </li>
        </ul>

        <Button className="w-full bg-transparent" variant="outline" disabled>
          Current Plan
        </Button>
      </Card>

      {/* Premium Plan */}
      <Card className="relative overflow-hidden border-4 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-2xl">
        <div className="absolute right-4 top-4">
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-semibold text-white">
            <Crown className="h-3 w-3" />
            POPULAR
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>

          <div className="mb-4 flex items-center gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">£9.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <Button
                onClick={() => handleSubscribe("monthly")}
                disabled={loading === "monthly"}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700"
              >
                {loading === "monthly" ? "Processing..." : "Subscribe Monthly"}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">or</div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">£120</span>
                <span className="text-gray-600">/year</span>
              </div>
              <div className="mt-1 text-sm text-green-600 font-semibold">Save £40 per year!</div>
              <Button
                onClick={() => handleSubscribe("yearly")}
                disabled={loading === "yearly"}
                className="mt-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700"
              >
                {loading === "yearly" ? "Processing..." : "Subscribe Yearly"}
              </Button>
            </div>
          </div>
        </div>

        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600" />
            <span className="font-semibold text-gray-900">Everything in Free, plus:</span>
          </li>
          <li className="flex items-start gap-3">
            <Crown className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600" />
            <span className="text-gray-700">
              <strong>Exclusive venue access</strong> - Premium locations
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600" />
            <span className="text-gray-700">
              <strong>£10 complimentary credits</strong> every month
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600" />
            <span className="text-gray-700">
              <strong>10% off</strong> monthly plan credits (20% off yearly)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600" />
            <span className="text-gray-700">Priority support</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600" />
            <span className="text-gray-700">Early access to new features</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
