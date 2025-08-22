"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Edit, CheckCircle, Upload, FileImage, Music, Eye, DollarSign, AlertCircle } from "lucide-react"
import type { Asset } from "@/lib/types"
import { updateAsset } from "@/lib/api"

interface EditAssetDialogProps {
  asset: Asset
  open: boolean
  onClose: () => void
  onAssetUpdated: (updatedAsset: Asset) => void
}

export function EditAssetDialog({ asset, open, onClose, onAssetUpdated }: EditAssetDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "FREE" as "FREE" | "PAID",
    price: "",
    tags: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        description: asset.description,
        type: asset.type,
        price: asset.price?.toString() || "",
        tags: asset.tags,
      })
    }
  }, [asset])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/eps+xml", "audio/mpeg", "audio/mp3"]
      const allowedExtensions = [".eps", ".mp3"]
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Only EPS and MP3 files are allowed",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)

      if (!isEpsFile(file)) {
        setSelectedPreviewFile(null)
        setPreviewUrl(null)
      }
    }
  }

  const handlePreviewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg"]
      const allowedExtensions = [".jpg", ".jpeg"]
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid Preview File Type",
          description: "Preview file must be in JPG/JPEG format",
          variant: "destructive",
        })
        return
      }

      setSelectedPreviewFile(file)

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.type === "PAID" && (!formData.price || Number.parseFloat(formData.price) <= 0)) {
      toast({
        title: "Price Required",
        description: "Please enter a valid price for paid assets",
        variant: "destructive",
      })
      return
    }

    if (selectedFile && isEpsFile(selectedFile) && !selectedPreviewFile) {
      toast({
        title: "Preview File Required",
        description: "JPG preview file is required when updating with EPS file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updateData = new FormData()
      updateData.append("name", formData.name)
      updateData.append("description", formData.description)
      updateData.append("type", formData.type)
      updateData.append("tags", formData.tags)

      if (formData.type === "PAID") {
        updateData.append("price", formData.price)
      }

      if (selectedFile) {
        updateData.append("file", selectedFile)
      }

      if (selectedFile && isEpsFile(selectedFile) && selectedPreviewFile) {
        updateData.append("previewFile", selectedPreviewFile)
      }

      const updatedAsset = await updateAsset(asset.id, updateData)

      toast({
        title: "Asset Updated Successfully!",
        description: "Your asset has been updated successfully.",
      })

      onAssetUpdated(updatedAsset)
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update asset. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const isEpsFile = (file: File) => {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    return fileExtension === ".eps" || file.type === "image/eps+xml"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-l-4 border-l-pink-500 shadow-xl bg-white">
        <DialogHeader className="pb-4 border-b border-pink-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Edit className="w-5 h-5 text-pink-600" />
            </div>
            Edit Asset: {asset.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="edit-name" className="font-medium text-gray-900">
                Asset Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="mt-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div>
              <Label htmlFor="edit-type" className="font-medium text-gray-900">
                Asset Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "FREE" | "PAID") => handleInputChange("type", value)}
              >
                <SelectTrigger className="mt-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Free Asset</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PAID">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Premium Asset</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === "PAID" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Label htmlFor="edit-price" className="font-medium text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Price (USD) *
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                required
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <p className="text-xs text-emerald-700 mt-1">Set a fair price for your premium asset</p>
            </div>
          )}

          <div>
            <Label htmlFor="edit-description" className="font-medium text-gray-900">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              placeholder="Describe your asset, its style, and potential use cases..."
              className="mt-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>

          <div>
            <Label htmlFor="edit-tags" className="font-medium text-gray-900">
              Tags
            </Label>
            <Input
              id="edit-tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="ui, icon, button, modern, minimalist (comma separated)"
              className="mt-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">Add relevant tags to help users discover your asset</p>
          </div>

          <div>
            <Label htmlFor="edit-file" className="font-medium text-gray-900">
              Update Asset File (Optional)
            </Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors bg-gray-50 hover:bg-pink-50">
              <input
                id="edit-file"
                type="file"
                accept=".eps,.mp3,audio/mpeg,audio/mp3,image/eps+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="edit-file" className="cursor-pointer">
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
                        {selectedFile.name.endsWith(".mp3") ? (
                          <Music className="w-6 h-6 text-purple-500" />
                        ) : (
                          <FileImage className="w-6 h-6 text-pink-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                        {selectedFile.name.endsWith(".mp3") ? "Audio File" : "Vector Graphics"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null)
                        setSelectedPreviewFile(null)
                        setPreviewUrl(null)
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Upload new file (optional)</p>
                      <p className="text-sm text-gray-500">Supports EPS vector files and MP3 audio files</p>
                      <p className="text-xs text-gray-400 mt-1">Leave empty to keep current file</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {selectedFile && isEpsFile(selectedFile) && (
            <div>
              <Label htmlFor="edit-preview-file" className="font-medium text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                JPG Preview File *
              </Label>
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2 text-blue-700 mb-3">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Preview File Required</p>
                    <p className="text-xs text-blue-600">
                      Please upload a JPG version of your EPS file for preview purposes.
                    </p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors bg-white">
                  <input
                    id="edit-preview-file"
                    type="file"
                    accept=".jpg,.jpeg,image/jpeg,image/jpg"
                    onChange={handlePreviewFileChange}
                    className="hidden"
                  />
                  <label htmlFor="edit-preview-file" className="cursor-pointer">
                    {selectedPreviewFile ? (
                      <div className="space-y-3">
                        {previewUrl && (
                          <div className="flex justify-center">
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="Preview"
                              className="max-w-24 max-h-24 object-contain rounded border border-gray-200"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{selectedPreviewFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedPreviewFile.size / 1024 / 1024).toFixed(2)} MB • JPG Preview
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPreviewFile(null)
                            setPreviewUrl(null)
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Change Preview
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                          <FileImage className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Upload JPG Preview</p>
                          <p className="text-sm text-gray-500">Click to select a JPG version</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-pink-100">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Asset
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-pink-200 text-pink-700 hover:bg-pink-50 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
