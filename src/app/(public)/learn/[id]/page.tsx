
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Course } from '@/lib/types';
import { getCourseById, getLessonsByCourseId } from '@/app/actions';
import { LearnPageComponent, LearnPageSkeleton } from './components/learn-page-client';

export default async function LearnPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id: courseId } = params;

  // Datos iniciales desde el servidor (lección real del backend).
  const courseData = await getCourseById(courseId);
  if (!courseData) {
    notFound();
  }

  const lessonsData = courseData.lessons ?? (await getLessonsByCourseId(courseId));

  const initialCourse: Course = {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description ?? '',
    long_description: courseData.long_description,
    price: 0,
    price_usd: 0,
    original_price: null,
    instructor_id: courseData.instructor_id,
    category: courseData.category,
    category_id: courseData.category_id || '',
    created_at: courseData.created_at,
    updated_at: courseData.updated_at,
    presale_price: null,
    image_url: null,
    level: courseData.level,
    language: courseData.language ?? 'Español',
    lessons: [],
    instructor: {
      id: courseData.instructor.id,
      name: courseData.instructor.name,
      avatarUrl: courseData.instructor.avatarUrl,
    },
    rating: 0,
    reviews: 0,
    students: 0,
    lastUpdated: courseData.lastUpdated,
    is_active: courseData.is_active,
    brochure: null,
    grade: courseData.grade,
    estimatedTime: courseData.estimatedTime,
    evaluations: courseData.evaluations ?? [],
    progress: courseData.progress,
    resources: courseData.resources ?? [],
  };

  return (
    <Suspense fallback={<LearnPageSkeleton />}>
      <LearnPageComponent
        courseId={courseId}
        initialCourse={initialCourse}
        initialLessons={lessonsData}
      />
    </Suspense>
  );
}
