import { requireRole } from '@/lib/session';
import CourseEvaluationPageClient from './course-evaluation-page-client';

export default async function CourseEvaluationPage() {
  await requireRole(['docente']);

  return <CourseEvaluationPageClient />;
}
