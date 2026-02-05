"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, X, GripVertical } from "lucide-react"

interface ScreeningQuestion {
  id: number
  question: string
}

interface ScreeningQuestionsManagerProps {
  onClose: () => void
  questions: ScreeningQuestion[]
}

export function ScreeningQuestionsManager({ onClose, questions: initialQuestions }: ScreeningQuestionsManagerProps) {
  const [questions, setQuestions] = useState<ScreeningQuestion[]>(initialQuestions)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAdd = () => {
    if (newQuestion.trim() && questions.length < 4) {
      setQuestions([
        ...questions,
        {
          id: Date.now(),
          question: newQuestion.trim(),
        },
      ])
      setNewQuestion("")
      setShowAddForm(false)
    }
  }

  const handleDelete = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleEdit = (id: number, newText: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, question: newText } : q)))
    setEditingId(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Pre-Screening Questions</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-[#E91E8C]/10 border border-[#E91E8C]/30 rounded-xl p-4 mb-6">
          <p className="text-[#E91E8C] text-sm">
            Set 3-4 questions for people to answer when they want to ask you out. This helps you screen potential dates.
          </p>
        </div>

        {/* Question List */}
        <div className="space-y-3 mb-6">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-white/40 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/60 text-xs mb-1">Question {index + 1}</p>
                  {editingId === q.id ? (
                    <input
                      type="text"
                      defaultValue={q.question}
                      onBlur={(e) => handleEdit(q.id, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(q.id, e.currentTarget.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className="text-white text-sm">{q.question}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingId(q.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Question */}
        {questions.length < 4 &&
          (showAddForm ? (
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleAdd} size="sm" className="flex-1 bg-[#E91E8C] text-white">
                  Add Question
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewQuestion("")
                  }}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 text-white/60 hover:border-[#E91E8C]/50 hover:text-[#E91E8C] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Question ({questions.length}/4)</span>
            </button>
          ))}

        {/* Save Button */}
        <Button onClick={onClose} className="w-full mt-6 bg-[#E91E8C] text-white rounded-full">
          Save Questions
        </Button>
      </div>
    </div>
  )
}
