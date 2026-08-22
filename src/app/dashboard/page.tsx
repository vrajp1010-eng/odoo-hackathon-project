import { requireAuth } from '@/lib/auth-helpers'
import { getUserTrips } from '@/actions/trip-actions'
import { getPopularCities } from '@/actions/catalog-actions'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Navigation, Plus, TrendingUp, Globe, Sparkles, ArrowRight, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const session = await requireAuth()
  
  const [trips, popularCities] = await Promise.all([
    getUserTrips(),
    getPopularCities()
  ])

  const now = new Date()
  const upcomingTrips = trips.filter(t => t.startDate && new Date(t.startDate) >= now)
  const nextTrip = upcomingTrips[0] ?? null
  const countriesVisited = new Set(
    trips.flatMap(t => t.tripStops?.map(s => s.city?.country ?? '') ?? [])
  ).size

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white">
        {/* decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          {/* Greeting */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-widest">Travel Command Center</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back, {session.user.name?.split(' ')[0] || 'Explorer'}! ✈️
              </h1>
            </div>
            <Link href="/trips/new" className={buttonVariants({ variant: 'secondary', className: 'shrink-0 font-semibold' })}>
              <Plus className="mr-2 h-4 w-4" />
              Plan a New Trip
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total Trips', value: trips.length, icon: Navigation },
              { label: 'Upcoming', value: upcomingTrips.length, icon: Calendar },
              { label: 'Countries', value: countriesVisited, icon: Globe },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <Icon className="h-5 w-5 mx-auto mb-1 text-indigo-200" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-indigo-200 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Next Adventure hero card */}
          {nextTrip ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">Your Next Adventure</p>
                <h2 className="text-2xl font-bold truncate">{nextTrip.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-indigo-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {nextTrip.startDate ? new Date(nextTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {nextTrip.tripStops?.length ?? 0} {nextTrip.tripStops?.length === 1 ? 'stop' : 'stops'}
                  </span>
                </div>
              </div>
              <Link
                href={`/trips/${nextTrip.id}`}
                className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'shrink-0 font-semibold' })}
              >
                View Itinerary <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
              <Navigation className="h-10 w-10 mx-auto mb-3 text-indigo-200 opacity-70" />
              <h2 className="text-xl font-semibold mb-1">No upcoming trips yet</h2>
              <p className="text-indigo-200 text-sm mb-4">Your next adventure is just one click away.</p>
              <Link href="/trips/new" className={buttonVariants({ variant: 'secondary', className: 'font-semibold' })}>
                <Plus className="mr-2 h-4 w-4" /> Start Planning
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* AI COPILOT PLACEHOLDER — AiCopilot component will be added in Phase 2 */}
        <AiCopilotSection />

        {/* My Trips */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">My Trips</h2>
              <p className="text-muted-foreground text-sm mt-0.5">{trips.length} trip{trips.length !== 1 ? 's' : ''} in your collection</p>
            </div>
            <Link href="/trips" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>

          {trips.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <Navigation className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold">No trips yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
                  Start planning your first multi-city adventure.
                </p>
                <Link href="/trips/new" className={buttonVariants()}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Trip
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trips.slice(0, 6).map((trip, i) => {
                const firstCity = trip.tripStops?.[0]?.city
                const isUpcoming = trip.startDate && new Date(trip.startDate) >= now
                const isPast = trip.endDate && new Date(trip.endDate) < now
                return (
                  <Card key={trip.id} className="group overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-border/60">
                    {/* City image banner */}
                    <div className="h-32 relative bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
                      {firstCity?.imageUrl ? (
                        <Image
                          src={firstCity.imageUrl}
                          alt={firstCity.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                          {trip.tripStops?.length ?? 0} stop{(trip.tripStops?.length ?? 0) !== 1 ? 's' : ''}
                        </Badge>
                        {isUpcoming && (
                          <Badge className="bg-green-500/80 text-white border-0 text-xs">
                            Upcoming
                          </Badge>
                        )}
                        {isPast && (
                          <Badge className="bg-slate-500/80 text-white border-0 text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-base font-bold leading-snug group-hover:text-primary transition-colors">{trip.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3 w-3" />
                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                        {trip.endDate && ` – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 pb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {trip.tripStops?.slice(0, 3).map(stop => (
                          <span key={stop.id} className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />{stop.city?.name ?? 'Unknown'}
                          </span>
                        ))}
                        {(trip.tripStops?.length ?? 0) > 3 && (
                          <span className="text-xs text-muted-foreground">+{(trip.tripStops?.length ?? 0) - 3} more</span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 pb-4">
                      <Link href={`/trips/${trip.id}`} className={buttonVariants({ size: 'sm', className: 'w-full' })}>
                        Open Itinerary <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* Popular Destinations */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight">Discover Destinations</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Most popular cities among Globe Trotter travelers</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {popularCities.map(city => (
              <div key={city.id} className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer">
                {city.imageUrl ? (
                  <Image
                    src={city.imageUrl}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white font-semibold text-sm leading-tight">{city.name}</p>
                  <p className="text-white/70 text-xs">{city._count?.activities ?? 0} activities</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// Placeholder that will be replaced when AiCopilot component is wired in
function AiCopilotSection() {
  return (
    <section className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-base">AI Travel Copilot</h3>
          <p className="text-xs text-muted-foreground">Let AI plan your perfect itinerary</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Loading AI Copilot...</p>
    </section>
  )
}
