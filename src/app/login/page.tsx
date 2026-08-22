'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth-shell'

const initialState = {
  error: undefined,
  success: false
}

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, initialState)

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard')
    }
  }, [state?.success, router])

  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-3xl border border-white/25 bg-white/15 p-8 shadow-xl shadow-black/20 backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-white/70">Sign in to continue your itinerary.</p>
        </div>
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@wander.com"
              required
              className="border-white/20 bg-white/90"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <span className="text-xs text-white/50">Forgot?</span>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="border-white/20 bg-white/90"
            />
          </div>

          {state?.error && (
            <div className="rounded-2xl bg-red-500/20 p-3 text-sm text-red-50">
              {state.error}
            </div>
          )}

          <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Log in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/70">
          New here?{' '}
          <Link href="/signup" className="font-semibold text-white underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
