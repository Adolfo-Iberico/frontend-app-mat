
"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import type { Profile } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UserColumn = {
  id: string;
  name: string;
  email: string;
  role: Profile['role'];
  isActive: boolean;
  createdAt: string;
}

const roleLabels: Record<Profile['role'], string> = {
  admin: 'Administrador',
  docente: 'Docente',
  user: 'Estudiante',
};

export const columns: ColumnDef<UserColumn>[] = [
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
    accessorKey: "name",
    header: "Nombre",
  },
    {
    accessorKey: "email",
    header: "Correo Electrónico",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => roleLabels[row.original.role] ?? row.original.role,
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge
          className={cn(
            'text-xs font-semibold',
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          )}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de Creación",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
