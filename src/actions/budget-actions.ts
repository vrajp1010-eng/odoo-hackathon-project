"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const updateBudgetSchema = z.object({
  tripId: z.string(),
  totalBudget: z.number().min(0).optional(),
  transportBudget: z.number().min(0).optional(),
  stayBudget: z.number().min(0).optional(),
  activityBudget: z.number().min(0).optional(),
  mealBudget: z.number().min(0).optional(),
});

export type BudgetActionState = {
  error?: string;
  success?: boolean;
};

export async function updateBudget(data: {
  tripId: string;
  totalBudget?: number;
  transportBudget?: number;
  stayBudget?: number;
  activityBudget?: number;
  mealBudget?: number;
}): Promise<BudgetActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = updateBudgetSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  // Verify trip ownership
  const trip = await prisma.trip.findUnique({
    where: { id: parsed.data.tripId },
  });
  if (!trip || trip.userId !== userId) {
    return { error: "Trip not found or access denied" };
  }

  await prisma.budget.upsert({
    where: { tripId: parsed.data.tripId },
    create: {
      tripId: parsed.data.tripId,
      totalBudget: parsed.data.totalBudget ?? 0,
      transportBudget: parsed.data.transportBudget ?? 0,
      stayBudget: parsed.data.stayBudget ?? 0,
      activityBudget: parsed.data.activityBudget ?? 0,
      mealBudget: parsed.data.mealBudget ?? 0,
    },
    update: {
      ...(parsed.data.totalBudget !== undefined && { totalBudget: parsed.data.totalBudget }),
      ...(parsed.data.transportBudget !== undefined && { transportBudget: parsed.data.transportBudget }),
      ...(parsed.data.stayBudget !== undefined && { stayBudget: parsed.data.stayBudget }),
      ...(parsed.data.activityBudget !== undefined && { activityBudget: parsed.data.activityBudget }),
      ...(parsed.data.mealBudget !== undefined && { mealBudget: parsed.data.mealBudget }),
    },
  });

  revalidatePath(`/trips/${parsed.data.tripId}`);
  return { success: true };
}

export async function getBudgetSummary(tripId: string) {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      budget: true,
      tripStops: {
        include: {
          tripActivities: {
            include: { activity: true },
          },
        },
      },
    },
  });

  if (!trip || trip.userId !== userId) return null;

  // Calculate actual spending from activities
  const activitySpending = trip.tripStops.reduce((total, stop) => {
    return (
      total +
      stop.tripActivities.reduce((stopTotal, ta) => {
        return stopTotal + (ta.customCost ?? ta.activity.estimatedCost);
      }, 0)
    );
  }, 0);

  // Calculate trip duration
  let tripDays = 1;
  if (trip.startDate && trip.endDate) {
    const diffTime = Math.abs(trip.endDate.getTime() - trip.startDate.getTime());
    tripDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const budget = trip.budget;
  const allocatedBudget = budget
    ? budget.transportBudget + budget.stayBudget + budget.activityBudget + budget.mealBudget
    : 0;

  return {
    totalBudget: budget?.totalBudget ?? 0,
    allocated: {
      transport: budget?.transportBudget ?? 0,
      stay: budget?.stayBudget ?? 0,
      activities: budget?.activityBudget ?? 0,
      meals: budget?.mealBudget ?? 0,
    },
    actualActivitySpending: activitySpending,
    totalAllocated: allocatedBudget,
    dailyAverage: allocatedBudget / tripDays,
    tripDays,
    isOverBudget: allocatedBudget > (budget?.totalBudget ?? 0) && (budget?.totalBudget ?? 0) > 0,
    remainingBudget: (budget?.totalBudget ?? 0) - allocatedBudget,
  };
}
