'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
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
import { FALLBACK_CITY } from '@/lib/media'
import { getTripStatus, tripStatusCopy } from '@/lib/trip-status'

export function TripCard({ trip }: { trip: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const cover = trip.tripStops?.[0]?.city?.imageUrl || FALLBACK_CITY
  const status = getTripStatus(trip)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTrip(trip.id)
      setDialogOpen(false)
      toast({ title: 'Trip Deleted', description: 'Your trip was removed.' })
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete trip.', variant: 'destructive' })
      setIsDeleting(false)
    }
  }

  return (
    <Card className="group flex flex-col overflow-hidden hover:-translate-y-1">
      <div className="relative h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="border-0 bg-white/20 text-white backdrop-blur-md">{tripStatusCopy[status]}</Badge>
          <Badge className="border-0 bg-black/30 text-white backdrop-blur-md">
            {trip.isPublic ? <Globe className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
            {trip.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug">{trip.title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Open dates'}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {trip.tripStops?.length || 0} cities
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{trip.description || 'No description yet.'}</p>
        <div className="mt-5 flex gap-2">
          <Link href={`/trips/${trip.id}`} className={buttonVariants({ className: 'flex-1' })}>
            View
          </Link>
          <Button variant="outline" size="icon" onClick={() => setDialogOpen(true)} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{trip.title}” and all stops, activities, and budget data.
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
    </Card>
  )
}
