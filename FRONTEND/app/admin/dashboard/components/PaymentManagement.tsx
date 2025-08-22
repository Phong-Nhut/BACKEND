"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
  CreditCard,
  Building2,
  User,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Wallet,
  AlertCircle,
} from "lucide-react"
import type { PaymentInfo, DepositRequest } from "@/lib/types"
import {
  createOrUpdatePaymentInfo,
  getActivePaymentInfo,
  getPendingDepositRequests,
  approveDepositRequest,
} from "@/lib/api"

export function PaymentManagement() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string>("")
  const [formData, setFormData] = useState<{
    accountNumber: string
    bankName: string
    accountHolderName: string
    qrCodeUrl: string
  }>({
    accountNumber: "",
    bankName: "",
    accountHolderName: "",
    qrCodeUrl: "",
  })

  useEffect(() => {
    fetchPaymentInfo()
    fetchPendingDeposits()
  }, [])

  const handleQrCodeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      setQrCodeFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setQrCodePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.accountNumber || !formData.bankName || !formData.accountHolderName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    console.log("[v0] Submitting payment info:", formData)

    try {
      const submitFormData = new FormData()
      submitFormData.append("accountNumber", formData.accountNumber)
      submitFormData.append("bankName", formData.bankName)
      submitFormData.append("accountHolderName", formData.accountHolderName)

      if (qrCodeFile) {
        submitFormData.append("qrCodeFile", qrCodeFile)
      }

      console.log("[v0] Calling createOrUpdatePaymentInfo API...")
      const updatedPaymentInfo = await createOrUpdatePaymentInfo(submitFormData)
      console.log("[v0] Payment info updated successfully:", updatedPaymentInfo)

      setPaymentInfo(updatedPaymentInfo)
      setFormData({
        accountNumber: updatedPaymentInfo.accountNumber,
        bankName: updatedPaymentInfo.bankName,
        accountHolderName: updatedPaymentInfo.accountHolderName,
        qrCodeUrl: updatedPaymentInfo.qrCodeUrl || "",
      })

      // Update QR code preview if new QR code was uploaded
      if (updatedPaymentInfo.qrCodeUrl) {
        setQrCodePreview(updatedPaymentInfo.qrCodeUrl)
      }

      toast({
        title: "Success",
        description: "Payment information updated successfully",
      })

      // Clear file input
      setQrCodeFile(null)
      const fileInput = document.getElementById("qrCodeFile") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("[v0] Failed to update payment info:", error)
      let errorMessage = "Failed to update payment information"

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Cannot connect to server. Please check if the backend is running."
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
          errorMessage = "You don't have permission to perform this action."
        } else if (error.message.includes("400")) {
          errorMessage = "Invalid data provided. Please check your input."
        } else if (error.message.includes("System admin user not found")) {
          errorMessage = "System configuration error. Please contact technical support."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentInfo = async () => {
    console.log("[v0] Fetching payment info...")
    try {
      const data = await getActivePaymentInfo()
      console.log("[v0] Payment info fetched:", data)
      setPaymentInfo(data)
      if (data) {
        setFormData({
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          qrCodeUrl: data.qrCodeUrl || "",
        })
        if (data.qrCodeUrl) {
          setQrCodePreview(data.qrCodeUrl)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch payment info:", error)
      // Don't show error toast for 404 (no payment info exists yet)
      if (error instanceof Error && !error.message.includes("404")) {
        toast({
          title: "Error",
          description: "Failed to load payment information",
          variant: "destructive",
        })
      }
    }
  }

  const fetchPendingDeposits = async () => {
    try {
      const response = await getPendingDepositRequests()
      setPendingDeposits(response.content || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending deposits",
        variant: "destructive",
      })
    }
  }

  const handleApproveDeposit = async (depositId: number) => {
    console.log("[v0] Approving deposit request:", depositId)
    try {
      await approveDepositRequest(depositId, { status: "APPROVED" })
      console.log("[v0] Deposit request approved successfully")
      toast({
        title: "Success",
        description: "Deposit request approved successfully",
      })
      fetchPendingDeposits()
    } catch (error) {
      console.error("[v0] Failed to approve deposit request:", error)
      toast({
        title: "Error",
        description: "Failed to approve deposit request",
        variant: "destructive",
      })
    }
  }

  const handleRejectDeposit = async (depositId: number, reason: string) => {
    console.log("[v0] Rejecting deposit request:", depositId, "with reason:", reason)
    try {
      await approveDepositRequest(depositId, { status: "REJECTED", adminNote: reason })
      console.log("[v0] Deposit request rejected successfully")
      toast({
        title: "Success",
        description: "Deposit request rejected",
      })
      fetchPendingDeposits()
    } catch (error) {
      console.error("[v0] Failed to reject deposit request:", error)
      toast({
        title: "Error",
        description: "Failed to reject deposit request",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Wallet className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
          <p className="text-sm text-gray-600 mt-1">Configure bank account information and manage deposit requests</p>
        </div>
      </div>

      <Tabs defaultValue="payment-info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="payment-info"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            Payment Information
          </TabsTrigger>
          <TabsTrigger
            value="deposits"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            Deposit Requests ({pendingDeposits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment-info" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                Bank Account Information
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Configure the system-wide bank account information for receiving payments from developers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="accountNumber" className="flex items-center gap-2 font-medium text-gray-900">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Account Number *
                    </Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Enter account number"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bankName" className="flex items-center gap-2 font-medium text-gray-900">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Bank Name *
                    </Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g., Vietcombank, BIDV, Techcombank"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="accountHolderName" className="flex items-center gap-2 font-medium text-gray-900">
                      <User className="w-4 h-4 text-blue-600" />
                      Account Holder Name *
                    </Label>
                    <Input
                      id="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder="Full name as on bank account"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="qrCodeFile" className="flex items-center gap-2 font-medium text-gray-900">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      QR Code Image (Optional)
                    </Label>
                    <Input
                      id="qrCodeFile"
                      type="file"
                      accept="image/*"
                      onChange={handleQrCodeFileChange}
                      className="cursor-pointer border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Upload a QR code image (PNG, JPG, etc. - Max 5MB)
                    </p>

                    {qrCodePreview && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-900">Preview:</Label>
                        <div className="mt-2 p-4 border border-gray-200 rounded-xl bg-gray-50">
                          <img
                            src={qrCodePreview || "/placeholder.svg"}
                            alt="QR Code Preview"
                            className="w-32 h-32 object-contain mx-auto rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Updating...
                    </div>
                  ) : (
                    "Update Payment Information"
                  )}
                </Button>
              </form>

              {paymentInfo && (
                <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <h3 className="font-semibold text-emerald-800 mb-4 text-lg">Current Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-900">Account:</span>
                      <span className="ml-2 text-gray-700">{paymentInfo.accountNumber}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Bank:</span>
                      <span className="ml-2 text-gray-700">{paymentInfo.bankName}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-900">Holder:</span>
                      <span className="ml-2 text-gray-700">{paymentInfo.accountHolderName}</span>
                    </div>
                    {paymentInfo.qrCodeUrl && (
                      <div className="md:col-span-2 mt-4">
                        <p className="font-semibold text-gray-900 mb-3">QR Code:</p>
                        <div className="flex items-center gap-6">
                          <img
                            src={paymentInfo.qrCodeUrl || "/placeholder.svg"}
                            alt="Payment QR Code"
                            className="w-24 h-24 object-contain border border-emerald-200 rounded-lg"
                          />
                          <a
                            href={paymentInfo.qrCodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
                          >
                            View Full Size
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                Pending Deposit Requests
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                  {pendingDeposits.length}
                </Badge>
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Review and approve deposit requests from developers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDeposits.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Pending Deposits</h3>
                  <p className="text-gray-600 leading-relaxed">All deposit requests have been processed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingDeposits.map((deposit) => (
                    <Card
                      key={deposit.id}
                      className="border-l-4 border-l-amber-400 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg text-gray-900">
                                {deposit.userName} ({deposit.userEmail})
                              </h4>
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                                {deposit.status}
                              </Badge>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(deposit.amount)}</p>
                            <p className="text-sm text-gray-600">
                              Requested: {new Date(deposit.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                            {deposit.transactionNote && (
                              <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">Note:</span> {deposit.transactionNote}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-200 hover:bg-gray-50 bg-transparent"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white border-0 shadow-xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-semibold text-gray-900">
                                    Deposit Request Details
                                  </DialogTitle>
                                  <DialogDescription className="leading-relaxed">
                                    Review the deposit request information
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <Label className="font-semibold text-gray-900">Developer</Label>
                                      <p className="font-medium text-gray-700 mt-1">{deposit.userName}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold text-gray-900">Amount</Label>
                                      <p className="font-semibold text-emerald-600 text-lg mt-1">
                                        {formatCurrency(deposit.amount)}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold text-gray-900">Status</Label>
                                      <div className="mt-1">
                                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                                          {deposit.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-semibold text-gray-900">Created</Label>
                                      <p className="text-gray-700 mt-1">
                                        {new Date(deposit.createdAt).toLocaleString("vi-VN")}
                                      </p>
                                    </div>
                                  </div>
                                  {deposit.transactionNote && (
                                    <div>
                                      <Label className="font-semibold text-gray-900">Transaction Note</Label>
                                      <p className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 leading-relaxed">
                                        {deposit.transactionNote}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              onClick={() => handleApproveDeposit(deposit.id)}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 shadow-sm"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white border-l-4 border-l-red-500 shadow-xl">
                                <DialogHeader className="pb-4 border-b border-red-100">
                                  <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                      <XCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    Reject Deposit Request
                                  </DialogTitle>
                                  <DialogDescription className="leading-relaxed text-gray-600">
                                    Please provide a reason for rejecting this deposit request. This action cannot be
                                    undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.currentTarget)
                                    const reason = formData.get("reason") as string
                                    if (reason.trim()) {
                                      handleRejectDeposit(deposit.id, reason)
                                    }
                                  }}
                                >
                                  <div className="space-y-6 pt-4">
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                      <Label
                                        htmlFor="reason"
                                        className="font-semibold text-gray-900 flex items-center gap-2"
                                      >
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                        Rejection Reason *
                                      </Label>
                                      <Textarea
                                        id="reason"
                                        name="reason"
                                        placeholder="Enter a detailed reason for rejecting this deposit request..."
                                        required
                                        rows={4}
                                        className="mt-3 border-red-200 focus:border-red-500 focus:ring-red-500 bg-white"
                                      />
                                      <p className="text-xs text-red-600 mt-2">
                                        This reason will be sent to the developer via email notification.
                                      </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-red-100">
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
                                        >
                                          Cancel
                                        </Button>
                                      </DialogTrigger>
                                      <Button
                                        type="submit"
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Request
                                      </Button>
                                    </div>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
