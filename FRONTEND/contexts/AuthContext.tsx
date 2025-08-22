"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { loginUser, registerUser, getCurrentUser, getUserProfile } from "@/lib/api"
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  login: (data: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => void
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const fullProfile = await getUserProfile()
      setUser(fullProfile)
    } catch (error) {
      console.error("Failed to refresh user profile:", error)
    }
  }

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          try {
            const fullProfile = await getUserProfile()
            setUser(fullProfile)
          } catch (profileError) {
            console.error("Failed to fetch full profile:", profileError)
            // Fallback to basic user info from localStorage
            const userStr = localStorage.getItem("user")
            if (userStr) {
              const authResponse: AuthResponse = JSON.parse(userStr)
              setUser({
                id: authResponse.id || authResponse.userId || 0,
                email: authResponse.email,
                role: authResponse.role as any,
                status: "APPROVED",
                fullName: currentUser.fullName,
              })
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await loginUser(data)
    localStorage.setItem("user", JSON.stringify(response))

    try {
      const fullProfile = await getUserProfile()
      setUser(fullProfile)
    } catch (profileError) {
      console.error("Failed to fetch profile after login:", profileError)
      // Fallback to basic user info
      setUser({
        id: response.id || response.userId || 0,
        email: response.email,
        role: response.role as any,
        status: "APPROVED",
      })
    }

    return response
  }

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await registerUser(data)
    localStorage.setItem("user", JSON.stringify(response))

    // Set user state with available information
    setUser({
      id: response.id || response.userId || 0,
      email: response.email,
      role: response.role as any,
      status: "PENDING", // New registrations are typically pending
      fullName: data.fullName,
      portfolioUrl: data.portfolioUrl,
      experienceYears: data.experienceYears,
    })

    return response
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
