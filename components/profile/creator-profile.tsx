"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ChevronDown, Settings, Plus, Edit2, Trash2, X, Clock, Sparkles } from "lucide-react"
import { QuizManager } from "./quiz-manager"
import { AskOutForm } from "./ask-out-form"
import { DailyQuestions } from "./daily-questions"
import { MediaManager } from "./media-manager"
import { ScreeningQuestionsManager } from "./screening-questions-manager"

// Sample user data
const userData = {
  username: "NEWUSERSAMPLE",
  bio: "When I'm not busy designing logos or sketching out ideas, you can find me exploring the latest art exhibits.",
  age: 28,
  location: "Brooklyn, NY",
  height: "5'6\"",
  loveLanguage: "Quality Time",
  photos: [
    "/profile-photo-1.jpg",
    "/profile-photo-2.jpg",
    "/profile-photo-3.jpg",
    "/profile-photo-4.jpg",
    "/profile-photo-5.jpg",
    "/profile-photo-6.jpg",
  ],
  ephemeralMedia: [
    {
      id: 1,
      url: "/profile-photo-7.jpg",
      type: "image" as const,
      isEphemeral: true,
      expiresAt: "Today 11:30 PM",
    },
  ],
  dailyAnswers: {
    1: "Anything by Studio Ghibli - they capture magic perfectly",
    2: "90s R&B and early 2000s indie rock",
  },
  hobbies: ["Photography", "Art Galleries", "Yoga", "Travel"],
  favourites: ["Studio Ghibli", "Italian Cuisine", "Jazz Music"],
  suggestedActivities: ["Wine Tasting", "Museum Visits", "Hiking"],
  availability: {
    monday: ["18:00-22:00"],
    wednesday: ["18:00-22:00"],
    friday: ["17:00-23:00"],
    saturday: ["12:00-23:00"],
    sunday: ["12:00-20:00"],
  },
  preferredRadius: 10,
  quizQuestions: [
    { id: 1, question: "What's your ideal first date?", answer: "A cozy coffee shop with great conversation" },
    { id: 2, question: "What are you looking for?", answer: "Someone genuine who loves adventure" },
    { id: 3, question: "Your biggest passion?", answer: "Creating art and exploring new places" },
  ],
}

