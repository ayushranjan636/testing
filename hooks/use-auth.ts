"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUser } from "@/lib/api"
import type { User } from "@/lib/types"

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Wait for auth to be ready
    const initializeAuth = async () => {
      try {
        await auth.authStateReady()
        setInitialized(true)
      } catch (err) {
        console.error("Auth initialization error:", err)
        setError("Authentication service unavailable")
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (!initialized) return

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null)
        setFirebaseUser(firebaseUser)

        if (firebaseUser) {
          const userData = await getUser(firebaseUser.uid)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (err: any) {
        setError(err.message)
        console.error("Auth state change error:", err)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [initialized])

  return {
    firebaseUser,
    user,
    loading,
    error,
    isAuthenticated: !!firebaseUser,
    isAdmin: user?.isAdmin || false,
  }
}
