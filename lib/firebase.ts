import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
}

// Validate required environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required Firebase environment variables: ${missingEnvVars.join(", ")}. Please ensure your .env.local file is correctly configured and your development server is restarted.`,
  )
  // Firebase initialization will likely fail if critical config is missing.
  // We'll let the Firebase SDK throw its own errors if the config is truly invalid.
}

let app
if (!getApps().length) {
  // Only initialize if no Firebase app has been initialized yet
  app = initializeApp(firebaseConfig)
} else {
  // If an app is already initialized, retrieve it
  app = getApp()
}

// Initialize Firebase services
// These calls should be safe as 'app' is guaranteed to be an initialized FirebaseApp instance
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export let analytics: any = null
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
    .catch((error) => {
      console.log("Analytics not supported:", error)
    })
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: "select_account",
})

export const facebookProvider = new FacebookAuthProvider()
facebookProvider.setCustomParameters({
  display: "popup",
})

export default app
