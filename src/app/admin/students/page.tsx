import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/session';
import { getTeacherStudents } from '@/lib/actions/reports';

export default async function TeacherStudentsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole(['docente']);
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1);
  const { students, error, currentPage, lastPage } = await getTeacherStudents(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seguimiento de estudiantes</h1>
        <p className="text-muted-foreground">Consulta el avance y los resultados de tus estudiantes.</p>
      </div>
      {error && <p role="alert" className="rounded-md border border-destructive p-4 text-destructive">{error}</p>}
      {students.length === 0 ? (
        <p className="rounded-md border p-6 text-muted-foreground">No hay estudiantes disponibles.</p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3">Estudiante</th><th className="p-3">Correo</th>
                <th className="p-3">Grado / sección</th><th className="p-3">Seguimiento</th>
              </tr></thead>
              <tbody>{students.map(student => (
                <tr key={student.id} className="border-b">
                  <td className="p-3 font-medium">{student.full_name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">{[student.grade, student.section].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="p-3"><Link className="text-primary underline" href={`/admin/students/${student.id}`}>Ver progreso</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Página {currentPage} de {lastPage}</p>
            <div className="flex gap-2">
              {currentPage > 1 ? (
                <Button asChild variant="outline">
                  <Link href={`/admin/students?page=${currentPage - 1}`}>Anterior</Link>
                </Button>
              ) : <Button variant="outline" disabled>Anterior</Button>}
              {currentPage < lastPage ? (
                <Button asChild variant="outline">
                  <Link href={`/admin/students?page=${currentPage + 1}`}>Siguiente</Link>
                </Button>
              ) : <Button variant="outline" disabled>Siguiente</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
