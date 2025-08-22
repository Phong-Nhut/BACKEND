"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Search, Eye, Check, X, Clock, CheckCircle, XCircle, FileImage, Music, Package } from "lucide-react"
import { getPendingAssets, approveAsset, rejectAsset, getPublicAssets } from "@/lib/api"
import type { Asset } from "@/lib/types"

export function AssetManagement() {
  const [pendingAssets, setPendingAssets] = useState<Asset[]>([])
  const [approvedAssets, setApprovedAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [processingAssetId, setProcessingAssetId] = useState<number | null>(null)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const [pending, approved] = await Promise.all([getPendingAssets(), getPublicAssets()])
      setPendingAssets(pending)
      setApprovedAssets(approved.filter((asset) => asset.status === "APPROVED"))
    } catch (error) {
      console.error("Error fetching assets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch assets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (assetId: number) => {
    try {
      setProcessingAssetId(assetId)
      await approveAsset(assetId)
      toast({
        title: "Success",
        description: "Asset approved successfully",
      })
      fetchAssets()
    } catch (error) {
      console.error("Error approving asset:", error)
      toast({
        title: "Error",
        description: "Failed to approve asset",
        variant: "destructive",
      })
    } finally {
      setProcessingAssetId(null)
    }
  }

  const handleReject = async (assetId: number) => {
    try {
      setProcessingAssetId(assetId)
      await rejectAsset(assetId, rejectReason)
      toast({
        title: "Success",
        description: "Asset rejected successfully",
      })
      setShowRejectDialog(false)
      setRejectReason("")
      setSelectedAsset(null)
      fetchAssets()
    } catch (error) {
      console.error("Error rejecting asset:", error)
      toast({
        title: "Error",
        description: "Failed to reject asset",
        variant: "destructive",
      })
    } finally {
      setProcessingAssetId(null)
    }
  }

  const openRejectDialog = (asset: Asset) => {
    setSelectedAsset(asset)
    setShowRejectDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-medium">
            {status}
          </Badge>
        )
    }
  }

  const getAssetTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "MP3":
        return <Music className="w-4 h-4 text-violet-500" />
      case "EPS":
        return <FileImage className="w-4 h-4 text-blue-500" />
      default:
        return <FileImage className="w-4 h-4 text-gray-500" />
    }
  }

  const renderAssetPreview = (asset: Asset) => {
    if (asset.previewImageUrl) {
      return (
        <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
          <img
            src={asset.previewImageUrl || "/placeholder.svg"}
            alt={asset.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              target.nextElementSibling?.classList.remove("hidden")
            }}
          />
          <div className="hidden w-full h-full bg-gray-100 rounded-xl flex items-center justify-center absolute top-0 left-0">
            {getAssetTypeIcon(asset.fileType)}
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm shadow-sm">
              {asset.fileType}
            </Badge>
          </div>
        </div>
      )
    }

    return (
      <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm border">
        {asset.fileType === "MP3" ? (
          <div className="text-center">
            <Music className="w-7 h-7 text-violet-500 mx-auto" />
            <span className="text-xs text-violet-600 font-medium block mt-1">Audio</span>
          </div>
        ) : asset.fileType === "EPS" ? (
          <div className="text-center">
            <FileImage className="w-7 h-7 text-blue-500 mx-auto" />
            <span className="text-xs text-blue-600 font-medium block mt-1">Vector</span>
          </div>
        ) : (
          <div className="text-center">
            <FileImage className="w-7 h-7 text-gray-500 mx-auto" />
            <span className="text-xs text-gray-600 font-medium block mt-1">{asset.fileType}</span>
          </div>
        )}
      </div>
    )
  }

  const filteredPendingAssets = pendingAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredApprovedAssets = approvedAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 font-medium">Loading assets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
            <p className="text-sm text-gray-600 mt-1">Review and manage designer asset submissions</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 w-80 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Clock className="w-4 h-4" />
            Pending Approval ({filteredPendingAssets.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Approved Assets ({filteredApprovedAssets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {filteredPendingAssets.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Pending Assets</h3>
                <p className="text-gray-600 leading-relaxed">All asset submissions have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredPendingAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className="hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-5">
                        {renderAssetPreview(asset)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold text-gray-900 text-lg">{asset.name}</h4>
                            {getStatusBadge(asset.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{asset.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              {getAssetTypeIcon(asset.fileType)}
                              <span className="font-medium">Type:</span> {asset.fileType}
                            </span>
                            <span className="font-medium">
                              Price: {(asset.price ?? 0) > 0 ? `$${asset.price}` : "Free"}
                            </span>
                            <span className="font-medium">Tags: {asset.tags}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-200 hover:bg-gray-50 bg-transparent"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl border-0 shadow-xl bg-white">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-gray-900">Asset Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {asset.previewImageUrl && (
                                <div className="flex justify-center">
                                  <img
                                    src={asset.previewImageUrl || "/placeholder.svg"}
                                    alt={asset.name}
                                    className="max-w-full max-h-64 object-contain rounded-xl border shadow-sm"
                                  />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-lg mb-3">{asset.name}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{asset.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                  <span className="font-semibold text-gray-900">File Type:</span>
                                  <span className="ml-2 text-gray-600">{asset.fileType}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">Price:</span>
                                  <span className="ml-2 text-gray-600">
                                    {(asset.price ?? 0) > 0 ? `$${asset.price}` : "Free"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">Tags:</span>
                                  <span className="ml-2 text-gray-600">{asset.tags}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">Status:</span>
                                  <span className="ml-2">{getStatusBadge(asset.status)}</span>
                                </div>
                              </div>
                              {asset.previewUrl && (
                                <div>
                                  <span className="font-semibold text-gray-900">JPG Preview URL:</span>
                                  <a
                                    href={asset.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 hover:underline ml-2 font-medium break-all"
                                  >
                                    {asset.previewUrl}
                                  </a>
                                </div>
                              )}
                              {asset.fileUrl && (
                                <div>
                                  <span className="font-semibold text-gray-900">File:</span>
                                  <a
                                    href={asset.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 hover:underline ml-2 font-medium"
                                  >
                                    Download File
                                  </a>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          onClick={() => handleApprove(asset.id)}
                          disabled={processingAssetId === asset.id}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                        >
                          {processingAssetId === asset.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => openRejectDialog(asset)}
                          disabled={processingAssetId === asset.id}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 shadow-sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          {filteredApprovedAssets.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Approved Assets</h3>
                <p className="text-gray-600 leading-relaxed">
                  Approved assets will appear here once they're processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredApprovedAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className="hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-5">
                      {renderAssetPreview(asset)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-semibold text-gray-900 text-lg">{asset.name}</h4>
                          {getStatusBadge(asset.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{asset.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {getAssetTypeIcon(asset.fileType)}
                            <span className="font-medium">Type:</span> {asset.fileType}
                          </span>
                          <span className="font-medium">
                            Price: {(asset.price ?? 0) > 0 ? `$${asset.price}` : "Free"}
                          </span>
                          <span className="font-medium">Tags: {asset.tags}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="border-0 shadow-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Reject Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              Please provide a reason for rejecting "{selectedAsset?.name}":
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedAsset && handleReject(selectedAsset.id)}
                disabled={!rejectReason.trim() || processingAssetId === selectedAsset?.id}
                className="bg-red-600 hover:bg-red-700 shadow-sm"
              >
                Reject Asset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
