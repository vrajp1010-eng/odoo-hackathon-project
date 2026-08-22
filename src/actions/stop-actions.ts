"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const addStopSchema = z.object({
  tripId: z.string(),
  cityId: z.string(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
});

const updateStopSchema = z.object({
  id: z.string(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  notes: z.string().optional(),
  orderIndex: z.number().optional(),
});

export type StopActionState = {
  error?: string;
  success?: boolean;
  stopId?: string;
};

async function verifyTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) return null;
  return trip;
}

async function verifyStopOwnership(stopId: string, userId: string) {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });
  if (!stop || stop.trip.userId !== userId) return null;
  return stop;
}

export async function addTripStop(data: {
  tripId: string;
  cityId: string;
  arrivalDate?: string;
  departureDate?: string;
}): Promise<StopActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = addStopSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const trip = await verifyTripOwnership(parsed.data.tripId, userId);
  if (!trip) return { error: "Trip not found or access denied" };

  // Get the next order index
  const maxOrder = await prisma.tripStop.findFirst({
    where: { tripId: parsed.data.tripId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const stop = await prisma.tripStop.create({
    data: {
      tripId: parsed.data.tripId,
      cityId: parsed.data.cityId,
      orderIndex: (maxOrder?.orderIndex ?? -1) + 1,
      arrivalDate: parsed.data.arrivalDate ? new Date(parsed.data.arrivalDate) : null,
      departureDate: parsed.data.departureDate ? new Date(parsed.data.departureDate) : null,
    },
  });

  revalidatePath(`/trips/${parsed.data.tripId}`);
  return { success: true, stopId: stop.id };
}

export async function updateTripStop(data: {
  id: string;
  arrivalDate?: string;
  departureDate?: string;
  notes?: string;
  orderIndex?: number;
}): Promise<StopActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = updateStopSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const stop = await verifyStopOwnership(parsed.data.id, userId);
  if (!stop) return { error: "Stop not found or access denied" };

  const updateData: Record<string, unknown> = {};
  if (parsed.data.arrivalDate !== undefined) updateData.arrivalDate = new Date(parsed.data.arrivalDate);
  if (parsed.data.departureDate !== undefined) updateData.departureDate = new Date(parsed.data.departureDate);
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.orderIndex !== undefined) updateData.orderIndex = parsed.data.orderIndex;

  await prisma.tripStop.update({
    where: { id: parsed.data.id },
    data: updateData,
  });

  revalidatePath(`/trips/${stop.tripId}`);
  return { success: true };
}

export async function removeTripStop(stopId: string): Promise<StopActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const stop = await verifyStopOwnership(stopId, userId);
  if (!stop) return { error: "Stop not found or access denied" };

  await prisma.tripStop.delete({ where: { id: stopId } });

  revalidatePath(`/trips/${stop.tripId}`);
  return { success: true };
}

export async function reorderTripStops(
  tripId: string,
  stopIds: string[]
): Promise<StopActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) return { error: "Trip not found or access denied" };

  // Update order indexes
  await Promise.all(
    stopIds.map((id, index) =>
      prisma.tripStop.update({
        where: { id },
        data: { orderIndex: index },
      })
    )
  );

  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
