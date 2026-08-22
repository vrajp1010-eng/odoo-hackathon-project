import { requireAuth } from '@/lib/auth-helpers'
import { getUserTrips } from '@/actions/trip-actions'
import { getPopularCities } from '@/actions/catalog-actions'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Calendar, MapPin, Navigation, Plus } from 'lucide-react'
import Image from 'next/image'

export default async function DashboardPage() {
  const session = await requireAuth()
  
  // Fetch data in parallel
  const [trips, popularCities] = await Promise.all([
    getUserTrips(),
    getPopularCities()
  ])
  
  const upcomingTrips = trips.filter(trip => trip.startDate && new Date(trip.startDate) >= new Date())
  
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name?.split(' ')[0] || 'Explorer'}!</h1>
          <p className="text-muted-foreground mt-1">Ready for your next adventure?</p>
        </div>
        <Link href="/trips/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Plan a New Trip
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Upcoming Trips</h2>
          <Link href="/trips" className={buttonVariants({ variant: "link" })}>View all</Link>
        </div>
        
        {upcomingTrips.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Navigation className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No upcoming trips</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">You don't have any trips planned for the future.</p>
              <Link href="/trips/new" className={buttonVariants({ variant: "outline" })}>Start Planning</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrips.map(trip => (
              <Card key={trip.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{trip.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <Calendar className="h-3 w-3" />
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'TBD'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'TBD'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    {trip.tripStops?.length || 0} destinations
                  </div>
                  <p className="text-sm line-clamp-2 mt-2">{trip.description}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/trips/${trip.id}`} className={buttonVariants({ className: "w-full" })}>View Itinerary</Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularCities.map(city => (
            <Card key={city.id} className="overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square relative overflow-hidden bg-muted">
                {city.imageUrl ? (
                  <Image 
                    src={city.imageUrl} 
                    alt={city.name} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-secondary">
                    <MapPin className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{city.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{city.country}</p>
                <div className="text-xs mt-2 pt-2 border-t text-muted-foreground">
                  {city._count?.activities || 0} activities
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
