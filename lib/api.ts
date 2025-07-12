import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase"
import type { User, Item, SwapOrder, PointsTransaction } from "./types"

// Helper function to convert Firestore data
const convertTimestamps = (data: any) => {
  const converted = { ...data }
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate()
    }
  })
  return converted
}

// Error handling wrapper
const handleApiError = (error: any): never => {
  console.error("API Error:", error)

  // Handle specific Firebase errors
  if (error.code) {
    switch (error.code) {
      case "permission-denied":
        throw new Error("You don't have permission to perform this action")
      case "not-found":
        throw new Error("The requested resource was not found")
      case "already-exists":
        throw new Error("This resource already exists")
      case "failed-precondition":
        throw new Error("Operation failed due to invalid state")
      case "unavailable":
        throw new Error("Service is temporarily unavailable. Please try again")
      default:
        throw new Error(`Firebase Error: ${error.message}`)
    }
  }

  throw new Error("An unexpected error occurred")
}

// User API
export const createUser = async (userData: Partial<User>): Promise<string> => {
  try {
    // Use the user's UID as the document ID for easier lookups
    const userRef = doc(db, "users", userData.id!)

    await runTransaction(db, async (transaction) => {
      // Check if user already exists
      const userDoc = await transaction.get(userRef)

      if (!userDoc.exists()) {
        transaction.set(userRef, {
          ...userData,
          points: 100, // Welcome bonus
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          isAdmin: false,
          isBanned: false,
        })
      }
    })

    return userData.id!
  } catch (error) {
    handleApiError(error)
  }
}

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      ...updates,
      lastActive: serverTimestamp(),
    })
  } catch (error) {
    handleApiError(error)
  }
}

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", userId)
    const docSnap = await getDoc(userRef)

    if (!docSnap.exists()) return null

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...convertTimestamps(data),
    } as User
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

// Items API
export const createItem = async (itemData: Partial<Item>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "items"), {
      ...itemData,
      status: "pending",
      createdAt: serverTimestamp(),
      riskScore: 0, // Default low risk
    })
    return docRef.id
  } catch (error) {
    handleApiError(error)
  }
}

export const updateItem = async (itemId: string, updates: Partial<Item>): Promise<void> => {
  try {
    const itemRef = doc(db, "items", itemId)
    await updateDoc(itemRef, updates)
  } catch (error) {
    handleApiError(error)
  }
}

export const getItems = async (filters?: {
  category?: string
  size?: string
  condition?: string
  status?: string
  ownerId?: string
  pageSize?: number
  lastDoc?: QueryDocumentSnapshot<DocumentData>
}): Promise<{ items: Item[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> => {
  try {
    let q = query(collection(db, "items"))

    // Apply filters
    if (filters?.category) {
      q = query(q, where("category", "==", filters.category))
    }
    if (filters?.size) {
      q = query(q, where("size", "==", filters.size))
    }
    if (filters?.condition) {
      q = query(q, where("condition", "==", filters.condition))
    }
    if (filters?.status) {
      q = query(q, where("status", "==", filters.status))
    }
    if (filters?.ownerId) {
      q = query(q, where("ownerId", "==", filters.ownerId))
    }

    // Add ordering and pagination
    q = query(q, orderBy("createdAt", "desc"))

    if (filters?.pageSize) {
      q = query(q, limit(filters.pageSize))
    }

    if (filters?.lastDoc) {
      q = query(q, startAfter(filters.lastDoc))
    }

    const querySnapshot = await getDocs(q)
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Item[]

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]

    return { items, lastDoc }
  } catch (error) {
    handleApiError(error)
  }
}

export const getItem = async (itemId: string): Promise<Item | null> => {
  try {
    const itemRef = doc(db, "items", itemId)
    const docSnap = await getDoc(itemRef)

    if (!docSnap.exists()) return null

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...convertTimestamps(data),
    } as Item
  } catch (error) {
    console.error("Error getting item:", error)
    return null
  }
}

// Swap Orders API
export const createSwapOrder = async (orderData: Partial<SwapOrder>): Promise<string> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // Check user points first
      const buyerRef = doc(db, "users", orderData.buyerId!)
      const buyerDoc = await transaction.get(buyerRef)

      if (!buyerDoc.exists()) {
        throw new Error("Buyer not found")
      }

      const buyer = buyerDoc.data() as User
      const pointsNeeded = orderData.pointsAmount || 0

      if (buyer.points < pointsNeeded) {
        throw new Error("Insufficient points")
      }

      // Check item availability
      const itemRef = doc(db, "items", orderData.itemId!)
      const itemDoc = await transaction.get(itemRef)

      if (!itemDoc.exists()) {
        throw new Error("Item not found")
      }

      const item = itemDoc.data() as Item
      if (item.status !== "approved") {
        throw new Error("Item not available")
      }

      // Create order
      const orderRef = doc(collection(db, "swapOrders"))
      transaction.set(orderRef, {
        ...orderData,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      // Deduct points (escrowed)
      transaction.update(buyerRef, {
        points: buyer.points - pointsNeeded,
        lastActive: serverTimestamp(),
      })

      // Create points transaction record
      const transactionRef = doc(collection(db, "pointsTransactions"))
      transaction.set(transactionRef, {
        userId: orderData.buyerId,
        amount: -pointsNeeded,
        type: "spent",
        reason: "Item purchase (escrowed)",
        relatedOrderId: orderRef.id,
        createdAt: serverTimestamp(),
      })

      // Update item status
      transaction.update(itemRef, {
        status: "in-transit",
      })

      return orderRef.id
    })
  } catch (error) {
    handleApiError(error)
  }
}

