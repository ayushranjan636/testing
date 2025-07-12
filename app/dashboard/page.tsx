"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getItems } from "@/lib/api"
import type { Item } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Zap, Package, ShoppingBag, TrendingUp } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import Link from "next/link"
import Image from "next/image"

export default function DashboardPage() {
  const { firebaseUser, user, loading: authLoading, error: authError } = useAuth()
  const router = useRouter()
  const [myListings, setMyListings] = useState<Item[]>([])
  const [myPurchases, setMyPurchases] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login")
      return
    }

    if (firebaseUser) {
      loadUserData()
    }
  }, [firebaseUser, authLoading, router])

  const loadUserData = async () => {
    if (!firebaseUser) return

    try {
      setLoading(true)
      setError(null)

      const { items: listings } = await getItems({
        ownerId: firebaseUser.uid,
        pageSize: 20,
      })
      setMyListings(listings)

      // In a real app, you'd have a separate query for purchases
      // For now, we'll use a placeholder
      setMyPurchases([])
    } catch (err: any) {
      setError(err.message)
      console.error("Error loading user data:", err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (authError || error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={authError || error || "An error occurred"} onRetry={loadUserData} />
      </div>
    )
  }

  if (!firebaseUser) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">ReWear</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/browse">
              <Button variant="outline">Browse</Button>
            </Link>
            <Link href="/list-item">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                List Item
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL || "/placeholder.svg"} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || firebaseUser.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{user?.displayName || firebaseUser.email?.split("@")[0]}</CardTitle>
                  <CardDescription>{firebaseUser.email}</CardDescription>
                  {user?.bio && <p className="text-sm text-gray-600 mt-2">{user.bio}</p>}
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{user?.points || 0}</span>
                    <span className="text-gray-600">points</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myListings.filter((item) => item.status === "approved").length}</div>
              <p className="text-xs text-muted-foreground">Items available for swap</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Swaps</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myPurchases.length}</div>
              <p className="text-xs text-muted-foreground">Successful exchanges</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((myListings.length + myPurchases.length) * 8.5 * 10) / 10}
              </div>
              <p className="text-xs text-muted-foreground">kg CO₂e saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Rest of the component remains the same */}
        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Listed Items</h3>
              <Link href="/list-item">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Item
                </Button>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items listed yet</h3>
                  <p className="text-gray-600 mb-4">Start by listing your first item to begin swapping!</p>
                  <Link href="/list-item">
                    <Button>List Your First Item</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={item.images[0] || "/placeholder.svg?height=200&width=200"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <div className="flex justify-between items-center mb-2">
                        <Badge
                          variant={
                            item.status === "approved"
                              ? "default"
                              : item.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                        {item.pointValue && (
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{item.pointValue} pts</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <h3 className="text-lg font-semibold">Your Purchases</h3>
            {myPurchases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                  <p className="text-gray-600 mb-4">Browse items from the community to make your first swap!</p>
                  <Link href="/browse">
                    <Button>Browse Items</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Purchase items would be rendered here */}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Activity feed coming soon</h3>
                <p className="text-gray-600">Track your swaps, points earned, and community interactions.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
