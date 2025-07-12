import type { Timestamp } from "firebase/firestore"

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  bio?: string
  points: number
  createdAt: Timestamp | Date
  lastActive: Timestamp | Date
  isAdmin?: boolean
  isBanned?: boolean
}

export interface Item {
  id: string
  title: string
  description: string
  category: string
  type: string
  size: string
  condition: "new" | "like-new" | "good" | "fair"
  tags: string[]
  images: string[]
  pointValue?: number
  openToSwap: boolean
  ownerId: string
  ownerName: string
  status: "pending" | "approved" | "rejected" | "available" | "in-transit" | "completed"
  createdAt: Timestamp | Date
  moderationNotes?: string
  riskScore?: number
}

export interface SwapOrder {
  id: string
  itemId: string
  buyerId: string
  sellerId: string
  pointsAmount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "disputed" | "completed"
  createdAt: Timestamp | Date
  shippingInfo?: {
    method: string
    trackingNumber?: string
    address: string
  }
  disputeReason?: string
}

export interface PointsTransaction {
  id: string
  userId: string
  amount: number
  type: "earned" | "spent" | "expired" | "refunded"
  reason: string
  relatedOrderId?: string
  createdAt: Timestamp | Date
}

export interface ImpactMetrics {
  co2Saved: number // kg CO2e
  waterSaved: number // liters
  wasteDiverted: number // kg
}

export interface ApiError {
  code: string
  message: string
}
