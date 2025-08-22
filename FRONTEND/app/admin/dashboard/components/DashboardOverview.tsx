"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Gamepad2Icon as GameController2,
  BarChart3,
  Settings,
  TrendingUp,
  Shield,
  Activity,
  Clock,
  Wallet,
} from "lucide-react"
import { getPendingUsers, getAdminAllUsers, getAdminAllGames, getUserBalance } from "@/lib/api"

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeGames: 0,
    systemHealth: 0, // removed placeholder value
  })
  const [balance, setBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allUsers, pendingUsers, allGames] = await Promise.all([
          getAdminAllUsers(),
          getPendingUsers(),
          getAdminAllGames(),
        ])

        const approvedGamesCount = allGames.filter((game) => game.status === "APPROVED").length

        setStats({
          totalUsers: allUsers.length,
          pendingApprovals: pendingUsers.length,
          activeGames: approvedGamesCount,
          systemHealth: 0, // will be populated by backend
        })
      } catch (error) {
        console.error("Failed to load dashboard stats:", error)
      } finally {
        setLoading(false)
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

    loadStats()
    fetchBalance()
  }, [])

  const statCards = [
    {
      title: "Current Balance",
      value: isLoadingBalance ? "Loading..." : `${(balance * 1000).toLocaleString("vi-VN")} VND`,
      change: !isLoadingBalance && balance === 0 ? "Start your backend server" : "Available for operations",
      icon: Wallet,
      borderColor: "border-l-blue-500",
      iconBgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      onClick: () => onNavigate("payments"),
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: "", // removed mock data, will be populated by backend
      icon: Users,
      borderColor: "border-l-blue-500",
      iconBgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      onClick: () => onNavigate("users"),
    },
    {
      title: "Active Games",
      value: stats.activeGames,
      change: "", // removed mock data
      icon: GameController2,
      borderColor: "border-l-emerald-500",
      iconBgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      onClick: () => onNavigate("games"),
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      change: stats.pendingApprovals > 0 ? "Requires attention" : "All caught up",
      icon: Shield,
      borderColor: "border-l-amber-500",
      iconBgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      onClick: () => onNavigate("users"),
    },
    {
      title: "System Health",
      value: stats.systemHealth > 0 ? `${stats.systemHealth}%` : "Loading...",
      change: stats.systemHealth > 0 ? "All systems operational" : "",
      icon: Activity,
      borderColor: "border-l-violet-500",
      iconBgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      onClick: () => onNavigate("settings"),
    },
  ]

  const quickActions = [
    {
      title: "Manage Users",
      description: "Review and approve user accounts",
      icon: Users,
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      onClick: () => onNavigate("users"),
    },
    {
      title: "Review Games",
      description: "Approve new game submissions",
      icon: GameController2,
      bgColor: "bg-emerald-50",
      hoverColor: "hover:bg-emerald-100",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      onClick: () => onNavigate("games"),
    },
    {
      title: "View Analytics",
      description: "Check platform statistics",
      icon: BarChart3,
      bgColor: "bg-violet-50",
      hoverColor: "hover:bg-violet-100",
      iconColor: "text-violet-600",
      borderColor: "border-violet-200",
      onClick: () => onNavigate("analytics"),
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      bgColor: "bg-amber-50",
      hoverColor: "hover:bg-amber-100",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200",
      onClick: () => onNavigate("settings"),
    },
  ]

  const recentActivities: Array<{
    id: number
    type: string
    message: string
    time: string
    icon: any
  }> = [] // Empty array - backend will populate this

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className={`border-l-4 ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 ${stat.iconBgColor} rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.title === "Current Balance" && isLoadingBalance ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                {stat.change && <p className="text-sm text-gray-500 mt-1">{stat.change}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Activity will appear here as it happens</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`p-6 h-auto flex flex-col items-center gap-4 ${action.bgColor} ${action.hoverColor} border ${action.borderColor} rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md`}
                    onClick={action.onClick}
                  >
                    <Icon className={`h-8 w-8 ${action.iconColor}`} />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{action.title}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{action.description}</p>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
