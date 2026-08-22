import { getProfile } from '@/actions/profile-actions';
import { requireAuth } from '@/lib/auth-helpers';
import { ProfileClient } from '@/components/profile-client';

export default async function ProfilePage() {
  await requireAuth();
  const profile = await getProfile();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Account Settings</h1>
      <ProfileClient profile={profile} />
    </div>
  );
}
