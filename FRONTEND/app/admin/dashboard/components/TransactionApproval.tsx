"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Clock, CheckCircle, XCircle, Eye, CreditCard, Package, ArrowRightLeft } from "lucide-react"
import type { TransactionResponse } from "@/lib/types"
import { getPendingTransactions, approveTransaction, rejectTransaction } from "@/lib/api"

export function TransactionApproval() {
  const [pendingTransactions, setPendingTransactions] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [transactionToReject, setTransactionToReject] = useState<TransactionResponse | null>(null)

  useEffect(() => {
    fetchPendingTransactions()
  }, [])

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true)
      const response = await getPendingTransactions()
      setPendingTransactions(response.content || [])
    } catch (error) {
      console.error("Failed to fetch pending transactions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch pending transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (transactionId: number) => {
    try {
      setProcessingId(transactionId)
      await approveTransaction(transactionId)
      toast({
        title: "Success",
        description: "Transaction approved successfully!",
      })
      await fetchPendingTransactions()
    } catch (error) {
      console.error("Failed to approve transaction:", error)
      toast({
        title: "Error",
        description: "Failed to approve transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (reason: string) => {
    if (!transactionToReject) return

    try {
      setProcessingId(transactionToReject.id)
      await rejectTransaction(transactionToReject.id, reason)
      toast({
        title: "Success",
        description: "Transaction rejected successfully!",
      })
      await fetchPendingTransactions()
    } catch (error) {
      console.error("Failed to reject transaction:", error)
      toast({
        title: "Error",
        description: "Failed to reject transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
      setRejectDialogOpen(false)
      setTransactionToReject(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const TransactionCard = ({ transaction }: { transaction: TransactionResponse }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{transaction.assetName}</h4>
                <p className="text-sm text-gray-600">Transaction #{transaction.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Buyer</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{transaction.buyerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Seller</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{transaction.sellerEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <span className="text-xl font-bold text-emerald-600">{formatCurrency(transaction.amount)}</span>
              </div>
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">{transaction.status}</Badge>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Created: {new Date(transaction.createdAt).toLocaleDateString("vi-VN")} at{" "}
              {new Date(transaction.createdAt).toLocaleTimeString("vi-VN")}
            </p>
          </div>

          <div className="flex flex-col gap-3 ml-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTransaction(transaction)}
              className="w-full min-w-[120px] border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(transaction.id)}
                disabled={processingId === transaction.id}
                className="bg-emerald-600 hover:bg-emerald-700 flex-1 shadow-sm"
              >
                {processingId === transaction.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setTransactionToReject(transaction)
                  setRejectDialogOpen(true)
                }}
                disabled={processingId === transaction.id}
                className="flex-1 bg-red-600 hover:bg-red-700 shadow-sm"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <ArrowRightLeft className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Approval</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 font-medium">Loading transactions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <ArrowRightLeft className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Approval</h2>
          <p className="text-sm text-gray-600 mt-1">Review and approve asset purchase transactions</p>
        </div>
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium ml-auto">
          {pendingTransactions.length} pending
        </Badge>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            Pending Asset Purchase Transactions
          </CardTitle>
          <CardDescription className="leading-relaxed">
            Review and approve asset purchase transactions from developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Pending Transactions</h3>
              <p className="text-gray-600 leading-relaxed">All asset purchase transactions have been processed.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Transaction Details</DialogTitle>
              <DialogDescription className="leading-relaxed">
                Complete information about this asset purchase transaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Transaction ID</Label>
                    <p className="text-lg font-semibold text-gray-700 mt-1">#{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Asset</Label>
                    <p className="font-semibold text-gray-700 mt-1">{selectedTransaction.assetName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Amount</Label>
                    <p className="text-xl font-bold text-emerald-600 mt-1">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Status</Label>
                    <div className="mt-1">
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Buyer</Label>
                    <p className="font-semibold text-gray-700 mt-1">{selectedTransaction.buyerEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Seller</Label>
                    <p className="font-semibold text-gray-700 mt-1">{selectedTransaction.sellerEmail}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Created At</Label>
                    <p className="text-gray-700 mt-1">
                      {new Date(selectedTransaction.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Transaction Type</Label>
                    <p className="font-medium text-gray-700 mt-1">{selectedTransaction.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Transaction Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Reject Transaction</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Please provide a reason for rejecting this asset purchase transaction
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const reason = formData.get("reason") as string
              if (reason.trim()) {
                handleReject(reason)
              }
            }}
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="reason" className="font-semibold text-gray-900">
                  Rejection Reason
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Enter reason for rejecting this transaction..."
                  required
                  className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                  className="border-gray-200 hover:bg-gray-50 bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" className="bg-red-600 hover:bg-red-700 shadow-sm">
                  Reject Transaction
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
