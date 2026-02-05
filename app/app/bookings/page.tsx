"use client"

import { AppHeader } from "@/components/navigation/app-header"
import { BookingsList } from "@/components/bookings/bookings-list"

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Bookings" showModeToggle={false} />
      <BookingsList />
    </div>
  )
}
