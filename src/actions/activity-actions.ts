"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const addActivitySchema = z.object({
  tripStopId: z.string(),
  activityId: z.string(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  customCost: z.number().optional(),
  notes: z.string().optional(),
});

const updateActivitySchema = z.object({
  id: z.string(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  customCost: z.number().optional(),
  notes: z.string().optional(),
  orderIndex: z.number().optional(),
});

export type ActivityActionState = {
  error?: string;
  success?: boolean;
};

async function verifyStopOwnership(stopId: string, userId: string) {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });
  if (!stop || stop.trip.userId !== userId) return null;
  return stop;
}

async function verifyTripActivityOwnership(activityId: string, userId: string) {
  const tripActivity = await prisma.tripActivity.findUnique({
    where: { id: activityId },
    include: { tripStop: { include: { trip: true } } },
  });
  if (!tripActivity || tripActivity.tripStop.trip.userId !== userId) return null;
  return tripActivity;
}

export async function addTripActivity(data: {
  tripStopId: string;
  activityId: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  customCost?: number;
  notes?: string;
}): Promise<ActivityActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = addActivitySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const stop = await verifyStopOwnership(parsed.data.tripStopId, userId);
  if (!stop) return { error: "Stop not found or access denied" };

  // Get activity details for default cost
  const activity = await prisma.activity.findUnique({
    where: { id: parsed.data.activityId },
  });
  if (!activity) return { error: "Activity not found" };

  // Get next order index
  const maxOrder = await prisma.tripActivity.findFirst({
    where: { tripStopId: parsed.data.tripStopId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  await prisma.tripActivity.create({
    data: {
      tripStopId: parsed.data.tripStopId,
      activityId: parsed.data.activityId,
      date: parsed.data.date ? new Date(parsed.data.date) : null,
      startTime: parsed.data.startTime || null,
      endTime: parsed.data.endTime || null,
      customCost: parsed.data.customCost ?? activity.estimatedCost,
      notes: parsed.data.notes || null,
      orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
    },
  });

  revalidatePath(`/trips/${stop.tripId}`);
  return { success: true };
}

export async function updateTripActivity(data: {
  id: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  customCost?: number;
  notes?: string;
  orderIndex?: number;
}): Promise<ActivityActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = updateActivitySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const tripActivity = await verifyTripActivityOwnership(parsed.data.id, userId);
  if (!tripActivity) return { error: "Activity not found or access denied" };

  const updateData: Record<string, unknown> = {};
  if (parsed.data.date !== undefined) updateData.date = new Date(parsed.data.date);
  if (parsed.data.startTime !== undefined) updateData.startTime = parsed.data.startTime;
  if (parsed.data.endTime !== undefined) updateData.endTime = parsed.data.endTime;
  if (parsed.data.customCost !== undefined) updateData.customCost = parsed.data.customCost;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.orderIndex !== undefined) updateData.orderIndex = parsed.data.orderIndex;

  await prisma.tripActivity.update({
    where: { id: parsed.data.id },
    data: updateData,
  });

  revalidatePath(`/trips/${tripActivity.tripStop.tripId}`);
  return { success: true };
}

export async function removeTripActivity(id: string): Promise<ActivityActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const tripActivity = await verifyTripActivityOwnership(id, userId);
  if (!tripActivity) return { error: "Activity not found or access denied" };

  await prisma.tripActivity.delete({ where: { id } });

  revalidatePath(`/trips/${tripActivity.tripStop.tripId}`);
  return { success: true };
}

export async function reorderTripActivities(
  tripStopId: string,
  activityIds: string[]
): Promise<ActivityActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const stop = await verifyStopOwnership(tripStopId, userId);
  if (!stop) return { error: "Stop not found or access denied" };

  await Promise.all(
    activityIds.map((id, index) =>
      prisma.tripActivity.update({
        where: { id },
        data: { orderIndex: index },
      })
    )
  );

  revalidatePath(`/trips/${stop.tripId}`);
  return { success: true };
}
