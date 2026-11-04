
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Course } from '@/lib/types';
import { getLessonsByCourseId, getCourseById } from '@/app/actions';
import { CourseDetailPageContent } from './components/course-detail-page-client';
import { CourseDetailSkeleton } from './components/course-detail-skeleton';

export default async function CourseDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const course = await getCourseById(id);
  
  if (!course) {
    notFound();
  }

  const lessons = await getLessonsByCourseId(id);

  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetailPageContent course={course as Course} lessons={lessons} />
    </Suspense>
  );
}
