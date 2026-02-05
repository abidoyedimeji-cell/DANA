"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Verification {
  id: string
  user: {
    id: string
    name: string
    email: string
    photo: string
  }
  idPhoto: string
  selfiePhoto: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}

export default function VerificationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("user_role").eq("id", user.id).single()

      if (!profile || profile.user_role !== "super_admin") {
        router.push("/app/profile")
        return
      }

      setIsLoading(false)
      loadVerifications()
    }

    checkAccess()
  }, [router])

  const loadVerifications = () => {
    // TODO: Fetch from Supabase
    setVerifications([
      {
        id: "1",
        user: {
          id: "u1",
          name: "Emma Wilson",
          email: "emma@example.com",
          photo: "/serene-woman.png",
        },
        idPhoto: "/generic-identification-card.png",
        selfiePhoto: "/woman-selfie.png",
        status: "pending",
        submittedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        user: {
          id: "u2",
          name: "James Chen",
          email: "james@example.com",
          photo: "/man-face.png",
        },
        idPhoto: "/drivers-license-mockup.png",
        selfiePhoto: "/man-selfie.jpg",
        status: "pending",
        submittedAt: "2024-01-15T11:45:00Z",
      },
    ])
  }

  const handleApprove = (id: string) => {
    // TODO: Update in Supabase
    setVerifications((prev) => prev.map((v) => (v.id === id ? { ...v, status: "approved" as const } : v)))
    setSelectedVerification(null)
  }

  const handleReject = (id: string) => {
    // TODO: Update in Supabase
    setVerifications((prev) => prev.map((v) => (v.id === id ? { ...v, status: "rejected" as const } : v)))
    setSelectedVerification(null)
  }

  const pendingVerifications = verifications.filter((v) => v.status === "pending")

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
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Verification Queue</h1>
            <p className="text-white/60">{pendingVerifications.length} pending verifications</p>
          </div>
        </div>

        {/* Verification Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-4">
            {pendingVerifications.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">All caught up!</p>
                <p className="text-white/60">No pending verifications to review</p>
              </div>
            ) : (
              pendingVerifications.map((verification) => (
                <button
                  key={verification.id}
                  onClick={() => setSelectedVerification(verification)}
                  className={`w-full bg-white/5 backdrop-blur-sm border rounded-2xl p-6 hover:bg-white/10 transition-all text-left ${
                    selectedVerification?.id === verification.id ? "border-[var(--dana-yellow)]" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={verification.user.photo || "/placeholder.svg"}
                      alt={verification.user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">{verification.user.name}</h3>
                      <p className="text-white/60 text-sm">{verification.user.email}</p>
                      <p className="text-white/40 text-xs mt-1">
                        Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-[var(--dana-orange)]" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Detail View */}
          <div className="sticky top-8">
            {selectedVerification ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-bold text-xl mb-6">Review Verification</h2>

                {/* User Info */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={selectedVerification.user.photo || "/placeholder.svg"}
                      alt={selectedVerification.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-white font-bold">{selectedVerification.user.name}</h3>
                      <p className="text-white/60 text-sm">{selectedVerification.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-white/60 text-sm mb-2">Government ID</p>
                    <img
                      src={selectedVerification.idPhoto || "/placeholder.svg"}
                      alt="ID"
                      className="w-full rounded-xl border border-white/20"
                    />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Live Selfie</p>
                    <img
                      src={selectedVerification.selfiePhoto || "/placeholder.svg"}
                      alt="Selfie"
                      className="w-full rounded-xl border border-white/20"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(selectedVerification.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedVerification.id)}
                    variant="destructive"
                    className="flex-1 font-semibold"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Select a verification to review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
