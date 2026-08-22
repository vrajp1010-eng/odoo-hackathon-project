import Link from 'next/link'
import { Map, Wallet, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { getPopularCities } from '@/actions/catalog-actions'
import { DestinationCard, HorizontalScroller } from '@/components/destination-card'
import { HeroSearch } from '@/components/hero-search'
import { HERO_IMAGES } from '@/lib/media'

const FALLBACK_CITIES = [
  { id: '1', name: 'Paris', country: 'France', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e917407431b?w=800&q=80' },
  { id: '2', name: 'Tokyo', country: 'Japan', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
  { id: '3', name: 'New York', country: 'USA', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80' },
  { id: '4', name: 'Santorini', country: 'Greece', imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69d2c56?w=800&q=80' },
]

export default async function LandingPage() {
  let popularCities: any[] = []
  try {
    popularCities = await getPopularCities()
  } catch {
    popularCities = FALLBACK_CITIES
  }

  if (!popularCities.length) popularCities = FALLBACK_CITIES

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <section className="relative flex min-h-[88vh] items-end pb-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGES.landing}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 md:px-6 md:pb-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Travel, designed</p>
          <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.95] text-white md:text-7xl">
            Plan journeys that feel like film.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            Multi-city itineraries, living budgets, and a community of travelers — in one calm, cinematic studio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonVariants({ size: 'lg', variant: 'accent' })}>
              Start planning
            </Link>
            <Link href="/dashboard" className={buttonVariants({ size: 'lg', variant: 'outline', className: 'border-white/30 bg-white/10 text-white hover:bg-white/20' })}>
              Explore trips
            </Link>
          </div>
          <div className="relative mt-16 translate-y-1/2">
            <HeroSearch />
          </div>
        </div>
      </section>

      <section className="bg-background pb-8 pt-28 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Regions</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Top regional selections</h2>
            </div>
          </div>
          <HorizontalScroller>
            {popularCities.map((city: any) => (
              <div key={city.id} className="w-[260px] snap-start">
                <DestinationCard
                  name={city.name}
                  country={city.country}
                  imageUrl={city.imageUrl}
                  href="/search"
                  meta={city._count?.activities ? `${city._count.activities} activities` : undefined}
                />
              </div>
            ))}
          </HorizontalScroller>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Inspiration</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Previous trips, reimagined</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularCities.slice(0, 6).map((city: any) => (
              <DestinationCard
                key={`prev-${city.id}`}
                name={`${city.name} escape`}
                country={city.country}
                imageUrl={city.imageUrl}
                href="/signup"
                meta="Sample itinerary"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            { icon: Map, title: 'Multi-city ateliers', copy: 'Compose stops like scenes — dates, notes, and activities in elevated cards.' },
            { icon: Wallet, title: 'Quiet budgets', copy: 'Inline spend tracking that stays out of the way until you need it.' },
            { icon: Users, title: 'Shared wanderlust', copy: 'Publish a trip and let friends follow the timeline as it unfolds.' },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="rounded-3xl border border-white/60 bg-card p-8 shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-border/60 bg-[#14120f] py-12 text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <span className="font-display text-lg font-bold text-white">GlobeTrotter</span>
          <p className="text-sm">© {new Date().getFullYear()} GlobeTrotter. Crafted for wanderers.</p>
        </div>
      </footer>
    </div>
  )
}
