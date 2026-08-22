'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, User, LogOut, Search } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Explore' },
  { href: '/trips', label: 'Trips' },
  { href: '/search', label: 'Search' },
  { href: '/community', label: 'Community' },
  { href: '/calendar', label: 'Calendar' },
]

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const hide = pathname === '/login' || pathname === '/signup'
  if (hide) return null

  const transparent = pathname === '/'

  return (
    <header
      className={cn(
        'z-50 border-b',
        transparent
          ? 'absolute inset-x-0 top-0 border-white/10 bg-transparent text-white'
          : 'sticky top-0 border-white/40 bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          GlobeTrotter
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-all duration-300 hover:opacity-100',
                pathname.startsWith(link.href) ? 'opacity-100' : 'opacity-70'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'hidden sm:inline-flex' })}
          >
            <Search className="h-4 w-4" />
          </Link>
          {status === 'loading' ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-black/10" />
          ) : session ? (
            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Avatar className="h-9 w-9 ring-2 ring-white/50">
                  {session.user?.image ? (
                    <AvatarImage src={session.user.image} alt={session.user?.name || 'User'} />
                  ) : null}
                  <AvatarFallback className="bg-accent/15 text-accent">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-white/60 bg-white/95 py-1 text-foreground shadow-xl shadow-black/10 backdrop-blur-md">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold">{session.user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin
                    </Link>
                    <button
                      className="flex w-full items-center px-4 py-2.5 text-sm text-destructive hover:bg-secondary"
                      onClick={() => {
                        setIsDropdownOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Link href="/login" className={buttonVariants({ variant: transparent ? 'ghost' : 'ghost' })}>
                Login
              </Link>
              <Link href="/signup" className={buttonVariants({ variant: transparent ? 'secondary' : 'default' })}>
                Sign up
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-1 border-t border-white/20 bg-white px-4 py-4 text-foreground md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-2xl px-3 py-2.5 text-base font-medium hover:bg-secondary"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!session && (
            <div className="mt-3 flex flex-col gap-2 border-t pt-3">
              <Link href="/login" className={buttonVariants({ variant: 'outline' })} onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link href="/signup" className={buttonVariants()} onClick={() => setIsOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