export const updateSwapOrder = async (orderId: string, updates: Partial<SwapOrder>): Promise<void> => {
  try {
    const orderRef = doc(db, "swapOrders", orderId)
    await updateDoc(orderRef, updates)
  } catch (error) {
    handleApiError(error)
  }
}

// Image Upload API
export const uploadItemImages = async (files: File[], itemId: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        throw new Error(`File ${file.name} is not an image`)
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new Error(`File ${file.name} is too large (max 5MB)`)
      }

      const storageRef = ref(storage, `items/${itemId}/${index}-${Date.now()}-${file.name}`)
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          itemId: itemId,
          uploadedBy: itemId, // Will be set by security rules
        },
      }

      const snapshot = await uploadBytes(storageRef, file, metadata)
      return await getDownloadURL(snapshot.ref)
    })

    return await Promise.all(uploadPromises)
  } catch (error) {
    handleApiError(error)
  }
}

export const deleteItemImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
    // Don't throw error for image deletion failures
  }
}

// Points System API
export const awardPoints = async (userId: string, amount: number, reason: string): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId)
      const userDoc = await transaction.get(userRef)

      if (!userDoc.exists()) {
        throw new Error("User not found")
      }

      const user = userDoc.data() as User

      transaction.update(userRef, {
        points: user.points + amount,
        lastActive: serverTimestamp(),
      })

      const transactionRef = doc(collection(db, "pointsTransactions"))
      transaction.set(transactionRef, {
        userId,
        amount,
        type: "earned",
        reason,
        createdAt: serverTimestamp(),
      })
    })
  } catch (error) {
    handleApiError(error)
  }
}

// Admin API
export const getPendingItems = async (): Promise<Item[]> => {
  try {
    const q = query(
      collection(db, "items"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc"),
      limit(50), // Limit for performance
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Item[]
  } catch (error) {
    handleApiError(error)
  }
}

export const moderateItem = async (itemId: string, approved: boolean, notes?: string): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const itemRef = doc(db, "items", itemId)
      const itemDoc = await transaction.get(itemRef)

      if (!itemDoc.exists()) {
        throw new Error("Item not found")
      }

      const item = itemDoc.data() as Item

      transaction.update(itemRef, {
        status: approved ? "approved" : "rejected",
        moderationNotes: notes || "",
      })

      if (approved) {
        // Award points to item owner
        const ownerRef = doc(db, "users", item.ownerId)
        const ownerDoc = await transaction.get(ownerRef)

        if (ownerDoc.exists()) {
          const owner = ownerDoc.data() as User

          transaction.update(ownerRef, {
            points: owner.points + 50, // Points for approved listing
            lastActive: serverTimestamp(),
          })

          const transactionRef = doc(collection(db, "pointsTransactions"))
          transaction.set(transactionRef, {
            userId: item.ownerId,
            amount: 50,
            type: "earned",
            reason: "Item listing approved",
            createdAt: serverTimestamp(),
          })
        }
      }
    })
  } catch (error) {
    handleApiError(error)
  }
}

export const getUserTransactions = async (userId: string, pageSize = 20): Promise<PointsTransaction[]> => {
  try {
    const q = query(
      collection(db, "pointsTransactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as PointsTransaction[]
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return []
  }
}

// Impact Metrics API
export const calculateImpact = (itemCount: number) => {
  // Default values per garment based on research
  const CO2_PER_ITEM = 8.5 // kg CO2e
  const WATER_PER_ITEM = 2700 // liters
  const WASTE_PER_ITEM = 0.5 // kg

  return {
    co2Saved: Math.round(itemCount * CO2_PER_ITEM * 10) / 10,
    waterSaved: Math.round(itemCount * WATER_PER_ITEM),
    wasteDiverted: Math.round(itemCount * WASTE_PER_ITEM * 10) / 10,
  }
}

// Get platform-wide statistics
export const getPlatformStats = async () => {
  try {
    // In a real app, you'd use aggregation queries or maintain counters
    // For now, we'll return mock data that would be calculated server-side
    return {
      totalUsers: 1234,
      totalItems: 5678,
      totalSwaps: 2345,
      totalPointsAwarded: 123456,
    }
  } catch (error) {
    console.error("Error getting platform stats:", error)
    return {
      totalUsers: 0,
      totalItems: 0,
      totalSwaps: 0,
      totalPointsAwarded: 0,
    }
  }
}
