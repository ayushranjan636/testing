"use client"

import { useState, useEffect } from "react"
import { getItems } from "@/lib/api"
import type { Item } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Zap } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import Link from "next/link"
import Image from "next/image"

const categories = [
  "All Categories",
  "Tops & T-Shirts",
  "Dresses",
  "Pants & Jeans",
  "Shorts",
  "Skirts",
  "Jackets & Coats",
  "Shoes",
  "Accessories",
  "Activewear",
  "Formal Wear",
]

const sizes = ["All Sizes", "XS", "S", "M", "L", "XL", "XXL", "6", "8", "10", "12", "14", "16", "18"]
const conditions = ["All Conditions", "new", "like-new", "good", "fair"]

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedSize, setSelectedSize] = useState("All Sizes")
  const [selectedCondition, setSelectedCondition] = useState("All Conditions")

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchTerm, selectedCategory, selectedSize, selectedCondition])

  const loadItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const { items: allItems } = await getItems({
        status: "approved",
        pageSize: 50,
      })
      setItems(allItems)
    } catch (err: any) {
      setError(err.message)
      console.error("Error loading items:", err)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Size filter
    if (selectedSize !== "All Sizes") {
      filtered = filtered.filter((item) => item.size === selectedSize)
    }

    // Condition filter
    if (selectedCondition !== "All Conditions") {
      filtered = filtered.filter((item) => item.condition === selectedCondition)
    }

    setFilteredItems(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={loadItems} />
      </div>
    )
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
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/list-item">
              <Button>List Item</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition === "All Conditions"
                        ? condition
                        : condition.charAt(0).toUpperCase() + condition.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
            </p>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/item/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square relative">
                    <Image
                      src={item.images[0] || "/placeholder.svg?height=200&width=200"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.condition.charAt(0).toUpperCase() + item.condition.slice(1).replace("-", " ")}
                      </Badge>
                      <span className="text-xs text-gray-500">Size {item.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">by {item.ownerName}</span>
                      {item.pointValue && (
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium text-sm">{item.pointValue} pts</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
