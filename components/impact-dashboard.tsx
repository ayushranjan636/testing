"use client"

import { useState, useEffect } from "react"
import { calculateImpact } from "@/lib/api"
import type { ImpactMetrics } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Leaf, Droplets, Recycle, TrendingUp } from "lucide-react"

interface ImpactDashboardProps {
  userItemCount?: number
  showPersonal?: boolean
}

export function ImpactDashboard({ userItemCount = 0, showPersonal = false }: ImpactDashboardProps) {
  const [platformMetrics, setPlatformMetrics] = useState<ImpactMetrics>({
    co2Saved: 0,
    waterSaved: 0,
    wasteDiverted: 0,
  })
  const [userMetrics, setUserMetrics] = useState<ImpactMetrics>({
    co2Saved: 0,
    waterSaved: 0,
    wasteDiverted: 0,
  })

  useEffect(() => {
    // In a real app, you'd fetch actual platform metrics
    const totalItems = 1500 // Mock total platform items
    setPlatformMetrics(calculateImpact(totalItems))

    if (showPersonal) {
      setUserMetrics(calculateImpact(userItemCount))
    }
  }, [userItemCount, showPersonal])

  const MetricCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color,
    userValue,
  }: {
    title: string
    value: number
    unit: string
    icon: any
    color: string
    userValue?: number
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{unit}</p>
        {showPersonal && userValue !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Your contribution</span>
              <span>
                {userValue.toLocaleString()} {unit}
              </span>
            </div>
            <Progress value={(userValue / value) * 100} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {showPersonal ? "Your Environmental Impact" : "Platform Environmental Impact"}
        </h2>
        <p className="text-gray-600">
          {showPersonal
            ? "See how your sustainable fashion choices are making a difference"
            : "Together, we're building a more sustainable future through clothing exchange"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="CO₂ Emissions Saved"
          value={platformMetrics.co2Saved}
          unit="kg CO₂e"
          icon={Leaf}
          color="text-green-600"
          userValue={showPersonal ? userMetrics.co2Saved : undefined}
        />
        <MetricCard
          title="Water Saved"
          value={platformMetrics.waterSaved}
          unit="liters"
          icon={Droplets}
          color="text-blue-600"
          userValue={showPersonal ? userMetrics.waterSaved : undefined}
        />
        <MetricCard
          title="Waste Diverted"
          value={platformMetrics.wasteDiverted}
          unit="kg"
          icon={Recycle}
          color="text-purple-600"
          userValue={showPersonal ? userMetrics.wasteDiverted : undefined}
        />
      </div>

      {showPersonal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Impact Breakdown
            </CardTitle>
            <CardDescription>Environmental benefits from your {userItemCount} listed items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Carbon Footprint:</strong> Each clothing item saves an average of 8.5 kg CO₂e by extending its
                lifecycle and reducing the need for new production.
              </p>
              <p className="mb-2">
                <strong>Water Conservation:</strong> The fashion industry is water-intensive. Each reused item saves
                approximately 2,700 liters of water.
              </p>
              <p>
                <strong>Waste Reduction:</strong> By keeping clothes in circulation, we prevent an average of 0.5 kg of
                textile waste per item.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
