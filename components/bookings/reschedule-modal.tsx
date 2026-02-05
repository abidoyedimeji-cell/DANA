"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabaseClient } from "@/lib/supabase/use-supabase-client"
import { getDateRequestById } from "@/shared/api/date-requests"
import { getDanaIntersection } from "@/shared/api/availability"
import { canSwapBooking } from "@/shared/api/booking-swap"
import { chargeAndExecuteSwap } from "@/app/actions/booking-swap"
import type { Venue } from "@/shared/types"

function parseTstzRange(range: string): { start: Date; end: Date } | null {
  if (!range) return null
  const cleaned = range.replace(/[\[\]\(\)]/g, "")
  const parts = cleaned.split(",")
  if (parts.length < 2) return null
  const start = new Date(parts[0].replace(/"/g, "").trim())
  const end = new Date(parts[1].replace(/"/g, "").trim())
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  return { start, end }
}

function formatSlot(range: string): string {
  const r = parseTstzRange(range)
  if (!r) return range
  const date = r.start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
  const time = r.start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  return `${date} · ${time}`
}

interface RescheduleModalProps {
  open: boolean
  onClose: () => void
  dateInviteId: string | null
  onSuccess?: () => void
}

export function RescheduleModal({ open, onClose, dateInviteId, onSuccess }: RescheduleModalProps) {
  const supabase = useSupabaseClient()
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenueId, setSelectedVenueId] = useState("")
  const [timeSlots, setTimeSlots] = useState<{ value: string; label: string }[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [checkMessage, setCheckMessage] = useState<string | null>(null)
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSelectedVenueId("")
    setSelectedTimeSlot("")
    setCheckMessage(null)
    setAllowed(false)
    setError(null)
    supabase
      .from("venues")
      .select("id,name,description,location,address,city,image_url,category,price_range,rating,is_partner,promo_text,created_at")
      .not("exclusive_window", "is", null)
      .then(({ data }) => setVenues((data ?? []) as Venue[]))
  }, [open, supabase])

  useEffect(() => {
    if (!open || !dateInviteId || !selectedVenueId) {
      setTimeSlots([])
      setSelectedTimeSlot("")
      setCheckMessage(null)
      setAllowed(false)
      return
    }
    let isMounted = true
    setLoading(true)
    getDateRequestById(supabase, dateInviteId).then((inv) => {
      if (!isMounted || !inv) return
      const hostId = inv.inviter_id
      const guestId = inv.invitee_id
      getDanaIntersection(supabase, {
        host_id: hostId,
        guest_id: guestId,
        venue_id: selectedVenueId,
        meeting_duration: "90 minutes",
      })
        .then((windows) => {
          if (!isMounted) return
          setTimeSlots(
            windows.map((w) => ({
              value: w.meeting_window,
              label: formatSlot(w.meeting_window),
            }))
          )
          setSelectedTimeSlot("")
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    })
    return () => {
      isMounted = false
    }
  }, [open, dateInviteId, selectedVenueId, supabase])

  const handleCheck = useCallback(async () => {
    if (!dateInviteId || !selectedVenueId || !selectedTimeSlot) return
    setError(null)
    setCheckMessage(null)
    setAllowed(false)
    try {
      const result = await canSwapBooking(supabase, dateInviteId, selectedVenueId, selectedTimeSlot)
      setCheckMessage(result.message)
      setAllowed(result.allowed)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Check failed")
    }
  }, [dateInviteId, selectedVenueId, selectedTimeSlot, supabase])

  const handleConfirm = async () => {
    if (!dateInviteId || !selectedVenueId || !selectedTimeSlot || !allowed) return
    setSubmitting(true)
    setError(null)
    try {
      const r = parseTstzRange(selectedTimeSlot)
      const newProposedDate = r ? r.start.toISOString().slice(0, 10) : undefined
      const newProposedTime = r ? r.start.toISOString().slice(11, 16) : undefined
      const result = await chargeAndExecuteSwap(
        dateInviteId,
        selectedVenueId,
        selectedTimeSlot,
        newProposedDate,
        newProposedTime
      )
      if (result.error) setError(result.error)
      else {
        onSuccess?.()
        onClose()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Swap failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule or change venue</DialogTitle>
          <DialogDescription>
            Pick a new venue and time. £1.99 swap fee (charged to inviter). Not allowed within 24 hours of the event.
          </DialogDescription>
        </DialogHeader>

        {!dateInviteId ? (
          <p className="text-sm text-muted-foreground">No booking selected.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>New venue</Label>
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} – {v.location ?? v.city ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVenueId && (
              <div>
                <Label>New time</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading slots..." : "Select time"} />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedVenueId && selectedTimeSlot && (
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={handleCheck}>
                  Check if swap allowed
                </Button>
                {checkMessage && (
                  <p className={`text-sm ${allowed ? "text-muted-foreground" : "text-destructive"}`}>
                    {checkMessage}
                  </p>
                )}
                {allowed && (
                  <Button className="w-full" onClick={handleConfirm} disabled={submitting}>
                    {submitting ? "Processing..." : "Confirm & pay £1.99"}
                  </Button>
                )}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
