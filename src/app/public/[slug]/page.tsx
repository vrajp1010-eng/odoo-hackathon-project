import { getPublicTrip } from '@/actions/trip-actions'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { Calendar, MapPin, Clock, DollarSign, User, Globe, ArrowRight } from 'lucide-react'
import { ShareBar } from '@/components/share-bar'

const CATEGORY_BORDER: Record<string, string> = {
  sightseeing: 'border-l-blue-500',
  food: 'border-l-orange-500',
  adventure: 'border-l-green-500',
  culture: 'border-l-purple-500',
  nature: 'border-l-emerald-500',
  shopping: 'border-l-pink-500',
}

function getCategoryBorder(category: string): string {
  return CATEGORY_BORDER[category?.toLowerCase()] ?? 'border-l-slate-400'
}

const CATEGORY_BADGE: Record<string, string> = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-green-100 text-green-700',
  culture: 'bg-purple-100 text-purple-700',
  nature: 'bg-emerald-100 text-emerald-700',
  shopping: 'bg-pink-100 text-pink-700',
}

function getCategoryBadge(category: string): string {
  return CATEGORY_BADGE[category?.toLowerCase()] ?? 'bg-slate-100 text-slate-700'
}

export default async function PublicTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const trip = await getPublicTrip(slug)

  if (!trip) {
    notFound()
  }

  const heroCity = trip.tripStops?.[0]?.city
  const heroImage = heroCity?.imageUrl ?? null

  const totalActivities = trip.tripStops?.reduce((sum, stop) => sum + (stop.tripActivities?.length ?? 0), 0) ?? 0
  const totalCost = trip.tripStops?.reduce((sum, stop) =>
    sum + (stop.tripActivities?.reduce((s, a) => s + (a.customCost ?? 0), 0) ?? 0), 0
  ) ?? 0

  return (
    <div className="min-h-screen bg-white">
      {/* ===== CINEMATIC HERO ===== */}
      <div className="relative h-[75vh] min-h-[480px] max-h-[700px] w-full overflow-hidden">
        {/* Background image */}
        {heroImage ? (
          <Image
            src={heroImage}
            alt={heroCity?.name ?? trip.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          // Premium gradient fallback — deep indigo to violet, no image needed
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
        )}

        {/* Multi-layer cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16 max-w-5xl">
          {/* Meta pill */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">
              <Globe className="h-3 w-3" /> Public Itinerary
            </span>
            {trip.tripStops && trip.tripStops.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">
                <MapPin className="h-3 w-3" /> {trip.tripStops.length} {trip.tripStops.length === 1 ? 'destination' : 'destinations'}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-2xl">
            {trip.title}
          </h1>

          {/* Sub-info row */}
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            {trip.user?.name && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                  {trip.user.image ? (
                    <Image src={trip.user.image} alt={trip.user.name} width={28} height={28} className="rounded-full" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <span>by {trip.user.name}</span>
              </div>
            )}
            {(trip.startDate || trip.endDate) && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {trip.startDate ? format(new Date(trip.startDate), 'MMM d') : '?'}
                  {' – '}
                  {trip.endDate ? format(new Date(trip.endDate), 'MMM d, yyyy') : '?'}
                </span>
              </div>
            )}
            {totalActivities > 0 && (
              <div className="flex items-center gap-1.5">
                <span>✦ {totalActivities} activities</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== TRIP OVERVIEW STRIP ===== */}
      {(trip.budget?.totalBudget || totalCost > 0 || trip.description) && (
        <div className="bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {trip.description && (
              <div className="md:col-span-2">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">About This Trip</p>
                <p className="text-slate-200 leading-relaxed">{trip.description}</p>
              </div>
            )}
            {(trip.budget?.totalBudget || totalCost > 0) && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Budget Overview</p>
                <div className="space-y-2">
                  {trip.budget?.totalBudget ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Total Budget</span>
                      <span className="font-bold">${trip.budget.totalBudget.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {totalCost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Est. Activities</span>
                      <span className="font-bold">${totalCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CITY STOPS ===== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">
        {trip.tripStops?.map((stop, index) => (
          <section key={stop.id} className="relative">
            {/* City Header */}
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8">
              {stop.city?.imageUrl ? (
                <Image
                  src={stop.city.imageUrl}
                  alt={stop.city?.name ?? 'City'}
                  fill
                  className="object-cover"
                />
              ) : (
                // Premium gradient fallback per stop
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  index % 4 === 0 ? 'from-indigo-800 to-purple-900' :
                  index % 4 === 1 ? 'from-rose-800 to-orange-900' :
                  index % 4 === 2 ? 'from-teal-800 to-cyan-900' :
                                     'from-amber-800 to-yellow-900'
                }`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 flex items-end gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-black text-white">{index + 1}</span>
                </div>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest mb-0.5">Stop {index + 1}</p>
                  <h2 className="text-3xl font-black text-white">{stop.city?.name ?? 'Unknown City'}</h2>
                  {stop.city?.country && (
                    <p className="text-white/80 text-sm">{stop.city.country}</p>
                  )}
                </div>
              </div>
              {/* Date range */}
              {(stop.arrivalDate || stop.departureDate) && (
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-white text-xs">
                  <Calendar className="h-3 w-3" />
                  {stop.arrivalDate ? format(new Date(stop.arrivalDate), 'MMM d') : '?'}
                  {stop.departureDate && ` – ${format(new Date(stop.departureDate), 'MMM d')}`}
                </div>
              )}
            </div>

            {/* Activities */}
            {(!stop.tripActivities || stop.tripActivities.length === 0) ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-muted-foreground italic text-sm">No activities planned for this stop yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stop.tripActivities.map((activityInfo, actIndex) => (
                  <div
                    key={activityInfo.id}
                    className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 border-l-4 ${getCategoryBorder(activityInfo.activity?.category ?? '')}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base leading-tight">{activityInfo.activity?.name ?? 'Activity'}</h4>
                        {activityInfo.activity?.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activityInfo.activity.description}</p>
                        )}
                      </div>
                      {activityInfo.activity?.category && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${getCategoryBadge(activityInfo.activity.category)}`}>
                          {activityInfo.activity.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {(activityInfo.startTime || activityInfo.endTime) && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activityInfo.startTime ?? ''}  {activityInfo.endTime ? `– ${activityInfo.endTime}` : ''}
                        </span>
                      )}
                      {(activityInfo.customCost ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${activityInfo.customCost}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* ===== INSPIRED CTA ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-700 py-20 px-6">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto text-center space-y-5">
          <h3 className="text-3xl sm:text-4xl font-black text-white">Inspired by this trip?</h3>
          <p className="text-indigo-200 text-lg">
            Create your own personalized multi-city itinerary, set budgets, and share it with the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className={buttonVariants({ size: 'lg', variant: 'secondary', className: 'font-bold' })}
            >
              Start Planning Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/"
              className={buttonVariants({ size: 'lg', variant: 'outline', className: 'border-white/30 text-white hover:bg-white/10 font-semibold' })}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* ===== STICKY FLOATING SHARE BAR ===== */}
      <ShareBar tripTitle={trip.title} />
    </div>
  )
}
