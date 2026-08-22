'use client';

import React from 'react';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { Clock, DollarSign } from 'lucide-react';

export function TripCalendar({ trip }: { trip: any }) {
  const days = eachDayOfInterval({
    start: new Date(trip.startDate),
    end: new Date(trip.endDate)
  });

  const cityColors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100'];

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex min-w-[800px] gap-4">
        {days.map((day, i) => {
          const dayActivities = trip.stops?.flatMap((stop: any, stopIdx: number) => {
            return (stop.activities || [])
              .filter((activity: any) => activity.date && isSameDay(new Date(activity.date), day))
              .map((activity: any) => ({
                ...activity,
                city: stop.cityName,
                colorClass: cityColors[stopIdx % cityColors.length]
              }));
          }).sort((a: any, b: any) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          }) || [];
          
          return (
            <div key={i} className="flex-1 min-w-[250px] border rounded-lg bg-card overflow-hidden">
              <div className="p-3 border-b bg-muted/50 font-semibold text-center">
                {format(day, 'MMM d, EEE')}
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {dayActivities.map((activity: any) => (
                  <div key={activity.id} className={`p-3 rounded-md text-sm border ${activity.colorClass}`}>
                    <div className="font-semibold mb-1">{activity.name}</div>
                    <div className="text-xs text-muted-foreground flex flex-col gap-1">
                      <span className="font-medium text-foreground">{activity.city}</span>
                      {activity.startTime && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.startTime} {activity.endTime ? `- ${activity.endTime}` : ''}
                        </span>
                      )}
                      {activity.cost > 0 && (
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {activity.cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
