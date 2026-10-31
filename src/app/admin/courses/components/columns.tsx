
'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ClipboardCheck, Paperclip } from 'lucide-react';

export type CourseColumn = {
  id: string;
  title: string;
  instructor_name: string;
  category: string;
  grade: string;
  level: string;
  resource_count: number;
  evaluation_count: number;
  is_active: boolean;
  created_at: string;
};

export const columns: ColumnDef<CourseColumn>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'instructor_name',
    header: 'Docente',
  },
  {
    accessorKey: 'category',
    header: 'Unidad',
  },
  {
    accessorKey: 'grade',
    header: 'Grado',
  },
  {
    accessorKey: 'level',
    header: 'Nivel',
  },
  {
    id: 'content',
    header: 'Contenido',
    cell: ({ row }) => {
      const { resource_count, evaluation_count } = row.original;
      return (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1" title="Recursos adjuntos">
            <Paperclip className="w-4 h-4" />
            {resource_count}
          </span>
          <span className="flex items-center gap-1" title="Evaluaciones">
            <ClipboardCheck className="w-4 h-4" />
            {evaluation_count}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Estado',
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <Badge
          className={cn(
            'text-xs font-semibold',
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          )}
        >
          {isActive ? 'Publicada' : 'Borrador'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Fecha de Creación',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
