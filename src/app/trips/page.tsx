import { requireAuth } from '@/lib/auth-helpers'
import { getUserTrips } from '@/actions/trip-actions'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Navigation } from 'lucide-react'
import { TripCard } from '@/components/trip-card'

export default async function TripsPage() {
  await requireAuth()
  const trips = await getUserTrips()
  
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming and past adventures</p>
        </div>
        <Link href="/trips/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Trip
        </Link>
      </div>
      
      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg bg-card/50">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Navigation className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No trips yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven't planned any trips yet. Start building your itinerary, finding activities, and managing your budget.
          </p>
          <Link href="/trips/new" className={buttonVariants({ size: 'lg' })}>
            Start Planning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
