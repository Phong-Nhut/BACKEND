"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Search,
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
} from "lucide-react"
import { getMyAssetPurchases } from "@/lib/api"
import type { TransactionResponse } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export function AssetPurchaseHistory() {
  const [purchases, setPurchases] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchPurchases()
  }, [currentPage])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const response = await getMyAssetPurchases(currentPage, 10)
      setPurchases(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Failed to fetch asset purchases:", error)
      toast({
        title: "Error",
        description: "Failed to load asset purchase history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      case "APPROVED":
        return "bg-green-100 text-green-700 border border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const handleDownload = (purchase: TransactionResponse) => {
    if (purchase.status === "APPROVED") {
      toast({
        title: "Download Available",
        description: "Please check the 'Purchased Assets' tab to download your asset",
        variant: "default",
      })
    } else {
      toast({
        title: "Download Unavailable",
        description: "Only approved assets can be downloaded",
        variant: "default",
      })
    }
  }

  const pendingPurchases = filteredPurchases.filter((p) => p.status === "PENDING")
  const approvedPurchases = filteredPurchases.filter((p) => p.status === "APPROVED")
  const rejectedPurchases = filteredPurchases.filter((p) => p.status === "REJECTED")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
          <p className="text-gray-600">Track the status of your asset purchase transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
        <p className="text-gray-600">Track the status of your asset purchase transactions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search assets or designers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPurchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedPurchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedPurchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-green-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                All ({filteredPurchases.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                Pending ({pendingPurchases.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Approved ({approvedPurchases.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Rejected ({rejectedPurchases.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Purchase History</h3>
                  <p className="text-gray-600">You haven't made any asset purchases yet</p>
                </div>
              ) : (
                filteredPurchases.map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} onDownload={handleDownload} />
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingPurchases.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-12 w-12 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Pending Transactions</h3>
                  <p className="text-gray-600">All your transactions have been processed</p>
                </div>
              ) : (
                pendingPurchases.map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} onDownload={handleDownload} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedPurchases.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Approved Transactions</h3>
                  <p className="text-gray-600">No transactions have been approved yet</p>
                </div>
              ) : (
                approvedPurchases.map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} onDownload={handleDownload} />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedPurchases.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-12 w-12 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Rejected Transactions</h3>
                  <p className="text-gray-600">None of your transactions have been rejected</p>
                </div>
              ) : (
                rejectedPurchases.map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} onDownload={handleDownload} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function PurchaseCard({
  purchase,
  onDownload,
}: {
  purchase: TransactionResponse
  onDownload: (purchase: TransactionResponse) => void
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      case "APPROVED":
        return "bg-green-100 text-green-700 border border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending"
      case "APPROVED":
        return "Approved"
      case "REJECTED":
        return "Rejected"
      default:
        return status
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-gray-900">{purchase.assetName}</h3>
              <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                {purchase.type}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{purchase.sellerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">{(purchase.amount * 1000).toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {purchase.rejectionReason && (
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                <strong>Rejection Reason:</strong> {purchase.rejectionReason}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(purchase.status)}
              <Badge className={`${getStatusColor(purchase.status)} font-medium`}>
                {getStatusText(purchase.status)}
              </Badge>
            </div>

            {purchase.status === "APPROVED" && (
              <Button
                onClick={() => onDownload(purchase)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
