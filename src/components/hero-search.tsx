'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [when, setWhen] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (when) params.set('when', when)
        router.push(`/search?${params.toString()}`)
      }}
      className="mx-auto w-full max-w-3xl rounded-3xl border border-white/40 bg-white/85 p-2 shadow-xl shadow-black/10 backdrop-blur-md sm:p-3"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="flex items-center gap-3 rounded-2xl px-4 py-2">
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where to next?"
            className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </label>
        <label className="flex items-center gap-3 rounded-2xl px-4 py-2 sm:min-w-[180px]">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            type="date"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </label>
        <Button type="submit" variant="accent" className="h-12 w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  )
}
