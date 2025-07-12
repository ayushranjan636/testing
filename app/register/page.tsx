import { AuthForm } from "@/components/auth/auth-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <AuthForm mode="register" />
    </div>
  )
}
