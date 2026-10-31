'use server';

import { fetchAllCourses } from '@/lib/actions/courses';
import { getStudentLessons } from '@/lib/actions/dashboard';
import { getSession } from '@/lib/session';

export interface AiResourceSuggestionInput {
  userPreferences: string;
}

const LEVEL_PRIORITY: Record<string, number> = {
  Principiante: 0,
  Intermedio: 1,
  Avanzado: 2,
};

function normalizeLevel(level?: string | null): 'Principiante' | 'Intermedio' | 'Avanzado' {
  if (level === 'Intermedio') return 'Intermedio';
  if (level === 'Avanzado') return 'Avanzado';
  return 'Principiante';
}

function inferLevelFromText(text: string): 'Principiante' | 'Intermedio' | 'Avanzado' | null {
  const normalized = text.toLowerCase();

  if (/(principiante|básico|basico|inicio|novato|inicio)/.test(normalized)) return 'Principiante';
  if (/(intermedio|medio|nivel medio|progresando)/.test(normalized)) return 'Intermedio';
  if (/(avanzado|complejo|retos|desafiante|expert|profesional)/.test(normalized)) return 'Avanzado';

  return null;
}

async function resolveStudentLevel(): Promise<'Principiante' | 'Intermedio' | 'Avanzado'> {
  const session = await getSession();
  if (!session) return 'Principiante';

  const [courses, studentLessons] = await Promise.all([fetchAllCourses(), getStudentLessons()]);
  if (!studentLessons) return 'Principiante';

  const learnedIds = new Set([
    ...studentLessons.completed.map(item => item.id),
    ...studentLessons.inProgress.map(item => item.id),
  ]);

  const levels = courses
    .filter(course => learnedIds.has(course.id))
    .map(course => normalizeLevel(course.level));

  if (levels.length === 0) return 'Principiante';

  return levels.reduce((highest, current) =>
    LEVEL_PRIORITY[current] > LEVEL_PRIORITY[highest] ? current : highest,
  levels[0]);
}

/**
 * Sugerencia de lecciones por nivel y progreso del estudiante.
 * La lógica prioriza la secuencia didáctica: básico -> intermedio -> avanzado.
 */
export async function getResourceSuggestion(
  input: AiResourceSuggestionInput
): Promise<{ suggestedResources?: string; error?: string }> {
  const rawText = input.userPreferences?.trim() ?? '';
  const words = rawText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const lessons = await fetchAllCourses();
  const available = lessons.filter(lesson => lesson.is_active);

  const preferredLevel = inferLevelFromText(rawText) ?? (await resolveStudentLevel());
  const targetPriority = LEVEL_PRIORITY[preferredLevel] ?? 0;

  const scored = available.map(lesson => {
    const haystack = `${lesson.title} ${lesson.description ?? ''} ${lesson.category ?? ''}`.toLowerCase();
    let score = 0;

    if (words.length > 0) {
      score += words.filter(word => haystack.includes(word)).length * 3;
    }

    const lessonPriority = LEVEL_PRIORITY[normalizeLevel(lesson.level)] ?? 99;
    if (lesson.level === preferredLevel) {
      score += 8;
    } else if (Math.abs(lessonPriority - targetPriority) === 1) {
      score += 3;
    }

    if (targetPriority >= 1 && lessonPriority < targetPriority) {
      score += 1;
    }

    return { lesson, score };
  });

  const picks = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.lesson);

  const recommended = picks.length > 0 ? picks : available.slice(0, 3);

  if (recommended.length === 0) {
    return { suggestedResources: 'Todavía no hay lecciones disponibles para tu grado. ¡Vuelve pronto!' };
  }

  return {
    suggestedResources: [
      `Tu nivel actual estimado es ${preferredLevel}. Te sugerimos seguir esta secuencia didáctica:`,
      ...recommended.map(lesson => `• ${lesson.title} — ${lesson.level} · ${lesson.description}`),
    ].join('\n'),
  };
}
