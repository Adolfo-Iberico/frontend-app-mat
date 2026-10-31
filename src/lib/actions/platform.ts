'use server';

import { api, toList } from '@/lib/api/client';
import { type BackendUser, mapUserToProfile } from '@/lib/api/adapters';
import { getSession } from '@/lib/session';
import type { PlatformStats } from '@/lib/types';

/**
 * Métricas del dashboard según el rol del usuario autenticado:
 * - admin   → GET /dashboard/admin
 * - docente → GET /dashboard/teacher
 * - student → GET /dashboard/student
 * El gráfico muestra lecciones por unidad temática (reutiliza /lessons).
 */

const EMPTY_STATS: PlatformStats = {
  role: 'user',
  cards: [],
  chart: [],
  chartTitle: '',
  recentItems: [],
  recentTitle: '',
};

interface UnitCount {
  unit: string;
  count: number;
}

async function lessonsByUnit(): Promise<UnitCount[]> {
  const { fetchAllCourses } = await import('@/lib/actions/courses');
  const courses = await fetchAllCourses();
  const map = new Map<string, number>();
  for (const course of courses) {
    const unit = course.category ?? 'General';
    map.set(unit, (map.get(unit) ?? 0) + 1);
  }
  return [...map.entries()].map(([unit, count]) => ({ unit, count }));
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const session = await getSession();
  if (!session) return EMPTY_STATS;

  const role = session.profile.role;

  // ---- Administrador ----
  if (role === 'admin') {
    try {
      const json = await api<Record<string, unknown>>('/dashboard/admin');
      const stats = (json.stats ?? {}) as Record<string, number | unknown>;
      const recentUsers = Array.isArray(json.recent_users) ? (json.recent_users as BackendUser[]) : [];
      const units = await lessonsByUnit();

      return {
        role: 'admin',
        cards: [
          { label: 'Usuarios totales', value: Number(stats.total_users ?? 0), hint: 'Cuentas registradas en el sistema.' },
          { label: 'Estudiantes', value: Number(stats.total_students ?? 0), hint: 'Usuarios con rol estudiante.' },
          { label: 'Docentes', value: Number(stats.total_teachers ?? 0), hint: 'Usuarios con rol docente.' },
          { label: 'Lecciones publicadas', value: Number(stats.published_lessons ?? 0), hint: `de ${Number(stats.total_lessons ?? 0)} lecciones en total.` },
        ],
        chart: units.map(unit => ({ name: unit.unit, total: unit.count })),
        chartTitle: 'Lecciones por unidad temática',
        recentItems: recentUsers.slice(0, 10).map(user => {
          const profile = mapUserToProfile(user);
          return {
            id: user.id,
            title: user.full_name ?? 'Usuario',
            subtitle: `${user.email ?? ''} · ${profile.role}`,
            href: `/admin/users/profile/${user.id}`,
          };
        }),
        recentTitle: 'Usuarios recientes',
      };
    } catch {
      return EMPTY_STATS;
    }
  }

  // ---- Docente ----
  if (role === 'docente') {
    try {
      const json = await api<Record<string, unknown>>('/dashboard/teacher');
      const stats = (json.stats ?? {}) as Record<string, number | unknown>;
      const recentEvaluations = Array.isArray(json.recent_evaluations)
        ? (json.recent_evaluations as { id?: string; title?: string; lesson_id?: string }[])
        : [];
      const units = await lessonsByUnit();

      return {
        role: 'docente',
        cards: [
          { label: 'Estudiantes', value: Number(stats.total_students ?? 0), hint: 'Estudiantes registrados en la plataforma.' },
          { label: 'Mis lecciones', value: Number(stats.published_lessons ?? 0), hint: `de ${Number(stats.total_lessons ?? 0)} creadas.` },
          { label: 'Evaluaciones', value: Number(stats.published_evaluations ?? 0), hint: `de ${Number(stats.total_evaluations ?? 0)} creadas.` },
          { label: 'Promedio general', value: Number(stats.average_score ?? 0).toFixed(1), hint: 'Nota vigesimal de los estudiantes (0–20).' },
        ],
        chart: units.map(unit => ({ name: unit.unit, total: unit.count })),
        chartTitle: 'Mis lecciones por unidad temática',
        recentItems: recentEvaluations
          .filter(evaluation => evaluation.id)
          .slice(0, 5)
          .map(evaluation => ({
            id: evaluation.id!,
            title: evaluation.title ?? 'Evaluación',
            subtitle: null,
            href: evaluation.lesson_id ? `/admin/courses/${evaluation.lesson_id}/evaluation` : '/admin/courses',
          })),
        recentTitle: 'Evaluaciones recientes',
      };
    } catch {
      return EMPTY_STATS;
    }
  }

  // ---- Estudiante ----
  try {
    const json = await api<Record<string, unknown>>('/dashboard/student');
    const stats = (json.stats ?? {}) as Record<string, number | unknown>;
    const inProgress = Array.isArray(json.in_progress_lessons)
      ? (json.in_progress_lessons as { lesson?: { id?: string; title?: string; unit?: string } | null }[])
      : [];
    const units = await lessonsByUnit();

    return {
      role: 'user',
      cards: [
        { label: 'Lecciones completadas', value: Number(stats.completed_lessons ?? 0), hint: `de ${Number(stats.total_lessons ?? 0)} disponibles para tu grado.` },
        { label: 'En progreso', value: Number(stats.in_progress_lessons ?? 0), hint: 'Lecciones que empezaste a estudiar.' },
        { label: 'Promedio', value: Number(stats.average_score ?? 0).toFixed(1), hint: 'Tu nota vigesimal (0–20).' },
        { label: 'Racha', value: `${Number(stats.current_streak ?? 0)} días`, hint: 'Días consecutivos de estudio.' },
      ],
      chart: units.map(unit => ({ name: unit.unit, total: unit.count })),
      chartTitle: 'Lecciones de tu grado por unidad',
      recentItems: inProgress
        .map(item => item.lesson)
        .filter((lesson): lesson is { id: string; title: string; unit?: string } => !!lesson?.id)
        .slice(0, 5)
        .map(lesson => ({
          id: lesson.id,
          title: lesson.title ?? 'Lección',
          subtitle: lesson.unit ?? null,
          href: `/learn/${lesson.id}`,
        })),
      recentTitle: 'Continúa aprendiendo',
    };
  } catch {
    return EMPTY_STATS;
  }
}
