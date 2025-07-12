"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getPendingItems, moderateItem, getPlatformStats } from "@/lib/api"
import type { Item } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, AlertTriangle, Users, Package, TrendingUp } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import Image from "next/image"

export default function AdminPage() {
  const { firebaseUser, user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [pendingItems, setPendingItems] = useState<Item[]>([])
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalSwaps: 0,
    totalPointsAwarded: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moderating, setModerating] = useState<string | null>(null)
  const [moderationNotes, setModerationNotes] = useState("")

  useEffect(() => {
    if (!authLoading) {
      if (!firebaseUser) {
        router.push("/login")
        return
      }

      if (!currentUser?.isAdmin) {
        router.push("/dashboard")
        return
      }

      loadAdminData()
    }
  }, [firebaseUser, currentUser, authLoading, router])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [items, stats] = await Promise.all([getPendingItems(), getPlatformStats()])

      setPendingItems(items)
      setPlatformStats(stats)
    } catch (err: any) {
      setError(err.message)
      console.error("Error loading admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (itemId: string, approved: boolean) => {
    setModerating(itemId)

    try {
      await moderateItem(itemId, approved, moderationNotes)

      // Remove item from pending list
      setPendingItems((prev) => prev.filter((item) => item.id !== itemId))
      setModerationNotes("")
    } catch (err: any) {
      setError(err.message)
      console.error("Error moderating item:", err)
    } finally {
      setModerating(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={loadAdminData} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingItems.length}</div>
              <p className="text-xs text-muted-foreground">Items awaiting moderation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Registered members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalItems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Listed items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalSwaps.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Completed exchanges</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="moderation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="moderation">Item Moderation</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pending Item Reviews</h3>
              <Badge variant="secondary">{pendingItems.length} items</Badge>
            </div>

            {pendingItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending items</h3>
                  <p className="text-gray-600">All items have been reviewed!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {pendingItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription>
                            Listed by {item.ownerName} • {new Date(item.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Risk Score: {item.riskScore || "Low"}</Badge>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Images */}
                        <div>
                          <h4 className="font-medium mb-2">Images</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {item.images.slice(0, 4).map((image, index) => (
                              <div
                                key={index}
                                className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`${item.title} ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-1">Description</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Size:</span> {item.size}
                            </div>
                            <div>
                              <span className="font-medium">Condition:</span> {item.condition}
                            </div>
                            <div>
                              <span className="font-medium">Points:</span> {item.pointValue || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Open to Swap:</span> {item.openToSwap ? "Yes" : "No"}
                            </div>
                          </div>
                          {item.tags.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-1">Tags</h4>
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Moderation Notes */}
                      <div>
                        <h4 className="font-medium mb-2">Moderation Notes (Optional)</h4>
                        <Textarea
                          placeholder="Add notes about this item..."
                          value={moderationNotes}
                          onChange={(e) => setModerationNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleModeration(item.id, false)}
                          disabled={moderating === item.id}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button onClick={() => handleModeration(item.id, true)} disabled={moderating === item.id}>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-gray-600">User management features coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Detailed analytics and reporting coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
