"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, User, Mail, Palette, Calendar, Edit3 } from "lucide-react"
import { uploadAvatar, updateUserProfile, getUserProfile } from "@/lib/api"
import type { User as UserType } from "@/lib/types"
import { useAuth } from "@/contexts/AuthContext"
import { ImageCropper } from "@/components/ui/image-cropper"

export function ProfileSection() {
  const [user, setUser] = useState<UserType | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refreshUser } = useAuth()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile()
      setUser(profile)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
      setShowCropper(true)
    }
  }

  const handleCroppedImage = (croppedFile: File) => {
    setSelectedFile(croppedFile)
    const url = URL.createObjectURL(croppedFile)
    setPreviewUrl(url)
    setShowCropper(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // Upload avatar to backend
      const response = await uploadAvatar(selectedFile)

      // Update user profile with new avatar URL
      await updateUserProfile({ avatarUrl: response.avatarUrl })

      // Update local state
      setUser((prev) => (prev ? { ...prev, avatarUrl: response.avatarUrl } : null))

      await refreshUser()

      // Clear selection
      setSelectedFile(null)
      setPreviewUrl(null)

      alert("Avatar uploaded successfully!")
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      alert("Failed to upload avatar. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-pink-50 to-rose-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            <div className="w-32 h-32 bg-pink-200 rounded-full mx-auto"></div>
            <div className="space-y-3">
              <div className="h-4 bg-pink-200 rounded w-1/4"></div>
              <div className="h-10 bg-pink-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-pink-50 to-rose-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <User className="h-6 w-6" />
            </div>
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <Avatar className="relative w-32 h-32 border-4 border-white shadow-2xl ring-4 ring-pink-100">
                <AvatarImage
                  src={previewUrl || user?.avatarUrl || ""}
                  alt={user?.fullName || "User avatar"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 text-3xl font-bold">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 transform hover:scale-110 group"
              >
                <Camera className="w-5 h-5" />
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{user?.fullName || "User Name"}</h3>
              <p className="text-pink-600 font-medium flex items-center justify-center gap-2">
                <Palette className="w-4 h-4" />
                {user?.role || "Designer"}
              </p>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {selectedFile && !showCropper && (
              <div className="text-center space-y-3 p-4 bg-white rounded-xl shadow-sm border border-pink-100">
                <p className="text-sm text-gray-600 font-medium">Ready to upload: {selectedFile.name}</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                    }}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Avatar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-pink-600" />
              Profile Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700 font-medium">
                  <User className="w-4 h-4 text-pink-600" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={user?.fullName || ""}
                  readOnly
                  className="bg-pink-50 border-pink-200 focus:border-pink-400 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Mail className="w-4 h-4 text-pink-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  readOnly
                  className="bg-pink-50 border-pink-200 focus:border-pink-400 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Palette className="w-4 h-4 text-pink-600" />
                  Role
                </Label>
                <Input
                  id="role"
                  value={user?.role || ""}
                  readOnly
                  className="bg-pink-50 border-pink-200 focus:border-pink-400 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 text-pink-600" />
                  Status
                </Label>
                <Input
                  id="status"
                  value={user?.status || ""}
                  readOnly
                  className="bg-pink-50 border-pink-200 focus:border-pink-400 h-12"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ImageCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        onCrop={handleCroppedImage}
        imageFile={selectedFile}
      />
    </div>
  )
}
