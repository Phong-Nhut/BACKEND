"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import type { Game } from "@/lib/types"

interface GameCardProps {
  game: Game
  showStatus?: boolean
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function GameCard({ game, showStatus = false, showActions = false, onEdit, onDelete }: GameCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default"
      case "PENDING":
        return "secondary"
      case "REJECTED":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 border-gray-200">
      <div className="relative aspect-video">
        <Image src={game.previewImageUrl || "/stylized-game-scene.png"} alt={game.name} fill className="object-cover" />
        {showStatus && (
          <div className="absolute top-3 right-3">
            <Badge variant={getStatusVariant(game.status)} className="shadow-sm">
              {game.status}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1 text-gray-800">{game.name}</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{game.description || "No description available"}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {game.supportPoints && (
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
              Points
            </Badge>
          )}
          {game.supportLeaderboard && (
            <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
              Leaderboard
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <Link href={`/games/${game.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Link>
          </Button>

          {showActions && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit} className="px-3 bg-transparent">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
