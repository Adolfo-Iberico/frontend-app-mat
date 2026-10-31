'use client';

import { useEffect, useState } from 'react';
import { Award, Medal, Sparkles, Star, Book } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import type { StudentLessonItem } from '@/lib/actions/dashboard';
import type { BackendGamificationSummary } from '@/lib/actions/gamification';
import {
  CATEGORY_LABELS,
  badgeFromBackend,
  computeLocalGamification,
  metricsFromStudentLessons,
  type UiBadge,
  type UiLevelInfo,
} from '@/lib/gamification';
import { BadgeCard } from './components/badge-card';

function AchievementsSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-52 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [badges, setBadges] = useState<UiBadge[]>([]);
  const [level, setLevel] = useState<UiLevelInfo | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [unitsExplored, setUnitsExplored] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login?next=/achievements');
        return;
      }

      setLoading(true);

      // Lecciones completadas (métrica para la tarjeta de resumen).
      const dashboard = profile?.role === 'user'
        ? await import('@/lib/actions/dashboard').then(m => m.getStudentLessons()).catch(() => null)
        : null;
      const completed: StudentLessonItem[] = dashboard?.completed ?? [];
      setLessonsCompleted(completed.length);
      setUnitsExplored(new Set(completed.map(l => l.unit).filter(Boolean)).size);

      // Fuente de verdad: resumen de gamificación del backend.
      const summary: BackendGamificationSummary | null = await import('@/lib/actions/gamification')
        .then(m => m.getGamificationSummary())
        .catch(() => null);

      if (summary && summary.available && summary.achievements.length > 0) {
        setBadges(summary.achievements.map(badgeFromBackend));
        setTotalXp(summary.total_xp);
        setUnlockedCount(summary.unlocked_count);
        const progress = summary.level_progress;
        const xpForNext = progress?.xp_for_next_level ?? summary.total_xp;
        const xpInLevel = progress?.xp_in_level ?? summary.total_xp;
        setLevel({
          name: `Nivel ${summary.level}`,
          levelNumber: summary.level,
          progressPercent: progress?.progress_percent ?? 0,
          progressLabel: `${xpInLevel} / ${xpForNext} XP`,
          hint:
            progress && progress.xp_to_next_level > 0
              ? `Te faltan ${progress.xp_to_next_level} XP para alcanzar el nivel ${summary.level + 1}.`
              : '¡Sigue así! Consigue más XP para subir de nivel.',
        });
      } else {
        // Respaldo local: la API de gamificación no está disponible.
        const local = computeLocalGamification(metricsFromStudentLessons(completed));
        setBadges(local.badges);
        setTotalXp(local.totalXp);
        setUnlockedCount(local.unlockedCount);
        setLevel(local.level);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, profile, authLoading, router]);

  if (loading || authLoading || !level) {
    return <AchievementsSkeleton />;
  }

  const totalCount = badges.length;

  const summaryCards = [
    {
      label: 'Puntos de experiencia',
      value: `${totalXp.toLocaleString('es-PE')} XP`,
      hint: level.name,
      icon: Sparkles,
    },
    {
      label: 'Insignias obtenidas',
      value: `${unlockedCount} / ${totalCount}`,
      hint: `${totalCount - unlockedCount} por desbloquear`,
      icon: Medal,
    },
    {
      label: 'Nivel actual',
      value: level.name,
      hint: `Siguiente nivel al ${level.progressPercent}% de progreso`,
      icon: Star,
    },
    {
      label: 'Lecciones completadas',
      value: String(lessonsCompleted),
      hint: `${unitsExplored} ${unitsExplored === 1 ? 'unidad explorada' : 'unidades exploradas'}`,
      icon: Book,
    },
  ];

  // Categorías presentes en el catálogo (backend o local), en español.
  const categories = Array.from(new Set(badges.map(badge => badge.category)));

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Award className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">Insignias y Logros</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Completa lecciones y evaluaciones para desbloquear insignias y subir de nivel.
          </p>
        </div>
      </div>

      {/* Resumen de puntajes */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-6 border rounded-2xl bg-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.hint}</p>
            </div>
          );
        })}
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold font-headline mb-4">Retos de aprendizaje</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Completa 3 lecciones', current: lessonsCompleted, target: 3, unit: 'lecciones' },
            { title: 'Explora 2 unidades', current: unitsExplored, target: 2, unit: 'unidades' },
            { title: 'Acumula 100 XP', current: totalXp, target: 100, unit: 'XP' },
          ].map(challenge => {
            const progress = Math.min(100, Math.round((challenge.current / challenge.target) * 100));
            const complete = challenge.current >= challenge.target;
            return (
              <div key={challenge.title} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground">
                    {complete ? 'Completado' : 'En progreso'}
                  </span>
                </div>
                <Progress value={progress} className="mt-4 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {Math.min(challenge.current, challenge.target)} / {challenge.target} {challenge.unit}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Progreso de nivel */}
      <div className="mb-12 p-6 border rounded-2xl bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-lg font-semibold">Progreso de nivel</h2>
          <p className="text-sm text-muted-foreground">{level.progressLabel}</p>
        </div>
        <Progress value={level.progressPercent} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">{level.hint}</p>
      </div>

      {/* Colección de insignias por categoría */}
      <Tabs defaultValue="todas">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold font-headline">Colección de insignias</h2>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {CATEGORY_LABELS[category] ?? 'General'}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="todas">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {badges.map(badge => (
              <BadgeCard key={badge.slug} badge={badge} />
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {badges
                .filter(badge => badge.category === category)
                .map(badge => (
                  <BadgeCard key={badge.slug} badge={badge} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {unlockedCount === 0 && (
        <div className="mt-10 text-center py-12 border rounded-2xl bg-card/50">
          <p className="text-lg font-semibold mb-1">Aún no tienes insignias.</p>
          <p className="text-muted-foreground mb-6">
            Completa tu primera lección para ganar tu primera insignia.
          </p>
          <Button asChild>
            <Link href="/courses">Explorar Lecciones</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
