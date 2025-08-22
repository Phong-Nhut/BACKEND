"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Gift, Edit, Trash2, Coins, Package, Calendar, AlertTriangle } from "lucide-react"
import { getMyGifts, getCurrentUser } from "@/lib/api"
import type { GiftDTO, User } from "@/lib/types"
import EditGiftDialog from "./EditGiftDialog"

export default function MyGifts() {
  // State management - Quản lý trạng thái
  const [gifts, setGifts] = useState<GiftDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingGift, setEditingGift] = useState<GiftDTO | null>(null)
  const { toast } = useToast()

  // Fetch gifts data - Lấy dữ liệu gifts
  const fetchGifts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user - Lấy thông tin user hiện tại
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError("Please log in to view your gifts")
        return
      }
      setUser(currentUser)

      // Fetch gifts - Lấy danh sách gifts
      const giftsData = await getMyGifts()
      console.log("[v0] My gifts data:", giftsData)
      setGifts(giftsData)
    } catch (err) {
      console.error("Error fetching gifts:", err)
      setError(err instanceof Error ? err.message : "Failed to load gifts")
      toast({
        title: "Error",
        description: "Failed to load your gifts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount - Tải dữ liệu khi component mount
  useEffect(() => {
    fetchGifts()
  }, [])

  // Handle gift deletion - Xử lý xóa gift
  const handleDeleteGift = async (giftId: number, giftName: string, forceDelete = false) => {
    try {
      setDeletingId(giftId)
      console.log(`[v0] Deleting gift: ID=${giftId}, Name=${giftName}, Force=${forceDelete}`)

      // Call delete API with force parameter - Gọi API xóa với tham số force
      const url = forceDelete
        ? `http://localhost:8080/api/v1/gifts/${giftId}?force=true`
        : `http://localhost:8080/api/v1/gifts/${giftId}`

      const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).token : null

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Delete failed" }))

        // If deletion failed due to existing transactions, show force delete option
        // Nếu xóa thất bại do có transactions, hiển thị tùy chọn force delete
        if (errorData.message?.includes("redeemed by players")) {
          const confirmForce = window.confirm(
            `Cannot delete "${giftName}" because it has been redeemed by players.\n\nDo you want to force delete it anyway? This action cannot be undone.`,
          )

          if (confirmForce) {
            return handleDeleteGift(giftId, giftName, true)
          }
          return
        }

        throw new Error(errorData.message || "Failed to delete gift")
      }

      // Remove gift from local state - Xóa gift khỏi state local
      setGifts((prev) => prev.filter((gift) => gift.id !== giftId))

      toast({
        title: "Success",
        description: `Gift "${giftName}" deleted successfully`,
      })

      console.log(`[v0] Gift deleted successfully: ${giftName}`)
    } catch (err) {
      console.error("Error deleting gift:", err)
      toast({
        title: "Delete Failed",
        description: err instanceof Error ? err.message : "Failed to delete gift",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Handle gift update success - Xử lý cập nhật gift thành công
  const handleGiftUpdated = (updatedGift: GiftDTO) => {
    setGifts((prev) => prev.map((gift) => (gift.id === updatedGift.id ? updatedGift : gift)))
    setEditingGift(null)
    toast({
      title: "Success",
      description: `Gift "${updatedGift.name}" updated successfully`,
    })
  }

  // Loading state - Trạng thái loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">My Gifts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state - Trạng thái lỗi
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Gifts</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchGifts} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state - Trạng thái rỗng
  if (gifts.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Gifts Yet</h3>
        <p className="text-gray-500">You haven't created any gifts yet. Upload your first gift to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Tiêu đề */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">My Gifts</h2>
          <Badge variant="secondary" className="ml-2">
            {gifts.length} gift{gifts.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button onClick={fetchGifts} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Gifts Grid - Lưới hiển thị gifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gifts.map((gift) => (
          <Card key={gift.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">{gift.name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(gift.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge variant={gift.quantity > 0 ? "default" : "destructive"} className="ml-2">
                  {gift.quantity > 0 ? "Available" : "Out of Stock"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Gift Image - Hình ảnh gift */}
              {gift.imageUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={gift.imageUrl || "/placeholder.svg"}
                    alt={gift.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/wrapped-gift.png"
                    }}
                  />
                </div>
              )}

              {/* Gift Description - Mô tả gift */}
              {gift.description && <p className="text-sm text-gray-600 line-clamp-2">{gift.description}</p>}

              {/* Gift Stats - Thống kê gift */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-blue-600 font-medium">
                  <Coins className="w-4 h-4" />
                  {gift.pointCost} points
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Package className="w-4 h-4" />
                  {gift.quantity} left
                </div>
              </div>

              {/* Action Buttons - Nút hành động */}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setEditingGift(gift)} variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                      disabled={deletingId === gift.id}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {deletingId === gift.id ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Gift</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{gift.name}"? This action cannot be undone.
                        {gift.quantity === 0 && (
                          <span className="block mt-2 text-amber-600 font-medium">
                            ⚠️ This gift is out of stock and may have been redeemed by players.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteGift(gift.id, gift.name)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Gift
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Gift Dialog - Dialog chỉnh sửa gift */}
      {editingGift && (
        <EditGiftDialog
          gift={editingGift}
          open={!!editingGift}
          onClose={() => setEditingGift(null)}
          onSuccess={handleGiftUpdated}
        />
      )}
    </div>
  )
}
