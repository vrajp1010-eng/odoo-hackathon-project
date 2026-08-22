"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

const createTripSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateTripSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type TripActionState = {
  error?: string;
  success?: boolean;
  tripId?: string;
};

export async function createTrip(
  _prevState: TripActionState,
  formData: FormData
): Promise<TripActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = createTripSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const trip = await prisma.trip.create({
    data: {
      userId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      budget: {
        create: {
          totalBudget: 0,
          transportBudget: 0,
          stayBudget: 0,
          activityBudget: 0,
          mealBudget: 0,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  return { success: true, tripId: trip.id };
}

export async function updateTrip(data: {
  id: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
}): Promise<TripActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = updateTripSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  // Ownership check
  const trip = await prisma.trip.findUnique({
    where: { id: parsed.data.id },
  });

  if (!trip || trip.userId !== userId) {
    return { error: "Trip not found or access denied" };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.startDate !== undefined) updateData.startDate = new Date(parsed.data.startDate);
  if (parsed.data.endDate !== undefined) updateData.endDate = new Date(parsed.data.endDate);
  if (parsed.data.isPublic !== undefined) {
    updateData.isPublic = parsed.data.isPublic;
    // Generate public slug when making public
    if (parsed.data.isPublic && !trip.publicSlug) {
      updateData.publicSlug = nanoid(12);
    }
  }

  await prisma.trip.update({
    where: { id: parsed.data.id },
    data: updateData,
  });

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  revalidatePath(`/trips/${parsed.data.id}`);
  return { success: true };
}

export async function deleteTrip(tripId: string): Promise<TripActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) {
    return { error: "Trip not found or access denied" };
  }

  await prisma.trip.delete({ where: { id: tripId } });

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  return { success: true };
}

export async function getTrip(tripId: string) {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      budget: true,
      tripStops: {
        include: {
          city: true,
          tripActivities: {
            include: { activity: true },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!trip || trip.userId !== userId) {
    return null;
  }

  return trip;
}

export async function getUserTrips() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  return prisma.trip.findMany({
    where: { userId },
    include: {
      budget: true,
      tripStops: {
        include: { city: true },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublicTrip(slug: string) {
  const trip = await prisma.trip.findUnique({
    where: { publicSlug: slug },
    include: {
      user: { select: { name: true, image: true } },
      budget: true,
      tripStops: {
        include: {
          city: true,
          tripActivities: {
            include: { activity: true },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!trip || !trip.isPublic) {
    return null;
  }

  return trip;
}
