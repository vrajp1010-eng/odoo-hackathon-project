// Trip Health Score — pure deterministic function, no DB queries
// Returns a score 0–100 plus labeled breakdown

export type ScoreBreakdownItem = {
  label: string
  points: number  // positive = bonus, negative = deduction
  tip: string
}

export type TripScoreResult = {
  score: number          // 0–100
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs Work'
  color: string          // Tailwind color class for the ring
  breakdown: ScoreBreakdownItem[]
}

export function calculateTripScore(trip: any): TripScoreResult {
  let score = 100
  const breakdown: ScoreBreakdownItem[] = []

  // --- Dates completeness ---
  if (!trip.startDate || !trip.endDate) {
    score -= 10
    breakdown.push({ label: 'Missing dates', points: -10, tip: 'Add start and end dates to your trip.' })
  }

  // --- Description ---
  if (!trip.description || trip.description.trim().length < 10) {
    score -= 5
    breakdown.push({ label: 'No description', points: -5, tip: 'Add a description to remember why you planned this trip.' })
  }

  // --- Budget ---
  const totalBudget = trip.budget?.totalBudget ?? 0
  if (totalBudget === 0) {
    score -= 10
    breakdown.push({ label: 'No budget set', points: -10, tip: 'Set a total budget to track spending.' })
  } else {
    // Calculate total spent from activities
    const totalSpent = (trip.tripStops ?? []).reduce((acc: number, stop: any) => {
      return acc + (stop.tripActivities ?? []).reduce((s: number, a: any) => s + (a.customCost ?? 0), 0)
    }, 0)
    if (totalSpent > totalBudget) {
      score -= 20
      breakdown.push({ label: 'Over budget!', points: -20, tip: `You are $${(totalSpent - totalBudget).toFixed(0)} over your total budget.` })
    } else if (totalSpent > totalBudget * 0.9) {
      score -= 5
      breakdown.push({ label: 'Near budget limit', points: -5, tip: 'You are close to your total budget.' })
    }
  }

  // --- Stops coverage ---
  const stops = trip.tripStops ?? []
  if (stops.length === 0) {
    score -= 15
    breakdown.push({ label: 'No destinations', points: -15, tip: 'Add at least one city destination.' })
  } else {
    // Check each stop has at least 1 activity
    let stopsWithNoActivity = 0
    let stopsWithTooManyActivities = 0

    for (const stop of stops) {
      const activityCount = (stop.tripActivities ?? []).length
      if (activityCount === 0) {
        stopsWithNoActivity++
      }
      // Penalize more than 5 activities per stop (per day estimate)
      const days = (() => {
        if (!stop.arrivalDate || !stop.departureDate) return 1
        const diff = new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()
        return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
      })()
      if (activityCount > days * 5) {
        stopsWithTooManyActivities++
      }
    }

    if (stopsWithNoActivity > 0) {
      const deduction = stopsWithNoActivity * 5
      score -= deduction
      breakdown.push({
        label: `${stopsWithNoActivity} stop${stopsWithNoActivity > 1 ? 's' : ''} without activities`,
        points: -deduction,
        tip: 'Add activities to all your destinations.'
      })
    }

    if (stopsWithTooManyActivities > 0) {
      const deduction = stopsWithTooManyActivities * 5
      score -= deduction
      breakdown.push({
        label: 'Overpacked schedule',
        points: -deduction,
        tip: 'You have more than 5 activities per day — consider slowing down!'
      })
    }

    // Bonus for multi-city trip
    if (stops.length >= 3) {
      score += 5
      breakdown.push({ label: 'Multi-city explorer', points: 5, tip: 'Great mix of destinations!' })
    }
  }

  // Clamp score
  score = Math.min(100, Math.max(0, score))

  // Label
  let label: TripScoreResult['label'] = 'Needs Work'
  let color = 'text-red-500'
  if (score >= 85) { label = 'Excellent'; color = 'text-green-500' }
  else if (score >= 70) { label = 'Good'; color = 'text-blue-500' }
  else if (score >= 50) { label = 'Fair'; color = 'text-amber-500' }

  return { score, label, color, breakdown }
}
