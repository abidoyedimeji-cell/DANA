"use client"

import { useState, useEffect, useRef } from "react"
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { getCommunityPosts, likePost } from "@/lib/actions/community-actions"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { PostComposer } from "./post-composer"
import Link from "next/link"

interface FeedPost {
  id: string
  type: "post" | "venue"
  data: any
}

export function VerticalFeed() {
  const { user } = useAuth()
  const [feed, setFeed] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComposer, setShowComposer] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
    setLoading(true)
    const { posts } = await getCommunityPosts(20, 0)

    const mixedFeed: FeedPost[] = []
    if (!posts || posts.length === 0) {
      // Sample posts with different media types
      mixedFeed.push({
        id: "sample-1",
        type: "post",
        data: {
          id: "sample-1",
          content: "Welcome to Dana! Share your moments with photos, videos, or carousel images.",
          media_type: "image",
          image_url: "/elegant-dinner-date.jpg",
          author: {
            username: "Dana",
            display_name: "Dana App",
            is_verified: true,
            avatar_url: "/dana-logo.png",
          },
          likes_count: 42,
          comments_count: 8,
          user_liked: false,
        },
      })
      mixedFeed.push({
        id: "sample-2",
        type: "post",
        data: {
          id: "sample-2",
          content: "Perfect evening at The Ivy 🌟",
          media_type: "carousel",
          media_urls: ["/restaurant-interior-elegant.jpg", "/gourmet-food-plating.png", "/cocktail-bar-luxury.jpg"],
          author: {
            username: "sarah_london",
            display_name: "Sarah Chen",
            is_verified: true,
            avatar_url: "/professional-woman.png",
          },
          likes_count: 128,
          comments_count: 24,
          user_liked: true,
        },
      })
      mixedFeed.push({
        id: "sample-3",
        type: "post",
        data: {
          id: "sample-3",
          content: "Quick tour of the new rooftop bar!",
          media_type: "video",
          video_url: "/rooftop-bar-video.jpg",
          video_duration: 18,
          author: {
            username: "james_creative",
            display_name: "James Wilson",
            avatar_url: "/creative-man.png",
          },
          likes_count: 89,
          comments_count: 15,
          user_liked: false,
        },
      })
    } else {
      posts.forEach((post, idx) => {
        mixedFeed.push({ id: post.id, type: "post", data: post })
        if ((idx + 1) % 3 === 0) {
          mixedFeed.push({
            id: `venue-${idx}`,
            type: "venue",
            data: {
              id: `venue-${idx}`,
              name: idx % 2 === 0 ? "76 Dean Street" : "Cecconi's Soho",
              image: "/luxury-restaurant-interior.png",
              category: "Restaurant",
              promo: idx % 2 === 0 ? "20% off dinner" : "Free dessert with booking",
              rating: 4.8,
              price: 3,
            },
          })
        }
      })
    }

    mixedFeed.push({
      id: "venue-featured",
      type: "venue",
      data: {
        id: "venue-featured",
        name: "The Ivy Chelsea",
        image: "/the-ivy-restaurant-chelsea.jpg",
        category: "Fine Dining",
        promo: "New Arrival - 15% off",
        rating: 4.9,
        price: 4,
      },
    })

    setFeed(mixedFeed)
    setLoading(false)
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    setFeed((prev) =>
      prev.map((item) => {
        if (item.type === "post" && item.data.id === postId) {
          const isLiked = item.data.user_liked
          return {
            ...item,
            data: {
              ...item.data,
              user_liked: !isLiked,
              likes_count: isLiked ? item.data.likes_count - 1 : item.data.likes_count + 1,
            },
          }
        }
        return item
      }),
    )
    if (!postId.startsWith("sample-")) {
      await likePost(postId, user.id)
    }
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const scrollTop = scrollContainerRef.current.scrollTop
    const itemHeight = window.innerHeight
    const newIndex = Math.round(scrollTop / itemHeight)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-[var(--dana-yellow)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
      >
        {feed.map((item, idx) => (
          <div key={item.id} className="h-screen snap-start snap-always relative">
            {item.type === "venue" ? (
              <VenueCard venue={item.data} />
            ) : (
              <PostCard post={item.data} onLike={handleLike} />
            )}
          </div>
        ))}
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowComposer(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-[var(--dana-pink)] rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      <PostComposer isOpen={showComposer} onClose={() => setShowComposer(false)} onPostCreated={loadFeed} />
    </>
  )
}

function PostCard({ post, onLike }: { post: any; onLike: (id: string) => void }) {
  const { user } = useAuth()
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const mediaUrls = post.media_urls || []
  const hasCarousel = post.media_type === "carousel" && mediaUrls.length > 1
  const hasVideo = post.media_type === "video" && post.video_url

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % mediaUrls.length)
  }

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length)
  }

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* Media Background */}
      {hasVideo ? (
        <div className="relative w-full h-full" onClick={toggleVideo}>
          <video ref={videoRef} src={post.video_url} className="w-full h-full object-cover" loop playsInline muted />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
              </div>
            </div>
          )}
          {post.video_duration && (
            <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-full text-xs text-white">
              {post.video_duration}s
            </div>
          )}
        </div>
      ) : hasCarousel ? (
        <div className="relative w-full h-full">
          <img src={mediaUrls[carouselIndex] || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
          {/* Carousel Controls */}
          {carouselIndex > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {carouselIndex < mediaUrls.length - 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
          {/* Carousel Indicators */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {mediaUrls.map((_: string, idx: number) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === carouselIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      ) : post.image_url ? (
        <img src={post.image_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-600 via-[var(--dana-pink)] to-[var(--dana-orange)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 pb-32">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={post.author?.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
            alt={post.author?.username}
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">
                {post.author?.display_name || post.author?.username || "Anonymous"}
              </span>
              {post.author?.is_verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm">@{post.author?.username || "anonymous"}</p>
          </div>
        </div>

        <p className="text-white text-lg font-medium mb-6">{post.content}</p>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
        <button onClick={() => onLike(post.id)} className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Heart
              className={`w-6 h-6 ${post.user_liked ? "text-[var(--dana-pink)] fill-[var(--dana-pink)]" : "text-white"}`}
            />
          </div>
          <span className="text-white text-xs font-semibold mt-1">{post.likes_count || 0}</span>
        </button>

        <Link href={`/community/${post.id}`} className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold mt-1">{post.comments_count || 0}</span>
        </Link>

        <button className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
        </button>
      </div>
    </div>
  )
}

function VenueCard({ venue }: { venue: any }) {
  return (
    <div className="relative h-full w-full">
      <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

      <div className="absolute inset-0 flex flex-col justify-between p-6 pb-32">
        <div className="self-end">
          <div className="bg-[var(--dana-orange)] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
            {venue.promo}
          </div>
        </div>

        <div>
          <div className="bg-black/60 backdrop-blur-md rounded-3xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-2xl mb-1">{venue.name}</h2>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {venue.category} · Soho
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[var(--dana-yellow)] font-bold">{venue.rating}</span>
                <svg className="w-5 h-5 text-[var(--dana-yellow)] fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>{"£".repeat(venue.price)}</span>
              </div>
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>Open Now</span>
              </div>
            </div>

            <Link href="/spots">
              <Button
                size="lg"
                className="w-full bg-[var(--dana-yellow)] text-black hover:bg-[var(--dana-gold)] font-bold rounded-full"
              >
                View & Book
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
