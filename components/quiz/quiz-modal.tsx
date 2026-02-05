"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  profileUserId: string
  profileName: string
}

interface QuizQuestion {
  id: string
  question: string
  display_order: number
}

export function QuizModal({ isOpen, onClose, profileUserId, profileName }: QuizModalProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && profileUserId) {
      loadQuiz()
    }
  }, [isOpen, profileUserId])

  const loadQuiz = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("user_id", profileUserId)
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (data && data.length > 0) {
      setQuestions(data)
    } else {
      // Default questions if none set
      setQuestions([
        { id: "default-1", question: "What's your ideal first date?", display_order: 1 },
        { id: "default-2", question: "What's your favorite weekend activity?", display_order: 2 },
        { id: "default-3", question: "Coffee or tea?", display_order: 3 },
      ])
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!user?.id) return
    setSubmitting(true)

    const supabase = createClient()

    // Save responses
    const responses = Object.entries(answers).map(([questionId, response]) => ({
      question_id: questionId,
      responder_id: user.id,
      response,
    }))

    const { error } = await supabase.from("quiz_responses").insert(responses)

    if (!error) {
      // Create notification for profile owner
      await supabase.from("notifications").insert({
        user_id: profileUserId,
        type: "quiz_completed",
        title: "Quiz Completed!",
        message: `Someone answered your quiz`,
        related_user_id: user.id,
        action_type: "view_quiz",
        action_label: "View Results",
      })
    }

    setSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{profileName}'s Quiz</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="space-y-2">
                <label className="text-white font-medium text-sm">
                  {index + 1}. {q.question}
                </label>
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Your answer..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--dana-pink)] resize-none"
                  rows={3}
                />
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length === 0}
              className="w-full bg-gradient-to-r from-[var(--dana-pink)] to-[var(--dana-orange)] text-white rounded-full py-6 font-semibold hover:opacity-90 transition-opacity"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
