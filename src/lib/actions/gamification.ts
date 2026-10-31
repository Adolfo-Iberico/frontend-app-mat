'use server';

import { api } from '@/lib/api/client';
import { getSession } from '@/lib/session';

// ============================================================
// Módulo de Gamificación — integración con el backend Laravel.
//
// Endpoints consumidos:
// - GET /gamification/summary      (rol estudiante)
// - GET /rankings/overall          (autenticado)
// - GET /rankings/my-position      (autenticado)
// ============================================================

/** Logro del backend (Achievement) con estado de desbloqueo para el usuario. */
export interface BackendAchievement {
  slug: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

/** Progreso de nivel calculado por el backend (StudentProfile::levelProgress). */
export interface BackendLevelProgress {
  level: number;
  total_xp: number;
  xp_in_level: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  progress_percent: number;
  xp_to_next_level: number;
}

/** Respuesta de GET /gamification/summary. */
export interface BackendGamificationSummary {
  available: boolean;
  level: number;
  total_xp: number;
  rank_points: number;
  level_progress: BackendLevelProgress | null;
  achievements: BackendAchievement[];
  unlocked_count: number;
  total_count: number;
  badges: string[];
}

/** Fila del ranking (GET /rankings/overall). */
export interface BackendRankingEntry {
  position: number;
  student_name: string;
  student_id: string;
  average_score: number;
  total_works: number;
}

/** Respuesta de GET /rankings/my-position. */
export interface BackendMyPosition {
  student_id: string;
  student_name: string;
  overall_average: number;
  total_works: number;
  position: number;
  total_students: number;
}

interface BackendLevelProgressRow {
  level?: number;
  total_xp?: number;
  xp_in_level?: number;
  xp_for_current_level?: number;
  xp_for_next_level?: number;
  progress_percent?: number;
  xp_to_next_level?: number;
}

interface BackendSummaryRow {
  available?: boolean;
  level?: number;
  total_xp?: number;
  rank_points?: number;
  level_progress?: BackendLevelProgressRow | null;
  achievements?: Record<string, unknown>[];
  unlocked_count?: number;
  total_count?: number;
  badges?: string[];
}

function mapAchievement(row: Record<string, unknown>): BackendAchievement {
  return {
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    icon: typeof row.icon === 'string' ? row.icon : '',
    xp_reward: Number(row.xp_reward ?? 0),
    category: String(row.category ?? 'general'),
    unlocked: Boolean(row.unlocked),
    unlocked_at: typeof row.unlocked_at === 'string' ? row.unlocked_at : null,
  };
}

/**
 * Resumen de gamificación del estudiante autenticado
 * (nivel, XP, progreso y catálogo de logros con estado).
 */
export async function getGamificationSummary(): Promise<BackendGamificationSummary | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const json = await api<Record<string, unknown>>('/gamification/summary');
    const row = (json.gamification ?? null) as BackendSummaryRow | null;
    if (!row) return null;

    const achievements = Array.isArray(row.achievements)
      ? row.achievements.map(mapAchievement)
      : [];

    const progress = row.level_progress ?? null;
    const levelProgress: BackendLevelProgress | null = progress
      ? {
          level: Number(progress.level ?? 1),
          total_xp: Number(progress.total_xp ?? 0),
          xp_in_level: Number(progress.xp_in_level ?? 0),
          xp_for_current_level: Number(progress.xp_for_current_level ?? 0),
          xp_for_next_level: Number(progress.xp_for_next_level ?? 0),
          progress_percent: Number(progress.progress_percent ?? 0),
          xp_to_next_level: Number(progress.xp_to_next_level ?? 0),
        }
      : null;

    return {
      available: Boolean(row.available),
      level: Number(row.level ?? 1),
      total_xp: Number(row.total_xp ?? 0),
      rank_points: Number(row.rank_points ?? 0),
      level_progress: levelProgress,
      achievements,
      unlocked_count: Number(row.unlocked_count ?? achievements.filter(a => a.unlocked).length),
      total_count: Number(row.total_count ?? achievements.length),
      badges: Array.isArray(row.badges) ? row.badges.map(String) : [],
    };
  } catch {
    return null;
  }
}

interface BackendRankingRow {
  position?: number;
  student_name?: string;
  student_id?: string;
  average_score?: number;
  total_works?: number;
}

export type RankingPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all_time';

/**
 * Ranking general de estudiantes por promedio de evaluaciones
 * y trabajos calificados. Devuelve además la posición del usuario.
 * El período filtra por fecha de las entregas (week/month/quarter/year/all_time).
 */
export async function getOverallRanking(
  period: RankingPeriod = 'all_time'
): Promise<{
  entries: BackendRankingEntry[];
  myPosition: number | null;
} | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const json = await api<Record<string, unknown>>(`/rankings/overall?period=${period}`);
    const rows = Array.isArray(json.data) ? (json.data as BackendRankingRow[]) : [];

    const entries: BackendRankingEntry[] = rows
      .map(row => ({
        position: Number(row.position ?? 0),
        student_name: String(row.student_name ?? 'Estudiante'),
        student_id: String(row.student_id ?? ''),
        average_score: Number(row.average_score ?? 0),
        total_works: Number(row.total_works ?? 0),
      }))
      .filter(entry => entry.position > 0 && entry.student_id);

    const myPosition =
      typeof json.my_position === 'number' && json.my_position > 0 ? json.my_position : null;

    return { entries, myPosition };
  } catch {
    return null;
  }
}

/** Posición del estudiante autenticado en el ranking general. */
export async function getMyRankingPosition(): Promise<BackendMyPosition | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const json = await api<Record<string, unknown>>('/rankings/my-position');
    const row = (json.data ?? null) as Record<string, unknown> | null;
    if (!row) return null;

    return {
      student_id: String(row.student_id ?? ''),
      student_name: String(row.student_name ?? ''),
      overall_average: Number(row.overall_average ?? 0),
      total_works: Number(row.total_works ?? 0),
      position: Number(row.position ?? 0),
      total_students: Number(row.total_students ?? 0),
    };
  } catch {
    return null;
  }
}
