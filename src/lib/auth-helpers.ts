import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session, or null if not authenticated.
 */
export async function getSession() {
  return await auth();
}

/**
 * Require authentication. Redirects to login if not authenticated.
 * Returns the session with guaranteed user.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

/**
 * Get the current user ID, or null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
