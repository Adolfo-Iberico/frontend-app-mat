'use server';

import { api } from '@/lib/api/client';
import { getSession } from '@/lib/session';

/**
 * Resumen de lecciones del estudiante para "Mis lecciones":
 * usa GET /dashboard/student (en progreso y completadas).
 */

export interface StudentLessonItem {
  id: string;
  title: string;
  unit: string | null;
  progress: number;
  completedAt: string | null;
}

export interface StudentEvaluationResultItem {
  id: string;
  title: string;
  score: number | null;
  status: string;
  completedAt: string | null;
}

interface BackendLessonProgressRow {
  lesson_id?: string;
  progress?: number;
  status?: string;
  completed_at?: string | null;
  lesson?: { id?: string; title?: string; unit?: string | null } | null;
}

interface BackendEvaluationResultRow {
  id?: string;
  score?: number | null;
  status?: string;
  completed_at?: string | null;
  evaluation?: { title?: string } | null;
}

interface BackendLearningRecord {
  lesson_progress?: BackendLessonProgressRow[];
  evaluation_results?: BackendEvaluationResultRow[];
  summary?: {
    completed_lessons?: number;
    in_progress_lessons?: number;
    completed_evaluations?: number;
    average_score?: number;
  };
}

function mapRow(row: BackendLessonProgressRow): StudentLessonItem | null {
  const lessonId = row.lesson?.id ?? row.lesson_id;
  if (!lessonId) return null;
  return {
    id: lessonId,
    title: row.lesson?.title ?? 'Lección',
    unit: row.lesson?.unit ?? null,
    progress: row.progress ?? 0,
    completedAt: row.completed_at ?? null,
  };
}

export async function getStudentLessons(): Promise<{
  inProgress: StudentLessonItem[];
  completed: StudentLessonItem[];
  recentEvaluations: StudentEvaluationResultItem[];
  summary: {
    completedLessons: number;
    inProgressLessons: number;
    completedEvaluations: number;
    averageScore: number;
  };
} | null> {
  const session = await getSession();
  if (!session || session.profile.role !== 'user') return null;

  try {
    const json = await api<BackendLearningRecord>('/progress/my-record');
    const lessonRows = json.lesson_progress ?? [];
    const inProgressRows = lessonRows.filter(row => row.status === 'in_progress' || row.status === 'not_started');
    const completedRows = lessonRows.filter(row => row.status === 'completed');
    const evaluationRows = json.evaluation_results ?? [];

    return {
      inProgress: inProgressRows.map(mapRow).filter((item): item is StudentLessonItem => !!item),
      completed: completedRows.map(mapRow).filter((item): item is StudentLessonItem => !!item),
      recentEvaluations: evaluationRows
        .filter(row => !!row.id)
        .map(row => ({
          id: row.id!,
          title: row.evaluation?.title ?? 'Evaluación',
          score: row.score == null ? null : Number(row.score),
          status: row.status ?? 'pending',
          completedAt: row.completed_at ?? null,
        })),
      summary: {
        completedLessons: Number(json.summary?.completed_lessons ?? completedRows.length),
        inProgressLessons: Number(json.summary?.in_progress_lessons ?? inProgressRows.length),
        completedEvaluations: Number(json.summary?.completed_evaluations ?? 0),
        averageScore: Number(json.summary?.average_score ?? 0),
      },
    };
  } catch {
    return null;
  }
}
