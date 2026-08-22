import { getProfile } from '@/actions/profile-actions';
import { requireAuth } from '@/lib/auth-helpers';
import { ProfileClient } from '@/components/profile-client';
import { getUserTrips } from '@/actions/trip-actions';
import { Settings, MapPin, Navigation } from 'lucide-react';

export default async function ProfilePage() {
  const session = await requireAuth();
  const profile = await getProfile();
  const trips = await getUserTrips();

  const countriesVisited = new Set(
    trips.flatMap(t => t.tripStops?.map(s => s.city?.country ?? '') ?? [])
  ).size;

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 py-16 text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur-md">
              <span className="font-display text-3xl font-bold">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{session.user?.name || 'Explorer'}</h1>
              <p className="mt-1 text-white/70">{session.user?.email}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5" /> {trips.length} trips
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {countriesVisited} countries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings content */}
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <div className="mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-display text-xl font-bold">Account Settings</h2>
        </div>
        <ProfileClient profile={profile} />
      </div>
    </div>
  );
}
