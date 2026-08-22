'use client'

import { useActionState, useEffect, useState } from 'react'
import { createTrip } from '@/actions/trip-actions'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DestinationCard } from '@/components/destination-card'

const initialState = {
  success: false,
  error: undefined,
  tripId: undefined
}

export function NewTripForm({ suggestions }: { suggestions: any[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createTrip, initialState)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (state.success && state.tripId) {
      router.push(`/trips/${state.tripId}`)
    }
  }, [state, router])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <Link href="/trips" className={buttonVariants({ variant: 'ghost', className: 'mb-8 -ml-3' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>

      <div className="mx-auto max-w-xl rounded-3xl border border-white/60 bg-card p-8 shadow-xl shadow-black/5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Create</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Plan a new trip</h1>
        <p className="mt-2 text-sm text-muted-foreground">Name it, set the window, then dress it with cities.</p>

        <form action={formAction} className="mt-8 space-y-6">
          {state.error && !state.success && (
            <div className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Trip title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer in Lisbon"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea id="description" name="description" placeholder="What is this trip about?" rows={4} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Link href="/trips" className={buttonVariants({ variant: 'outline' })}>
              Cancel
            </Link>
            <Button type="submit" variant="accent" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create trip
            </Button>
          </div>
        </form>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Suggestions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap a destination to name your trip after it.</p>
          <div className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {suggestions.map((city, i) => (
              <button
                key={city.id}
                type="button"
                className={`mb-5 w-full break-inside-avoid text-left ${i % 3 === 1 ? 'sm:translate-y-4' : ''}`}
                onClick={() => setTitle(`${city.name} with friends`)}
              >
                <DestinationCard name={city.name} country={city.country} imageUrl={city.imageUrl} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
