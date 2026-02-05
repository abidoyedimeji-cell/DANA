import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SubscriptionSuccessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to DANA Premium! 🎉</h1>

        <p className="text-gray-600 mb-6">
          Your subscription is now active. You've received £10 in complimentary credits and now have access to exclusive
          venues!
        </p>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
          <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Your Premium Benefits</h3>
          <ul className="text-sm text-gray-700 space-y-2 text-left">
            <li>✓ £10 complimentary credits added</li>
            <li>✓ Access to exclusive venues</li>
            <li>✓ Up to 20% off booking credits</li>
            <li>✓ Priority support</li>
            <li>✓ Early access to new features</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/discover">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">Start Exploring</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" className="w-full bg-transparent">
              Manage Subscription
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
