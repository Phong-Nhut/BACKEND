"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, GamepadIcon } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("[v0] Login attempt started for email:", email)
    console.log("[v0] API_BASE_URL:", "http://localhost:8080")

    try {
      console.log("[v0] Calling login function...")

      console.log("[v0] Testing API connectivity...")
      const testResponse = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@test.com", password: "test" }),
      }).catch((error) => {
        console.log("[v0] API connectivity test failed:", error)
        throw new Error(
          "Cannot connect to backend server. Please ensure the backend is running on http://localhost:8080",
        )
      })

      console.log("[v0] API connectivity test response status:", testResponse.status)

      const data = await login({ email, password })
      console.log("[v0] Login successful, received data:", data)

      console.log("[v0] About to show success toast notification")
      const toastResult = toast({
        title: "🎉 Welcome Back!",
        description: `Successfully logged into GameHub`,
        duration: 3000,
      })
      console.log("[v0] Toast function returned:", toastResult)

      console.log("[v0] Redirecting to main page")
      router.push("/")
    } catch (error: any) {
      console.log("[v0] Login failed with error:", error)
      console.log("[v0] Error message:", error.message)
      console.log("[v0] Error stack:", error.stack)

      let errorMessage = error.message || "Please check your credentials and try again."
      let toastTitle = "❌ Login Failed"

      if (error.message?.includes("not approved") || error.message?.includes("admin approval")) {
        toastTitle = "⏳ Account Pending Approval"
        errorMessage =
          "Your account is pending admin approval. You'll receive an email notification once approved. This usually takes 1-2 business days."
      } else if (
        error.message?.includes("fetch") ||
        error.message?.includes("connect") ||
        error.message?.includes("ECONNREFUSED")
      ) {
        errorMessage = "Cannot connect to server. Please ensure the backend is running on port 8080."
      }

      console.log("[v0] About to show error toast notification")
      const errorToastResult = toast({
        variant: "destructive",
        title: toastTitle,
        description: errorMessage,
        duration: 6000,
      })
      console.log("[v0] Error toast function returned:", errorToastResult)
    } finally {
      setLoading(false)
      console.log("[v0] Login attempt completed")
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <GamepadIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-serif text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground text-base mt-2">
              Sign in to your GameHub account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
