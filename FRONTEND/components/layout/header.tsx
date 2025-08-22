"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gamepad2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const getDashboardLink = () => {
    if (!user) return "/"
    return `/${user.role.toLowerCase()}/dashboard`
  }

  const getAvatarContent = () => {
    if (!user) return null

    switch (user.role) {
      case "PLAYER":
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatarUrl || ""} alt={user.fullName || "Player avatar"} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-blue-800">Player No. {user.id}</span>
          </div>
        )

      case "DESIGNER":
      case "DEVELOPER":
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatarUrl || ""} alt={user.fullName || "User avatar"} />
              <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                {user.fullName?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-semibold text-green-800">{user.role}</div>
              {user.fullName && <div className="text-xs text-green-600">{user.fullName}</div>}
            </div>
          </div>
        )

      case "ADMIN":
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatarUrl || ""} alt={user.fullName || "Admin avatar"} />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-purple-800">Admin</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-gray-200 backdrop-blur-sm",
        pathname === "/" ? "bg-gradient-to-r from-blue-50 to-purple-50" : "bg-white/95",
      )}
    >
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">GameAssetHub</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-4">
          {user && getAvatarContent()}

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50" asChild>
                  <Link href={getDashboardLink()}>Dashboard</Link>
                </Button>
                <Button onClick={logout} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
