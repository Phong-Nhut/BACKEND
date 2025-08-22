"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { updateGame } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Edit, CheckCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Game } from "@/lib/types"

interface EditGameDialogProps {
  game: Game
  open: boolean
  onClose: () => void
  onGameUpdated: (updatedGame: Game) => void
}

export function EditGameDialog({ game, open, onClose, onGameUpdated }: EditGameDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requirements: "",
    supportLeaderboard: false,
    supportPoints: false,
    apkFileUrl: "",
  })

  const [files, setFiles] = useState({
    previewImage: null as File | null,
  })

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name,
        description: game.description,
        requirements: game.requirements,
        supportLeaderboard: game.supportLeaderboard,
        supportPoints: game.supportPoints,
        apkFileUrl: game.apkFileUrl || "",
      })
    }
  }, [game])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("requirements", formData.requirements)
      data.append("supportLeaderboard", formData.supportLeaderboard.toString())
      data.append("supportPoints", formData.supportPoints.toString())
      data.append("apkFileUrl", formData.apkFileUrl)

      if (files.previewImage) {
        data.append("previewImage", files.previewImage)
      }

      const updatedGame = await updateGame(game.id, data)

      toast({
        title: "Game Updated Successfully! 🎮",
        description: "Your game has been updated and changes are now live.",
      })

      onGameUpdated(updatedGame)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update game. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-l-4 border-l-green-500 shadow-xl bg-white">
        <DialogHeader className="pb-4 border-b border-green-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Edit className="w-5 h-5 text-green-600" />
            </div>
            Edit Game: {game.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <Label htmlFor="edit-name" className="font-medium text-gray-900">
              Game Name *
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <Label htmlFor="edit-description" className="font-medium text-gray-900">
              Description *
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe your game..."
              required
              className="mt-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <Label htmlFor="edit-requirements" className="font-medium text-gray-900">
              System Requirements *
            </Label>
            <Textarea
              id="edit-requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={3}
              placeholder="e.g., Android 5.0+, 2GB RAM, 100MB storage"
              required
              className="mt-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Label className="font-medium text-gray-900">Game Features</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="supportLeaderboard"
                  checked={formData.supportLeaderboard}
                  onCheckedChange={(checked) => setFormData({ ...formData, supportLeaderboard: checked as boolean })}
                  className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label htmlFor="supportLeaderboard" className="text-gray-700">
                  Support Leaderboard
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="supportPoints"
                  checked={formData.supportPoints}
                  onCheckedChange={(checked) => setFormData({ ...formData, supportPoints: checked as boolean })}
                  className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label htmlFor="supportPoints" className="text-gray-700">
                  Support Points System
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-previewImage" className="font-medium text-gray-900">
                Update Preview Image
              </Label>
              <Input
                id="edit-previewImage"
                type="file"
                accept="image/*"
                onChange={(e) => setFiles({ ...files, previewImage: e.target.files?.[0] || null })}
                className="mt-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
            </div>

            <div>
              <Label htmlFor="edit-apkFileUrl" className="font-medium text-gray-900">
                URL tự tải game
              </Label>
              <Input
                id="edit-apkFileUrl"
                type="url"
                value={formData.apkFileUrl}
                onChange={(e) => setFormData({ ...formData, apkFileUrl: e.target.value })}
                placeholder="https://example.com/game.apk"
                className="mt-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the download URL for your game</p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-green-100">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Game
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
