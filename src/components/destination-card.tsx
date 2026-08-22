import Link from 'next/link'
import { FALLBACK_CITY } from '@/lib/media'

export function DestinationCard({
  name,
  country,
  imageUrl,
  href,
  meta,
}: {
  name: string
  country?: string
  imageUrl?: string | null
  href?: string
  meta?: string
}) {
  const content = (
    <article className="group relative h-64 min-w-[240px] overflow-hidden rounded-3xl shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl || FALLBACK_CITY}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-xl font-bold text-white">{name}</h3>
        {country && <p className="mt-0.5 text-sm text-white/75">{country}</p>}
        {meta && <p className="mt-2 text-xs font-medium uppercase tracking-widest text-white/60">{meta}</p>}
      </div>
    </article>
  )

  if (href) {
    return <Link href={href} className="block shrink-0">{content}</Link>
  }
  return <div className="shrink-0">{content}</div>
}

export function HorizontalScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="hide-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:px-0">
      {children}
    </div>
  )
}
