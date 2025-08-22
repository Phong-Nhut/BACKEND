"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Code,
  Upload,
  BarChart3,
  Settings,
  Home,
  TrendingUp,
  PaintRoller as GameController2,
  Star,
  CreditCard,
  Wallet,
  Download,
  Terminal,
  Gift,
} from "lucide-react"
import { GameUpload } from "./components/GameUpload"
import { MyGames } from "./components/MyGames"
import { DepositMoney } from "./components/DepositMoney"
import { AssetShop } from "./components/AssetShop"
import { AssetPurchaseHistory } from "./components/AssetPurchaseHistory"
import { PurchasedAssets } from "./components/PurchasedAssets"
import { ProfileSection } from "./components/ProfileSection"
import GiftUpload from "./components/GiftUpload"
import MyGifts from "./components/MyGifts"
import { getMyGames, getUserBalance } from "@/lib/api"
import type { Game } from "@/lib/types"

export default function DeveloperDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getMyGames()
        setGames(gamesData)
      } catch (error) {
        console.error("Failed to fetch games:", error)
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

    fetchGames()
    fetchBalance()
  }, [])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "games", label: "My Games", icon: GameController2 },
    { id: "upload", label: "Upload Game", icon: Upload },
    { id: "gift-upload", label: "Upload Gift", icon: Gift },
    { id: "my-gifts", label: "My Gifts", icon: Gift },
    { id: "shop", label: "Asset Shop", icon: Wallet },
    { id: "history", label: "Purchase History", icon: CreditCard },
    { id: "purchased", label: "Purchased Assets", icon: Download },
    { id: "deposit", label: "Deposit Money", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer Dashboard</h1>
              <p className="text-gray-600">Manage your games, assets, and track your development progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Wallet className="h-4 w-4 text-green-600" />
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

              <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Games</CardTitle>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GameController2 className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : games.length}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {isLoading ? (
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      `${games.filter((game) => game.status === "APPROVED").length} approved`
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-400">--</div>
                  <p className="text-sm text-gray-400 mt-1">Backend integration needed</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Star className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-400">--</div>
                  <p className="text-sm text-gray-400 mt-1">Backend integration needed</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-rose-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-400">--</div>
                  <p className="text-sm text-gray-400 mt-1">Backend integration needed</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <GameController2 className="h-5 w-5 text-green-600" />
                    Recent Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="w-16 h-6 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : games.length > 0 ? (
                      games.slice(0, 3).map((game) => (
                        <div
                          key={game.id}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <GameController2 className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{game.name}</p>
                            <p className="text-xs text-gray-500">Status: {game.status}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                game.status === "APPROVED"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : game.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                              }`}
                            >
                              {game.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <GameController2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No games uploaded yet</p>
                        <p className="text-sm text-gray-500 mt-1">Upload your first game to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-green-100">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Analytics Dashboard</p>
                      <p className="text-sm text-gray-500 mt-1">Performance metrics will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "games":
        return <MyGames />
      case "upload":
        return <GameUpload />
      case "gift-upload":
        return <GiftUpload />
      case "my-gifts":
        return <MyGifts />
      case "shop":
        return <AssetShop />
      case "history":
        return <AssetPurchaseHistory />
      case "purchased":
        return <PurchasedAssets />
      case "deposit":
        return <DepositMoney />
      case "profile":
        return <ProfileSection />
      default:
        return (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-green-600" />
                {menuItems.find((item) => item.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-600 font-medium">Coming Soon</p>
                <p className="text-sm text-gray-500 mt-2">This feature will be available soon</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Terminal className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Developer Hub</h1>
              <p className="text-sm text-gray-600">Game Development</p>
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
                className={`w-full flex items-center px-3 py-2.5 text-left transition-all duration-200 rounded-lg mb-1 ${
                  activeTab === item.id
                    ? "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  )
}
