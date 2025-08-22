"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  Loader2,
  CheckCircle,
  Gamepad2Icon as GameController2,
  FileText,
  Settings,
  ImageIcon,
} from "lucide-react"
import { createGame } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function GameUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requirements: "",
    apkFileUrl: "",
    supportLeaderboard: false,
    supportPoints: false,
  })

  const [files, setFiles] = useState({
    previewImage: null as File | null,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.requirements || !formData.apkFileUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including APK URL.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      const uploadData = new FormData()
      uploadData.append("name", formData.name)
      uploadData.append("description", formData.description)
      uploadData.append("requirements", formData.requirements)
      uploadData.append("apkFileUrl", formData.apkFileUrl)
      uploadData.append("supportLeaderboard", formData.supportLeaderboard.toString())
      uploadData.append("supportPoints", formData.supportPoints.toString())

      if (files.previewImage) uploadData.append("previewImage", files.previewImage)

      await createGame(uploadData)

      setUploadSuccess(true)
      toast({
        title: "Game Uploaded Successfully! 🎮",
        description: "Your game has been submitted and is pending admin approval.",
      })

      setFormData({
        name: "",
        description: "",
        requirements: "",
        apkFileUrl: "",
        supportLeaderboard: false,
        supportPoints: false,
      })
      setFiles({
        previewImage: null,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadSuccess) {
    return (
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Game Uploaded Successfully!</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your game has been submitted and is pending admin approval. You'll be notified once it's reviewed.
            </p>
            <Button
              onClick={() => setUploadSuccess(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Another Game
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Game</h1>
        <p className="text-gray-600">Submit your game for review and publication on the platform</p>
      </div>

      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-green-50 rounded-lg">
              <GameController2 className="w-6 h-6 text-green-600" />
            </div>
            Game Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Game Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your game name"
                  required
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Game Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your game, its features, and what makes it unique..."
                  rows={4}
                  required
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="requirements" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  System Requirements *
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="Enter system requirements (e.g., Android 5.0+, 2GB RAM, 100MB storage, etc.)"
                  rows={3}
                  required
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Game Files
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="apkFileUrl" className="text-sm font-semibold text-gray-700">
                    APK File URL *
                  </Label>
                  <Input
                    id="apkFileUrl"
                    type="url"
                    value={formData.apkFileUrl}
                    onChange={(e) => handleInputChange("apkFileUrl", e.target.value)}
                    placeholder="https://example.com/your-game.apk"
                    required
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    Enter the direct download URL to your game's APK file
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="previewImage" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Preview Image
                  </Label>
                  <div className="relative">
                    <Input
                      id="previewImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("previewImage", e.target.files?.[0] || null)}
                      className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Upload a preview image (PNG, JPG) - Optional
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Game Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                  <Checkbox
                    id="supportLeaderboard"
                    checked={formData.supportLeaderboard}
                    onCheckedChange={(checked) => handleInputChange("supportLeaderboard", checked as boolean)}
                    className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <Label htmlFor="supportLeaderboard" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Support Leaderboard System
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                  <Checkbox
                    id="supportPoints"
                    checked={formData.supportPoints}
                    onCheckedChange={(checked) => handleInputChange("supportPoints", checked as boolean)}
                    className="border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <Label htmlFor="supportPoints" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Support Points System
                  </Label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading Game...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Submit Game for Review
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
