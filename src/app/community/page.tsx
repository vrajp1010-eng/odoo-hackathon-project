import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Globe, ArrowRight } from 'lucide-react'
import { FALLBACK_CITY } from '@/lib/media'

export default async function CommunityPage() {
  const publicTrips = await prisma.trip.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { name: true, image: true } },
      tripStops: {
        include: { city: true },
        orderBy: { orderIndex: 'asc' },
        take: 3,
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Community</p>
        <h1 className="mt-1 font-display text-4xl font-bold">Travel inspiration</h1>
        <p className="mt-2 text-muted-foreground">Discover itineraries shared by fellow globe trotters.</p>
      </div>

      {publicTrips.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 py-20 text-center">
          <Globe className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold">No shared trips yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Be the first to share your itinerary with the community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {publicTrips.map((trip) => {
            const firstCity = trip.tripStops?.[0]?.city
            return (
              <div
                key={trip.id}
                className="group overflow-hidden rounded-3xl bg-card shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Hero image */}
                <div className="relative h-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firstCity?.imageUrl || FALLBACK_CITY}
                    alt={trip.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Author pill */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md">
                      {trip.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={trip.user.image} alt="" className="h-5 w-5 rounded-full" />
                      ) : (
                        <Users className="h-3.5 w-3.5 text-white" />
                      )}
                      <span className="text-xs font-medium text-white">{trip.user?.name ?? 'Traveler'}</span>
                    </div>
                  </div>
                  {/* Destination tags */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {trip.tripStops?.map((stop) => (
                      <Badge key={stop.id} className="bg-white/20 text-white border-0 backdrop-blur-md text-xs">
                        <MapPin className="mr-1 h-2.5 w-2.5" />
                        {stop.city?.name ?? 'Unknown'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold">{trip.title}</h3>
                  {trip.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{trip.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {trip.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span>{trip.tripStops?.length ?? 0} destinations</span>
                  </div>
                  <div className="mt-4">
                    {trip.publicSlug ? (
                      <Link
                        href={`/public/${trip.publicSlug}`}
                        className={buttonVariants({ size: 'sm', className: 'w-full' })}
                      >
                        View itinerary <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/public/${trip.id}`}
                        className={buttonVariants({ size: 'sm', className: 'w-full' })}
                      >
                        View itinerary <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
