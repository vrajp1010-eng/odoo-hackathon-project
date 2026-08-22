export type TripStatus = "ongoing" | "upcoming" | "completed" | "unscheduled";

export function getTripStatus(trip: {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}): TripStatus {
  if (!trip.startDate || !trip.endDate) return "unscheduled";
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  end.setHours(23, 59, 59, 999);
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

export const tripStatusCopy: Record<TripStatus, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
  unscheduled: "Preplanned",
};
