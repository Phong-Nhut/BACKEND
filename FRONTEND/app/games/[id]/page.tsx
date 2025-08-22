  "use client"

  import { useState, useEffect } from "react"
  import { useParams } from "next/navigation"
  import Image from "next/image"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"
  import { Download, Users, Trophy } from "lucide-react"
  import { getGameById, trackDownloadAndGetUrl, getCurrentUser, getDirectApkUrl } from "@/lib/api"
  import { GameReviews } from "@/components/game-reviews"
  import type { Game, User } from "@/lib/types"
  import { useToast } from "@/hooks/use-toast"

  export default function GameDetailPage() {
    const params = useParams()
    const gameId = Number.parseInt(params.id as string)
    const [game, setGame] = useState<Game | null>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [hasDownloadedBefore, setHasDownloadedBefore] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
      if (gameId) {
        loadGame()
        loadCurrentUser()
        checkDownloadHistory()
      }
    }, [gameId])

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error("Failed to load current user:", error)
      }
    }

    const loadGame = async () => {
      try {
        setLoading(true)
        const gameData = await getGameById(gameId)
        setGame(gameData)
      } catch (error) {
        console.error("Failed to load game:", error)
        toast({
          title: "Error",
          description: "Failed to load game details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const checkDownloadHistory = () => {
      // Check localStorage for download history
      const downloadHistory = localStorage.getItem(`download_${gameId}`)
      if (downloadHistory) {
        setHasDownloadedBefore(true)
      }
    }

    const handleDownload = async () => {
      try {
        setDownloading(true)

        // For GUEST users or users who have downloaded before, just get direct APK URL
        if (!currentUser || currentUser.role !== "PLAYER" || hasDownloadedBefore) {
          const apkUrl = await getDirectApkUrl(gameId)

          toast({
            title: "Download Started",
            description: !currentUser
              ? "Download started!"
              : currentUser.role !== "PLAYER"
                ? "Download started!"
                : "Download started! (Points already earned previously)",
          })

          // Open the APK URL in a new tab
          window.open(apkUrl, "_blank")
          return
        }

        // For PLAYER users downloading for the first time
        try {
          const apkUrl = await trackDownloadAndGetUrl(currentUser.id, gameId)

          // Mark as downloaded in localStorage
          localStorage.setItem(`download_${gameId}`, "true")
          setHasDownloadedBefore(true)

          toast({
            title: "Download Started",
            description: game?.supportPoints ? "Download started! You earned 10 points!" : "Download started!",
          })

          // Open the APK URL in a new tab
          window.open(apkUrl, "_blank")
        } catch (error: any) {
          console.error("Download tracking failed:", error)

          // If tracking fails, try direct download
          try {
            const apkUrl = await getDirectApkUrl(gameId)

            toast({
              title: "Download Started",
              description: "Download started! (Point tracking unavailable)",
            })

            window.open(apkUrl, "_blank")
          } catch (directError) {
            throw new Error("Could not access game file")
          }
        }
      } catch (error: any) {
        console.error("Download failed:", error)
        toast({
          title: "Download Failed",
          description: error.message || "Failed to start download",
          variant: "destructive",
        })
      } finally {
        setDownloading(false)
      }
    }

    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading game details...</div>
        </div>
      )
    }

    if (!game) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Game not found</div>
        </div>
      )
    }

    const getDownloadButtonText = () => {
      if (downloading) return "Starting Download..."

      if (!currentUser) return "Download Game"

      if (currentUser.role !== "PLAYER") return "Download Game"

      if (hasDownloadedBefore) return "Download Game"

      return game?.supportPoints ? "Download Game (+10 points)" : "Download Game"
    }

    const getDownloadHelpText = () => {
      if (!currentUser) {
        return "Anyone can download games"
      }

      if (currentUser.role !== "PLAYER") {
        return "Download available (no points for non-players)"
      }

      if (hasDownloadedBefore) {
        return "You have already earned points for this game"
      }

      return null
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{game.name}</CardTitle>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="secondary">{game.status}</Badge>
                      {game.supportPoints && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          Points Enabled
                        </Badge>
                      )}
                      {game.supportLeaderboard && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Leaderboard
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={game.previewImageUrl || "/stylized-game-scene.png"}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{game.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">System Requirements</h3>
                    <p className="text-gray-700">{game.requirements}</p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleDownload} disabled={downloading} className="w-full sm:w-auto" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      {getDownloadButtonText()}
                    </Button>

                    {getDownloadHelpText() && <p className="text-sm text-gray-500 mt-2">{getDownloadHelpText()}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Developer ID:</span>
                  <span className="font-medium">{game.developerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={game.status === "APPROVED" ? "default" : "secondary"}>{game.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points System:</span>
                  <span className={game.supportPoints ? "text-green-600" : "text-gray-400"}>
                    {game.supportPoints ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leaderboard:</span>
                  <span className={game.supportLeaderboard ? "text-green-600" : "text-gray-400"}>
                    {game.supportLeaderboard ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Points Info for Players */}
            {currentUser?.role === "PLAYER" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Earn Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {game.supportPoints ? (
                    <>
                      <div className="flex justify-between">
                        <span>Download Game:</span>
                        <span className={`font-medium ${hasDownloadedBefore ? "text-gray-400" : "text-green-600"}`}>
                          {hasDownloadedBefore ? "Already earned" : "+10 points"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Write Review:</span>
                        <span className="font-medium text-green-600">+20 points</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">This game doesn't support points</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <GameReviews gameId={gameId} />
        </div>
      </div>
    )
  }
