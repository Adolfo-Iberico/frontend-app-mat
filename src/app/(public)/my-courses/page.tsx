'use client';

import { useState, useEffect } from 'react';
import { Book, Award } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getCourseById, getPlatformStats } from '@/app/actions';
import type { Course, PlatformStats } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EnrolledCourseCard } from './components/enrolled-course-card';

function MyCoursesSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [inProgress, setInProgress] = useState<{ course: Course; progress: number }[]>([]);
  const [completed, setCompleted] = useState<{ course: Course; progress: number }[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<
    { id: string; title: string; score: number | null; status: string; completedAt: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login?redirect=/my-courses');
        return;
      }

      setLoading(true);

      // El dashboard del estudiante trae las lecciones en progreso y completadas.
      const [platformStats] = await Promise.all([getPlatformStats()]);
      setStats(platformStats);

      if (profile?.role === 'user') {
        const dashboard = await import('@/lib/actions/dashboard').then(m => m.getStudentLessons()).catch(() => null);
        if (dashboard) {
          setRecentEvaluations(dashboard.recentEvaluations);
          const inProgressItems = await Promise.all(
            dashboard.inProgress
              .filter(item => item.id)
              .map(async item => {
                const course = await getCourseById(item.id);
                return course ? { course, progress: item.progress } : null;
              })
          );
          const completedItems = await Promise.all(
            dashboard.completed
              .filter(item => item.id)
              .map(async item => {
                const course = await getCourseById(item.id);
                return course ? { course, progress: 100 } : null;
              })
          );
          setInProgress(inProgressItems.filter((item): item is { course: Course; progress: number } => !!item));
          setCompleted(completedItems.filter((item): item is { course: Course; progress: number } => !!item));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user, profile, authLoading, router]);

  if (loading || authLoading) {
    return <MyCoursesSkeleton />;
  }

  const allLessons = [...inProgress, ...completed];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Book className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Mis Lecciones</h1>
      </div>

      {allLessons.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allLessons.map(({ course, progress }) => (
            <EnrolledCourseCard key={course.id} course={course} progress={progress} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-card/50">
          <h2 className="text-2xl font-semibold mb-2">Aún no has empezado ninguna lección.</h2>
          <p className="text-muted-foreground mb-6">Explora las lecciones de tu grado para empezar a aprender.</p>
          <Button asChild>
            <Link href="/courses">Explorar Lecciones</Link>
          </Button>
        </div>
      )}

      <Separator className="my-12 md:my-16" />

      <div>
        <div className="flex items-center gap-4 mb-8">
          <Award className="h-8 w-8 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold font-headline">Tu progreso</h2>
        </div>

        {stats && stats.cards.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.cards.map(card => (
              <div key={card.label} className="p-6 border rounded-lg bg-card">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.hint}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card/50">
            <p>Completa lecciones para ver tu progreso aquí.</p>
          </div>
        )}
      </div>

      <Separator className="my-12 md:my-16" />

      <section>
        <h2 className="text-2xl md:text-3xl font-bold font-headline mb-6">Resultados recientes</h2>
        {recentEvaluations.length > 0 ? (
          <div className="space-y-3">
            {recentEvaluations.map(result => (
              <div key={result.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
                <div>
                  <p className="font-semibold">{result.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.completedAt ? new Date(result.completedAt).toLocaleDateString('es-PE') : 'En progreso'}
                  </p>
                </div>
                <p className="font-semibold">
                  {result.status === 'completed' && result.score !== null ? `${result.score.toFixed(1)} / 20` : 'Pendiente'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border bg-card/50 p-6 text-center text-muted-foreground">
            Aún no hay resultados de evaluaciones.
          </p>
        )}
      </section>
    </div>
  );
}
