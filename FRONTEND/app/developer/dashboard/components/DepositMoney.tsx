"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createDepositRequest, getMyDepositRequests, getActivePaymentInfo } from "@/lib/api"
import type { DepositRequestCreate, DepositRequest, PaymentInfo } from "@/lib/types"
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  QrCode,
  Building2,
  User,
  Hash,
  Wallet,
  History,
  DollarSign,
  Loader2,
} from "lucide-react"

export function DepositMoney() {
  const [amount, setAmount] = useState("")
  const [transactionNote, setTransactionNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([])
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    console.log("[v0] Fetching deposit data...")
    try {
      const [depositsResponse, paymentInfoData] = await Promise.all([
        getMyDepositRequests(0, 10),
        getActivePaymentInfo(),
      ])
      console.log("[v0] Deposits fetched:", depositsResponse.content)
      console.log("[v0] Payment info fetched:", paymentInfoData)
      setDepositRequests(depositsResponse.content)
      setPaymentInfo(paymentInfoData || null)
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
      let errorMessage = "Failed to load deposit information"
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Cannot connect to server. Please check if the backend is running."
        } else if (error.message.includes("404")) {
          errorMessage = "Payment information not configured yet. Please contact admin."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setPaymentInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    console.log("[v0] Submitting deposit request:", { amount, transactionNote })
    try {
      const depositData: DepositRequestCreate = {
        amount: amount,
        transactionNote: transactionNote.trim() || undefined,
      }

      const result = await createDepositRequest(depositData)
      console.log("[v0] Deposit request created:", result)
      toast({
        title: "Deposit Request Submitted",
        description: "Your deposit request has been submitted for admin approval",
      })

      setAmount("")
      setTransactionNote("")
      fetchData()
    } catch (error: any) {
      console.error("[v0] Failed to submit deposit request:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit deposit request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-200"
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deposit Money</h1>
          <p className="text-gray-600">Add funds to your account for purchasing assets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse shadow-sm border-l-4 border-l-green-500">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>

          <Card className="animate-pulse shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                <div className="h-6 bg-gray-200 rounded w-40"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deposit Money</h1>
        <p className="text-gray-600">Add funds to your account for purchasing premium assets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-50 rounded-lg">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              Request Deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitDeposit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount (VND)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to deposit (e.g., 100 for 100,000 VND)"
                  required
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 bg-green-50 p-2 rounded border border-green-200">
                  💡 Enter simplified amount (e.g., 100 = 100,000 VND)
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="transactionNote" className="text-sm font-semibold text-gray-700">
                  Transaction Note (Optional)
                </Label>
                <Textarea
                  id="transactionNote"
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                  placeholder="Add a note about your transaction (e.g., bank transfer reference)"
                  rows={3}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Submit Deposit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentInfo ? (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Bank Transfer Details
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Bank Name:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{paymentInfo.bankName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.bankName, "Bank name")}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Account Number:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-gray-900">{paymentInfo.accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.accountNumber, "Account number")}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Account Holder:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{paymentInfo.accountHolderName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.accountHolderName, "Account holder name")}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentInfo.qrCodeUrl && (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <QrCode className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">QR Code Payment</span>
                    </div>
                    <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                      <img
                        src={paymentInfo.qrCodeUrl || "/placeholder.svg"}
                        alt="Payment QR Code"
                        className="w-32 h-32 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3">Scan to pay via mobile banking app</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Information Unavailable</h3>
                <p className="text-gray-600">
                  The admin has not yet configured the payment information. Please contact the administrator to set up
                  bank account details for deposits.
                </p>
                <Button onClick={fetchData} variant="outline" className="mt-4 bg-transparent" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    "Refresh Payment Info"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gray-50 rounded-lg">
              <History className="w-6 h-6 text-gray-600" />
            </div>
            Deposit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {depositRequests.length > 0 ? (
            <div className="space-y-3">
              {depositRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg">{getStatusIcon(request.status)}</div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">
                        {(Number(request.amount) * 1000).toLocaleString()} VND
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {request.transactionNote && (
                        <p className="text-sm text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded">
                          Note: {request.transactionNote}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(request.status)} font-medium`}>{request.status}</Badge>
                    {request.adminNote && (
                      <p className="text-xs text-gray-500 mt-2 max-w-48 truncate bg-yellow-50 px-2 py-1 rounded">
                        Admin: {request.adminNote}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Deposit Requests Yet</h3>
              <p className="text-gray-600">Submit your first deposit request using the form above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
