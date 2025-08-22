"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download,
  Search,
  FileImage,
  Music,
  Calendar,
  User,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { getPurchasedAssets } from "@/lib/api"
import type { PurchasedAssetResponse } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export function PurchasedAssets() {
  const [purchasedAssets, setPurchasedAssets] = useState<PurchasedAssetResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    fetchPurchasedAssets()
  }, [currentPage])

  const fetchPurchasedAssets = async () => {
    try {
      setLoading(true)
      const response = await getPurchasedAssets(currentPage, 10)
      setPurchasedAssets(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Failed to fetch purchased assets:", error)
      toast({
        title: "Error",
        description: "Failed to load purchased assets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (asset: PurchasedAssetResponse) => {
    try {
      setDownloadingId(asset.transactionId)
      if (!asset.fileUrl) {
        throw new Error("File URL not available")
      }

      const link = document.createElement("a")
      link.href = asset.fileUrl
      link.download = `${asset.assetName}.${asset.fileType.toLowerCase()}`
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download Started",
        description: `Asset "${asset.assetName}" download has started`,
      })
    } catch (error) {
      console.error("Failed to download asset:", error)
      toast({
        title: "Download Failed",
        description: "Unable to download this asset",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredAssets = purchasedAssets.filter(
    (asset) =>
      asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.designerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchased Assets</h1>
          <p className="text-gray-600">Access and download your purchased assets</p>
        </div>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg w-10 h-10 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchased Assets</h1>
        <p className="text-gray-600">Access and download your purchased assets</p>
      </div>

      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Asset Library</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {totalElements} {totalElements === 1 ? "asset" : "assets"} purchased
                </p>
              </div>
            </div>
            <Button
              onClick={fetchPurchasedAssets}
              variant="outline"
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search purchased assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {purchasedAssets.length === 0 ? "No Purchased Assets" : "No Assets Found"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {purchasedAssets.length === 0
                  ? "Purchase assets from the marketplace to use in your projects!"
                  : "Try adjusting your search terms to find the assets you're looking for."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <Card
                  key={asset.transactionId}
                  className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-200"
                >
                  <CardContent className="p-6">
                    <div className="relative h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg mb-4 overflow-hidden border border-green-100">
                      <div className="w-full h-full flex items-center justify-center">
                        {asset.fileType === "MP3" ? (
                          <div className="text-center">
                            <Music className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                            <span className="text-xs text-purple-600 font-medium">Audio File</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <FileImage className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                            <span className="text-xs text-blue-600 font-medium">Image Asset</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/90 backdrop-blur-sm border border-gray-200"
                        >
                          {asset.fileType}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{asset.assetName}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{asset.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="truncate">{asset.designerEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(asset.purchasedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 border border-green-200 font-medium">
                            Purchased
                          </Badge>
                          <span className="text-sm font-bold text-gray-900">
                            {(asset.price * 1000).toLocaleString("vi-VN")} VND
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDownload(asset)}
                        disabled={downloadingId === asset.transactionId}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        {downloadingId === asset.transactionId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Asset
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
