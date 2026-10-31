'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AcademicReportData } from '@/lib/actions/reports';

function downloadCsv(rows: Record<string, unknown>[]) {
  const columns = ['Estudiante', 'Correo', 'Evaluación', 'Nota', 'Fecha'];
  const csv = [
    columns.join(','),
    ...rows.map(row => {
      const student = row.user as Record<string, unknown> | undefined;
      const evaluation = row.evaluation as Record<string, unknown> | undefined;
      const values = [
        student?.full_name,
        student?.email,
        evaluation?.title,
        row.score,
        row.created_at,
      ];
      return values.map(value => {
        const text = String(value ?? '');
        const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
        return `"${safeText.replace(/"/g, '""')}"`;
      }).join(',');
    }),
  ].join('\r\n');
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  link.href = url;
  link.download = 'reporte-academico.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ReportsClient({ report }: { report: AcademicReportData }) {
  const data = Array.isArray(report.grades.data)
    ? report.grades.data as Record<string, unknown>[]
    : [];
  const performance = report.performance;
  const cards = [
    { label: 'Evaluaciones rendidas', value: String(performance?.total_evaluations ?? '—') },
    { label: 'Estudiantes', value: String(performance?.total_students ?? '—') },
    { label: 'Promedio', value: typeof performance?.average_score === 'number' ? performance.average_score.toFixed(1) : '—' },
    { label: 'Aprobación', value: typeof performance?.passing_rate === 'number' ? `${performance.passing_rate}%` : '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Reportes académicos</h1>
          <p className="text-muted-foreground">Rendimiento y calificaciones registrados en la plataforma.</p>
        </div>
        <Button onClick={() => downloadCsv(data)} disabled={data.length === 0}>Descargar CSV</Button>
      </div>

      {report.error && (
        <p role="alert" className="rounded-md border border-destructive p-4 text-destructive">{report.error}</p>
      )}

      {performance && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(card => (
            <Card key={card.label}>
              <CardHeader><CardTitle className="text-sm font-medium">{card.label}</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{card.value}</CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Calificaciones recientes</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay resultados disponibles para este reporte.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b">
                <th className="p-2">Estudiante</th><th className="p-2">Evaluación</th>
                <th className="p-2">Nota</th><th className="p-2">Fecha</th>
              </tr></thead>
              <tbody>
                {data.map((row, index) => {
                  const student = row.user as Record<string, unknown> | undefined;
                  const evaluation = row.evaluation as Record<string, unknown> | undefined;
                  return (
                    <tr key={String(row.id ?? index)} className="border-b">
                      <td className="p-2">{String(student?.full_name ?? '—')}</td>
                      <td className="p-2">{String(evaluation?.title ?? '—')}</td>
                      <td className="p-2">{row.score == null ? '—' : `${Number(row.score).toFixed(1)} / 20`}</td>
                      <td className="p-2">{row.created_at ? new Date(String(row.created_at)).toLocaleDateString('es-PE') : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
