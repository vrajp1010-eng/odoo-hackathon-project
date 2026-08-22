import { requireAuth } from '@/lib/auth-helpers'
import { getUserTrips } from '@/actions/trip-actions'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TRIP_COLORS = [
  'bg-indigo-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-violet-500',
]

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  await requireAuth()
  const trips = await getUserTrips()
  const params = await searchParams

  const now = new Date()
  const currentMonth = params.month ? parseInt(params.month) : now.getMonth()
  const currentYear = params.year ? parseInt(params.year) : now.getFullYear()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Build trip events for this month
  const tripEvents = trips.map((trip, i) => {
    const start = trip.startDate ? new Date(trip.startDate) : null
    const end = trip.endDate ? new Date(trip.endDate) : null
    return { ...trip, start, end, color: TRIP_COLORS[i % TRIP_COLORS.length] }
  }).filter(t => t.start || t.end)

  function getTripsForDay(day: number) {
    const date = new Date(currentYear, currentMonth, day)
    return tripEvents.filter(t => {
      if (!t.start) return false
      const s = new Date(t.start.getFullYear(), t.start.getMonth(), t.start.getDate())
      const e = t.end ? new Date(t.end.getFullYear(), t.end.getMonth(), t.end.getDate()) : s
      return date >= s && date <= e
    })
  }

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Plan</p>
        <h1 className="mt-1 font-display text-4xl font-bold">Travel Calendar</h1>
        <p className="mt-2 text-muted-foreground">See all your trips at a glance.</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-xl shadow-black/5">
        <Link
          href={`/calendar?month=${prevMonth}&year=${prevYear}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h2 className="font-display text-xl font-bold">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <Link
          href={`/calendar?month=${nextMonth}&year=${nextYear}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-black/5">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {DAY_NAMES.map(day => (
            <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r bg-muted/20 p-2 sm:min-h-[100px]" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayTrips = getTripsForDay(day)
            const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()

            return (
              <div
                key={day}
                className={`min-h-[80px] border-b border-r p-2 sm:min-h-[100px] ${
                  isToday ? 'bg-primary/5' : ''
                }`}
              >
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                }`}>
                  {day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayTrips.slice(0, 2).map(trip => (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}`}
                      className={`block truncate rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${trip.color}`}
                    >
                      {trip.title}
                    </Link>
                  ))}
                  {dayTrips.length > 2 && (
                    <span className="block text-[10px] text-muted-foreground">+{dayTrips.length - 2} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Trip Legend */}
      {tripEvents.length > 0 && (
        <div className="rounded-2xl bg-card p-5 shadow-xl shadow-black/5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your trips</h3>
          <div className="flex flex-wrap gap-3">
            {tripEvents.map(trip => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${trip.color}`} />
                <span className="font-medium">{trip.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
