import { requireRole } from '@/lib/session';
import { redirect } from 'next/navigation';
import { UserForm } from './components/user-form';
import { Heading } from '@/components/ui/heading';
import { getUserById } from '@/app/actions';

export default async function EditUserPage(props: {
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
         <Heading title="Editar Usuario" description="Modifica el rol del usuario." />
         <div className="mt-8">
            <UserForm initialData={userProfile} />
         </div>
      </div>
    </div>
  );
}

    