"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { updateGift } from "@/lib/api"
import type { GiftDTO } from "@/lib/types"

interface EditGiftDialogProps {
  gift: GiftDTO
  open: boolean
  onClose: () => void
  onSuccess: (updatedGift: GiftDTO) => void
}

export default function EditGiftDialog({ gift, open, onClose, onSuccess }: EditGiftDialogProps) {
  // Form state - Trạng thái form
  const [formData, setFormData] = useState({
    name: gift.name,
    description: gift.description || "",
    pointCost: gift.pointCost.toString(),
    quantity: gift.quantity.toString(),
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(gift.imageUrl || null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Handle input changes - Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle image selection - Xử lý chọn hình ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB) - Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type - Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)

      // Create preview - Tạo preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove image - Xóa hình ảnh
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(gift.imageUrl || null)
  }

  // Handle form submission - Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation - Kiểm tra dữ liệu
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
      console.log(`[v0] Updating gift: ID=${gift.id}, Name=${formData.name}`)

      // Prepare form data - Chuẩn bị dữ liệu form
      const updateData = new FormData()

      // Only append changed fields - Chỉ thêm các field đã thay đổi
      if (formData.name !== gift.name) {
        updateData.append("name", formData.name.trim())
      }
      if (formData.description !== (gift.description || "")) {
        updateData.append("description", formData.description.trim())
      }
      if (Number.parseInt(formData.pointCost) !== gift.pointCost) {
        updateData.append("pointCost", formData.pointCost)
      }
      if (Number.parseInt(formData.quantity) !== gift.quantity) {
        updateData.append("quantity", formData.quantity)
      }
      if (imageFile) {
        updateData.append("imageFile", imageFile)
      }

      // Call update API - Gọi API cập nhật
      const updatedGift = await updateGift(gift.id, updateData)

      console.log("[v0] Gift updated successfully:", updatedGift)
      onSuccess(updatedGift)
    } catch (error) {
      console.error("Error updating gift:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update gift",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form when dialog closes - Reset form khi đóng dialog
  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: gift.name,
        description: gift.description || "",
        pointCost: gift.pointCost.toString(),
        quantity: gift.quantity.toString(),
      })
      setImageFile(null)
      setImagePreview(gift.imageUrl || null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Gift</DialogTitle>
          <DialogDescription>Update your gift information. Only changed fields will be updated.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information - Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Gift Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter gift name"
                required
                disabled={isLoading}
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
                placeholder="Points required"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
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
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description - Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your gift..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Image Upload - Upload hình ảnh */}
          <div className="space-y-2">
            <Label htmlFor="image">Gift Image</Label>
            <div className="space-y-3">
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={isLoading} />

              {/* Image Preview - Xem trước hình ảnh */}
              {imagePreview && (
                <div className="relative border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Current Image</Label>
                    {imageFile && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage} disabled={isLoading}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Gift preview"
                    className="max-w-full max-h-48 object-contain mx-auto rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/wrapped-gift.png"
                    }}
                  />
                  {imageFile && <p className="text-xs text-green-600 mt-2 text-center">✓ New image selected</p>}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Update Gift
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
