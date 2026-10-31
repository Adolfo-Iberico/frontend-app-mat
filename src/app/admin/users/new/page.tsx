import { requireRole } from '@/lib/session';
import { Heading } from '@/components/ui/heading';
import { CreateUserForm } from './user-form';

export default async function NewUserPage() {
  await requireRole(['admin']);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Crear usuario" description="Registra una cuenta de estudiante o docente." />
        <div className="mt-8">
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}
