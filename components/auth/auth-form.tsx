"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider, facebookProvider } from "@/lib/firebase"
import { createUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User, Facebook } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Wait for Firebase Auth to be ready
    const initAuth = async () => {
      try {
        await auth.authStateReady()
        setAuthReady(true)
      } catch (err) {
        console.error("Auth initialization failed:", err)
        setError("Authentication service is unavailable. Please refresh the page.")
      }
    }

    initAuth()
  }, [])

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }

    if (!password) {
      setError("Password is required")
      return false
    }

    if (mode === "register") {
      if (password.length < 12) {
        setError("Password must be at least 12 characters long")
        return false
      }

      if (!displayName.trim()) {
        setError("Full name is required")
        return false
      }
    }

    return true
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authReady) {
      setError("Authentication service is not ready. Please wait.")
      return
    }

    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName })

        // Create user profile in Firestore
        await createUser({
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: displayName.trim(),
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Auth error:", err)

      // Provide user-friendly error messages
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password")
          break
        case "auth/email-already-in-use":
          setError("An account with this email already exists")
          break
        case "auth/weak-password":
          setError("Password is too weak")
          break
        case "auth/invalid-email":
          setError("Invalid email address")
          break
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later")
          break
        case "auth/network-request-failed":
          setError("Network error. Please check your connection and try again")
          break
        default:
          setError(err.message || "An error occurred. Please try again")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialAuth = async (provider: any) => {
    if (!authReady) {
      setError("Authentication service is not ready. Please wait.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signInWithPopup(auth, provider)

      // Create user record if new user (check if this is their first time)
      try {
        await createUser({
          id: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || result.user.email!.split("@")[0],
          photoURL: result.user.photoURL,
        })
      } catch (createError: any) {
        // User might already exist, which is fine
        console.log("User profile might already exist:", createError)
      }

      router.push("/dashboard")
    } catch (err: any) {
      switch (err.code) {
        case "auth/popup-closed-by-user":
          setError("Sign-in was cancelled")
          break
        case "auth/popup-blocked":
          setError("Popup was blocked. Please allow popups and try again")
          break
        case "auth/network-request-failed":
          setError("Network error. Please check your connection and try again")
          break
        default:
          console.error("Social auth error:", err)
          setError(err.message || "Social sign-in failed. Please try again")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!authReady) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">Initializing authentication...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{mode === "login" ? "Welcome Back" : "Join ReWear"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to your account to continue swapping"
            : "Create your account and start sustainable fashion"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={mode === "register" ? 12 : undefined}
                required
              />
            </div>
            {mode === "register" && (
              <p className="text-sm text-muted-foreground">Password must be at least 12 characters long</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => handleSocialAuth(googleProvider)} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" onClick={() => handleSocialAuth(facebookProvider)} disabled={loading}>
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
        </div>

        <div className="text-center text-sm">
          {mode === "login" ? (
            <span>
              {"Don't have an account? "}
              <Button variant="link" className="p-0" onClick={() => router.push("/register")}>
                Sign up
              </Button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => router.push("/login")}>
                Sign in
              </Button>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
