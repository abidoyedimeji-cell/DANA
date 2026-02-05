"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { generateCalendarEvent } from "@/app/actions/bookings"
import { toast } from "sonner"

export function CalendarButton({ bookingId }: { bookingId: string }) {
  const handleAddToCalendar = async () => {
    const result = await generateCalendarEvent(bookingId)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (result.icsContent) {
      // Create downloadable .ics file
      const blob = new Blob([result.icsContent], { type: "text/calendar" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "dana-booking.ics"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Calendar event downloaded!")
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleAddToCalendar} className="bg-transparent">
      <Calendar className="w-4 h-4 mr-2" />
      Add to Calendar
    </Button>
  )
}
