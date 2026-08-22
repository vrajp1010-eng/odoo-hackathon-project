'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { planWithAI, generateAITrip, type AIPlan } from '@/actions/ai-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Send, MapPin, DollarSign, Loader2, CheckCircle2, X } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-green-100 text-green-700',
  culture: 'bg-purple-100 text-purple-700',
  nature: 'bg-emerald-100 text-emerald-700',
  shopping: 'bg-pink-100 text-pink-700',
  default: 'bg-slate-100 text-slate-700',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? CATEGORY_COLORS.default
}

function PlanSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <div className="h-6 animate-shimmer rounded-lg w-2/3" />
      <div className="h-4 animate-shimmer rounded-lg w-full" />
      <div className="h-4 animate-shimmer rounded-lg w-4/5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {[1, 2].map(i => (
          <div key={i} className="h-28 animate-shimmer rounded-xl" />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        <span>AI is crafting your perfect itinerary...</span>
      </div>
    </div>
  )
}

export function AiCopilot() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [plan, setPlan] = useState<AIPlan | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsThinking(true)
    setPlan(null)
    setError(null)

    // Simulate a 3-second thinking delay for the demo wow-factor
    await new Promise(res => setTimeout(res, 3000))

    try {
      const result = await planWithAI(prompt)
      setPlan(result)

      // Pre-fill suggested dates
      const today = new Date()
      const suggestedStart = new Date(today)
      suggestedStart.setDate(today.getDate() + 14) // 2 weeks from now
      const suggestedEnd = new Date(suggestedStart)
      suggestedEnd.setDate(suggestedStart.getDate() + result.suggestedDays)

      setStartDate(suggestedStart.toISOString().split('T')[0])
      setEndDate(suggestedEnd.toISOString().split('T')[0])
    } catch (err) {
      setError('Failed to generate plan. Please try again.')
    } finally {
      setIsThinking(false)
    }
  }

  const handleAccept = async () => {
    if (!plan || !startDate || !endDate) return
    setIsCreating(true)
    try {
      const result = await generateAITrip(plan, startDate, endDate)
      if (result.success && result.tripId) {
        router.push(`/trips/${result.tripId}`)
      } else {
        setError(result.error ?? 'Something went wrong')
        setIsCreating(false)
      }
    } catch (err) {
      setError('Failed to create trip. Are you logged in?')
      setIsCreating(false)
    }
  }

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Travel Copilot</h3>
          <p className="text-sm text-muted-foreground">Describe your dream trip — AI will plan it in seconds.</p>
        </div>
      </div>

      {/* Prompt Form */}
      {!plan && (
        <form onSubmit={handlePlan} className="space-y-3">
          <div className="relative">
            <textarea
              className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-muted-foreground min-h-[72px] shadow-sm"
              placeholder="e.g. 10 days in Japan and South Korea, mix of temples and food culture"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              disabled={isThinking}
            />
          </div>
          <div className="flex gap-2">
            {['7 days in Japan', 'Europe in 2 weeks', '5 nights in Bali'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            disabled={isThinking || !prompt.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold"
          >
            {isThinking ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Plan with AI</>
            )}
          </Button>
        </form>
      )}

      {/* Skeleton loader */}
      {isThinking && <PlanSkeleton />}

      {/* Error */}
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Plan Preview */}
      {plan && !isThinking && (
        <div className="mt-4 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h4 className="font-bold text-base">{plan.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 ml-7">{plan.description}</p>
            </div>
            <button
              onClick={() => { setPlan(null); setPrompt('') }}
              className="p-1 rounded-lg hover:bg-indigo-100 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* City Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {plan.cities.map((city, i) => (
              <div key={city.cityId} className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{i + 1}</div>
                  <div>
                    <p className="font-semibold text-sm">{city.cityName}</p>
                    <p className="text-xs text-muted-foreground">{city.country}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {city.activities.slice(0, 2).map(act => (
                    <div key={act.activityId} className="flex items-center justify-between">
                      <span className="text-xs text-foreground/80 truncate flex-1 mr-2">{act.name}</span>
                      <Badge className={`text-xs ${getCategoryColor(act.category)} border-0 shrink-0`}>{act.category}</Badge>
                    </div>
                  ))}
                  {city.activities.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{city.activities.length - 2} more activities</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Date pickers */}
          <div className="bg-white rounded-xl border border-indigo-100 p-4 mb-4">
            <p className="text-sm font-medium mb-3">Set your travel dates</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setPlan(null); setPrompt('') }}
              disabled={isCreating}
              className="flex-1"
            >
              Regenerate
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isCreating || !startDate || !endDate}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold"
            >
              {isCreating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Accept & Create Trip</>
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
