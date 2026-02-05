"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

interface QuizResponse {
  id: string
  question: string
  response: string
  correct_answer?: string
  score?: number
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [responderProfile, setResponderProfile] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"descriptive" | "quantitative">("quantitative")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResults()
  }, [params.userId])

  const loadResults = async () => {
    const supabase = createClient()

    // Get responder profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.userId).single()

    setResponderProfile(profile)

    // Get quiz responses
    const { data: quizResponses } = await supabase
      .from("quiz_responses")
      .select(`
        id,
        response,
        question_id,
        quiz_questions (
          question,
          correct_answer,
          points
        )
      `)
      .eq("responder_id", params.userId)

    if (quizResponses) {
      const formatted = quizResponses.map((r: any) => ({
        id: r.id,
        question: r.quiz_questions?.question || "",
        response: r.response,
        correct_answer: r.quiz_questions?.correct_answer,
        score: r.quiz_questions?.points || 0,
      }))
      setResponses(formatted)
    }

    setLoading(false)
  }

  const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0)
  const maxScore = responses.length * 10

  const getCategoryInsights = () => {
    // Group responses by category (you could add category field to questions)
    return {
      personality: responses.slice(0, 3),
      lifestyle: responses.slice(3, 6),
      values: responses.slice(6),
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-4 flex items-center gap-3 z-10">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Quiz Results</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Responder Info */}
        {responderProfile && (
          <div className="bg-gradient-to-r from-[var(--dana-pink)] to-[var(--dana-orange)] rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-bold">{(responderProfile.display_name || "U")[0].toUpperCase()}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{responderProfile.display_name}</h2>
            <p className="text-white/80 text-sm">completed your quiz</p>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-white/10 rounded-full p-1">
          <button
            onClick={() => setViewMode("quantitative")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
              viewMode === "quantitative" ? "bg-white text-black" : "text-white/60"
            }`}
          >
            Quantitative
          </button>
          <button
            onClick={() => setViewMode("descriptive")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
              viewMode === "descriptive" ? "bg-white text-black" : "text-white/60"
            }`}
          >
            Descriptive
          </button>
        </div>

        {viewMode === "quantitative" ? (
          <>
            {/* Score Overview */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Total Score</p>
                  <p className="text-4xl font-bold">{totalScore}</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--dana-pink)] to-[var(--dana-orange)] flex items-center justify-center">
                  <TrendingUp className="w-10 h-10" />
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[var(--dana-pink)] to-[var(--dana-orange)] h-2 rounded-full transition-all"
                  style={{ width: `${(totalScore / maxScore) * 100}%` }}
                />
              </div>
              <p className="text-white/60 text-sm mt-2">
                {totalScore} out of {maxScore} points
              </p>
            </div>

            {/* Individual Responses */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold">Detailed Responses</h3>
              {responses.map((r, index) => (
                <div key={r.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium text-sm flex-1">
                      {index + 1}. {r.question}
                    </p>
                    <span className="text-[var(--dana-pink)] font-bold text-sm ml-2">{r.score} pts</span>
                  </div>
                  <p className="text-white/80 text-sm">{r.response}</p>
                  {r.correct_answer && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-white/60 text-xs">Expected: {r.correct_answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Descriptive Summary */}
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Compatibility Overview</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Based on the quiz responses, here's what we learned about compatibility:
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold">Personality Match</h4>
                  </div>
                  <p className="text-white/70 text-sm pl-7">
                    Shows strong alignment in lifestyle choices and social preferences.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold">Common Interests</h4>
                  </div>
                  <p className="text-white/70 text-sm pl-7">
                    Shared interests in activities and hobbies create natural conversation topics.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold">Values Alignment</h4>
                  </div>
                  <p className="text-white/70 text-sm pl-7">Core values and life goals appear to be compatible.</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold">Response Highlights</h3>
              {responses.slice(0, 5).map((r, index) => (
                <div key={r.id} className="bg-white/5 rounded-xl p-4">
                  <p className="text-white font-medium text-sm mb-2">{r.question}</p>
                  <p className="text-white/80 text-sm italic">"{r.response}"</p>
                </div>
              ))}
            </div>
          </>
        )}

        <Button
          onClick={() => router.push("/app/search")}
          className="w-full bg-gradient-to-r from-[var(--dana-pink)] to-[var(--dana-orange)] text-white rounded-full py-6 font-semibold hover:opacity-90 transition-opacity"
        >
          Discover More Connections
        </Button>
      </div>
    </div>
  )
}
