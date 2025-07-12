import { ImpactDashboard } from "@/components/impact-dashboard"

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Environmental Impact</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ImpactDashboard />
      </div>
    </div>
  )
}
