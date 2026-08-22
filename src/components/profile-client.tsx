'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateProfile, changePassword, deleteAccount } from '@/actions/profile-actions';
import { signOut } from 'next-auth/react';

import { useToast } from '@/components/ui/toaster';

export function ProfileClient({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const [name, setName] = useState(profile?.name || '');
  const [language, setLanguage] = useState(profile?.language || 'en');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, language });
    setIsEditing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await changePassword({ currentPassword, newPassword });
    setCurrentPassword('');
    setNewPassword('');
    toast({ title: 'Password Updated', description: 'Your password was changed successfully.', variant: 'success' });
  };
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue={profile?.email || ''} 
                disabled 
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language Preference</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger disabled={!isEditing}>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all your trips.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
              await deleteAccount();
              await signOut({ callbackUrl: '/' });
            }
          }}>
            <Button type="submit" variant="destructive">Delete Account</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
