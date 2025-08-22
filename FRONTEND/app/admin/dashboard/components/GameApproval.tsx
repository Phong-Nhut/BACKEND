"use client"

import { useEffect, useState } from "react"
import { getPendingGames, approveGame, getAdminAllGames } from "@/lib/api"
import type { Game } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Clock, CheckCircle, Trophy, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const normalizeGameData = (game: any): Game => {
  return {
    ...game,
    developerId: game.developerId || game.developer_id || game.developerId || null,
  }
}

export function GameApproval() {
  const [pendingGames, setPendingGames] = useState<Game[]>([])
  const [approvedGames, setApprovedGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [processingGameId, setProcessingGameId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchGames = async () => {
    setLoading(true)
    try {
      const [pending, allGames] = await Promise.all([getPendingGames(), getAdminAllGames()])

      const normalizedPending = pending.map(normalizeGameData)
      const normalizedAllGames = allGames.map(normalizeGameData)

      setPendingGames(normalizedPending)
      setApprovedGames(normalizedAllGames.filter((game) => game.status === "APPROVED"))
    } catch (error) {
      console.log("[v0] Error fetching games:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch games.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const handleApproval = async (gameId: number, status: "APPROVED" | "REJECTED") => {
    try {
      setProcessingGameId(gameId)
      await approveGame(gameId, status)
      toast({
        title: "Success",
        description: `Game has been ${status.toLowerCase()}.`,
      })
      fetchGames()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update game status.",
      })
    } finally {
      setProcessingGameId(null)
    }
  }

  const renderDeveloperId = (developerId: number | null | undefined) => {
    if (developerId) {
      return <span className="text-gray-600">{developerId}</span>
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
        Missing ID
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Gamepad2 className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Game Approval</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 font-medium">Loading games...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Gamepad2 className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Game Approval</h2>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Clock className="h-4 w-4" />
            Pending Approval ({pendingGames.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <CheckCircle className="h-4 w-4" />
            Approved Games ({approvedGames.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                Games Awaiting Approval
              </CardTitle>
              <p className="text-sm text-gray-600 leading-relaxed">Review and approve or reject game submissions</p>
            </CardHeader>
            <CardContent className="p-0">
              {pendingGames.length > 0 ? (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900 py-4">Game Name</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Description</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Developer ID</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingGames.map((game) => (
                        <TableRow key={game.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900 py-4">{game.name}</TableCell>
                          <TableCell className="max-w-xs truncate text-gray-600 py-4">{game.description}</TableCell>
                          <TableCell className="py-4">{renderDeveloperId(game.developerId)}</TableCell>
                          <TableCell className="py-4">
                            <Badge
                              className="bg-amber-50 text-amber-700 border-amber-200 font-medium"
                              variant="outline"
                            >
                              {game.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                onClick={() => handleApproval(game.id, "APPROVED")}
                                disabled={processingGameId === game.id}
                              >
                                {processingGameId === game.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                  "Approve"
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                                onClick={() => handleApproval(game.id, "REJECTED")}
                                disabled={processingGameId === game.id}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Pending Approvals</h3>
                  <p className="text-gray-600 leading-relaxed">All game submissions have been processed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                Approved Games
              </CardTitle>
              <p className="text-sm text-gray-600 leading-relaxed">
                Games that have been approved and are live on the platform
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {approvedGames.length > 0 ? (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900 py-4">Game Name</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Description</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Developer ID</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Features</TableHead>
                        <TableHead className="font-semibold text-gray-900 py-4">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedGames.map((game) => (
                        <TableRow key={game.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900 py-4">{game.name}</TableCell>
                          <TableCell className="max-w-xs truncate text-gray-600 py-4">{game.description}</TableCell>
                          <TableCell className="py-4">{renderDeveloperId(game.developerId)}</TableCell>
                          <TableCell className="py-4">
                            <div className="flex gap-2">
                              {game.supportLeaderboard && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs"
                                >
                                  <Trophy className="h-3 w-3 mr-1" />
                                  Leaderboard
                                </Badge>
                              )}
                              {game.supportPoints && (
                                <Badge
                                  variant="outline"
                                  className="bg-violet-50 text-violet-700 border-violet-200 font-medium text-xs"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Points
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              variant="outline"
                            >
                              {game.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Approved Games</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Approved games will appear here once they're processed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
