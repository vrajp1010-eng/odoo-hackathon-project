import { getTrip } from '@/actions/trip-actions'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { format, eachDayOfInterval } from 'date-fns'
import { ItineraryTimeline } from '@/components/itinerary-timeline'

export default async function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = await getTrip(id)

  if (!trip) {
    notFound()
  }

  const itemsByDate = new Map<string, any[]>()
  let totalCost = 0

  trip.tripStops?.forEach((stop: any) => {
    stop.tripActivities?.forEach((ta: any) => {
      const dateKey = ta.date
        ? format(new Date(ta.date), 'yyyy-MM-dd')
        : stop.arrivalDate
          ? format(new Date(stop.arrivalDate), 'yyyy-MM-dd')
          : 'unscheduled'
      const cost = ta.customCost ?? ta.activity?.estimatedCost ?? 0
      totalCost += cost
      const list = itemsByDate.get(dateKey) ?? []
      list.push({
        id: ta.id,
        title: ta.activity?.name ?? 'Activity',
        description: ta.activity?.description,
        city: stop.city?.name ?? 'Unknown',
        startTime: ta.startTime,
        endTime: ta.endTime,
        cost,
        category: ta.activity?.category,
      })
      itemsByDate.set(dateKey, list)
    })
  })

  let days: { key: string; label: string; city?: string; items: any[] }[] = []
  if (trip.startDate && trip.endDate) {
    days = eachDayOfInterval({ start: new Date(trip.startDate), end: new Date(trip.endDate) }).map((d, i) => {
      const key = format(d, 'yyyy-MM-dd')
      const items = itemsByDate.get(key) ?? []
      return {
        key,
        label: `Day ${i + 1}`,
        city: items[0]?.city,
        items,
      }
    })
  } else {
    days = Array.from(itemsByDate.entries()).map(([key, items], i) => ({
      key,
      label: key === 'unscheduled' ? 'Open' : `Day ${i + 1}`,
      city: items[0]?.city,
      items,
    }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 md:px-8">
      <div className="print:hidden">
        <Link href={`/trips/${id}`} className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to trip
        </Link>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Itinerary</p>
        <h1 className="mt-2 font-display text-4xl font-bold">{trip.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {trip.startDate ? format(new Date(trip.startDate), 'MMM d, yyyy') : 'TBD'} — {trip.endDate ? format(new Date(trip.endDate), 'MMM d, yyyy') : 'TBD'}
        </p>
      </div>

      <ItineraryTimeline days={days} />

      <div className="rounded-3xl bg-primary px-6 py-8 text-center text-primary-foreground shadow-xl shadow-black/10">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">Estimated spend</p>
        <p className="mt-2 font-display text-3xl font-bold">${totalCost.toFixed(2)}</p>
      </div>
    </div>
  )
}
