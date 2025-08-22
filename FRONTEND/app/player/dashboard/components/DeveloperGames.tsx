"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Download, Trophy, Star, X, MessageSquare, Send, Gift } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  getGamesByDeveloper,
  getPlayerPointsForDeveloper,
  getLeaderboardByDeveloper,
  getCurrentUser,
  trackDownloadAndGetUrl,
  getGameReviews,
  submitReview,
  getGiftsByDeveloper,
  redeemGift, // Added redeemGift import
} from "@/lib/api"
import type { User, Game, LeaderboardResponse, Review, ReviewRequest, GiftDTO } from "@/lib/types"

// Notification Component
const Notification = ({
  message,
  isVisible,
  onClose,
}: { message: string; isVisible: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface DeveloperGamesProps {
  developer: User
  onBack: () => void
}

export default function DeveloperGames({ developer, onBack }: DeveloperGamesProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [playerPoints, setPlayerPoints] = useState<number>(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse[]>([])
  const [pointsLoading, setPointsLoading] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [notification, setNotification] = useState<{ message: string; isVisible: boolean }>({
    message: "",
    isVisible: false,
  })
  const [activeTab, setActiveTab] = useState<"games" | "gifts">("games")
  const [gifts, setGifts] = useState<GiftDTO[]>([])
  const [giftsLoading, setGiftsLoading] = useState(false)
  const [redeemingGifts, setRedeemingGifts] = useState<Set<number>>(new Set()) // Added redeeming state

  const showNotification = (message: string) => {
    setNotification({ message, isVisible: true })
  }

  const closeNotification = () => {
    setNotification({ message: "", isVisible: false })
  }

  useEffect(() => {
    fetchData()
  }, [developer.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Starting to fetch data for developer:", developer.id)

      // Get current user
      const user = await getCurrentUser()
      console.log("[v0] Current user:", user ? `${user.email} (ID: ${user.id})` : "Not logged in")
      setCurrentUser(user)

      // Fetch games
      console.log("[v0] Fetching games for developer:", developer.id)
      const gamesData = await getGamesByDeveloper(developer.id)
      console.log("[v0] Games fetched:", gamesData.length, "games")
      setGames(gamesData)

      try {
        console.log("[v0] Fetching gifts for developer:", developer.id)
        setGiftsLoading(true)
        const giftsData = await getGiftsByDeveloper(developer.id)
        console.log("[v0] Gifts fetched:", giftsData.length, "gifts")
        setGifts(giftsData)
      } catch (giftsError) {
        console.error("[v0] Failed to fetch gifts:", giftsError)
        setGifts([])
      } finally {
        setGiftsLoading(false)
      }

      // Fetch points and leaderboard if user is logged in
      if (user) {
        setPointsLoading(true)
        try {
          console.log("[v0] Fetching player points for user:", user.id, "developer:", developer.id)
          const points = await getPlayerPointsForDeveloper(user.id, developer.id)
          console.log("[v0] Player points fetched:", points)
          setPlayerPoints(points)

          console.log("[v0] Fetching leaderboard for developer:", developer.id)
          const leaderboardData = await getLeaderboardByDeveloper(developer.id)
          console.log("[v0] Leaderboard data fetched:", leaderboardData.length, "entries")
          console.log(
            "[v0] Leaderboard entries:",
            leaderboardData.map((entry) => ({
              playerId: entry.playerId,
              playerName: entry.playerEmail?.split("@")[0] || `Player ${entry.playerId}`,
              totalPoints: entry.totalPoints,
              rank: entry.rank,
            })),
          )
          setLeaderboard(leaderboardData)
        } catch (pointsError) {
          console.error("[v0] Failed to fetch points/leaderboard:", pointsError)
          if (pointsError instanceof Error && pointsError.message.includes("fetch")) {
            console.log("[v0] Backend connection failed - server likely not running")
          }
        } finally {
          setPointsLoading(false)
        }
      } else {
        console.log("[v0] User not logged in, skipping points/leaderboard fetch")
      }

      setError(null)
    } catch (err) {
      console.error("[v0] Failed to fetch developer games:", err)
      if (err instanceof Error && err.message.includes("fetch")) {
        console.log("[v0] Backend connection failed - server likely not running")
        setError("Cannot connect to server. Please make sure the backend is running on port 8080.")
      } else {
        setError("Failed to load games. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (game: Game) => {
    console.log("[v0] Download button clicked for game:", game.name)

    if (!currentUser) {
      showNotification("Please log in to download games")
      return
    }

    const downloadKey = `downloaded_${currentUser.id}_${game.id}`
    const hasDownloadedBefore = localStorage.getItem(downloadKey) === "true"

    try {
      console.log("[v0] Attempting to track download and get URL...")
      const downloadUrl = await trackDownloadAndGetUrl(currentUser.id, game.id)
      console.log("[v0] Backend response (download URL):", downloadUrl)

      // Always redirect to the APK file URL
      window.open(game.apkFileUrl, "_blank")

      try {
        const updatedPoints = await getPlayerPointsForDeveloper(currentUser.id, developer.id)
        const pointsIncreased = updatedPoints > playerPoints
        setPlayerPoints(updatedPoints)

        if (pointsIncreased) {
          console.log("[v0] Points increased, showing points awarded notification")
          localStorage.setItem(downloadKey, "true") // Mark as downloaded
          showNotification("Points awarded successfully for download!")
        } else {
          console.log("[v0] No points increase, showing cannot accumulate message")
          showNotification("Cannot accumulate points next time")
        }
      } catch (pointsError) {
        console.log("[v0] Failed to check points update:", pointsError)
        if (!hasDownloadedBefore) {
          localStorage.setItem(downloadKey, "true")
          showNotification("Points awarded successfully for download!")
        } else {
          showNotification("Cannot accumulate points next time")
        }
      }
    } catch (error) {
      console.error("[v0] Download tracking failed:", error)
      console.log("[v0] Tracking failed, but still redirecting to download URL:", game.apkFileUrl)
      window.open(game.apkFileUrl, "_blank")

      if (!hasDownloadedBefore) {
        localStorage.setItem(downloadKey, "true")
        showNotification("Points awarded successfully for download!")
      } else {
        showNotification("Cannot accumulate points next time")
      }
    }
  }

  const fetchReviews = async (gameId: number) => {
    try {
      setReviewsLoading(true)
      const reviewsData = await getGameReviews(gameId)
      setReviews(reviewsData)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!currentUser || !selectedGame) {
      showNotification("Please log in to submit a review")
      return
    }

    if (!newReview.comment.trim()) {
      showNotification("Please enter a comment")
      return
    }

    try {
      setSubmittingReview(true)
      const reviewData: ReviewRequest = {
        gameId: selectedGame.id,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      }

      await submitReview(reviewData)

      // Reset form
      setNewReview({ rating: 5, comment: "" })

      // Refresh reviews
      await fetchReviews(selectedGame.id)

      // Refresh points to show updated score from review submission
      const updatedPoints = await getPlayerPointsForDeveloper(currentUser.id, developer.id)
      setPlayerPoints(updatedPoints)

      showNotification("Review submitted successfully! You earned points for your review.")
    } catch (error) {
      console.error("Failed to submit review:", error)
      showNotification("Failed to submit review. Please try again.")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game)
    fetchReviews(game.id)
  }

  const handleRedeemGift = async (gift: GiftDTO) => {
    if (!currentUser) {
      showNotification("Please log in to redeem gifts")
      return
    }

    if (playerPoints < gift.pointCost) {
      showNotification("Not enough points to redeem this gift")
      return
    }

    if (gift.quantity <= 0) {
      showNotification("This gift is out of stock")
      return
    }

    try {
      setRedeemingGifts((prev) => new Set(prev).add(gift.id))

      await redeemGift(currentUser.id, gift.id)

      // Refresh data after successful redemption
      const [updatedPoints, updatedGifts] = await Promise.all([
        getPlayerPointsForDeveloper(currentUser.id, developer.id),
        getGiftsByDeveloper(developer.id),
      ])

      setPlayerPoints(updatedPoints)
      setGifts(updatedGifts)

      showNotification(`Successfully redeemed ${gift.name}! Points deducted: ${gift.pointCost}`)
    } catch (error) {
      console.error("Failed to redeem gift:", error)
      showNotification("Failed to redeem gift. Please try again.")
    } finally {
      setRedeemingGifts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(gift.id)
        return newSet
      })
    }
  }

  const getAvatarColor = (email: string) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
    ]
    const index = email.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Developers
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading games...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Developers
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGame) {
    return (
      <div className="space-y-6">
        {/* Notification Component */}
        <Notification message={notification.message} isVisible={notification.isVisible} onClose={closeNotification} />

        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedGame(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedGame(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Game Detail View */}
        <div className="max-w-4xl mx-auto">
          {/* Large Preview Image */}
          <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100 mb-6">
            {selectedGame.previewImageUrl ? (
              <img
                src={selectedGame.previewImageUrl || "/placeholder.svg"}
                alt={selectedGame.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Play className="h-16 w-16" />
              </div>
            )}
          </div>

          {/* Game Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedGame.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{selectedGame.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Requirements</h2>
              <p className="text-gray-600">{selectedGame.requirements}</p>
            </div>

            {/* Reviews Section below requirements */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Reviews ({reviews.length})
              </h2>

              {/* Review Submission Form - Only for logged in users */}
              {currentUser && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Write a Review</h3>
                  <div className="space-y-4">
                    {/* Rating Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className={`p-1 ${
                              star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Share your thoughts about this game..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !newReview.comment.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submittingReview ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Submit Review & Earn Points
                    </Button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews
                    .filter((review) => review.status === "APPROVED")
                    .map((review) => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.playerName}</h4>
                            <div className="flex items-center space-x-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">No reviews yet. Be the first to review this game!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => handleDownload(selectedGame)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Game & Earn Points
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Component */}
      <Notification message={notification.message} isVisible={notification.isVisible} onClose={closeNotification} />

      {/* Header with back button and developer info */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Developers
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
          <AvatarImage src={developer.avatarUrl || ""} alt={developer.fullName || developer.email} />
          <AvatarFallback
            className={`bg-gradient-to-r ${getAvatarColor(developer.email)} text-white font-semibold text-xl`}
          >
            {developer.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{developer.fullName || developer.email}</h1>
          <p className="text-gray-600">{developer.email}</p>
          <p className="text-sm text-gray-500">
            {games.length} approved games • {gifts.length} gifts available
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("games")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "games"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Play className="h-4 w-4 inline mr-2" />
            Games ({games.length})
          </button>
          <button
            onClick={() => setActiveTab("gifts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "gifts"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Gift className="h-4 w-4 inline mr-2" />
            Gifts ({gifts.length})
          </button>
        </nav>
      </div>

      <div className="flex gap-6">
        {/* Content Area - Left Side */}
        <div className="flex-1">
          {activeTab === "games" ? (
            // Games List
            <div>
              <h2 className="text-xl font-semibold mb-4">Games</h2>
              <div className="space-y-4">
                {games.map((game) => (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Game Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {game.previewImageUrl ? (
                            <img
                              src={game.previewImageUrl || "/placeholder.svg"}
                              alt={game.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Play className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        {/* Game Name */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{game.name}</h3>
                        </div>

                        {/* Play Button */}
                        <div className="flex-shrink-0">
                          <Button onClick={() => handleGameSelect(game)} className="bg-green-600 hover:bg-green-700">
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {games.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">This developer hasn't published any approved games yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Gifts</h2>
              {giftsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading gifts...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gifts.map((gift) => (
                    <Card key={gift.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Gift Image */}
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                            {gift.imageUrl ? (
                              <img
                                src={gift.imageUrl || "/placeholder.svg"}
                                alt={gift.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Gift className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          {/* Gift Details */}
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{gift.name}</h3>
                            {gift.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{gift.description}</p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-blue-600">{gift.pointCost}</span> points
                              </div>
                              <div className="text-sm text-gray-500">
                                Stock: <span className="font-medium">{gift.quantity}</span>
                              </div>
                            </div>
                          </div>

                          {/* Redeem Button */}
                          <Button
                            onClick={() => handleRedeemGift(gift)}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={
                              gift.quantity === 0 ||
                              !currentUser ||
                              playerPoints < gift.pointCost ||
                              redeemingGifts.has(gift.id)
                            }
                          >
                            {redeemingGifts.has(gift.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Gift className="h-4 w-4 mr-2" />
                            )}
                            {gift.quantity === 0
                              ? "Out of Stock"
                              : !currentUser
                                ? "Login to Redeem"
                                : playerPoints < gift.pointCost
                                  ? "Not Enough Points"
                                  : redeemingGifts.has(gift.id)
                                    ? "Redeeming..."
                                    : "Redeem Gift"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {gifts.length === 0 && !giftsLoading && (
                <div className="text-center py-12">
                  <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">This developer hasn't uploaded any gifts yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Points & Leaderboard Sidebar - Right Side */}
        {currentUser && (
          <div className="w-80 space-y-6">
            {/* Player Points */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Your Points
                </h3>
                {pointsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{playerPoints}</div>
                    <p className="text-sm text-gray-600">Total Points from {developer.fullName || developer.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Leaderboard
                </h3>
                {pointsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Loading leaderboard...</p>
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((entry, index) => {
                      const playerName = entry.playerEmail
                        ? entry.playerEmail.split("@")[0]
                        : `Player ${entry.playerId}`

                      return (
                        <div
                          key={entry.playerId}
                          className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                            entry.playerId === currentUser.id
                              ? "bg-blue-50 border-blue-300 shadow-sm"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                  entry.rank === 1
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                                    : entry.rank === 2
                                      ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
                                      : entry.rank === 3
                                        ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
                                }`}
                              >
                                #{entry.rank}
                              </div>

                              <div className="flex-1">
                                <div
                                  className={`font-semibold text-base ${
                                    entry.playerId === currentUser.id ? "text-blue-700" : "text-gray-900"
                                  }`}
                                >
                                  {entry.playerId === currentUser.id ? "You" : `Player ${entry.playerId}`}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">Player ID:</span> {entry.playerId}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-xl text-blue-600">{entry.totalPoints}</div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">points</div>
                              <div className="text-xs text-gray-400 mt-1">Rank: {entry.rank}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No leaderboard data available</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentUser ? "Backend server may be offline" : "Login to see rankings"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Expected data: playerId, playerName, totalPoints, rank</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
