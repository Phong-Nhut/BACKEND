"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Building, QrCode, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getMyPaymentInfo, createOrUpdatePaymentInfo } from "@/lib/api"
import type { PaymentInfo as PaymentInfoType } from "@/lib/types"

export function PaymentInfo() {
  const [paymentInfo, setPaymentInfo] = useState<Partial<PaymentInfoType>>({
    // Changed to Partial<PaymentInfoType> to handle missing optional properties
    id: 0,
    accountNumber: "",
    bankName: "",
    accountHolderName: "",
    qrCodeUrl: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPaymentInfo()
  }, [])

  const fetchPaymentInfo = async () => {
    console.log("[v0] Fetching payment info...")
    try {
      const data = await getMyPaymentInfo()
      console.log("[v0] Payment info data received:", data)
      setPaymentInfo(data)
      setPreviewUrl(data.qrCodeUrl || null) // Added null check for qrCodeUrl
    } catch (error) {
      console.error("[v0] Failed to fetch payment info:", error)
      // Don't show error toast for 404 (no payment info exists yet)
      if (error instanceof Error && !error.message.includes("404")) {
        toast.error("Failed to load payment information")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Payment info save button clicked")

    if (!paymentInfo.accountNumber || !paymentInfo.bankName || !paymentInfo.accountHolderName) {
      console.log("[v0] Validation failed - missing required fields")
      toast.error("Please fill in all required fields")
      return
    }

    console.log("[v0] Starting payment info save process...")
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("accountNumber", paymentInfo.accountNumber)
      formData.append("bankName", paymentInfo.bankName)
      formData.append("accountHolderName", paymentInfo.accountHolderName)

      if (selectedFile) {
        console.log("[v0] Adding QR code file to form data:", selectedFile.name)
        formData.append("qrCodeFile", selectedFile)
      }

      console.log("[v0] Making API call to save payment info...")
      const data = await createOrUpdatePaymentInfo(formData)
      console.log("[v0] Payment info saved successfully:", data)
      setPaymentInfo(data)
      setSelectedFile(null)

      // Enhanced success notification with different messages for create vs update
      const isUpdate = paymentInfo.id && paymentInfo.id > 0
      if (isUpdate) {
        toast.success("Payment information updated successfully! 🎉", {
          description: "Your bank account details have been updated and are ready for use.",
          duration: 4000,
        })
      } else {
        toast.success("Payment information saved successfully! 🎉", {
          description: "Your bank account has been set up and is ready to receive payments.",
          duration: 4000,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to save payment info:", error)
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        toast.error("Cannot connect to server. Please check if the backend is running.")
      } else {
        toast.error("Failed to save payment information. Please try again.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof PaymentInfoType, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-rose-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            <div className="space-y-3">
              <div className="h-4 bg-red-200 rounded w-1/4"></div>
              <div className="h-10 bg-red-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-rose-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            Payment Information Management
          </CardTitle>
          <p className="text-red-100 mt-2">Manage your bank account details for receiving payments from asset sales</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bank Account Details Section */}
            <div className="payment-form-section">
              <h4 className="payment-section-title">
                <Building className="w-5 h-5" />
                Bank Account Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="payment-label">
                    Bank Name *
                  </Label>
                  <Input
                    id="bankName"
                    value={paymentInfo.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="e.g., Vietcombank, BIDV, Techcombank"
                    className="payment-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolderName" className="payment-label">
                    Account Holder Name *
                  </Label>
                  <Input
                    id="accountHolderName"
                    value={paymentInfo.accountHolderName}
                    onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                    placeholder="Full name as on bank account"
                    className="payment-input"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accountNumber" className="payment-label">
                    Account Number *
                  </Label>
                  <Input
                    id="accountNumber"
                    value={paymentInfo.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    placeholder="Enter your bank account number"
                    className="payment-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* QR Code Upload Section */}
            <div className="payment-form-section">
              <h4 className="payment-section-title">
                <QrCode className="w-5 h-5" />
                QR Code (Optional)
              </h4>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload a QR code image for easy payment processing. Supported formats: JPG, PNG (max 5MB)
                </p>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? "Change QR Code" : "Upload QR Code"}
                  </Button>

                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">QR Code Preview:</p>
                    <div className="w-32 h-32 border-2 border-red-200 rounded-lg overflow-hidden">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="QR Code Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-amber-800">Security Notice</h5>
                  <p className="text-sm text-amber-700 mt-1">
                    Your payment information is encrypted and securely stored. Only use this for receiving legitimate
                    payments from your asset sales on our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Payment Information
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
