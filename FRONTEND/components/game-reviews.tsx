"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getGameReviews, submitReview, getCurrentUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, StarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Review, User } from "@/lib/types"

interface GameReviewsProps {
  gameId: number
}

export function GameReviews({ gameId }: GameReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadReviews()
    loadCurrentUser()
  }, [gameId])

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error("Failed to load current user:", error)
    }
  }

  const loadReviews = async () => {
    try {
      setLoading(true)
      const gameReviews = await getGameReviews(gameId)
      setReviews(gameReviews)
    } catch (error) {
      console.error("Failed to load reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser || currentUser.role !== "PLAYER") {
      toast({
        title: "Error",
        description: "Only players can submit reviews.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        gameId,
        rating: newReview.rating,
        comment: newReview.comment,
      })

      toast({
        title: "Success",
        description: "Review submitted successfully! It will be visible after approval.",
      })

      setNewReview({ rating: 5, comment: "" })
      loadReviews() // Refresh reviews
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
            disabled={!interactive}
          >
            {star <= rating ? (
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading reviews...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser?.role === "PLAYER" && (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-3">Write a Review</h4>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(newReview.rating, true, (rating) => setNewReview({ ...newReview, rating }))}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Comment</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your thoughts about this game..."
                  rows={3}
                  required
                />
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{review.playerName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <Badge
                          variant={
                            review.status === "APPROVED"
                              ? "default"
                              : review.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {review.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review this game!</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
