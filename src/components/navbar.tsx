'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Globe, Menu, User, LogOut } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (pathname === '/') {
    return null
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">

          <span className="gradient-text font-extrabold text-xl tracking-tight">GlobeTrotter</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/trips" className="text-sm font-medium transition-colors hover:text-primary">
            My Trips
          </Link>
          <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : session ? (
            <div className="relative">
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full p-0"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Avatar className="h-8 w-8">
                  {session.user?.image ? (
                    <AvatarImage src={session.user.image} alt={session.user?.name || 'User'} />
                  ) : null}
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
              
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
            <div className="hidden md:flex gap-2">
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Login
              </Link>
              <Link href="/signup" className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white" })}>
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Nav Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4">
          <Link href="/dashboard" className="block text-base font-medium" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link href="/trips" className="block text-base font-medium" onClick={() => setIsOpen(false)}>
            My Trips
          </Link>
          <Link href="/profile" className="block text-base font-medium" onClick={() => setIsOpen(false)}>
            Profile
          </Link>
          
          {!session && (
            <div className="pt-4 border-t flex flex-col gap-2">
              <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full justify-start" })} onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link href="/signup" className={buttonVariants({ className: "w-full justify-start bg-blue-600 hover:bg-blue-700 text-white" })} onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
