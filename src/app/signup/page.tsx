'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signup } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from 'lucide-react'

const initialState = {
  error: undefined,
  success: false
}

export default function SignupPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signup, initialState)

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 2000)
      return () => clearTimeout(timer)
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
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your details to start planning your journeys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.success ? (
              <div className="text-center py-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 border border-green-200">
                  <h3 className="font-bold text-lg mb-1">Success!</h3>
                  <p>{'Account created successfully.'}</p>
                </div>
                <p className="text-sm text-gray-600">Redirecting to login...</p>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                  />
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                
                {state?.error && !state.success && (
                  <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-md border border-red-100">
                    {state.error}
                  </div>
                )}
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                  {isPending ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <div className="mt-2 text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
