"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"
import { getLeaderboardByDeveloper } from "@/lib/api"
import type { LeaderboardResponse } from "@/lib/types"

export function Leaderboard({ developerId }: { developerId?: number }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [developerId])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      if (developerId) {
        const data = await getLeaderboardByDeveloper(developerId)
        setLeaderboard(data)
      } else {
        // No developer specified, show empty leaderboard
        setLeaderboard([])
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading leaderboard...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {developerId ? "No players on the leaderboard yet." : "Please specify a developer to view leaderboard."}
            </p>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.playerId}
                className={`flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(entry.rank)}`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {entry.playerEmail ? entry.playerEmail.split("@")[0] : `Player ${entry.playerId}`}
                    </p>
                    <p className="text-sm text-gray-600">Player #{entry.playerId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-600">{entry.totalPoints}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
