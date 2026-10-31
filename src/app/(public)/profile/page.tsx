import { User } from 'lucide-react';
import { requireRole } from '@/lib/session';
import { ProfileForm } from './components/profile-form';

export default async function ProfilePage() {
  const { user, profile } = await requireRole(['admin', 'docente', 'user'], '/profile');

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Mi Perfil</h1>
        </div>
        <ProfileForm profile={profile} userId={user.id} />
    </div>
  );
}
