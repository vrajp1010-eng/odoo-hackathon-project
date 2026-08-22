import { requireAuth } from '@/lib/auth-helpers'
import { getUserTrips } from '@/actions/trip-actions'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Navigation } from 'lucide-react'
import { TripCard } from '@/components/trip-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTripStatus } from '@/lib/trip-status'

export default async function TripsPage() {
  await requireAuth()
  const trips = await getUserTrips()
  const ongoing = trips.filter(t => getTripStatus(t) === 'ongoing')
  const upcoming = trips.filter(t => getTripStatus(t) === 'upcoming')
  const completed = trips.filter(t => getTripStatus(t) === 'completed' || getTripStatus(t) === 'unscheduled')

  const Grid = ({ items }: { items: typeof trips }) =>
    items.length === 0 ? (
      <p className="py-12 text-center text-sm text-muted-foreground">Nothing in this chapter yet.</p>
    ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    )

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Library</p>
          <h1 className="mt-1 font-display text-4xl font-bold">My trips</h1>
          <p className="mt-2 text-muted-foreground">Ongoing, upcoming, and completed — in one collection.</p>
        </div>
        <Link href="/trips/new" className={buttonVariants({ variant: 'accent' })}>
          <Plus className="mr-2 h-4 w-4" />
          Create trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 py-24 text-center">
          <Navigation className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold">No trips yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Start building an itinerary, then come back to watch it live across these chapters.
          </p>
          <Link href="/trips/new" className={buttonVariants({ size: 'lg', variant: 'accent', className: 'mt-6' })}>
            Start planning
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="ongoing">Ongoing ({ongoing.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing" className="mt-8"><Grid items={ongoing} /></TabsContent>
          <TabsContent value="upcoming" className="mt-8"><Grid items={upcoming} /></TabsContent>
          <TabsContent value="completed" className="mt-8"><Grid items={completed} /></TabsContent>
        </Tabs>
      )}
    </div>
  )
}
