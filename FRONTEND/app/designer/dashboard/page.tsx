"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Palette,
  ImageIcon,
  Layers,
  Settings,
  Home,
  TrendingUp,
  Brush,
  Eye,
  Upload,
  Sparkles,
  Wallet,
  CreditCard,
  ArrowDownToLine,
} from "lucide-react"
import { AssetUpload } from "./components/AssetUpload"
import { MyAssets } from "./components/MyAssets"
import { PaymentInfo } from "./components/PaymentInfo"
import { WithdrawRequest } from "./components/WithdrawRequest"
import { getMyAssets, getUserBalance } from "@/lib/api"
import type { Asset } from "@/lib/types"
import { ProfileSection } from "./components/ProfileSection"

export default function DesignerDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "assets", label: "My Assets", icon: ImageIcon },
    { id: "upload", label: "Upload Asset", icon: Upload },
    { id: "payment", label: "Payment Info", icon: CreditCard },
    { id: "withdraw", label: "Withdraw", icon: ArrowDownToLine },
    { id: "tools", label: "Design Tools", icon: Brush },
    { id: "profile", label: "Profile", icon: Settings },
  ]

  useEffect(() => {
    fetchAssets()
    fetchBalance()
  }, [])

  const fetchAssets = async () => {
    try {
      const data = await getMyAssets()
      setAssets(data)
    } catch (error) {
      console.error("Failed to fetch assets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const balanceData = await getUserBalance()
      setBalance(balanceData.balance || 0)
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      setBalance(0)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <Wallet className="h-4 w-4 text-pink-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoadingBalance ? (
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      `${(balance * 1000).toLocaleString("vi-VN")} VND`
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {!isLoadingBalance && balance === 0 ? "Start your backend server" : "Available for purchases"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Total Assets</CardTitle>
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Layers className="h-5 w-5 text-pink-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{assets.length}</div>
                  <p className="text-sm text-gray-600">Your uploaded assets</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Approved Assets</CardTitle>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {assets.filter((a) => a.status === "APPROVED").length}
                  </div>
                  <p className="text-sm text-gray-600">Live on marketplace</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Pending Review</CardTitle>
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-cyan-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {assets.filter((a) => a.status === "PENDING").length}
                  </div>
                  <p className="text-sm text-gray-600">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Paid Assets</CardTitle>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {assets.filter((a) => a.type === "PAID").length}
                  </div>
                  <p className="text-sm text-gray-600">Premium content</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-pink-600" />
                    <CardTitle className="text-lg font-semibold text-gray-900">Recent Assets</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {assets.length > 0 ? (
                      assets.slice(0, 3).map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {asset.previewImageUrl ? (
                              <img
                                src={asset.previewImageUrl || "/placeholder.svg"}
                                alt={asset.name}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  const fallback = target.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = "flex"
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center ${asset.previewImageUrl ? "hidden" : ""}`}
                              style={{ display: asset.previewImageUrl ? "none" : "flex" }}
                            >
                              {asset.fileType === "MP3" ? (
                                <Palette className="w-7 h-7 text-pink-600" />
                              ) : (
                                <ImageIcon className="w-7 h-7 text-pink-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{asset.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  asset.status === "APPROVED"
                                    ? "bg-green-100 text-green-800"
                                    : asset.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {asset.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-semibold ${asset.type === "PAID" ? "text-emerald-600" : "text-gray-600"}`}
                            >
                              {asset.type}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{asset.fileType}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-pink-600" />
                        </div>
                        <p className="text-gray-600 font-medium">No assets uploaded yet</p>
                        <p className="text-sm text-gray-500 mt-1">Start by uploading your first asset</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-pink-600" />
                    <CardTitle className="text-lg font-semibold text-gray-900">Asset Types</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <ImageIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">EPS Files</p>
                      <p className="text-2xl font-bold text-purple-600 mb-1">
                        {assets.filter((a) => a.fileType === "EPS").length}
                      </p>
                      <p className="text-sm text-gray-600">Vector graphics</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Palette className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">MP3 Files</p>
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        {assets.filter((a) => a.fileType === "MP3").length}
                      </p>
                      <p className="text-sm text-gray-600">Audio assets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "assets":
        return <MyAssets />
      case "upload":
        return <AssetUpload />
      case "payment":
        return <PaymentInfo />
      case "withdraw":
        return <WithdrawRequest />
      case "profile":
        return <ProfileSection />
      default:
        return (
          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {menuItems.find((item) => item.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600 mb-1">This feature is coming soon</p>
                <p className="text-sm text-gray-500">We're working hard to bring you new tools</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Design Studio</h1>
              <p className="text-sm text-gray-500">Creative Workspace</p>
            </div>
          </div>
        </div>

        <nav className="mt-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 rounded-lg mb-1 group ${
                  activeTab === item.id
                    ? "bg-pink-50 text-pink-700 shadow-sm border border-pink-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-colors ${
                    activeTab === item.id ? "text-pink-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {activeTab === item.id && <div className="ml-auto w-2 h-2 bg-pink-600 rounded-full"></div>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              {(() => {
                const currentItem = menuItems.find((item) => item.id === activeTab)
                const Icon = currentItem?.icon || Home
                return <Icon className="w-6 h-6 text-pink-600" />
              })()}
              <h2 className="text-3xl font-bold text-gray-900">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {activeTab === "dashboard" && "Overview of your creative assets and design portfolio"}
              {activeTab === "assets" && "Manage and organize all your uploaded design assets"}
              {activeTab === "upload" && "Upload new assets to share with the community"}
              {activeTab === "payment" && "View and manage your payment information"}
              {activeTab === "withdraw" && "Request withdrawals from your account balance"}
              {activeTab === "tools" && "Access powerful design tools and resources"}
              {activeTab === "profile" && "Manage your designer profile and preferences"}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
