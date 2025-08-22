"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Download,
  ShoppingCart,
  ArrowLeft,
  FileImage,
  Music,
  Star,
  Palette,
  Store,
  Filter,
  Loader2,
} from "lucide-react"
import { getPublicAssets, getFreeAssets, getPaidAssets, purchaseAsset } from "@/lib/api"
import type { Asset } from "@/lib/types"

interface Designer {
  id: number
  name: string
  email: string
  avatar: string
  assetCount: number
  rating: number
}

export function AssetShop() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [designers, setDesigners] = useState<Designer[]>([])
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null)
  const [designerAssets, setDesignerAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all")
  const [purchasingAssetId, setPurchasingAssetId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAssets()
  }, [filter])

  const fetchAssets = async () => {
    try {
      setIsLoading(true)
      let assetsData: Asset[] = []

      switch (filter) {
        case "free":
          assetsData = await getFreeAssets()
          break
        case "paid":
          assetsData = await getPaidAssets()
          break
        default:
          assetsData = await getPublicAssets()
      }

      setAssets(assetsData)

      const designerMap = new Map<number, Designer>()

      assetsData.forEach((asset) => {
        if (!designerMap.has(asset.designerId)) {
          designerMap.set(asset.designerId, {
            id: asset.designerId,
            name: asset.designerName || `Designer ${asset.designerId}`,
            email: `designer${asset.designerId}@example.com`,
            avatar: asset.designerAvatarUrl || "",
            assetCount: 1,
            rating: 0,
          })
        } else {
          const designer = designerMap.get(asset.designerId)!
          designer.assetCount++
        }
      })

      const designersArray = Array.from(designerMap.values())
      setDesigners(designersArray)
      console.log("[v0] Processed designers with avatars:", designersArray.length)
    } catch (error) {
      console.error("Failed to fetch assets:", error)
      toast({
        title: "Error",
        description: "Failed to load assets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDesignerClick = (designer: Designer) => {
    setSelectedDesigner(designer)
    const filteredAssets = assets.filter((asset) => asset.designerId === designer.id)
    setDesignerAssets(filteredAssets)
  }

  const handleDownloadFree = (asset: Asset) => {
    toast({
      title: "Download Started",
      description: `Downloading ${asset.name}...`,
    })

    if (asset.fileUrl) {
      window.open(asset.fileUrl, "_blank")
    }
  }

  const handlePurchaseAsset = async (asset: Asset) => {
    try {
      setPurchasingAssetId(asset.id)
      const response = await purchaseAsset(asset.id)
      toast({
        title: "Purchase Request Sent",
        description:
          "Your purchase request has been submitted and is pending admin approval. You'll be notified when approved.",
      })
    } catch (error) {
      console.error("Purchase failed:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.log("[v0] Processing error message:", errorMessage) // Added debug logging

      if (
        errorMessage.includes("mua asset") ||
        errorMessage.includes("already purchased") ||
        errorMessage.includes("đã mua") ||
        errorMessage.includes("Bạn đã mua") ||
        errorMessage.includes("B?n ?? mua") || // Handle character encoding issues
        errorMessage.toLowerCase().includes("purchased") ||
        errorMessage.includes("asset này rồi") ||
        errorMessage.includes("asset này r?i") // Handle character encoding issues
      ) {
        console.log("[v0] Detected duplicate purchase error") // Added debug logging
        toast({
          title: "Bạn đã mua asset này rồi",
          description: "Bạn đã mua asset này rồi. Kiểm tra trong mục 'Purchased Assets' để tải xuống.",
          variant: "destructive",
        })
      } else if (errorMessage.includes("Số dư không đủ") || errorMessage.includes("insufficient")) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance to purchase this asset. Please add funds to your account.",
          variant: "destructive",
        })
      } else if (errorMessage.includes("chính mình") || errorMessage.includes("own asset")) {
        toast({
          title: "Cannot Purchase Own Asset",
          description: "You cannot purchase your own asset.",
          variant: "destructive",
        })
      } else {
        console.log("[v0] Showing generic error for:", errorMessage) // Added debug logging
        toast({
          title: "Purchase Failed",
          description: errorMessage || "Unable to send purchase request. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setPurchasingAssetId(null)
    }
  }

  const renderAssetIcon = (asset: Asset) => {
    if (asset.fileType === "MP3") {
      return <Music className="w-8 h-8 text-purple-500" />
    }
    return <FileImage className="w-8 h-8 text-blue-500" />
  }

  const renderAssetPreview = (asset: Asset) => {
    if (asset.previewUrl) {
      return (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={asset.previewUrl || "/placeholder.svg"}
            alt={`Preview of ${asset.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log("[v0] Failed to load preview image:", asset.previewUrl)
              const target = e.currentTarget as HTMLImageElement
              target.style.display = "none"
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) {
                fallback.classList.remove("hidden")
              }
            }}
            onLoad={() => {
              console.log("[v0] Successfully loaded preview image:", asset.previewUrl)
            }}
          />
          <div className="hidden w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            {renderAssetIcon(asset)}
            <span className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
              Preview unavailable
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border border-gray-200 relative">
        {renderAssetIcon(asset)}
        <span className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">No preview</span>
      </div>
    )
  }

  const filteredDesigners = designers.filter(
    (designer) =>
      designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      designer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredAssets = designerAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (selectedDesigner) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setSelectedDesigner(null)}
            className="mb-4 border-green-200 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Designers
          </Button>

          <Card className="shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-green-100">
                  <AvatarImage src={selectedDesigner.avatar || ""} alt={selectedDesigner.name} />
                  <AvatarFallback className="bg-green-50 text-green-600 text-xl">
                    {selectedDesigner.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDesigner.name}</h2>
                  <p className="text-gray-600 mb-2">{selectedDesigner.email}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Palette className="w-4 h-4" />
                      {selectedDesigner.assetCount} assets
                    </span>
                    {selectedDesigner.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{selectedDesigner.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-green-600" />
              Designer Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Assets Found</h3>
                <p className="text-gray-600">This designer hasn't uploaded any assets matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-200"
                  >
                    <CardContent className="p-4">
                      {renderAssetPreview(asset)}

                      <div className="mt-4 space-y-3">
                        <h3 className="font-bold text-lg text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{asset.description}</p>

                        <div className="flex flex-wrap gap-1">
                          {asset.tags
                            .split(",")
                            .slice(0, 3)
                            .map((tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-green-50 text-green-700 border border-green-200"
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-lg font-bold">
                            {asset.price && asset.price > 0 ? (
                              <span className="text-green-600">{(asset.price * 1000).toLocaleString("vi-VN")} VND</span>
                            ) : (
                              <span className="text-green-600">Free</span>
                            )}
                          </div>

                          {asset.price && asset.price > 0 ? (
                            <Button
                              onClick={() => handlePurchaseAsset(asset)}
                              disabled={purchasingAssetId === asset.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {purchasingAssetId === asset.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Purchasing...
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Purchase
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleDownloadFree(asset)}
                              variant="outline"
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Marketplace</h1>
        <p className="text-gray-600">Browse and purchase high-quality assets from talented designers</p>
      </div>

      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-50 rounded-lg">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              Designer Directory
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex items-center space-x-1">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  size="sm"
                  className={
                    filter === "all"
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-green-200 text-green-700 hover:bg-green-50"
                  }
                >
                  All Assets
                </Button>
                <Button
                  variant={filter === "free" ? "default" : "outline"}
                  onClick={() => setFilter("free")}
                  size="sm"
                  className={
                    filter === "free"
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-green-200 text-green-700 hover:bg-green-50"
                  }
                >
                  Free Only
                </Button>
                <Button
                  variant={filter === "paid" ? "default" : "outline"}
                  onClick={() => setFilter("paid")}
                  size="sm"
                  className={
                    filter === "paid"
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-green-200 text-green-700 hover:bg-green-50"
                  }
                >
                  Premium
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search designers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDesigners.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Avatar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Designers Found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filter settings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigners.map((designer) => (
                <Card
                  key={designer.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-green-200"
                  onClick={() => handleDesignerClick(designer)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16 border-2 border-green-100">
                        <AvatarImage src={designer.avatar || ""} alt={designer.name} />
                        <AvatarFallback className="bg-green-50 text-green-600 text-xl">
                          {designer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">{designer.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{designer.email}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Palette className="w-4 h-4" />
                            {designer.assetCount} assets
                          </span>
                          {designer.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{designer.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
