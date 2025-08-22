"use client"

import { useEffect, useState } from "react"
import { GameCard } from "@/components/game-card"
import { getPublicGames } from "@/lib/api"
import type { Game } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { HeroSection } from "@/components/layout/hero-section"
import { motion } from "framer-motion"
import { Server } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log("[v0] Attempting to fetch public games...")
        const publicGames = await getPublicGames()
        console.log("[v0] Successfully fetched games:", publicGames.length)
        setGames(publicGames)
        setError(null)
      } catch (error: any) {
        console.log("[v0] Failed to fetch games - backend likely not running")
        setError("Unable to connect to the game server. Please ensure your backend server is running on port 8080.")
        setGames([]) // Clear any existing games
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  return (
    <>
      <HeroSection />
      <div className="container mx-auto px-4 py-12 sm:py-16 bg-gradient-to-b from-blue-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl mb-8 text-center">
            Latest Game Assets
          </h2>

          {error && (
            <Alert className="mb-8 border-orange-200 bg-orange-50">
              <Server className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Backend Connection Issue:</strong> {error}
                <br />
                <span className="text-sm mt-2 block">
                  To fix this: Start your backend server and ensure it's running on http://localhost:8080
                </span>
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[225px] w-full rounded-xl bg-blue-100/50" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-blue-100/50" />
                    <Skeleton className="h-4 w-1/2 bg-blue-100/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}

          {games.length === 0 && !loading && !error && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-800">No Assets Found</h2>
              <p className="text-gray-500 mt-2">
                It looks like there are no approved assets to show right now. Check back later!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
