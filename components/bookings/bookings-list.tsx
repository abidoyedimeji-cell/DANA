"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InviteModal } from "@/components/bookings/invite-modal"
import { RescheduleModal } from "@/components/bookings/reschedule-modal"
import { acceptBooking, declineBooking, cancelBooking } from "@/app/actions/bookings"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSupabaseClient } from "@/lib/supabase/use-supabase-client"
import { getDateRequestsForUser } from "@/shared/api/date-requests"
import type { DateRequest, DateRequestStatus, Profile, Venue } from "@/shared/types"

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"

interface Booking {
  id: string
  guestName: string
  guestImage: string
  venue: string
  venueLocation: string
  date: string
  time: string
  status: BookingStatus
  userPaid: boolean
  guestPaid: boolean
  type: "dating" | "business"
  isInvitee: boolean
  inviterPaid: boolean
}

const statusConfig: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "Awaiting Payment", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

export function BookingsList() {
  const supabase = useSupabaseClient()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [rescheduleInviteId, setRescheduleInviteId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setBookings([])
        setError("Please sign in to view bookings.")
        return
      }
      const invites = await getDateRequestsForUser(supabase, user.id)
      const mapped = invites.map((invite) => mapInviteToBooking(invite, user.id))
      setBookings(mapped)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const upcomingBookings = useMemo(
    () =>
      bookings.filter((b) => {
        if (b.status === "cancelled" || b.status === "completed") return false
        return new Date(`${b.date}T${b.time}`) >= new Date()
      }),
    [bookings],
  )
  const pastBookings = useMemo(
    () => bookings.filter((b) => b.status === "completed" || b.status === "cancelled"),
    [bookings],
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Button className="w-full mb-4" onClick={() => setShowInviteModal(true)}>
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Send New Invite
      </Button>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center text-muted-foreground">Loading bookings...</CardContent>
            </Card>
          ) : error ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center text-destructive">{error}</CardContent>
            </Card>
          ) : upcomingBookings.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground mb-2">No upcoming bookings</p>
                <p className="text-sm text-muted-foreground">
                  Send an invite to someone you'd like to meet at a partner venue
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                formatDate={formatDate}
                onReschedule={booking.status === "confirmed" ? () => setRescheduleInviteId(booking.id) : undefined}
                onUpdated={loadBookings}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center text-muted-foreground">Loading bookings...</CardContent>
            </Card>
          ) : error ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center text-destructive">{error}</CardContent>
            </Card>
          ) : pastBookings.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No past bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                formatDate={formatDate}
                onUpdated={loadBookings}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <InviteModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
      <RescheduleModal
        open={!!rescheduleInviteId}
        onClose={() => setRescheduleInviteId(null)}
        dateInviteId={rescheduleInviteId}
        onSuccess={loadBookings}
      />
    </div>
  )
}

function mapInviteToBooking(invite: DateRequest, currentUserId: string): Booking {
  const isInvitee = invite.invitee_id === currentUserId
  const otherProfile = (isInvitee ? invite.inviter : invite.invitee) as Profile | null
  const venue = invite.venue as Venue | null
  return {
    id: invite.id,
    guestName: otherProfile?.first_name || otherProfile?.display_name || "Guest",
    guestImage: otherProfile?.avatar_url || "/placeholder.svg",
    venue: venue?.name ?? "Venue",
    venueLocation: venue?.location ?? venue?.city ?? "Venue",
    date: invite.proposed_date,
    time: invite.proposed_time?.slice(0, 5) ?? invite.proposed_time,
    status: mapInviteStatus(invite.status),
    userPaid: isInvitee ? invite.invitee_paid : invite.inviter_paid,
    guestPaid: isInvitee ? invite.inviter_paid : invite.invitee_paid,
    type: "dating",
    isInvitee,
    inviterPaid: invite.inviter_paid,
  }
}

function mapInviteStatus(status: DateRequestStatus): BookingStatus {
  if (status === "accepted") return "confirmed"
  if (status === "completed") return "completed"
  if (status === "cancelled" || status === "declined") return "cancelled"
  return "pending"
}

function BookingCard({
  booking,
  formatDate,
  onReschedule,
  onUpdated,
}: {
  booking: Booking
  formatDate: (date: string) => string
  onReschedule?: () => void
  onUpdated?: () => void
}) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  const config = statusConfig[booking.status]

  const handleAccept = async () => {
    setIsAccepting(true)
    const result = await acceptBooking(booking.id)
    setIsAccepting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Deposit received. Inviter can now confirm the booking.")
      onUpdated?.()
      router.refresh()
    }
  }

  const handleDecline = async () => {
    const reason = prompt("Reason for declining (optional):")
    setIsDeclining(true)
    const result = await declineBooking(booking.id, reason || undefined)
    setIsDeclining(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Booking declined. Sender has been refunded.")
      onUpdated?.()
      router.refresh()
    }
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking? Refund policy applies.")) {
      return
    }

    const reason = prompt("Reason for cancellation (optional):")
    setIsCancelling(true)
    const result = await cancelBooking(booking.id, reason || undefined)
    setIsCancelling(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message || "Booking cancelled")
      onUpdated?.()
      router.refresh()
    }
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={booking.guestImage || "/placeholder.svg"}
              alt={booking.guestName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <CardTitle className="text-base">Meet-up with {booking.guestName}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {booking.venue}, {booking.venueLocation}
              </p>
            </div>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            {formatDate(booking.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {booking.time}
          </span>
          <Badge variant="secondary" className="text-xs">
            {booking.type === "dating" ? "Date" : "Business"}
          </Badge>
        </div>

        {booking.status === "pending" && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium mb-2">Payment Status</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                {booking.userPaid ? (
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                )}
                You: {booking.userPaid ? "Paid" : "Pending"}
              </span>
              <span className="flex items-center gap-1.5">
                {booking.guestPaid ? (
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                )}
                {booking.guestName}: {booking.guestPaid ? "Paid" : "Pending"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Booking confirms when both parties pay their £5 deposit
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {booking.status === "confirmed" && (
            <>
              {onReschedule && (
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onReschedule}>
                  Reschedule
                </Button>
              )}
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent text-destructive border-destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>
            </>
          )}
          {booking.status === "pending" && booking.isInvitee && (
            <>
              {!booking.inviterPaid ? (
                <p className="text-xs text-muted-foreground">
                  Waiting for the inviter to pay their deposit before you can accept.
                </p>
              ) : (
                <>
                  <Button size="sm" className="flex-1" onClick={handleAccept} disabled={isAccepting}>
                    {isAccepting ? "Processing..." : "Accept & Pay £5"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={handleDecline}
                    disabled={isDeclining}
                  >
                    {isDeclining ? "Declining..." : "Decline"}
                  </Button>
                </>
              )}
            </>
          )}
          {booking.status === "completed" && (
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              Leave Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
