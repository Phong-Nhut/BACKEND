"use client"

import { Leaderboard } from "@/components/leaderboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Award, Medal } from "lucide-react"

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top players ranked by total points earned from downloading games and writing reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Leaderboard />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Points Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  Download a game: <strong>+10 points</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-sm">
                  Write a review: <strong>+20 points</strong>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Points are only awarded for games that support the points system.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ranking System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">
                  <strong>1st Place</strong> - Gold Trophy
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-gray-400" />
                <span className="text-sm">
                  <strong>2nd Place</strong> - Silver Medal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="text-sm">
                  <strong>3rd Place</strong> - Bronze Award
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Rankings are updated in real-time based on total points.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
