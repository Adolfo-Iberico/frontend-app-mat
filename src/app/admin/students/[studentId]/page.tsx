import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/session';
import { getTeacherStudentReport } from '@/lib/actions/reports';

export default async function TeacherStudentDetailPage(props: {
  params: Promise<{ studentId: string }>;
}) {
  await requireRole(['docente']);
  const { studentId } = await props.params;
  const result = await getTeacherStudentReport(studentId);

  if (!result.data) {
    return (
      <div className="space-y-4">
        <Link className="text-primary underline" href="/admin/students">Volver a estudiantes</Link>
        <p role="alert" className="rounded-md border border-destructive p-4 text-destructive">
          {result.error ?? 'No se encontró el reporte. Puede que aún no haya resultados de evaluaciones propias del docente.'}
        </p>
      </div>
    );
  }

  const student = result.data.student as Record<string, unknown> | undefined;
  const stats = result.data.stats as Record<string, unknown> | undefined;
  const progress = Array.isArray(result.data.lesson_progress) ? result.data.lesson_progress as Record<string, unknown>[] : [];
  const results = Array.isArray(result.data.evaluation_results) ? result.data.evaluation_results as Record<string, unknown>[] : [];

  if (!student) notFound();

  const summaryCards = [
    { label: 'Lecciones completadas', value: String(stats?.total_lessons_completed ?? '—') },
    { label: 'En progreso', value: String(stats?.total_lessons_in_progress ?? '—') },
    { label: 'Promedio', value: typeof stats?.average_score === 'number' ? stats.average_score.toFixed(1) : '—' },
    { label: 'Evaluaciones', value: String(stats?.total_evaluations ?? '—') },
  ];

  return (
    <div className="space-y-6">
      <Link className="text-primary underline" href="/admin/students">Volver a estudiantes</Link>
      <div>
        <h1 className="text-3xl font-bold">{String(student.full_name ?? 'Estudiante')}</h1>
        <p className="text-muted-foreground">{String(student.email ?? '')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Progreso por lección</h2>
        {progress.length === 0 ? <p className="text-muted-foreground">No hay progreso registrado.</p> : progress.map((row, index) => {
          const lesson = row.lesson as Record<string, unknown> | undefined;
          return <div key={String(row.id ?? index)} className="flex justify-between gap-4 rounded-md border p-3">
            <span>{String(lesson?.title ?? 'Lección')}</span>
            <span>{Number(row.progress ?? 0)}%</span>
          </div>;
        })}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Resultados de evaluaciones</h2>
        {results.length === 0 ? <p className="text-muted-foreground">No hay evaluaciones registradas.</p> : results.map((row, index) => {
          const evaluation = row.evaluation as Record<string, unknown> | undefined;
          return <div key={String(row.id ?? index)} className="flex justify-between gap-4 rounded-md border p-3">
            <span>{String(evaluation?.title ?? 'Evaluación')}</span>
            <span>{Number(row.score ?? 0).toFixed(1)} / 20</span>
          </div>;
        })}
      </section>
    </div>
  );
}
