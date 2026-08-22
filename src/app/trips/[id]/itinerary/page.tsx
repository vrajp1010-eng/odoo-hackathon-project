import { getTrip } from '@/actions/trip-actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default async function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) {
    notFound();
  }

  const days: Record<string, any> = {};
  let totalCost = 0;

  trip.tripStops?.forEach((stop: any) => {
    stop.activities?.forEach((activity: any) => {
      const dateStr = activity.date ? format(new Date(activity.date), 'yyyy-MM-dd') : 'Unscheduled';
      if (!days[dateStr]) {
        days[dateStr] = { date: activity.date, city: stop.cityName, activities: [] };
      }
      days[dateStr].activities.push(activity);
      totalCost += activity.cost || 0;
    });
  });

  const sortedDates = Object.keys(days).sort();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/trips/${id}`} className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trip
        </Link>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{trip.title}</h1>
        <p className="text-muted-foreground text-lg">
          {trip.startDate ? format(new Date(trip.startDate), 'MMM d, yyyy') : 'TBD'} - {trip.endDate ? format(new Date(trip.endDate), 'MMM d, yyyy') : 'TBD'}
        </p>
      </div>

      <div className="space-y-8">
        {sortedDates.map((dateStr) => {
          const day = days[dateStr];
          return (
            <div key={dateStr} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  {dateStr === 'Unscheduled' ? 'Unscheduled' : format(new Date(day.date), 'EEEE, MMMM d')}
                </h2>
                <span className="text-muted-foreground ml-auto flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {day.city}
                </span>
              </div>
              
              <div className="grid gap-4">
                {day.activities.map((activity: any) => (
                  <Card key={activity.id} className="print:shadow-none print:border-gray-200">
                    <CardHeader className="py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{activity.name}</CardTitle>
                          {activity.description && (
                            <CardDescription className="mt-2">{activity.description}</CardDescription>
                          )}
                        </div>
                        <div className="text-right text-sm space-y-1">
                          {activity.startTime && (
                            <div className="flex items-center justify-end text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.startTime} {activity.endTime ? `- ${activity.endTime}` : ''}
                            </div>
                          )}
                          {activity.cost > 0 && (
                            <div className="flex items-center justify-end font-medium">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {activity.cost.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg text-center print:break-inside-avoid">
        <h3 className="text-xl font-semibold mb-2">Trip Summary</h3>
        <p className="text-2xl font-bold">Total Estimated Cost: ${totalCost.toFixed(2)}</p>
      </div>
    </div>
  );
}
