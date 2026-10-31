import { requireRole } from '@/lib/session';
import { getCourses } from '@/app/actions';
import { CourseClient } from './components/client';


export default async function CoursesPage() {
  await requireRole(['docente']);

  const coursesData = await getCourses();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CourseClient data={coursesData} />
      </div>
    </div>
  );
}
