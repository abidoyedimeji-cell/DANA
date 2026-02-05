"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/navigation/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabaseClient } from "@/lib/supabase/use-supabase-client"
import { meetFormWindowOpen, submitMeetFormCompletion } from "@/shared/api/meet-form"
import { sendVenueCreditEmails } from "@/app/actions/venue-credit"

export default function MeetCheckinPage() {
  const supabase = useSupabaseClient()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const dateInviteIdParam = searchParams.get("dateInviteId")

  const [dateInviteId, setDateInviteId] = useState<string | null>(null)
  const [windowOpen, setWindowOpen] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const resolveDateInviteId = useCallback(async () => {
    if (dateInviteIdParam) {
      setDateInviteId(dateInviteIdParam)
      return dateInviteIdParam
    }
    if (eventId) {
      const { data, error: e } = await supabase
        .from("dana_events")
        .select("date_invite_id")
        .eq("id", eventId)
        .single()
      if (e || !data?.date_invite_id) {
        setError("Event not found or not linked to an invite.")
        return null
      }
      setDateInviteId(data.date_invite_id)
      return data.date_invite_id
    }
    setError("Provide eventId or dateInviteId in the URL.")
    return null
  }, [eventId, dateInviteIdParam, supabase])

  useEffect(() => {
    let isMounted = true
    setError(null)
    setLoading(true)
    resolveDateInviteId().then((inviteId) => {
      if (!isMounted || !inviteId) {
        setLoading(false)
        return
      }
      meetFormWindowOpen(supabase, inviteId)
        .then((open) => {
          if (isMounted) setWindowOpen(open)
        })
        .catch((err) => {
          if (isMounted) setError(err?.message ?? "Failed to check meet window")
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    })
    return () => {
      isMounted = false
    }
  }, [resolveDateInviteId, supabase])

  const handleSubmit = async () => {
    if (!dateInviteId) return
    setSubmitting(true)
    setError(null)
    try {
      await submitMeetFormCompletion(supabase, dateInviteId, { met: true })
      const result = await sendVenueCreditEmails(dateInviteId)
      if (result.error) setError(result.error)
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Meet check-in" showModeToggle={false} />
      <div className="p-4 max-w-md mx-auto">
        {loading && (
          <Card className="border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              Checking availability...
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card className="border-border">
            <CardContent className="py-6">
              <p className="text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                The meet form is only available 15 minutes before until 60 minutes after your date.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && dateInviteId && windowOpen === false && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Meet form closed</CardTitle>
              <CardDescription>
                The meet check-in window is not open yet, or has ended. It opens 15 minutes before your date and
                closes 60 minutes after.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && !error && dateInviteId && windowOpen === true && !submitted && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Confirm you met</CardTitle>
              <CardDescription>
                Submitting confirms your meet-up. Your venue credit code will be sent by email to both of you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && <p className="text-sm text-destructive mb-3">{error}</p>}
              <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "I met my date"}
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && submitted && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Thanks!</CardTitle>
              <CardDescription>
                Your check-in was recorded. Your venue credit code will be sent to your email shortly.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && !dateInviteId && !error && (
          <Card className="border-border">
            <CardContent className="py-6 text-center text-muted-foreground">
              Use a link with eventId or dateInviteId to check in.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
