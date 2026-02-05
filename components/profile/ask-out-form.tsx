"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, MapPin, Calendar, Clock, CreditCard } from "lucide-react"

interface AskOutFormProps {
  onClose: () => void
  profileUser: any
}

export function AskOutForm({ onClose, profileUser }: AskOutFormProps) {
  const [step, setStep] = useState<"form" | "payment" | "confirmation">("form")
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    date: "",
    time: "",
    venue: "",
    customAnswers: {} as Record<number, string>,
  })

  const screeningQuestions = [
    { id: 1, question: "What made you want to ask me out?" },
    { id: 2, question: "What type of date are you suggesting?" },
    { id: 3, question: "Tell me something interesting about yourself" },
  ]

  const nearbyVenues = [
    { id: "venue1", name: "The Cozy Bistro", distance: "2.3 miles", type: "Restaurant" },
    { id: "venue2", name: "Urban Wine Bar", distance: "4.1 miles", type: "Bar" },
    { id: "venue3", name: "Arcade Lounge", distance: "5.8 miles", type: "Entertainment" },
  ]

  const handleContinueToPayment = () => {
    if (!formData.name || !formData.date || !formData.time || !formData.venue || !formData.reason) {
      alert("Please fill in all required fields")
      return
    }

    // Check if all screening questions are answered
    const unansweredQuestions = screeningQuestions.filter((q) => !formData.customAnswers[q.id]?.trim())
    if (unansweredQuestions.length > 0) {
      alert("Please answer all screening questions")
      return
    }

    console.log("[v0] Moving to payment step with data:", formData)
    setStep("payment")
  }

  const handlePayment = () => {
    console.log("[v0] Processing £5 booking fee payment")
    // Simulate payment processing
    setTimeout(() => {
      setStep("confirmation")
    }, 1500)
  }

  if (step === "payment") {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-end">
        <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Confirm & Pay</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Booking Summary */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="text-white font-semibold">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Date</span>
                <span className="text-white">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Time</span>
                <span className="text-white">{formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Venue</span>
                <span className="text-white">{nearbyVenues.find((v) => v.id === formData.venue)?.name}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between font-semibold">
                <span className="text-white">Booking Fee</span>
                <span className="text-[#E91E8C]">£5.00</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-[#E91E8C]/10 border border-[#E91E8C]/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <CreditCard className="w-5 h-5 text-[#E91E8C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#E91E8C] text-sm font-medium mb-1">Refund Policy</p>
                <p className="text-[#E91E8C]/80 text-xs">
                  £5 deposit will be fully refunded if {profileUser.username} declines your invite. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button onClick={handlePayment} className="w-full bg-[#E91E8C] text-white rounded-full py-4 font-semibold">
            Pay £5 & Send Invite
          </Button>

          <button onClick={() => setStep("form")} className="w-full mt-3 text-white/60 text-sm hover:text-white">
            ← Back to form
          </button>
        </div>
      </div>
    )
  }

  if (step === "confirmation") {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invite Sent!</h2>
          <p className="text-white/60 text-sm mb-6">
            Your date request has been sent to {profileUser.username}. You'll be notified when they respond.
          </p>
          <Button onClick={onClose} className="w-full bg-[#E91E8C] text-white rounded-full">
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Ask {profileUser.username} Out</h2>
            <p className="text-white/60 text-sm">£5 booking fee (refunded if declined)</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">Your Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              placeholder="How should they call you?"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          {/* Venue Selection */}
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue (within {profileUser.preferredRadius} miles) *
            </label>
            <select
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            >
              <option value="">Select a venue...</option>
              {nearbyVenues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.distance} ({venue.type})
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">Why do you want to go on a date? *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
              placeholder="Share what caught your attention..."
            />
          </div>

          {/* Screening Questions */}
          <div className="bg-[#E91E8C]/10 border border-[#E91E8C]/30 rounded-xl p-4">
            <p className="text-[#E91E8C] text-sm font-medium mb-4">Pre-Screening Questions *</p>
            <div className="space-y-4">
              {screeningQuestions.map((q) => (
                <div key={q.id}>
                  <label className="text-white/80 text-sm mb-2 block">{q.question}</label>
                  <textarea
                    value={formData.customAnswers[q.id] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customAnswers: { ...formData.customAnswers, [q.id]: e.target.value },
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                    placeholder="Type your answer..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button onClick={handleContinueToPayment} className="w-full mt-6 bg-[#E91E8C] text-white rounded-full py-4">
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
