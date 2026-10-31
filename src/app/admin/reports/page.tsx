import { requireRole } from '@/lib/session';
import { getAcademicReports } from '@/lib/actions/reports';
import { ReportsClient } from './reports-client';

export default async function ReportsPage() {
  await requireRole(['admin', 'docente']);
  const report = await getAcademicReports();
  return <ReportsClient report={report} />;
}
