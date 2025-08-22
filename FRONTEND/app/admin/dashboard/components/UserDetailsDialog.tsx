"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, User, Briefcase, Calendar, Mail } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface UserDetailsDialogProps {
  user: UserType
  open: boolean
  onClose: () => void
}

export function UserDetailsDialog({ user, open, onClose }: UserDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "DEVELOPER":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "DESIGNER":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6 text-blue-600" />
            Registration Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.fullName || "Name not provided"}</h3>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          {(user.role === "DESIGNER" || user.role === "DEVELOPER") && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.role === "DESIGNER" && user.portfolioUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Portfolio URL</label>
                      <div className="mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-auto p-2 justify-start bg-transparent"
                          onClick={() => window.open(user.portfolioUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <span className="truncate max-w-48">{user.portfolioUrl}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.role === "DEVELOPER" && user.experienceYears && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {user.experienceYears} years
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Account Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">User ID</label>
                  <p className="text-gray-900">{user.id}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Account Type</label>
                  <p className="text-gray-900">{user.role}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Status</label>
                  <p className="text-gray-900">{user.status}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Registration Date</label>
                  <p className="text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {user.portfolioUrl && (
              <Button
                variant="default"
                onClick={() => window.open(user.portfolioUrl, "_blank")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Portfolio
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
