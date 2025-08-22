"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Wallet,
  ArrowDownToLine,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  History,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { getUserBalance, createWithdrawRequest, getMyWithdrawRequests } from "@/lib/api"
import type { WithdrawRequest as WithdrawRequestType, WithdrawRequestCreate } from "@/lib/types"

export function WithdrawRequest() {
  const [balance, setBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequestType[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    amount: "",
    userNote: "",
  })

  useEffect(() => {
    fetchBalance()
    fetchWithdrawRequests()
  }, [])

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

  const fetchWithdrawRequests = async () => {
    try {
      const response = await getMyWithdrawRequests()
      setWithdrawRequests(response.content || [])
    } catch (error) {
      console.error("Failed to fetch withdraw requests:", error)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (amount > balance) {
      toast.error("Insufficient balance for withdrawal")
      return
    }

    setIsSubmitting(true)
    try {
      const requestData: WithdrawRequestCreate = {
        amount: amount,
        userNote: formData.userNote || undefined,
      }

      await createWithdrawRequest(requestData)
      toast.success("Withdraw request submitted successfully!")
      setFormData({ amount: "", userNote: "" })
      setShowForm(false)
      fetchWithdrawRequests()
    } catch (error) {
      console.error("Failed to submit withdraw request:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit withdraw request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />
      case "REJECTED":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100"
      case "APPROVED":
        return "text-green-600 bg-green-100"
      case "REJECTED":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">Available Balance</h3>
          </div>
          <div className="text-center">
            {isLoadingBalance ? (
              <div className="h-16 bg-white/20 rounded-lg animate-pulse mb-2"></div>
            ) : (
              <div className="text-4xl font-bold mb-2 tracking-tight">
                {(balance * 1000).toLocaleString("vi-VN")} VND
              </div>
            )}
            <p className="text-emerald-100 text-lg">Ready for withdrawal</p>
          </div>
        </div>
        <div className="p-4 bg-white/50">
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Funds available for immediate withdrawal</span>
          </div>
        </div>
      </Card>

      {/* Withdraw Request Form */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-blue-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowDownToLine className="h-6 w-6" />
            </div>
            Withdraw Request
          </CardTitle>
          <p className="text-cyan-100 mt-2">Request a withdrawal from your account balance</p>
        </CardHeader>
        <CardContent className="p-8">
          {!showForm ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Withdraw Request</h3>
              <p className="text-gray-600 mb-6">Submit a request to withdraw funds from your account</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg"
                disabled={balance <= 0}
              >
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                New Withdraw Request
              </Button>
              {balance <= 0 && <p className="text-sm text-gray-500 mt-2">Insufficient balance for withdrawal</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="withdraw-form-section">
                <h4 className="withdraw-section-title">
                  <DollarSign className="w-5 h-5" />
                  Withdrawal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="withdraw-label">
                      Amount (VND) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balance}
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter withdrawal amount"
                      className="withdraw-input"
                      required
                    />
                    <p className="text-xs text-gray-500">Available: {(balance * 1000).toLocaleString("vi-VN")} VND</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userNote" className="withdraw-label">
                      Note (Optional)
                    </Label>
                    <Textarea
                      id="userNote"
                      value={formData.userNote}
                      onChange={(e) => setFormData((prev) => ({ ...prev, userNote: e.target.value }))}
                      placeholder="Add a note for your withdrawal request"
                      className="withdraw-input min-h-[80px]"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-amber-800">Important Notice</h5>
                    <p className="text-sm text-amber-700 mt-1">
                      Withdrawal requests are processed manually by our admin team. Please ensure your payment
                      information is up to date before submitting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ amount: "", userNote: "" })
                  }}
                  className="flex-1 border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Withdraw History */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <History className="w-5 h-5 text-cyan-600" />
            Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingRequests ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : withdrawRequests.length > 0 ? (
            <div className="space-y-4">
              {withdrawRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {(request.amount * 1000).toLocaleString("vi-VN")} VND
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(request.createdAt)}</p>
                      {request.userNote && <p className="text-xs text-gray-500 mt-1">Note: {request.userNote}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </span>
                    {request.adminNote && (
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">Admin: {request.adminNote}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No withdrawal requests yet</p>
              <p className="text-sm text-gray-500 mt-1">Your withdrawal history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
