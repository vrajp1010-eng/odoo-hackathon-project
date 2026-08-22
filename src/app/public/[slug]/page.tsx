import { getPublicTrip } from '@/actions/trip-actions';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, MapPin, Clock, DollarSign } from 'lucide-react';

export default async function PublicTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getPublicTrip(slug);

  if (!trip) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{trip.title}</h1>
          <p className="text-xl opacity-90">Planned by {trip.user?.name || 'A Globe Trotter user'}</p>
          <div className="flex items-center justify-center gap-2 text-lg pt-4">
            <Calendar className="w-5 h-5" />
            {trip.startDate ? format(new Date(trip.startDate), 'MMM d, yyyy') : 'TBD'} - {trip.endDate ? format(new Date(trip.endDate), 'MMM d, yyyy') : 'TBD'}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold border-b pb-2">Destinations & Activities</h2>
          
          {trip.tripStops?.map((stop: any, index: number) => (
            <div key={stop.id} className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                <MapPin className="w-6 h-6" />
                {stop.cityName}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {stop.activities?.map((activity: any) => (
                  <Card key={activity.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{activity.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {activity.date && (
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(activity.date), 'MMM d, yyyy')}
                        </div>
                      )}
                      {activity.startTime && (
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          {activity.startTime} {activity.endTime ? `- ${activity.endTime}` : ''}
                        </div>
                      )}
                      {activity.description && (
                        <p className="mt-2 text-foreground">{activity.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {(!stop.activities || stop.activities.length === 0) && (
                  <p className="text-muted-foreground italic">No activities planned yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-xl border text-center space-y-6 shadow-sm">
          <h3 className="text-2xl font-bold">Inspired by this trip?</h3>
          <p className="text-muted-foreground text-lg">
            Create your own itinerary, manage your budget, and plan your next adventure with Globe Trotter.
          </p>
          <Link href="/signup" className={buttonVariants({ size: 'lg', className: 'mt-4' })}>
            Plan Your Own Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
