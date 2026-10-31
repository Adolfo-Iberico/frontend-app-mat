
import { requireRole } from '@/lib/session';
import { UserClient } from './components/client';
import { getUsers } from '@/app/actions';

export default async function UsersPage() {
  await requireRole(['admin']);

  const users = await getUsers();

  return (
    <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <UserClient data={users} />
        </div>
    </div>
  );
}
