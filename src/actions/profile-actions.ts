"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  language: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export type ProfileActionState = {
  error?: string;
  success?: boolean;
};

export async function getProfile() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      language: true,
      createdAt: true,
      _count: { select: { trips: true } },
    },
  });
}

export async function updateProfile(data: {
  name?: string;
  language?: string;
}): Promise<ProfileActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ProfileActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.hashedPassword) {
    return { error: "User not found" };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.hashedPassword);
  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { hashedPassword },
  });

  return { success: true };
}

export async function deleteAccount(): Promise<ProfileActionState> {
  const session = await requireAuth();
  const userId = session.user!.id!;

  // Cascade delete handles all related data
  await prisma.user.delete({ where: { id: userId } });

  return { success: true };
}
