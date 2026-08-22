'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Trash2, Globe, Lock } from 'lucide-react'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteTrip } from '@/actions/trip-actions'

import { useToast } from '@/components/ui/toaster'

export function TripCard({ trip }: { trip: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTrip(trip.id)
      setDialogOpen(false)
      toast({ title: 'Trip Deleted', description: 'Your trip was removed.' })
      router.refresh()
    } catch (error) {
      console.error('Failed to delete trip', error)
      toast({ title: 'Error', description: 'Failed to delete trip.', variant: 'destructive' })
      setIsDeleting(false)
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
          <Badge variant={trip.isPublic ? "default" : "secondary"} className="shrink-0 flex items-center gap-1">
            {trip.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            <span className="sr-only sm:not-sr-only sm:inline-block text-[10px] uppercase">
              {trip.isPublic ? 'Public' : 'Private'}
            </span>
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 mt-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5" />
          {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          {trip.tripStops?.length || 0} cities planned
        </div>
        <p className="text-sm line-clamp-2 text-muted-foreground">{trip.description || 'No description provided.'}</p>
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Link href={`/trips/${trip.id}`} className={buttonVariants({ className: "flex-1" })}>
          View
        </Link>
        
        <Button variant="outline" size="icon" onClick={() => setDialogOpen(true)} className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete trip</span>
        </Button>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your trip
                "{trip.title}" and remove all associated data, stops, and activities.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
