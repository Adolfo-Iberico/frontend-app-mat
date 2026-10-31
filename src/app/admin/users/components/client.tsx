

'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type UserColumn, columns } from './columns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserClientProps {
  data: import('@/lib/actions/users').AdminUserRow[];
}

export const UserClient: React.FC<UserClientProps> = ({ data }) => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedUsers: UserColumn[] = data.map((item) => ({
    id: item.id,
    name: item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
    email: item.email || 'No email',
    role: item.role,
    isActive: item.is_active ?? true,
    createdAt: isClient && item.created_at ? format(new Date(item.created_at), "d 'de' MMMM, yyyy", { locale: es }) : 'Cargando...',
  }));

  if (!isClient) {
    // You can return a skeleton loader here if you want
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Usuarios" description="Gestiona los usuarios de tu plataforma." />
        <Button onClick={() => router.push('/admin/users/new')}>
          <Plus className="mr-2 h-4 w-4" /> Crear usuario
        </Button>
      </div>
      <Separator className="my-6" />
      <DataTable searchKey="name" columns={columns} data={formattedUsers} />
    </>
  );
};
