"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAllDevelopers } from "@/lib/api"
import type { User } from "@/lib/types"

interface DeveloperListProps {
  onSelectDeveloper: (developer: User) => void
}

export default function DeveloperList({ onSelectDeveloper }: DeveloperListProps) {
  const [developers, setDevelopers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevelopers()
  }, [])

  const fetchDevelopers = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching developers...")
      const developersData = await getAllDevelopers()
      console.log("[v0] Developers fetched:", developersData)
      setDevelopers(developersData)
      setError(null)
    } catch (err) {
      console.error("[v0] Failed to fetch developers:", err)
      setError("Failed to load developers. Please try again.")
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading developers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDevelopers} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Developers</h1>
        <p className="text-gray-600">Choose a developer to view their games</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((developer) => (
          <Card
            key={developer.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectDeveloper(developer)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={developer.avatarUrl || ""} alt={developer.fullName || developer.email} />
                  <AvatarFallback
                    className={`bg-gradient-to-r ${getAvatarColor(developer.email)} text-white font-semibold text-lg`}
                  >
                    {developer.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{developer.fullName}</h3>
                  <p className="text-sm text-gray-600">{developer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {developers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No developers found.</p>
        </div>
      )}
    </div>
  )
}
