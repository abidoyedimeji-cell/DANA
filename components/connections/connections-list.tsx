"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getMyConnections, acceptConnectionRequest, declineConnectionRequest } from "@/lib/actions/connection-actions"
import { Button } from "@/components/ui/button"
import { Loader2, UserCheck, X, Check } from "lucide-react"

export function ConnectionsList() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadConnections()
    }
  }, [user])

  const loadConnections = async () => {
    if (!user) return

    setLoading(true)
    const { connections: data } = await getMyConnections(user.id)
    setConnections(data)
    setLoading(false)
  }

  const handleAccept = async (connectionId: string) => {
    setProcessingId(connectionId)
    await acceptConnectionRequest(connectionId)
    await loadConnections()
    setProcessingId(null)
  }

  const handleDecline = async (connectionId: string) => {
    setProcessingId(connectionId)
    await declineConnectionRequest(connectionId)
    await loadConnections()
    setProcessingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#E91E8C] animate-spin" />
      </div>
    )
  }

  const pendingRequests = connections.filter((c) => c.status === "pending" && c.recipient_id === user?.id)
  const acceptedConnections = connections.filter((c) => c.status === "accepted")
  const sentRequests = connections.filter((c) => c.status === "pending" && c.requester_id === user?.id)

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">Pending Requests</h2>
          <div className="space-y-3">
            {pendingRequests.map((connection) => {
              const otherUser = connection.requester
              return (
                <div key={connection.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center">
                    <span className="text-white font-bold">
                      {(otherUser?.username || otherUser?.display_name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{otherUser?.display_name || otherUser?.username || "User"}</p>
                    <p className="text-white/60 text-sm">@{otherUser?.username || "unknown"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(connection.id)}
                      disabled={processingId === connection.id}
                      className="bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-black"
                    >
                      {processingId === connection.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecline(connection.id)}
                      disabled={processingId === connection.id}
                      className="border-white/20 text-white/60"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* My Connections */}
      {acceptedConnections.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">
            My Connections ({acceptedConnections.length})
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {acceptedConnections.map((connection) => {
              const otherUser = connection.requester_id === user?.id ? connection.recipient : connection.requester
              return (
                <div key={connection.id} className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {(otherUser?.username || otherUser?.display_name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm truncate">
                    {otherUser?.display_name || otherUser?.username || "User"}
                  </p>
                  <p className="text-white/60 text-xs truncate">@{otherUser?.username || "unknown"}</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-[#2DD4BF] text-xs">
                    <UserCheck className="w-3 h-3" />
                    <span>Connected</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">Sent Requests</h2>
          <div className="space-y-2">
            {sentRequests.map((connection) => {
              const otherUser = connection.recipient
              return (
                <div key={connection.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {(otherUser?.username || otherUser?.display_name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{otherUser?.display_name || otherUser?.username || "User"}</p>
                    <p className="text-white/40 text-xs">Pending...</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {connections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">No connections yet</p>
          <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white">Find People</Button>
        </div>
      )}
    </div>
  )
}
