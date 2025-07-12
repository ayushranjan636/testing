import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Leaf, Users, Recycle, Droplets, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const featuredItems = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      image: "/placeholder.svg?height=200&width=200",
      points: 150,
      condition: "Good",
    },
    {
      id: 2,
      title: "Designer Silk Scarf",
      image: "/placeholder.svg?height=200&width=200",
      points: 80,
      condition: "Like New",
    },
    {
      id: 3,
      title: "Wool Winter Coat",
      image: "/placeholder.svg?height=200&width=200",
      points: 200,
      condition: "Good",
    },
    {
      id: 4,
      title: "Summer Floral Dress",
      image: "/placeholder.svg?height=200&width=200",
      points: 120,
      condition: "New",
    },
  ]

  const impactMetrics = {
    co2Saved: 12500,
    waterSaved: 850000,
    wasteDiverted: 2800,
    itemsSwapped: 1500,
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Recycle className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">ReWear</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/browse" className="text-gray-600 hover:text-gray-900">
              Browse
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
              How It Works
            </Link>
            <Link href="/impact" className="text-gray-600 hover:text-gray-900">
              Impact
            </Link>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sustainable Fashion Through
            <span className="text-green-600"> Community Exchange</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of fashion-conscious individuals reducing textile waste by swapping, sharing, and giving new
            life to pre-loved clothing. Every swap makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Swapping <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Browse Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Environmental Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{impactMetrics.co2Saved.toLocaleString()}</div>
              <div className="text-gray-600">kg CO₂e Saved</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{impactMetrics.waterSaved.toLocaleString()}</div>
              <div className="text-gray-600">Liters Water Saved</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Recycle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{impactMetrics.wasteDiverted.toLocaleString()}</div>
              <div className="text-gray-600">kg Waste Diverted</div>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{impactMetrics.itemsSwapped.toLocaleString()}</div>
              <div className="text-gray-600">Items Swapped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Items</h2>
            <Link href="/browse">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{item.condition}</Badge>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{item.points} pts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How ReWear Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">List Your Items</h3>
              <p className="text-gray-600">
                Upload photos and details of clothing you no longer wear. Set a point value or mark as open for direct
                swaps.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Browse & Request</h3>
              <p className="text-gray-600">
                Discover amazing pre-loved items from the community. Use points to redeem items or propose direct swaps.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Swap & Impact</h3>
              <p className="text-gray-600">
                Complete the exchange and see your positive environmental impact. Earn points for every successful swap!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community of sustainable fashion enthusiasts and start your eco-friendly wardrobe journey today.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Join ReWear Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Recycle className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold">ReWear</span>
              </div>
              <p className="text-gray-400">Building a sustainable future through community-driven fashion exchange.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/browse">Browse Items</Link>
                </li>
                <li>
                  <Link href="/how-it-works">How It Works</Link>
                </li>
                <li>
                  <Link href="/impact">Impact</Link>
                </li>
                <li>
                  <Link href="/events">Events</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help">Help Center</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link href="/safety">Safety Guidelines</Link>
                </li>
                <li>
                  <Link href="/disputes">Dispute Resolution</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/cookies">Cookie Policy</Link>
                </li>
                <li>
                  <Link href="/gdpr">GDPR Compliance</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ReWear. All rights reserved. Building sustainable fashion communities.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
