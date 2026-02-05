"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"

const weeklyQuestions = [
  { id: 1, question: "What's your favourite movie of all time?" },
  { id: 2, question: "Which music era speaks to you most?" },
  { id: 3, question: "One thing you'd want to know before a first date?" },
  { id: 4, question: "What's your go-to weekend activity?" },
]

interface DailyQuestionsProps {
  onClose: () => void
  userAnswers?: Record<number, string>
}

export function DailyQuestions({ onClose, userAnswers = {} }: DailyQuestionsProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(userAnswers)

  const handleSave = () => {
    console.log("[v0] Saving daily question answers:", answers)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FBBF24]" />
            <h2 className="text-xl font-bold text-white">This Week's Questions</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-xl p-4 mb-6">
          <p className="text-[#FBBF24] text-sm">
            Answer Dana's weekly questions to keep your profile active and engaging. Questions rotate every week!
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {weeklyQuestions.map((q) => (
            <div key={q.id} className="bg-white/5 rounded-xl p-4">
              <label className="text-white font-medium text-sm mb-3 block">{q.question}</label>
              <textarea
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Share your answer..."
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none placeholder:text-white/40"
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full bg-[#E91E8C] text-white rounded-full py-4">
          Save Answers
        </Button>
      </div>
    </div>
  )
}
