"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSupabaseClient } from "@/lib/supabase/use-supabase-client"
import { confirmDanaBooking, createDanaHold, getDanaIntersection } from "@/shared/api/availability"
import {
  createDateRequest,
  getDateRequestById,
  markInviterPaid,
} from "@/shared/api/date-requests"
import type { DanaEvent, DanaHold, DanaIntersectionWindow, Venue } from "@/shared/types"

interface InviteModalProps {
  open: boolean
  onClose: () => void
}

type Step = "select-person" | "select-venue" | "select-time" | "payment" | "confirmation"

export function InviteModal({ open, onClose }: InviteModalProps) {
  const supabase = useSupabaseClient()
  const [step, setStep] = useState<Step>("select-person")
  const [selectedPerson] = useState({ name: "Sophie", image: "/professional-woman-smiling.png" })
  const [guestId, setGuestId] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [venuesError, setVenuesError] = useState<string | null>(null)
  const [intersectionWindows, setIntersectionWindows] = useState<DanaIntersectionWindow[]>([])
  const [intersectionError, setIntersectionError] = useState<string | null>(null)
  const [activeHold, setActiveHold] = useState<DanaHold | null>(null)
  const [confirmedEvent, setConfirmedEvent] = useState<DanaEvent | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [dateInviteId, setDateInviteId] = useState<string | null>(null)
  const [inviterPaid, setInviterPaid] = useState(false)
  const [inviteePaid, setInviteePaid] = useState(false)

  useEffect(() => {
    let isMounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return
      setCurrentUserId(data.user?.id ?? null)
    })
    return () => {
      isMounted = false
    }
  }, [supabase])

  useEffect(() => {
    let isMounted = true
    setVenuesError(null)
    supabase
      .from("venues")
      .select("id,name,description,location,address,city,image_url,category,price_range,rating,is_partner,promo_text,created_at")
      .not("exclusive_window", "is", null)
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          setVenuesError(error.message)
          setVenues([])
          return
        }
        setVenues((data ?? []) as Venue[])
      })
    return () => {
      isMounted = false
    }
  }, [supabase])

  useEffect(() => {
    if (!currentUserId || !guestId || !selectedVenue) {
      setIntersectionWindows([])
      setIntersectionError(null)
      return
    }
    let isMounted = true
    setIntersectionError(null)
    getDanaIntersection(supabase, {
      host_id: currentUserId,
      guest_id: guestId,
      venue_id: selectedVenue,
      meeting_duration: "90 minutes",
    })
      .then((data) => {
        if (!isMounted) return
        setIntersectionWindows(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setIntersectionError(err?.message ?? "Unable to calculate availability")
        setIntersectionWindows([])
      })
    return () => {
      isMounted = false
    }
  }, [currentUserId, guestId, selectedVenue, supabase])

  const selectedWindowLabel = useMemo(() => {
    const range = parseTstzRange(selectedTimeSlot)
    if (!range) return ""
    return formatMeetingWindow(range.start, range.end)
  }, [selectedTimeSlot])

  /** Map TSTZRANGE start to proposed_date (YYYY-MM-DD) and proposed_time (HH:MM). */
  const timeSlotToProposed = useCallback((timeSlot: string) => {
    const range = parseTstzRange(timeSlot)
    if (!range) return null
    const start = range.start
    const proposed_date = start.toISOString().slice(0, 10)
    const proposed_time = start.toISOString().slice(11, 16)
    return { proposed_date, proposed_time }
  }, [])

  /** When entering payment step, create date_invite if not yet created. */
  const ensureDateInviteAndGoToPayment = useCallback(async () => {
    if (!currentUserId || !guestId || !selectedVenue || !selectedTimeSlot) return
    const proposed = timeSlotToProposed(selectedTimeSlot)
    if (!proposed) return
    setIsProcessing(true)
    setActionError(null)
    try {
      if (dateInviteId) {
        setStep("payment")
        return
      }
      const invite = await createDateRequest(supabase, currentUserId, {
        invitee_id: guestId,
        venue_id: selectedVenue,
        proposed_date: proposed.proposed_date,
        proposed_time: proposed.proposed_time,
      })
      setDateInviteId(invite.id)
      setInviterPaid(!!invite.inviter_paid)
      setInviteePaid(!!invite.invitee_paid)
      setStep("payment")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create invite."
      setActionError(message)
    } finally {
      setIsProcessing(false)
    }
  }, [
    currentUserId,
    guestId,
    selectedVenue,
    selectedTimeSlot,
    dateInviteId,
    timeSlotToProposed,
    supabase,
  ])

  /** Poll invite for payment status when on payment step. */
  useEffect(() => {
    if (step !== "payment" || !dateInviteId) return
    const t = setInterval(() => {
      getDateRequestById(supabase, dateInviteId).then((inv) => {
        if (inv) {
          setInviterPaid(!!inv.inviter_paid)
          setInviteePaid(!!inv.invitee_paid)
        }
      })
    }, 3000)
    return () => clearInterval(t)
  }, [step, dateInviteId, supabase])

  const handleInviterPay = async () => {
    if (!dateInviteId) return
    setIsProcessing(true)
    setActionError(null)
    try {
      await markInviterPaid(supabase, dateInviteId)
      setInviterPaid(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed."
      setActionError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmBooking = async () => {
    if (!currentUserId || !guestId || !selectedVenue || !selectedTimeSlot || !dateInviteId) return
    if (!inviterPaid || !inviteePaid) return
    setIsProcessing(true)
    setActionError(null)
    try {
      const hold =
        activeHold ??
        (await createDanaHold(supabase, {
          host_id: currentUserId,
          guest_id: guestId,
          venue_id: selectedVenue,
          time_slot: selectedTimeSlot,
          meeting_duration: "90 minutes",
          hold_ttl: "5 minutes",
        }))
      setActiveHold(hold)
      const event = await confirmDanaBooking(supabase, hold.id, dateInviteId)
      setConfirmedEvent(event)
      setStep("confirmation")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to confirm booking."
      setActionError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setStep("select-person")
    setSelectedVenue("")
    setSelectedTimeSlot("")
    setGuestId("")
    setActiveHold(null)
    setConfirmedEvent(null)
    setDateInviteId(null)
    setInviterPaid(false)
    setInviteePaid(false)
    setIntersectionWindows([])
    setIntersectionError(null)
    setActionError(null)
    onClose()
  }

  const selectedVenueData = venues.find((v) => v.id === selectedVenue)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "select-person" && (
          <>
            <DialogHeader>
              <DialogTitle>Send Invite</DialogTitle>
              <DialogDescription>You're about to invite someone to meet at a partner venue</DialogDescription>
            </DialogHeader>

              <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPerson.image || "/placeholder.svg"}
                    alt={selectedPerson.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{selectedPerson.name}</h3>
                    <p className="text-sm text-muted-foreground">Selected from Discover</p>
                  </div>
                  <Badge className="ml-auto bg-accent/10 text-accent border-0">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    Verified
                  </Badge>
                </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="guest-id">Guest user ID</Label>
                    <Input
                      id="guest-id"
                      placeholder="UUID for the guest"
                      value={guestId}
                      onChange={(e) => setGuestId(e.target.value)}
                    />
                  </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="bg-transparent">
                Cancel
              </Button>
              <Button onClick={() => setStep("select-venue")} disabled={!guestId}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "select-venue" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose a Venue</DialogTitle>
              <DialogDescription>Select a partner venue for your meet-up</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Label>Venue</Label>
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} - {venue.location ?? venue.city ?? "Venue"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {venuesError && <p className="text-sm text-destructive">{venuesError}</p>}
              {!venuesError && venues.length === 0 && (
                <p className="text-sm text-muted-foreground">No venues with availability windows yet.</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select-person")} className="bg-transparent">
                Back
              </Button>
              <Button onClick={() => setStep("select-time")} disabled={!selectedVenue}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "select-time" && (
          <>
            <DialogHeader>
              <DialogTitle>Pick a Date & Time</DialogTitle>
              <DialogDescription>When would you like to meet?</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-window">Available meeting windows</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger id="meeting-window">
                    <SelectValue placeholder="Select a time window" />
                  </SelectTrigger>
                  <SelectContent>
                    {intersectionWindows.map((window) => {
                      const range = parseTstzRange(window.meeting_window)
                      const label = range ? formatMeetingWindow(range.start, range.end) : window.meeting_window
                      return (
                        <SelectItem key={window.meeting_window} value={window.meeting_window}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {intersectionError && <p className="text-sm text-destructive">{intersectionError}</p>}
                {!intersectionError && intersectionWindows.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No overlapping availability found yet. Add availability blocks for both users and try again.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select-venue")} className="bg-transparent">
                Back
              </Button>
              <Button
                onClick={ensureDateInviteAndGoToPayment}
                disabled={!selectedTimeSlot || isProcessing}
              >
                {isProcessing ? "Creating invite..." : "Continue to Payment"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm & Pay</DialogTitle>
              <DialogDescription>Review your booking and pay your deposit. Both must pay before confirming.</DialogDescription>
            </DialogHeader>

            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meeting with</span>
                  <span className="font-medium">{selectedPerson.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Venue</span>
                  <span className="font-medium">{selectedVenueData?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium">{selectedWindowLabel}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="text-sm">Your deposit</span>
                  {inviterPaid ? (
                    <Badge variant="secondary">Paid</Badge>
                  ) : (
                    <span className="font-medium">£5.00</span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{selectedPerson.name} also pays £5.</span>
                  {inviteePaid ? (
                    <Badge variant="secondary" className="text-xs">Paid</Badge>
                  ) : (
                    <span>Awaiting their payment</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Cancellation Policy:</strong> Full refund if cancelled 48+ hours before. Partial refund 24-48
                hours. No refund under 24 hours.
              </AlertDescription>
            </Alert>
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}

            <div className="space-y-2">
              {!inviterPaid && (
              <Button className="w-full" onClick={handleInviterPay} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                    Pay £5.00 (your deposit)
                  </>
                )}
              </Button>
              )}
              {inviterPaid && !inviteePaid && (
                <p className="text-sm text-center text-muted-foreground">
                  You&apos;ve paid. Waiting for {selectedPerson.name} to pay their £5. Confirm once they&apos;ve paid from their Bookings.
                </p>
              )}
              {inviterPaid && inviteePaid && (
                <Button className="w-full" onClick={handleConfirmBooking} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Confirming...
                    </>
                  ) : (
                    "Confirm booking"
                  )}
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" disabled={isProcessing}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple Pay
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" disabled={isProcessing}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#4285F4" />
                    <path
                      d="M12 9.75v4.5h6.3c-.27 1.44-1.08 2.66-2.3 3.48l3.7 2.88c2.16-2 3.4-4.94 3.4-8.43 0-.81-.07-1.59-.21-2.34H12z"
                      fill="#fff"
                    />
                  </svg>
                  Google Pay
                </Button>
              </div>
            </div>

            <Button variant="ghost" onClick={() => setStep("select-time")} className="w-full" disabled={!!dateInviteId}>
              Back
            </Button>
          </>
        )}

        {step === "confirmation" && (
          <>
            <DialogHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <DialogTitle>Invite Sent!</DialogTitle>
              <DialogDescription className="text-center">
                Your invite has been sent to {selectedPerson.name}. They have 48 hours to pay their deposit to confirm
                the booking.
              </DialogDescription>
            </DialogHeader>

            <Card className="border-border">
              <CardContent className="p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue</span>
                  <span>{selectedVenueData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span>{selectedWindowLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">{confirmedEvent ? "Confirmed" : "Awaiting Confirmation"}</Badge>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-muted-foreground">
              We'll notify you when {selectedPerson.name} confirms. You can also check the status in your Bookings tab.
            </p>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function parseTstzRange(range: string): { start: Date; end: Date } | null {
  if (!range) return null
  const cleaned = range.replace(/[\[\]\(\)]/g, "")
  const parts = cleaned.split(",")
  if (parts.length < 2) return null
  const startText = parts[0].replace(/"/g, "").trim()
  const endText = parts[1].replace(/"/g, "").trim()
  const start = new Date(startText)
  const end = new Date(endText)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  return { start, end }
}

function formatMeetingWindow(start: Date, end: Date): string {
  const date = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
  const startTime = start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  const endTime = end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  return `${date} · ${startTime} - ${endTime}`
}
