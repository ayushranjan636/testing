"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getItem, getUser, createSwapOrder } from "@/lib/api"
import type { Item, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Zap, UserIcon, Package, Heart, Share2, Flag } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import Image from "next/image"
import Link from "next/link"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { firebaseUser, user: currentUser } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [owner, setOwner] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      loadItemData()
    }
  }, [params.id])

  const loadItemData = async () => {
    try {
      setLoading(true)
      setError("")

      const itemData = await getItem(params.id as string)
      if (!itemData) {
        router.push("/browse")
        return
      }

      setItem(itemData)

      const ownerData = await getUser(itemData.ownerId)
      setOwner(ownerData)
    } catch (err: any) {
      setError(err.message)
      console.error("Error loading item:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapRequest = async () => {
    if (!firebaseUser || !currentUser || !item) return

    if (!item.pointValue) {
      setError("This item doesn't have a point value set")
      return
    }

    if (currentUser.points < item.pointValue) {
      setError("Insufficient points for this item")
      return
    }

    setRequesting(true)
    setError("")

    try {
      await createSwapOrder({
        itemId: item.id,
        buyerId: firebaseUser.uid,
        sellerId: item.ownerId,
        pointsAmount: item.pointValue,
      })

      // Redirect to success page or show success message
      router.push("/dashboard?tab=purchases&success=swap-requested")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={loadItemData} />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
          <Link href="/browse">
            <Button>Browse Items</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = firebaseUser?.uid === item.ownerId
  const canRequest = firebaseUser && !isOwner && item.status === "approved"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
              <Image
                src={item.images[selectedImageIndex] || "/placeholder.svg?height=500&width=500"}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? "border-green-500" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${item.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {item.condition.charAt(0).toUpperCase() + item.condition.slice(1).replace("-", " ")}
                </Badge>
                <span className="text-gray-600">Size {item.size}</span>
                <span className="text-gray-600">{item.category}</span>
              </div>
              {item.pointValue && (
                <div className="flex items-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold">{item.pointValue} points</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Owner Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={owner?.photoURL || "/placeholder.svg"} />
                <AvatarFallback>
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{owner?.displayName || "Anonymous"}</h3>
                <p className="text-sm text-gray-600">
                  Member since {owner?.createdAt ? new Date(owner.createdAt).getFullYear() : "Unknown"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!firebaseUser ? (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button className="w-full" size="lg">
                      Sign In to Request Item
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600 text-center">Join ReWear to start swapping sustainable fashion</p>
                </div>
              ) : isOwner ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-green-600">
                      <Package className="h-5 w-5" />
                      <span className="font-medium">This is your item</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </p>
                  </CardContent>
                </Card>
              ) : canRequest ? (
                <div className="space-y-3">
                  {item.pointValue && (
                    <Button onClick={handleSwapRequest} disabled={requesting} className="w-full" size="lg">
                      {requesting ? "Processing..." : `Redeem for ${item.pointValue} Points`}
                    </Button>
                  )}
                  {item.openToSwap && (
                    <Button variant="outline" className="w-full bg-transparent" size="lg">
                      Propose Direct Swap
                    </Button>
                  )}
                  {currentUser && (
                    <p className="text-sm text-gray-600 text-center">Your balance: {currentUser.points} points</p>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-center text-gray-600">This item is not available for swapping</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
