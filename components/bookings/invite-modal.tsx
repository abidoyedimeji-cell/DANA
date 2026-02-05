"use client"

import { useState } from "react"
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

interface InviteModalProps {
  open: boolean
  onClose: () => void
}

const venues = [
  { id: "1", name: "The Blue Lounge", location: "Shoreditch" },
  { id: "2", name: "Ember & Oak", location: "Mayfair" },
  { id: "3", name: "Café Botanica", location: "Notting Hill" },
  { id: "4", name: "The Rooftop", location: "Canary Wharf" },
]

type Step = "select-person" | "select-venue" | "select-time" | "payment" | "confirmation"

export function InviteModal({ open, onClose }: InviteModalProps) {
  const [step, setStep] = useState<Step>("select-person")
  const [selectedPerson] = useState({ name: "Sophie", image: "/professional-woman-smiling.png" })
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep("confirmation")
  }

  const handleClose = () => {
    setStep("select-person")
    setSelectedVenue("")
    setSelectedDate("")
    setSelectedTime("")
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
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="bg-transparent">
                Cancel
              </Button>
              <Button onClick={() => setStep("select-venue")}>Continue</Button>
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
                      {venue.name} - {venue.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {["12:00", "12:30", "13:00", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select-venue")} className="bg-transparent">
                Back
              </Button>
              <Button onClick={() => setStep("payment")} disabled={!selectedDate || !selectedTime}>
                Continue to Payment
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm & Pay</DialogTitle>
              <DialogDescription>Review your booking and pay your deposit</DialogDescription>
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
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    at {selectedTime}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-medium">
                    <span>Your deposit</span>
                    <span>£5.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPerson.name} also pays £5. Total £10 goes towards your bill.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Cancellation Policy:</strong> Full refund if cancelled 48+ hours before. Partial refund 24-48
                hours. No refund under 24 hours.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button className="w-full" onClick={handlePayment} disabled={isProcessing}>
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
                    Pay £5.00 with Card
                  </>
                )}
              </Button>
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

            <Button variant="ghost" onClick={() => setStep("select-time")} className="w-full">
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
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {new Date(selectedDate).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">Awaiting {selectedPerson.name}'s Payment</Badge>
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
