"use server";

import { prisma } from "@/lib/prisma";

export async function searchCities(query: string = "") {
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { country: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  return prisma.city.findMany({
    where,
    include: {
      _count: { select: { activities: true } },
    },
    orderBy: { name: "asc" },
    take: 20,
  });
}

export async function getCity(cityId: string) {
  return prisma.city.findUnique({
    where: { id: cityId },
    include: {
      activities: {
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getPopularCities() {
  return prisma.city.findMany({
    include: {
      _count: { select: { activities: true, tripStops: true } },
    },
    orderBy: { tripStops: { _count: "desc" } },
    take: 6,
  });
}

export async function searchActivities(
  cityId: string,
  query: string = "",
  category: string = ""
) {
  const where: Record<string, unknown> = { cityId };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category && category !== "all") {
    where.category = category;
  }

  return prisma.activity.findMany({
    where,
    orderBy: { name: "asc" },
    take: 50,
  });
}

export async function getActivityCategories(cityId: string) {
  const activities = await prisma.activity.findMany({
    where: { cityId },
    select: { category: true },
    distinct: ["category"],
  });
  return activities.map((a) => a.category);
}
