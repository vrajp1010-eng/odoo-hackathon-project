import { format } from 'date-fns'
import { Clock, DollarSign, Footprints } from 'lucide-react'

type TimelineItem = {
  id: string
  title: string
  description?: string | null
  city: string
  startTime?: string | null
  endTime?: string | null
  cost: number
  category?: string | null
}

export function ItineraryTimeline({
  days,
}: {
  days: { key: string; label: string; city?: string; items: TimelineItem[] }[]
}) {
  if (!days.length) {
    return (
      <div className="rounded-3xl border border-dashed bg-card/50 py-16 text-center text-sm text-muted-foreground">
        No days on this itinerary yet.
      </div>
    )
  }

  return (
    <div className="relative space-y-12">
      {days.map((day, dayIndex) => (
        <section key={day.key} className="grid grid-cols-[72px_1fr] gap-4 sm:grid-cols-[100px_1fr] sm:gap-8">
          <div className="sticky top-24 self-start pt-1">
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xl shadow-black/15 sm:h-16 sm:w-16 sm:text-sm">
                {day.label}
              </div>
              {dayIndex < days.length - 1 && (
                <div className="mt-3 hidden h-full w-px bg-border sm:block" />
              )}
            </div>
          </div>
          <div className="relative space-y-4 border-l border-border/80 pl-6 sm:pl-8">
            {day.city && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{day.city}</p>
            )}
            {day.items.length === 0 ? (
              <p className="rounded-3xl bg-secondary/50 px-5 py-8 text-sm text-muted-foreground">A rest day — leave room for wandering.</p>
            ) : (
              day.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-white/60 bg-card p-5 shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                        <Footprints className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                    {item.category && (
                      <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {(item.startTime || item.endTime) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.startTime || 'Anytime'}
                        {item.endTime ? ` – ${item.endTime}` : ''}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      Expense ${item.cost.toFixed(2)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

export function formatDayLabel(date: Date | string, index: number) {
  try {
    return `Day ${index + 1}`
  } catch {
    return `Day ${index + 1}`
  }
}

export { format }
