"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { uploadGift } from "@/lib/api"
import { getCurrentUser } from "@/lib/api"
import { Upload, Gift, Loader2 } from "lucide-react"
import type { GiftDTO } from "@/lib/types"

export default function GiftUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointCost: "",
    quantity: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Gift name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.pointCost || Number.parseInt(formData.pointCost) <= 0) {
      toast({
        title: "Validation Error",
        description: "Point cost must be greater than 0",
        variant: "destructive",
      })
      return
    }

    if (!formData.quantity || Number.parseInt(formData.quantity) < 0) {
      toast({
        title: "Validation Error",
        description: "Quantity cannot be negative",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      const uploadData = new FormData()
      uploadData.append("developerId", currentUser.id.toString())
      uploadData.append("name", formData.name.trim())
      uploadData.append("description", formData.description.trim())
      uploadData.append("pointCost", formData.pointCost)
      uploadData.append("quantity", formData.quantity)

      if (imageFile) {
        uploadData.append("imageFile", imageFile)
      }

      const result: GiftDTO = await uploadGift(uploadData)

      toast({
        title: "Success!",
        description: `Gift "${result.name}" uploaded successfully`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        pointCost: "",
        quantity: "",
      })
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Gift upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload gift",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Gift className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Upload Gift</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Gift</CardTitle>
          <CardDescription>Upload a gift that players can redeem using their earned points</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Gift Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter gift name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointCost">Point Cost *</Label>
                <Input
                  id="pointCost"
                  name="pointCost"
                  type="number"
                  min="1"
                  value={formData.pointCost}
                  onChange={handleInputChange}
                  placeholder="Points required to redeem"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Available quantity"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Gift Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your gift..."
                rows={4}
              />
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="border rounded-lg p-4">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Gift preview"
                    className="max-w-xs max-h-48 object-contain mx-auto"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Gift...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Gift
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
