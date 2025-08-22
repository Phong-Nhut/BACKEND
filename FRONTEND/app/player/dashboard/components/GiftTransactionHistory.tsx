"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Gift, Coins } from "lucide-react"
import { getGiftTransactions, getCurrentUser } from "@/lib/api"
import type { GiftTransactionDTO, User } from "@/lib/types"

export default function GiftTransactionHistory() {
  const [transactions, setTransactions] = useState<GiftTransactionDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          setError("Please log in to view transaction history")
          return
        }

        setUser(currentUser)
        const transactionData = await getGiftTransactions(currentUser.id)
        console.log("[v0] Gift transactions data:", transactionData)
        transactionData.forEach((transaction, index) => {
          console.log(`[v0] Transaction ${index}:`, {
            id: transaction.id,
            pointsSpent: transaction.pointsSpent,
            giftId: transaction.giftId,
            createdAt: transaction.createdAt,
          })
        })
        setTransactions(transactionData)
      } catch (err) {
        console.error("Error fetching gift transactions:", err)
        setError(err instanceof Error ? err.message : "Failed to load transaction history")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Gift className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gift Transaction History</h2>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load History</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Gift Transactions</h3>
        <p className="text-gray-500">You haven't redeemed any gifts yet. Start exploring gifts from developers!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">Gift Transaction History</h2>
        <Badge variant="secondary" className="ml-2">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">Gift Redeemed</h3>
                      <Badge variant="outline" className="text-xs">
                        ID: {transaction.giftId}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <div className="flex items-center gap-1">
                        <span>Transaction ID: {transaction.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xl font-bold text-red-600 mb-1">
                    <Coins className="w-6 h-6" />{transaction.pointsSpent || 0}
                  </div>
                  <p className="text-sm font-medium text-gray-600">Points Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transactions.length > 0 && (
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-500">Total transactions: {transactions.length}</p>
        </div>
      )}
    </div>
  )
}