export function CreatorProfile({ isOwnProfile = false }: { isOwnProfile?: boolean }) {
  const { profileMode, setProfileMode, logout } = useAuth()
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showQuizManager, setShowQuizManager] = useState(false)
  const [showAskOutForm, setShowAskOutForm] = useState(false)
  const [isEditingHobbies, setIsEditingHobbies] = useState(false)
  const [hobbiesInput, setHobbiesInput] = useState("")
  const [showDailyQuestions, setShowDailyQuestions] = useState(false)
  const [showMediaManager, setShowMediaManager] = useState(false)
  const [showScreeningManager, setShowScreeningManager] = useState(false)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">@{userData.username}</span>
          <ChevronDown className="w-4 h-4 text-white/60" />
        </div>
        <div className="flex items-center gap-3">
          {isOwnProfile && (
            <button onClick={() => setShowMediaManager(true)} className="p-2">
              <Edit2 className="w-5 h-5 text-white/60" />
            </button>
          )}
          <button className="p-2">
            <Settings className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 pb-4">
        {/* Ephemeral media stories row */}
        {userData.ephemeralMedia.length > 0 && (
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {userData.ephemeralMedia.map((media) => (
              <button key={media.id} className="flex-shrink-0 relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FBBF24] p-0.5">
                  <img
                    src={media.url || "/placeholder.svg"}
                    alt="Story"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 rounded-full border border-[#FBBF24]">
                  <Clock className="w-2.5 h-2.5 text-[#FBBF24]" />
                </div>
              </button>
            ))}
            {isOwnProfile && (
              <button
                onClick={() => setShowMediaManager(true)}
                className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center"
              >
                <Plus className="w-6 h-6 text-white/40" />
              </button>
            )}
          </div>
        )}

        {/* Avatar and Connect Button */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20">
              <img src="/creator-avatar.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
          </div>
          <div className="flex-1">
            <Button className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-semibold rounded-full">
              REQUEST TO CONNECT
            </Button>
          </div>
        </div>

        {/* Bio */}
        <p className="text-white/80 text-sm mb-4">{userData.bio}</p>

        <div className="flex gap-3 mb-6">
          <Button
            disabled={!isOwnProfile}
            className="flex-1 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-black font-semibold rounded-full disabled:opacity-50"
          >
            Connect
          </Button>
          <Button
            onClick={() => setShowAskOutForm(true)}
            disabled={!isOwnProfile}
            className="flex-1 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-semibold rounded-full disabled:opacity-50"
          >
            Ask Out
          </Button>
        </div>

        {/* Photo Grid - max 6 photos */}
        <div className="grid grid-cols-3 gap-1 mb-6">
          {userData.photos.slice(0, 6).map((photo, index) => (
            <div key={index} className="aspect-square rounded-md overflow-hidden relative group">
              <img
                src={photo || "/placeholder.svg"}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {isOwnProfile && (
                <button className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
          {isOwnProfile && userData.photos.length < 6 && (
            <button className="aspect-square rounded-md border-2 border-dashed border-white/20 flex items-center justify-center hover:border-[#E91E8C]/50 transition-colors">
              <Plus className="w-8 h-8 text-white/40" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="font-semibold">Age:</span>
            <span>{userData.age}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold">Location:</span>
            <span>{userData.location}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="font-semibold">Height:</span>
            <span>{userData.height}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="font-semibold">Love language:</span>
            <span>{userData.loveLanguage}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E91E8C]" />
                <span className="text-[#E91E8C] text-xs font-semibold uppercase">Interests & Hobbies</span>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditingHobbies(!isEditingHobbies)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Edit2 className="w-3 h-3 text-white/60" />
                </button>
              )}
            </div>
            {isEditingHobbies ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={hobbiesInput}
                  onChange={(e) => setHobbiesInput(e.target.value)}
                  placeholder="Enter hobbies separated by commas (e.g. hiking, yoga, photography)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-[#E91E8C]">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingHobbies(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userData.hobbies.map((hobby, index) => (
                  <span key={index} className="px-3 py-1 bg-[#E91E8C]/20 text-[#E91E8C] text-xs rounded-full">
                    {hobby}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="text-[#F97316] text-xs font-semibold uppercase">Favourite Actors, Artist & Cuisine</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {userData.favourites.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-[#F97316]/20 text-[#F97316] text-xs rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[#22C55E] text-xs font-semibold uppercase">Suggested Activities</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {userData.suggestedActivities.map((activity, index) => (
                <span key={index} className="px-3 py-1 bg-[#22C55E]/20 text-[#22C55E] text-xs rounded-full">
                  {activity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar & Availability */}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#FF6B35]" />
            <span className="text-white font-medium">Date Availability</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${showCalendar ? "rotate-180" : ""}`} />
        </button>

        {showCalendar && (
          <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
              <Clock className="w-4 h-4" />
              <span>Available times for dates</span>
            </div>
            {Object.entries(userData.availability).map(([day, times]) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-white capitalize text-sm">{day}</span>
                <span className="text-white/60 text-sm">{times.join(", ")}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-white/60 text-sm">Preferred radius: {userData.preferredRadius} miles</span>
              </div>
            </div>
          </div>
        )}

        {/* Daily Questions Section */}
        {Object.keys(userData.dailyAnswers).length > 0 && (
          <div className="bg-gradient-to-br from-[#FBBF24]/10 to-[#FF6B35]/10 rounded-xl p-4 mb-4 border border-[#FBBF24]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                <h4 className="text-white font-semibold text-sm">This Week's Answers</h4>
              </div>
              {isOwnProfile && (
                <button onClick={() => setShowDailyQuestions(true)} className="text-[#FBBF24] text-xs hover:underline">
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(userData.dailyAnswers)
                .slice(0, 2)
                .map(([id, answer]) => (
                  <div key={id} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/80 text-sm">{answer}</p>
                  </div>
                ))}
            </div>
            {!isOwnProfile && <button className="text-[#FBBF24] text-xs mt-2 hover:underline">View all answers</button>}
          </div>
        )}

        {isOwnProfile && Object.keys(userData.dailyAnswers).length === 0 && (
          <button
            onClick={() => setShowDailyQuestions(true)}
            className="w-full mb-4 py-3 border-2 border-dashed border-[#FBBF24]/30 rounded-xl flex items-center justify-center gap-2 text-[#FBBF24] hover:border-[#FBBF24]/50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium text-sm">Answer This Week's Questions</span>
          </button>
        )}

        {/* Settings menu item for screening questions */}
        {isOwnProfile && (
          <button
            onClick={() => setShowScreeningManager(true)}
            className="w-full py-3 text-white/60 text-xs uppercase tracking-wide hover:text-white transition-colors border-t border-white/10"
          >
            Manage Ask-Out Questions
          </button>
        )}

        {/* Account Switcher (Instagram style) */}
        <button
          onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
          className="w-full py-3 text-white/60 text-xs uppercase tracking-wide hover:text-white transition-colors"
        >
          SWITCH TO {profileMode === "dating" ? "BUSINESS" : "DATING"} PROFILE
        </button>

        {showAccountSwitcher && (
          <div className="bg-white/5 rounded-xl p-4 mt-2 space-y-3">
            <button
              onClick={() => {
                setProfileMode("dating")
                setShowAccountSwitcher(false)
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                profileMode === "dating" ? "bg-[#E91E8C]/20" : "hover:bg-white/5"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#E91E8C]/20 flex items-center justify-center">
                <span className="text-[#E91E8C]">D</span>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Dating Profile</p>
                <p className="text-white/60 text-xs">Find meaningful connections</p>
              </div>
              {profileMode === "dating" && <div className="ml-auto w-2 h-2 rounded-full bg-[#E91E8C]" />}
            </button>
            <button
              onClick={() => {
                setProfileMode("business")
                setShowAccountSwitcher(false)
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                profileMode === "business" ? "bg-[#3B82F6]/20" : "hover:bg-white/5"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                <span className="text-[#3B82F6]">B</span>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Business Profile</p>
                <p className="text-white/60 text-xs">Network professionally</p>
              </div>
              {profileMode === "business" && <div className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6]" />}
            </button>
          </div>
        )}

        {/* Logout */}
        <button onClick={logout} className="w-full py-4 mt-4 text-red-500 text-sm hover:text-red-400 transition-colors">
          Log Out
        </button>
      </div>

      {/* Modals */}
      {showDailyQuestions && (
        <DailyQuestions onClose={() => setShowDailyQuestions(false)} userAnswers={userData.dailyAnswers} />
      )}

      {showMediaManager && (
        <MediaManager
          onClose={() => setShowMediaManager(false)}
          media={[
            ...userData.photos.map((url, i) => ({ id: i, url, type: "image" as const, isEphemeral: false })),
            ...userData.ephemeralMedia,
          ]}
        />
      )}

      {showQuizManager && <QuizManager onClose={() => setShowQuizManager(false)} questions={userData.quizQuestions} />}

      {showScreeningManager && (
        <ScreeningQuestionsManager
          onClose={() => setShowScreeningManager(false)}
          questions={[
            { id: 1, question: "What made you want to ask me out?" },
            { id: 2, question: "What type of date are you suggesting?" },
            { id: 3, question: "Tell me something interesting about yourself" },
          ]}
        />
      )}

      {showAskOutForm && <AskOutForm onClose={() => setShowAskOutForm(false)} profileUser={userData} />}

      {/* Quiz View Modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ice Breaker Quiz</h2>
              <button onClick={() => setShowQuiz(false)} className="text-white/60">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {userData.quizQuestions.map((q) => (
                <div key={q.id} className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-2">{q.question}</p>
                  <input
                    type="text"
                    placeholder="Your answer..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-black font-semibold rounded-full">
              Submit & Connect
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
