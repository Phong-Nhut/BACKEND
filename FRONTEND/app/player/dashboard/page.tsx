"use client"

import { useState } from "react"
import { Home, Gift } from "lucide-react"
import DeveloperList from "./components/DeveloperList"
import DeveloperGames from "./components/DeveloperGames"
import GiftTransactionHistory from "./components/GiftTransactionHistory"
import type { User } from "@/lib/types"

export default function PlayerDashboardPage() {
  const [selectedDeveloper, setSelectedDeveloper] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<"dashboard" | "gifts">("dashboard")

  const handleSelectDeveloper = (developer: User) => {
    setSelectedDeveloper(developer)
  }

  const handleBackToDevelopers = () => {
    setSelectedDeveloper(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Player Hub</h1>
          <p className="text-sm text-gray-500">Gaming Dashboard</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => {
              setActiveTab("dashboard")
              setSelectedDeveloper(null)
            }}
            className={`w-full flex items-center px-6 py-3 text-left ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("gifts")
              setSelectedDeveloper(null)
            }}
            className={`w-full flex items-center px-6 py-3 text-left ${
              activeTab === "gifts"
                ? "bg-purple-50 text-purple-600 border-r-2 border-purple-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Gift className="w-5 h-5 mr-3" />
            <span className="font-medium">Gift History</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === "gifts" ? (
            <GiftTransactionHistory />
          ) : selectedDeveloper ? (
            <DeveloperGames developer={selectedDeveloper} onBack={handleBackToDevelopers} />
          ) : (
            <DeveloperList onSelectDeveloper={handleSelectDeveloper} />
          )}
        </div>
      </div>
    </div>
  )
}
