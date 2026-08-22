import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { getTrip } from '@/actions/trip-actions'
import { TripDetailClient } from '@/components/trip-detail-client'

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAuth()
  
  const trip = await getTrip(id)
  
  if (!trip) {
    notFound()
  }
  
  return <TripDetailClient initialTrip={trip} />
}
