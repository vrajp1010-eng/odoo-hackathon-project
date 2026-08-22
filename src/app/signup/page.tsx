'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signup } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth-shell'
import { Camera } from 'lucide-react'

const initialState = {
  error: undefined,
  success: false
}

export default function SignupPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-3xl border border-white/25 bg-white/15 p-8 shadow-xl shadow-black/20 backdrop-blur-md">
        <div className="mb-6 text-center">
          <label className="group relative mx-auto mb-5 flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/10 shadow-xl shadow-black/20 transition-all duration-300 hover:scale-105">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-7 w-7 text-white/80" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setPreview(URL.createObjectURL(file))
              }}
            />
          </label>
          <h1 className="font-display text-3xl font-bold text-white">Join the journey</h1>
          <p className="mt-2 text-sm text-white/70">A photo is optional — your next trip is not.</p>
        </div>

        {state?.success ? (
          <div className="rounded-2xl bg-emerald-400/20 p-5 text-center text-white">
            <p className="font-semibold">Account created</p>
            <p className="mt-1 text-sm text-white/80">Redirecting you to login…</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Full name</Label>
              <Input id="name" name="name" placeholder="Ada Lovelace" required className="border-white/20 bg-white/90" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@wander.com" required className="border-white/20 bg-white/90" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Input id="password" name="password" type="password" required className="border-white/20 bg-white/90" />
            </div>

            {state?.error && !state.success && (
              <div className="rounded-2xl bg-red-500/20 p-3 text-sm text-red-50">
                {state.error}
              </div>
            )}

            <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white/70">
          Already wandering?{' '}
          <Link href="/login" className="font-semibold text-white underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
