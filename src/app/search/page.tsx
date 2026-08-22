import { searchCities, searchActivities } from '@/actions/catalog-actions'
import { requireAuth } from '@/lib/auth-helpers'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Clock, Search as SearchIcon } from 'lucide-react'
import { FALLBACK_CITY } from '@/lib/media'
import { SearchFilters } from './search-filters'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  await requireAuth()
  const { q = '', tab = 'cities' } = await searchParams

  const cities = await searchCities(q)

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Discover</p>
        <h1 className="mt-1 font-display text-4xl font-bold">Search destinations</h1>
        <p className="mt-2 text-muted-foreground">Find cities and activities to add to your trips.</p>
      </div>

      <SearchFilters initialQuery={q} />

      {/* Results */}
      {cities.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 py-20 text-center">
          <SearchIcon className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold">No destinations found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cities.map((city) => (
            <div
              key={city.id}
              className="group overflow-hidden rounded-3xl bg-card shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={city.imageUrl || FALLBACK_CITY}
                  alt={city.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{city.name}</h3>
                    <p className="text-sm text-white/70">{city.country}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-md text-xs">
                    {city._count?.activities ?? 0} activities
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Explore {city.name}&apos;s best experiences and add them to your next trip.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
