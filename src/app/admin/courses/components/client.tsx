
'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { columns, type CourseColumn } from './columns';

export const CourseClient: React.FC<{ data: unknown[] }> = ({ data }) => {
  const router = useRouter();

  const formattedCourses: CourseColumn[] = (data as Record<string, unknown>[]).map((item) => ({
    id: String(item.id),
    title: String(item.title ?? ''),
    instructor_name: String(item.instructorName ?? ''),
    category: String(item.unit ?? ''),
    grade: String(item.grade ?? ''),
    level: String(item.level ?? ''),
    resource_count: Number(item.resourceCount ?? 0),
    evaluation_count: Number(item.evaluationCount ?? 0),
    is_active: Boolean(item.isPublished),
    created_at: String(item.created ?? ''),
  }));

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Gestionar Lecciones"
          description="Crea, edita y publica las lecciones de matemáticas."
        />
        <Button onClick={() => router.push(`/admin/courses/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Nueva
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="title" columns={columns} data={formattedCourses} />
    </>
  );
};
