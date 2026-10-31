
'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { columns, type NewsColumn } from './columns';
import type { NewsArticle } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';

interface NewsClientProps {
  data: (NewsArticle & { isActive: boolean; type: string })[];
}

export const NewsClient: React.FC<NewsClientProps> = ({ data }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedNews: NewsColumn[] = data.map((item) => ({
    id: item.id,
    title: item.title,
    authorName: item.author?.name ?? 'Administración',
    isActive: item.isActive,
    createdAt: isClient ? format(new Date(item.created_at), "d 'de' MMMM, yyyy", { locale: es }) : 'Cargando...',
  }));

  if (!isClient) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Novedades (${data.length})`}
          description="Gestiona las novedades y noticias de tu plataforma."
        />
        <Button onClick={() => router.push(`/admin/news/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Nueva
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="title" columns={columns} data={formattedNews} />
    </>
  );
};
