'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Globe Trotter</span>
          </Link>
        </div>
        
        <Card className="shadow-lg border-none">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              
              {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {state.error}
                </div>
              )}
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <div className="mt-2 text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
