"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import type { Asset } from "@/lib/types"
import { deleteAsset } from "@/lib/api"

interface DeleteAssetDialogProps {
  asset: Asset
  open: boolean
  onClose: () => void
  onAssetDeleted: (deletedAssetId: number) => void
}

export function DeleteAssetDialog({ asset, open, onClose, onAssetDeleted }: DeleteAssetDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      await deleteAsset(asset.id)

      toast({
        title: "Asset Deleted Successfully",
        description: `"${asset.name}" has been permanently removed from your assets.`,
      })

      onAssetDeleted(asset.id)
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete asset. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-l-4 border-l-red-500 shadow-xl bg-white">
        <DialogHeader className="pb-4 border-b border-red-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            Delete Asset
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{asset.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {asset.type === "PAID" ? `Premium Asset • $${asset.price}` : "Free Asset"} • {asset.fileType}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-gray-700 font-medium">Are you sure you want to delete this asset?</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• This action cannot be undone</p>
              <p>• The asset file and preview will be permanently removed</p>
              <p>• This will not affect any existing purchases of this asset</p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-red-100 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Asset
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
