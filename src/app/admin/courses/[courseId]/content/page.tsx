import { requireRole } from '@/lib/session';
import CourseContentPageClient from './course-content-page-client';

export default async function CourseContentPage() {
  await requireRole(['docente']);

  return <CourseContentPageClient />;
}
