"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { registerUser } from "@/lib/api"
import { Loader2, UserPlusIcon, BrushIcon, CodeIcon, GamepadIcon } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("PLAYER")
  const [fullName, setFullName] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [experienceYears, setExperienceYears] = useState<number | string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const isProfessionalRole = role === "DEVELOPER" || role === "DESIGNER"

  const roleConfig = {
    PLAYER: { icon: GamepadIcon, color: "text-orange-600", bg: "bg-orange-50", description: "Play and discover games" },
    DEVELOPER: {
      icon: CodeIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Build and publish games",
    },
    DESIGNER: { icon: BrushIcon, color: "text-purple-600", bg: "bg-purple-50", description: "Create game assets" },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("[v0] Registration attempt started")
    console.log("[v0] Role:", role, "isProfessionalRole:", isProfessionalRole)
    console.log("[v0] API_BASE_URL:", "http://localhost:8080/api/v1")

    const registrationData: any = {
      email,
      password,
      role,
    }

    if (isProfessionalRole) {
      registrationData.fullName = fullName
      registrationData.portfolioUrl = portfolioUrl
      registrationData.experienceYears = Number(experienceYears)
    }

    console.log("[v0] Registration data:", registrationData)

    try {
      console.log("[v0] Testing API connectivity...")
      const testResponse = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@test.com", password: "test", role: "PLAYER" }),
      }).catch((error) => {
        console.log("[v0] API connectivity test failed:", error)
        throw new Error(
          "Cannot connect to backend server. Please ensure the backend is running on http://localhost:8080",
        )
      })

      console.log("[v0] API connectivity test response status:", testResponse.status)

      await registerUser(registrationData)
      console.log("[v0] Registration successful")

      if (isProfessionalRole) {
        console.log("[v0] Showing professional approval notification")
        console.log("[v0] About to show professional approval toast")
        const professionalToastResult = toast({
          title: "📋 Registration Submitted!",
          description: `Your ${role.toLowerCase()} account is pending admin approval. You'll receive an email notification once approved.`,
          duration: 6000,
        })
        console.log("[v0] Professional toast function returned:", professionalToastResult)
        router.push("/")
      } else {
        console.log("[v0] Showing player success notification")
        console.log("[v0] About to show player success toast")
        const playerToastResult = toast({
          title: "🎉 Welcome to GameHub!",
          description: "Your account has been created successfully. You can now sign in!",
          duration: 4000,
        })
        console.log("[v0] Player toast function returned:", playerToastResult)
        router.push("/login")
      }
    } catch (error: any) {
      console.log("[v0] Registration failed with error:", error)
      console.log("[v0] Error message:", error.message)
      console.log("[v0] Error stack:", error.stack)

      let errorMessage = error.message || "Please check your information and try again."
      if (
        error.message?.includes("fetch") ||
        error.message?.includes("connect") ||
        error.message?.includes("ECONNREFUSED")
      ) {
        errorMessage = "Cannot connect to server. Please ensure the backend is running on port 8080."
      }

      console.log("[v0] About to show registration error toast")
      const errorToastResult = toast({
        variant: "destructive",
        title: "❌ Registration Failed",
        description: errorMessage,
        duration: 6000,
      })
      console.log("[v0] Registration error toast function returned:", errorToastResult)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlusIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-serif text-foreground">Join GameHub</CardTitle>
            <CardDescription className="text-muted-foreground text-base mt-2">
              Create your account to get started
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
                  placeholder="Create a secure password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-semibold text-foreground">
                  Account Type
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 border-border bg-background/50 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-xl">
                    {Object.entries(roleConfig).map(([roleKey, config]) => {
                      const IconComponent = config.icon
                      return (
                        <SelectItem key={roleKey} value={roleKey} className="py-3 bg-white">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.bg}`}>
                              <IconComponent className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <div>
                              <div className="font-medium">{roleKey.charAt(0) + roleKey.slice(1).toLowerCase()}</div>
                              <div className="text-xs text-muted-foreground">{config.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {isProfessionalRole && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Professional Account Details</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl" className="text-sm font-semibold text-foreground">
                      Portfolio URL
                    </Label>
                    <Input
                      id="portfolioUrl"
                      placeholder="https://your-portfolio.com"
                      required
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="h-12 border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears" className="text-sm font-semibold text-foreground">
                      Years of Experience
                    </Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      placeholder="e.g., 3"
                      required
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="h-12 border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
