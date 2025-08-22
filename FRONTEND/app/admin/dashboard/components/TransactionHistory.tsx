"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, User, FileText, CheckCircle, XCircle, TrendingUp, Wallet, History } from "lucide-react"
import { getAllTransactions } from "@/lib/api"
import type { TransactionResponse } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchTransactionHistory()
  }, [currentPage])

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true)
      const response = await getAllTransactions(currentPage, 10)
      setTransactions(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Failed to fetch transaction history:", error)
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const approvedTransactions = filteredTransactions.filter((t) => t.status === "APPROVED")
  const rejectedTransactions = filteredTransactions.filter((t) => t.status === "REJECTED")

  // Calculate correct totals from backend data
  const totalPlatformRevenue = approvedTransactions.reduce((sum, t) => sum + (t.platformFee || t.amount * 0.1), 0)
  const totalTransactionCount = filteredTransactions.length

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <History className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 font-medium">Loading transaction history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <History className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-gray-600 mt-1">Track all processed asset purchase transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Platform Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(totalPlatformRevenue * 1000).toLocaleString("vi-VN")} VND
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Wallet className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Platform Fee (10%)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(totalPlatformRevenue * 1000).toLocaleString("vi-VN")} VND
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            All Transactions ({totalTransactionCount})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            Approved ({approvedTransactions.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            Rejected ({rejectedTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredTransactions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Transactions Found</h3>
                <p className="text-gray-600 leading-relaxed">No transactions match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          {approvedTransactions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Approved Transactions</h3>
                <p className="text-gray-600 leading-relaxed">Approved transactions will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            approvedTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} showPaymentBreakdown />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          {rejectedTransactions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Rejected Transactions</h3>
                <p className="text-gray-600 leading-relaxed">Rejected transactions will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            rejectedTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TransactionCard({
  transaction,
  showPaymentBreakdown = false,
}: {
  transaction: TransactionResponse
  showPaymentBreakdown?: boolean
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200 font-medium"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 font-medium"
    }
  }

  const platformFee = transaction.platformFee || transaction.amount * 0.1
  const designerAmount = transaction.designerAmount || transaction.amount * 0.9

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg text-gray-900">{transaction.assetName}</h3>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
                  {transaction.type}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Developer:</span>
                  <span>{transaction.buyerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-500" />
                  <span className="font-medium">Designer:</span>
                  <span>{transaction.sellerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{new Date(transaction.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>

              {transaction.rejectionReason && (
                <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                  <span className="font-semibold">Rejection reason:</span> {transaction.rejectionReason}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  {(transaction.amount * 1000).toLocaleString("vi-VN")} VND
                </p>
                <Badge variant="outline" className={getStatusColor(transaction.status)}>
                  {transaction.status === "APPROVED" && "Approved"}
                  {transaction.status === "REJECTED" && "Rejected"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment Breakdown for Approved Transactions */}
          {showPaymentBreakdown && transaction.status === "APPROVED" && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-4 text-lg">Payment Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600 font-medium">Developer Refund:</span>
                  <span className="font-semibold text-blue-600">0 VND</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600 font-medium">Designer Payment:</span>
                  <span className="font-semibold text-violet-600">
                    {(designerAmount * 1000).toLocaleString("vi-VN")} VND (90%)
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600 font-medium">Platform Fee:</span>
                  <span className="font-semibold text-amber-600">
                    {(platformFee * 1000).toLocaleString("vi-VN")} VND (10%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
