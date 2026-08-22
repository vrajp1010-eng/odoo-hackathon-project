import { requireAuth } from '@/lib/auth-helpers'
import { getUserTrips } from '@/actions/trip-actions'
import { getPopularCities } from '@/actions/catalog-actions'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Navigation, Plus, TrendingUp, Globe, Sparkles, ArrowRight, Clock } from 'lucide-react'
import { AiCopilot } from '@/components/ai-copilot'
import { DestinationCard, HorizontalScroller } from '@/components/destination-card'
import { HeroSearch } from '@/components/hero-search'
import { HERO_IMAGES, FALLBACK_CITY } from '@/lib/media'
import { getTripStatus, tripStatusCopy } from '@/lib/trip-status'

export default async function DashboardPage() {
  const session = await requireAuth()

  const [trips, popularCities] = await Promise.all([
    getUserTrips(),
    getPopularCities()
  ])

  const previousTrips = trips.filter((t) => getTripStatus(t) === 'completed' || getTripStatus(t) === 'unscheduled')
  const nextTrip = trips.find((t) => getTripStatus(t) === 'upcoming' || getTripStatus(t) === 'ongoing') ?? null
  const countriesVisited = new Set(
    trips.flatMap(t => t.tripStops?.map(s => s.city?.country ?? '') ?? [])
  ).size

  return (
    <div className="min-h-screen overflow-x-hidden">
      <section className="relative flex min-h-[72vh] items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGES.dashboard} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-16 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Your studio</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-white md:text-6xl">
            Welcome back, {session.user.name?.split(' ')[0] || 'Explorer'}
          </h1>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {[
              { label: 'Trips', value: trips.length },
              { label: 'Upcoming', value: trips.filter(t => getTripStatus(t) === 'upcoming').length },
              { label: 'Countries', value: countriesVisited },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-md">
                <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-white/65">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="relative mt-12 translate-y-1/2">
            <HeroSearch />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pb-20 pt-24 md:px-6">
        {nextTrip && (
          <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-card p-6 shadow-xl shadow-black/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Next departure</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{nextTrip.title}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {nextTrip.startDate ? new Date(nextTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Dates open'}
              </p>
            </div>
            <Link href={`/trips/${nextTrip.id}`} className={buttonVariants({ variant: 'accent' })}>
              Open itinerary <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}

        <AiCopilot />

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Regions</p>
              <h2 className="mt-1 font-display text-3xl font-bold">Top regional selections</h2>
            </div>
            <Link href="/search" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Browse all</Link>
          </div>
          <HorizontalScroller>
            {popularCities.map((city) => (
              <div key={city.id} className="w-[250px] snap-start">
                <DestinationCard
                  name={city.name}
                  country={city.country}
                  imageUrl={city.imageUrl}
                  href="/search"
                  meta={`${city._count?.activities ?? 0} activities`}
                />
              </div>
            ))}
          </HorizontalScroller>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Previous trips</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your archive, still glowing.</p>
            </div>
            <Link href="/trips" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              View all
            </Link>
          </div>
          {previousTrips.length === 0 && trips.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
              <Globe className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="font-display text-xl font-semibold">No trips yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Start with a destination and we will shape the rest.</p>
              <Link href="/trips/new" className={buttonVariants({ variant: 'accent', className: 'mt-6' })}>
                <Plus className="mr-2 h-4 w-4" /> Plan a trip
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(previousTrips.length ? previousTrips : trips).slice(0, 6).map((trip) => {
                const firstCity = trip.tripStops?.[0]?.city
                const status = getTripStatus(trip)
                return (
                  <Link key={trip.id} href={`/trips/${trip.id}`} className="group overflow-hidden rounded-3xl bg-card shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={firstCity?.imageUrl || FALLBACK_CITY} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                        {tripStatusCopy[status]}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold">{trip.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {trip.tripStops?.length ?? 0} stops
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
