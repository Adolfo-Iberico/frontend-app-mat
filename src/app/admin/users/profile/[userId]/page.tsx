import { requireRole } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/app/(public)/profile/components/profile-form';
import { getUserById } from '@/app/actions';
import { Heading } from '@/components/ui/heading';

export default async function AdminEditProfilePage(props: {
  params: Promise<{ userId: string }>;
}) {
  const params = await props.params;
  const { userId } = params;
  await requireRole(['admin']);

  const userProfile = await getUserById(userId);

  if (!userProfile) {
    return redirect('/admin/users');
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
            title="Editar Perfil de Usuario"
            description={`Modificando el perfil de: ${userProfile.first_name} ${userProfile.last_name} (${userProfile.email})`}
        />
        <div className="mt-8">
            <ProfileForm
              profile={userProfile}
              userId={userProfile.id}
              isAdmin={true}
            />
        </div>
      </div>
    </div>
  );
}
