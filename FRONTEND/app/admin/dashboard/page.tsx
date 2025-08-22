"use client"

import { useState } from "react"
import {
  Users,
  Gamepad2Icon as GameController2,
  BarChart3,
  Settings,
  Home,
  FileImage,
  CreditCard,
  History,
  Shield,
  ArrowUpFromLine,
} from "lucide-react"
import { DashboardOverview } from "./components/DashboardOverview"
import { UserManagement } from "./components/UserManagement"
import { GameApproval } from "./components/GameApproval"
import { AssetManagement } from "./components/AssetManagement"
import { Analytics } from "./components/Analytics"
import { SystemSettings } from "./components/SystemSettings"
import { PaymentManagement } from "./components/PaymentManagement"
import { TransactionApproval } from "./components/TransactionApproval"
import { TransactionHistory } from "./components/TransactionHistory"
import { WithdrawManagement } from "./components/WithdrawManagement"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "User Management", icon: Users },
    { id: "games", label: "Game Approval", icon: GameController2 },
    { id: "assets", label: "Asset Management", icon: FileImage },
    { id: "payments", label: "Payment Management", icon: CreditCard },
    { id: "withdraws", label: "Withdraw Management", icon: ArrowUpFromLine },
    { id: "transactions", label: "Transaction Approval", icon: CreditCard },
    { id: "history", label: "Transaction History", icon: History },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onNavigate={setActiveTab} />
      case "users":
        return <UserManagement />
      case "games":
        return <GameApproval />
      case "assets":
        return <AssetManagement />
      case "payments":
        return <PaymentManagement />
      case "withdraws":
        return <WithdrawManagement />
      case "transactions":
        return <TransactionApproval />
      case "history":
        return <TransactionHistory />
      case "analytics":
        return <Analytics />
      case "settings":
        return <SystemSettings />
      default:
        return <DashboardOverview onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">System Management</p>
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
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-colors ${
                    activeTab === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {activeTab === item.id && <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              {(() => {
                const currentItem = menuItems.find((item) => item.id === activeTab)
                const Icon = currentItem?.icon || Home
                return <Icon className="w-6 h-6 text-blue-600" />
              })()}
              <h2 className="text-3xl font-bold text-gray-900">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {activeTab === "dashboard" && "Overview of your admin panel and system metrics"}
              {activeTab === "users" && "Manage user accounts, approvals, and permissions"}
              {activeTab === "games" && "Review and approve game submissions from developers"}
              {activeTab === "assets" && "Review and approve designer asset submissions"}
              {activeTab === "payments" && "Manage bank account information and deposit requests"}
              {activeTab === "withdraws" && "Review and approve designer withdrawal requests"}
              {activeTab === "transactions" && "Review and approve asset purchase transactions"}
              {activeTab === "history" && "View complete transaction history with detailed payment breakdowns"}
              {activeTab === "analytics" && "View comprehensive platform statistics and performance reports"}
              {activeTab === "settings" && "Configure system settings and platform preferences"}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
