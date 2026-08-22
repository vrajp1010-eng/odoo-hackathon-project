"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"

export type AIPlanCity = {
  cityId: string
  cityName: string
  country: string
  imageUrl: string | null
  activities: Array<{
    activityId: string
    name: string
    category: string
    estimatedCost: number
    description: string | null
  }>
}

export type AIPlan = {
  title: string
  description: string
  suggestedDays: number
  cities: AIPlanCity[]
}

// Keywords that map to known destination regions
const DESTINATION_KEYWORDS: Record<string, string[]> = {
  japan: ["Tokyo", "Kyoto", "Osaka"],
  europe: ["Paris", "Rome", "Barcelona", "Amsterdam"],
  paris: ["Paris"],
  rome: ["Rome"],
  barcelona: ["Barcelona"],
  india: ["New Delhi", "Jaipur", "Mumbai"],
  "new york": ["New York"],
  nyc: ["New York"],
  london: ["London"],
  tokyo: ["Tokyo"],
  kyoto: ["Kyoto"],
  osaka: ["Osaka"],
  bali: ["Bali"],
  dubai: ["Dubai"],
  singapore: ["Singapore"],
  amsterdam: ["Amsterdam"],
  "new delhi": ["New Delhi"],
  delhi: ["New Delhi"],
  jaipur: ["Jaipur"],
  thai: ["Bangkok"],
  bangkok: ["Bangkok"],
  greece: ["Athens", "Santorini"],
  athens: ["Athens"],
}

function extractCityNames(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const cityNames = new Set<string>()

  for (const [keyword, cities] of Object.entries(DESTINATION_KEYWORDS)) {
    if (lower.includes(keyword)) {
      cities.forEach(c => cityNames.add(c))
    }
  }

  // If nothing matched, return empty array (fallback will pick popular cities)
  return Array.from(cityNames)
}

function extractDays(prompt: string): number {
  const match = prompt.match(/(\d+)\s*(?:day|days|night|nights|week|weeks)/i)
  if (!match) return 7
  const num = parseInt(match[1])
  const unit = match[0].toLowerCase()
  if (unit.includes('week')) return num * 7
  return Math.min(Math.max(num, 1), 30)
}

export async function planWithAI(prompt: string): Promise<AIPlan> {
  // No auth needed for planning — it's just generating a preview
  const cityNameMatches = extractCityNames(prompt)
  const suggestedDays = extractDays(prompt)

  let cities
  if (cityNameMatches.length > 0) {
    cities = await prisma.city.findMany({
      where: { name: { in: cityNameMatches } },
      include: {
        activities: {
          take: 3,
          orderBy: { estimatedCost: 'asc' }
        }
      },
      take: 4
    })
  }

  // Fallback: pick popular cities if none matched
  if (!cities || cities.length === 0) {
    cities = await prisma.city.findMany({
      include: {
        activities: { take: 3, orderBy: { estimatedCost: 'asc' } },
        _count: { select: { tripStops: true } }
      },
      orderBy: { tripStops: { _count: 'desc' } },
      take: 3
    })
  }

  // Build a friendly title
  const cityNamesForTitle = cities.map(c => c.name)
  const title = cityNamesForTitle.length === 1
    ? `${suggestedDays}-Day ${cityNamesForTitle[0]} Adventure`
    : cityNamesForTitle.length === 2
    ? `${cityNamesForTitle[0]} & ${cityNamesForTitle[1]} Explorer`
    : `${cityNamesForTitle[0]}, ${cityNamesForTitle[1]} & Beyond`

  const description = `An AI-crafted ${suggestedDays}-day journey across ${cities.length} incredible destinations, curated to give you the best local experiences.`

  return {
    title,
    description,
    suggestedDays,
    cities: cities.map(city => ({
      cityId: city.id,
      cityName: city.name,
      country: city.country,
      imageUrl: city.imageUrl ?? null,
      activities: city.activities.map(a => ({
        activityId: a.id,
        name: a.name,
        category: a.category,
        estimatedCost: a.estimatedCost,
        description: a.description ?? null
      }))
    }))
  }
}

export async function generateAITrip(
  plan: AIPlan,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; tripId?: string; error?: string }> {
  const session = await requireAuth()
  const userId = session.user!.id!

  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalMs = end.getTime() - start.getTime()
  const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)))
  const daysPerCity = Math.max(1, Math.floor(totalDays / plan.cities.length))

  // Create the trip
  const trip = await prisma.trip.create({
    data: {
      userId,
      title: plan.title,
      description: plan.description,
      startDate: start,
      endDate: end,
      budget: {
        create: {
          totalBudget: 0,
          transportBudget: 0,
          stayBudget: 0,
          activityBudget: 0,
          mealBudget: 0,
        }
      }
    }
  })

  // Create stops and activities
  for (let i = 0; i < plan.cities.length; i++) {
    const cityPlan = plan.cities[i]
    const stopStart = new Date(start.getTime() + i * daysPerCity * 24 * 60 * 60 * 1000)
    const stopEnd = new Date(stopStart.getTime() + daysPerCity * 24 * 60 * 60 * 1000)

    const stop = await prisma.tripStop.create({
      data: {
        tripId: trip.id,
        cityId: cityPlan.cityId,
        orderIndex: i,
        arrivalDate: stopStart,
        departureDate: i === plan.cities.length - 1 ? end : stopEnd,
      }
    })

    for (let j = 0; j < cityPlan.activities.length; j++) {
      await prisma.tripActivity.create({
        data: {
          tripStopId: stop.id,
          activityId: cityPlan.activities[j].activityId,
          orderIndex: j,
          customCost: cityPlan.activities[j].estimatedCost,
        }
      })
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/trips')
  return { success: true, tripId: trip.id }
}
