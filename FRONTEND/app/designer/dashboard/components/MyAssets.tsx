"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FileImage, Music, DollarSign, Eye, Layers, TrendingUp, Filter, Edit, Trash2 } from "lucide-react"
import { getMyAssets } from "@/lib/api"
import type { Asset } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { EditAssetDialog } from "./EditAssetDialog"
import { DeleteAssetDialog } from "./DeleteAssetDialog"

export function MyAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    filterAssets()
  }, [assets, searchTerm, statusFilter])

  const fetchAssets = async () => {
    try {
      const data = await getMyAssets()
      setAssets(data)
    } catch (error: any) {
      toast({
        title: "Failed to Load Assets",
        description: error.message || "Could not fetch your assets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAssets = () => {
    let filtered = assets

    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.tags.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((asset) => asset.status === statusFilter)
    }

    setFilteredAssets(filtered)
  }

  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAssets((prev) => prev.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset)))
    setEditingAsset(null)
  }

  const handleAssetDeleted = (deletedAssetId: number) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== deletedAssetId))
    setDeletingAsset(null)
  }

  const canEditAsset = (asset: Asset) => {
    return asset.status === "PENDING" || asset.status === "REJECTED"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "PAID"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-blue-100 text-blue-800 border-blue-200"
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{assets.length}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {assets.filter((a) => a.status === "APPROVED").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {assets.filter((a) => a.status === "PENDING").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Assets</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {assets.filter((a) => a.type === "PAID").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-pink-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Search & Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status as any)}
                  className={
                    statusFilter === status
                      ? "bg-pink-600 hover:bg-pink-700 text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileImage className="w-10 h-10 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assets Found</h3>
            <p className="text-gray-600 mb-4">
              {assets.length === 0
                ? "Upload your first asset to get started!"
                : "Try adjusting your search or filter criteria."}
            </p>
            {assets.length === 0 && (
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">Upload Your First Asset</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="shadow-sm hover:shadow-lg transition-all duration-200 border-0 bg-white">
              <CardContent className="p-6">
                <div className="relative h-36 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl mb-4 overflow-hidden border border-gray-100">
                  {asset.previewUrl ? (
                    <>
                      <img
                        src={asset.previewUrl || "/placeholder.svg"}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const fallbackDiv = target.parentElement?.querySelector(".fallback-icon") as HTMLElement
                          if (fallbackDiv) {
                            fallbackDiv.style.display = "flex"
                          }
                        }}
                      />
                      <div className="fallback-icon hidden flex items-center justify-center w-full h-full absolute inset-0">
                        {asset.fileType === "MP3" ? (
                          <div className="text-center">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                              <Music className="w-7 h-7 text-purple-600" />
                            </div>
                            <span className="text-sm text-purple-700 font-medium">Audio File</span>
                          </div>
                        ) : asset.fileType === "EPS" ? (
                          <div className="text-center">
                            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                              <FileImage className="w-7 h-7 text-pink-600" />
                            </div>
                            <span className="text-sm text-pink-700 font-medium">Vector Graphics</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                              <FileImage className="w-7 h-7 text-gray-600" />
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{asset.fileType}</span>
                          </div>
                        )}
                      </div>
                      {asset.fileType === "EPS" && (
                        <div className="absolute bottom-2 left-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-700 border border-blue-200"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      {asset.fileType === "MP3" ? (
                        <div className="text-center">
                          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Music className="w-7 h-7 text-purple-600" />
                          </div>
                          <span className="text-sm text-purple-700 font-medium">Audio File</span>
                        </div>
                      ) : asset.fileType === "EPS" ? (
                        <div className="text-center">
                          <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <FileImage className="w-7 h-7 text-pink-600" />
                          </div>
                          <span className="text-sm text-pink-700 font-medium">Vector Graphics</span>
                          <div className="mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200"
                            >
                              Preview Generating...
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <FileImage className="w-7 h-7 text-gray-600" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{asset.fileType}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm border border-gray-200">
                      {asset.fileType}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate flex-1 text-lg">{asset.name}</h3>
                    <Badge className={`${getStatusColor(asset.status)} border text-xs font-medium`}>
                      {asset.status}
                    </Badge>
                  </div>

                  {asset.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{asset.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge className={`${getTypeColor(asset.type)} border font-medium`}>
                      {asset.type === "PAID" ? (
                        asset.price && asset.price > 0 ? (
                          <span className="text-green-600">{(asset.price * 1000).toLocaleString("vi-VN")} VND</span>
                        ) : (
                          <span className="text-green-600">Free</span>
                        )
                      ) : (
                        "FREE"
                      )}
                    </Badge>
                    <span className="text-xs text-gray-500 font-medium">{asset.fileType}</span>
                  </div>

                  {asset.tags && (
                    <div className="flex flex-wrap gap-1">
                      {asset.tags
                        .split(",")
                        .slice(0, 3)
                        .map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      {asset.tags.split(",").length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{asset.tags.split(",").length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {canEditAsset(asset) && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingAsset(asset)}
                        className="flex-1 border-pink-200 text-pink-700 hover:bg-pink-50"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingAsset(asset)}
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                    Created: {new Date(asset.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingAsset && (
        <EditAssetDialog
          asset={editingAsset}
          open={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          onAssetUpdated={handleAssetUpdated}
        />
      )}

      {deletingAsset && (
        <DeleteAssetDialog
          asset={deletingAsset}
          open={!!deletingAsset}
          onClose={() => setDeletingAsset(null)}
          onAssetDeleted={handleAssetDeleted}
        />
      )}
    </div>
  )
}
