import { requireRole } from '@/lib/session';
import { getCourseById, getDistinctCategories } from '@/app/actions';
import { CourseForm } from '../components/course-form';
import type { Course } from '@/lib/types';

export default async function CoursePage(props: {
  params: Promise<{ courseId: string }>;
}) {
  const params = await props.params;
  const { courseId } = params;
  await requireRole(['docente']);

  const course = await getCourseById(courseId);
  const categories = await getDistinctCategories();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CourseForm
          initialData={course as Course | null}
          categories={categories}
        />
      </div>
    </div>
  );
}
