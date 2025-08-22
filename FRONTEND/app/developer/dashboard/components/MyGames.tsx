"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Gamepad2Icon as GameController2,
  Search,
  Edit,
  Trash2,
  Download,
  Star,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
} from "lucide-react"
import { getMyGames, deleteGame } from "@/lib/api"
import type { Game } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { EditGameDialog } from "./EditGameDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function MyGames() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [deletingGameId, setDeletingGameId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMyGames()
  }, [])

  useEffect(() => {
    const filtered = games.filter(
      (game) =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredGames(filtered)
  }, [games, searchTerm])

  const fetchMyGames = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const myGames = await getMyGames()
      setGames(myGames)
    } catch (error) {
      console.error("Failed to fetch games:", error)
      setError(error instanceof Error ? error.message : "Failed to load games")
      toast({
        title: "Error",
        description: "Failed to load your games. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGame = async (gameId: number) => {
    try {
      setDeletingGameId(gameId)
      await deleteGame(gameId)
      setGames((prev) => prev.filter((game) => game.id !== gameId))
      toast({
        title: "Game Deleted",
        description: "Your game has been successfully deleted.",
      })
    } catch (error) {
      console.error("Failed to delete game:", error)
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete game",
        variant: "destructive",
      })
    } finally {
      setDeletingGameId(null)
    }
  }

  const handleGameUpdated = (updatedGame: Game) => {
    setGames((prev) => prev.map((game) => (game.id === updatedGame.id ? updatedGame : game)))
    setEditingGame(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "✓"
      case "PENDING":
        return "⏳"
      case "REJECTED":
        return "✗"
      default:
        return "?"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Games</h1>
          <p className="text-gray-600">Manage and track your published games</p>
        </div>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <GameController2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Game Library</CardTitle>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mt-1"></div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-5 h-5 text-gray-400" />
                <div className="h-10 bg-gray-200 rounded animate-pulse flex-1 max-w-sm"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Games</h1>
          <p className="text-gray-600">Manage and track your published games</p>
        </div>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Failed to Load Games</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
              <Button onClick={fetchMyGames} className="bg-green-600 hover:bg-green-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Games</h1>
        <p className="text-gray-600">Manage and track your published games</p>
      </div>

      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <GameController2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Game Library</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {games.length} {games.length === 1 ? "game" : "games"} total •{" "}
                  {games.filter((g) => g.status === "APPROVED").length} approved
                </p>
              </div>
            </div>
            <Button
              onClick={fetchMyGames}
              variant="outline"
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search your games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {filteredGames.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GameController2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {games.length === 0 ? "No Games Yet" : "No Games Found"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {games.length === 0
                    ? "Upload your first game to get started on your development journey!"
                    : "Try adjusting your search terms to find the games you're looking for."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <Card
                    key={game.id}
                    className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-2 truncate text-lg">{game.name}</h3>
                          <Badge className={`${getStatusColor(game.status)} font-medium`}>
                            <span className="mr-1">{getStatusIcon(game.status)}</span>
                            {game.status}
                          </Badge>
                        </div>
                        {game.previewImageUrl && (
                          <div className="ml-4 flex-shrink-0">
                            <img
                              src={game.previewImageUrl || "/placeholder.svg"}
                              alt={game.name}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            />
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{game.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span className="text-gray-400">--</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span className="text-gray-400">--</span>
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          ID: {game.id}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingGame(game)}
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deletingGameId === game.id}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                            >
                              {deletingGameId === game.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                Delete Game
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Are you sure you want to delete "<strong>{game.name}</strong>"? This action cannot be
                                undone and will permanently remove the game from your library.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGame(game.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Game
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingGame && (
        <EditGameDialog
          game={editingGame}
          open={!!editingGame}
          onClose={() => setEditingGame(null)}
          onGameUpdated={handleGameUpdated}
        />
      )}
    </div>
  )
}
