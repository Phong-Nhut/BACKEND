"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowDownToLine,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Building,
  Calendar,
  DollarSign,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { getPendingWithdrawRequests, approveWithdrawRequest } from "@/lib/api"
import type { WithdrawRequest, WithdrawApprovalRequest } from "@/lib/types"

export function WithdrawManagement() {
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [approvalData, setApprovalData] = useState<WithdrawApprovalRequest>({
    status: "APPROVED",
    adminNote: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchWithdrawRequests()
  }, [])

  const fetchWithdrawRequests = async () => {
    try {
      const response = await getPendingWithdrawRequests()
      setWithdrawRequests(response.content || [])
    } catch (error) {
      console.error("Failed to fetch withdraw requests:", error)
      toast.error("Failed to load withdraw requests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async () => {
    if (!selectedRequest) return

    setIsSubmitting(true)
    try {
      await approveWithdrawRequest(selectedRequest.id, approvalData)
      toast.success(`Withdraw request ${approvalData.status.toLowerCase()} successfully!`)
      setShowApprovalDialog(false)
      setSelectedRequest(null)
      setApprovalData({ status: "APPROVED", adminNote: "" })
      fetchWithdrawRequests()
    } catch (error) {
      console.error("Failed to process withdraw request:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openApprovalDialog = (request: WithdrawRequest, action: "APPROVED" | "REJECTED") => {
    setSelectedRequest(request)
    setApprovalAction(action)
    setApprovalData({ status: action, adminNote: "" })
    setShowApprovalDialog(true)
  }

  const openDetailsDialog = (request: WithdrawRequest) => {
    setSelectedRequest(request)
    setShowDetailsDialog(true)
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

  const formatCurrency = (amount: number) => {
    return `${(amount * 1000).toLocaleString("vi-VN")} VND`
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {withdrawRequests.filter((r) => r.status === "PENDING").length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                withdrawRequests.filter((r) => r.status === "PENDING").reduce((sum, r) => sum + r.amount, 0),
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Pending withdrawals</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Users</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <User className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(withdrawRequests.filter((r) => r.status === "PENDING").map((r) => r.userId)).size}
            </div>
            <p className="text-sm text-gray-500 mt-1">Requesting withdrawal</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Requests Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowDownToLine className="h-6 w-6" />
            </div>
            Pending Withdraw Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : withdrawRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                            <div className="text-sm text-gray-500">{request.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(request.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.bankName}</div>
                        <div className="text-sm text-gray-500">{request.accountNumber}</div>
                        <div className="text-xs text-gray-400">{request.accountHolderName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(request.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailsDialog(request)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openApprovalDialog(request, "APPROVED")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openApprovalDialog(request, "REJECTED")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownToLine className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No pending withdraw requests</p>
              <p className="text-sm text-gray-500 mt-1">All requests have been processed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Withdraw Request Details
            </DialogTitle>
            <DialogDescription>Complete information about the withdrawal request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User Information
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{selectedRequest.userName}</p>
                      <p className="text-sm text-gray-600">{selectedRequest.userEmail}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedRequest.amount)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Bank Details
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{selectedRequest.bankName}</p>
                      <p className="text-sm text-gray-600">{selectedRequest.accountNumber}</p>
                      <p className="text-sm text-gray-600">{selectedRequest.accountHolderName}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Request Date
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p>{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              {selectedRequest.userNote && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    User Note
                  </Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">{selectedRequest.userNote}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approvalAction === "APPROVED" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {approvalAction === "APPROVED" ? "Approve" : "Reject"} Withdraw Request
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "APPROVED"
                ? "Approve this withdrawal request and process the payment."
                : "Reject this withdrawal request with a reason."}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedRequest.userName}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.userEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedRequest.amount)}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.bankName}</p>
                  </div>
                </div>
              </div>
              {approvalAction === "REJECTED" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-800">Rejection Notice</h5>
                      <p className="text-sm text-red-700 mt-1">
                        This action will reject the withdrawal request. The user's balance will remain unchanged.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="adminNote">
                  Admin Note {approvalAction === "REJECTED" ? "(Required)" : "(Optional)"}
                </Label>
                <Textarea
                  id="adminNote"
                  value={approvalData.adminNote || ""} // Added null check for adminNote
                  onChange={(e) => setApprovalData((prev) => ({ ...prev, adminNote: e.target.value }))}
                  placeholder={
                    approvalAction === "APPROVED"
                      ? "Add any notes about the approval..."
                      : "Please provide a reason for rejection..."
                  }
                  className="min-h-[80px]"
                  required={approvalAction === "REJECTED"}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleApproval}
              disabled={isSubmitting || (approvalAction === "REJECTED" && !approvalData.adminNote?.trim())} // Added optional chaining for adminNote
              className={
                approvalAction === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {approvalAction === "APPROVED" ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {approvalAction === "APPROVED" ? "Approve Request" : "Reject Request"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
