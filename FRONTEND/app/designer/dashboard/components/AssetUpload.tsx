"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, FileImage, Music, Eye, AlertCircle } from "lucide-react"
import { uploadAsset } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function AssetUpload() {
  const [isUploading, setIsUploading] = useState(false)
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
  const { toast } = useToast()

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

      if (fileExtension !== ".eps" && file.type !== "image/eps+xml") {
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

      // Create preview URL for display
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    const isEps = isEpsFile(selectedFile)
    if (isEps && !selectedPreviewFile) {
      toast({
        title: "Preview File Required",
        description: "JPG preview file is required for EPS uploads",
        variant: "destructive",
      })
      return
    }

    if (formData.type === "PAID" && (!formData.price || Number.parseInt(formData.price) <= 0)) {
      toast({
        title: "Price Required",
        description: "Please enter a valid price for paid assets",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append("name", formData.name)
      uploadData.append("description", formData.description)
      uploadData.append("type", formData.type)
      uploadData.append("tags", formData.tags)
      uploadData.append("file", selectedFile)

      if (isEps && selectedPreviewFile) {
        uploadData.append("previewFile", selectedPreviewFile)
      }

      if (formData.type === "PAID") {
        uploadData.append("price", formData.price)
      }

      const response = await uploadAsset(uploadData)

      toast({
        title: "Asset Uploaded Successfully!",
        description: "Your asset has been submitted for review and will be available once approved.",
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "FREE",
        price: "",
        tags: "",
      })
      setSelectedFile(null)
      setSelectedPreviewFile(null)
      setPreviewUrl(null)
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload asset",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const isEpsFile = (file: File) => {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
    return fileExtension === ".eps" || file.type === "image/eps+xml"
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Upload New Asset</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Share your creative work with the community</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Asset Name *
                </Label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Enter asset name"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="tags" className="text-sm font-semibold text-gray-700">
                  Tags
                </Label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="e.g., logo, icon, music, sound"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description *
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your asset and its intended use"
                rows={4}
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">Asset Type *</Label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="FREE"
                    checked={formData.type === "FREE"}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Free Asset</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="PAID"
                    checked={formData.type === "PAID"}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Paid Asset</span>
                </label>
              </div>
            </div>

            {formData.type === "PAID" && (
              <div className="space-y-3">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                  Price *
                </Label>
                <div className="relative">
                  <input
                    id="price"
                    type="number"
                    step="1"
                    min="1"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    placeholder="Enter amount to deposit (e.g., 100 for 100,000 VND)"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter simplified amount (e.g., 100 = 100,000 VND)</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-pink-600" />
                <Label htmlFor="file" className="text-sm font-semibold text-gray-700">
                  Asset File (EPS or MP3) *
                </Label>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors bg-gray-50 hover:bg-pink-50">
                <input
                  id="file"
                  type="file"
                  accept=".eps,.mp3,audio/mpeg,audio/mp3,image/eps+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-200">
                          {selectedFile.name.endsWith(".mp3") ? (
                            <Music className="w-8 h-8 text-purple-500" />
                          ) : (
                            <FileImage className="w-8 h-8 text-pink-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
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
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">Supports EPS vector files and MP3 audio files</p>
                        <p className="text-xs text-gray-400 mt-1">Maximum file size: 50MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {selectedFile && isEpsFile(selectedFile) && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <Label htmlFor="previewFile" className="text-sm font-semibold text-gray-700">
                    JPG Preview File *
                  </Label>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2 text-blue-700 mb-3">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Preview File Required</p>
                      <p className="text-xs text-blue-600">
                        Please upload a JPG version of your EPS file for preview purposes. This will be shown to users
                        browsing assets.
                      </p>
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-white">
                    <input
                      id="previewFile"
                      type="file"
                      accept=".jpg,.jpeg,image/jpeg,image/jpg"
                      onChange={handlePreviewFileChange}
                      className="hidden"
                    />
                    <label htmlFor="previewFile" className="cursor-pointer">
                      {selectedPreviewFile ? (
                        <div className="space-y-4">
                          {previewUrl && (
                            <div className="flex justify-center">
                              <img
                                src={previewUrl || "/placeholder.svg"}
                                alt="Preview"
                                className="max-w-32 max-h-32 object-contain rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{selectedPreviewFile.name}</p>
                            <p className="text-sm text-gray-500 mt-1">
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
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                            <FileImage className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Upload JPG Preview</p>
                            <p className="text-sm text-gray-500">Click to select a JPG version of your EPS file</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isUploading}
                className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  "Upload Asset"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
