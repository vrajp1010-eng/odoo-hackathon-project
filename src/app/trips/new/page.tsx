'use client'

import { useActionState, useEffect } from 'react'
import { createTrip } from '@/actions/trip-actions'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const initialState = {
  success: false,
  error: undefined,
  tripId: undefined
}

export default function NewTripPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createTrip, initialState)
  
  useEffect(() => {
    if (state.success && state.tripId) {
      router.push(`/trips/${state.tripId}`)
    }
  }, [state, router])

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Link href="/trips" className={buttonVariants({ variant: 'ghost', className: 'mb-6 -ml-4' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Trips
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Plan a New Trip</CardTitle>
          <CardDescription>
            Give your adventure a name and dates to get started with your itinerary.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            {state.error && !state.success && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                {state.error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Trip Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g. Summer in Europe, Tokyo 2025" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  name="endDate" 
                  type="date" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="What is this trip about?" 
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Link href="/trips" className={buttonVariants({ variant: 'outline' })}>
              Cancel
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Trip
            </Button>
          </CardFooter>
        </form>
      </Card>


    </div>
  )
}
