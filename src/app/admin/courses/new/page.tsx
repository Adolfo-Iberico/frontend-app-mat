import { requireRole } from '@/lib/session';
import { getDistinctCategories } from '@/app/actions';
import { CourseForm } from '../components/course-form';

export default async function NewCoursePage() {
    await requireRole(['docente']);

  const categories = await getDistinctCategories();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CourseForm categories={categories} initialData={null} />
      </div>
    </div>
  );
}
