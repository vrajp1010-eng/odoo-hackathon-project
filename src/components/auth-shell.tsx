import Link from 'next/link'
import { HERO_IMAGES } from '@/lib/media'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGES.auth}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <Link href="/" className="mb-8 font-display text-2xl font-bold tracking-tight text-white">
          GlobeTrotter
        </Link>
        {children}
      </div>
    </div>
  )
}
