"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { UserDetailsDialog } from "./UserDetailsDialog"
import { Users, Search, Eye, Check, X, Trash2, UserCheck, UserX, Clock } from "lucide-react"
import { getPendingUsers, getAdminAllUsers, approveUser, deleteUser } from "@/lib/api"
import type { User } from "@/lib/types"

export function UserManagement() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [processingUserId, setProcessingUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [pending, all] = await Promise.all([getPendingUsers(), getAdminAllUsers()])
      setPendingUsers(pending)
      setAllUsers(all)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (userId: number, status: "APPROVED" | "REJECTED") => {
    try {
      setProcessingUserId(userId)
      await approveUser(userId, status)

      toast({
        title: "Success",
        description: `User ${status.toLowerCase()} successfully!`,
        variant: "default",
      })

      await fetchUsers()
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete.id)
      toast({
        title: "Success",
        description: "User deleted successfully!",
        variant: "default",
      })
      await fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200 font-medium"
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200 font-medium"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 font-medium"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "DEVELOPER":
        return "bg-blue-50 text-blue-700 border-blue-200 font-medium"
      case "DESIGNER":
        return "bg-violet-50 text-violet-700 border-violet-200 font-medium"
      case "PLAYER":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200 font-medium"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 font-medium"
    }
  }

  const filteredPendingUsers = pendingUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredAllUsers = allUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const UserCard = ({ user, showActions = false }: { user: User; showActions?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl || "/placeholder.svg"}
                  alt={user.fullName || user.email}
                  className="w-12 h-12 rounded-full object-cover shadow-md"
                  onError={(e) => {
                    // Fallback to gradient background if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = "flex"
                  }}
                />
              ) : (
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md ${user.avatarUrl ? "hidden" : ""}`}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                  {user.fullName || "Name not provided"}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Badge className={getRoleColor(user.role)} variant="outline">
                {user.role}
              </Badge>
              <Badge className={getStatusColor(user.status)} variant="outline">
                {user.status}
              </Badge>
            </div>
            {user.createdAt && (
              <p className="text-xs text-gray-500 font-medium">
                Registered: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 ml-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUser(user)}
              className="w-full min-w-[120px] border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>

            {showActions && user.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApproval(user.id, "APPROVED")}
                  disabled={processingUserId === user.id}
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1 shadow-sm"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleApproval(user.id, "REJECTED")}
                  disabled={processingUserId === user.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 shadow-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!showActions && user.role !== "ADMIN" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserToDelete(user)
                  setDeleteDialogOpen(true)
                }}
                className="w-full min-w-[120px] text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
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
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 w-80 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Clock className="h-4 w-4" />
            Pending Approvals ({filteredPendingUsers.length})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Users className="h-4 w-4" />
            All Users ({filteredAllUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {filteredPendingUsers.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Pending Approvals</h3>
                <p className="text-gray-600 leading-relaxed">All user registrations have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredPendingUsers.map((user) => (
                <UserCard key={user.id} user={user} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {filteredAllUsers.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserX className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Users Found</h3>
                <p className="text-gray-600 leading-relaxed">No users match your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredAllUsers.map((user) => (
                <UserCard key={user.id} user={user} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      {selectedUser && (
        <UserDetailsDialog user={selectedUser} open={!!selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">Delete User Account</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 leading-relaxed">
              Are you sure you want to delete {userToDelete?.fullName || userToDelete?.email}? This action cannot be
              undone and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-gray-200 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 shadow-sm">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
