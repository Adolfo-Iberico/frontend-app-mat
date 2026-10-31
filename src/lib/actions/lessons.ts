'use server';

import { revalidatePath } from 'next/cache';
import { getCourseById } from '@/lib/actions/courses';
import { api, apiErrorMessage } from '@/lib/api/client';
import { getSession } from '@/lib/session';
import { fail, ok } from '@/lib/result';
import type { Lesson, LessonResource } from '@/lib/types';

/**
 * "Lecciones internas" del curso = contenido + recursos del backend.
 * El progreso se registra contra la lección real con POST /lessons/{id}/progress.
 */

/** Ítems del curso (contenido + recursos) para el reproductor. */
export async function getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
  const course = await getCourseById(courseId);
  return course?.lessons ?? [];
}

/** Ids de ítems completados: si la lección real está al 100%, todos los ítems. */
export async function getLessonProgressForCourse(_userId: string, courseId: string): Promise<string[]> {
  const course = await getCourseById(courseId);
  if (!course) return [];
  if ((course.progress ?? 0) >= 100) {
    return course.lessons.map(lesson => lesson.id);
  }
  return [];
}

function realLessonId(itemOrLessonId: string, courseId: string): string {
  if (itemOrLessonId.startsWith('content-') || itemOrLessonId.startsWith('resource-')) {
    return courseId;
  }
  return itemOrLessonId;
}

/** Marca la lección real como completada (100) o reinicia su progreso (0). */
export async function toggleLessonCompleted(payload: {
  userId: string;
  courseId: string;
  lessonId: string;
  totalLessons?: number;
}): Promise<
  | {
      success: true;
      newState: boolean;
      newProgress: number;
      leveledUp?: boolean;
      newLevel?: string | null;
      totalXp?: number;
      newAchievements?: { slug: string; name: string; icon: string }[];
    }
  | { success: false; error: string }
> {
  const session = await getSession();
  if (!session) return fail('Debes iniciar sesión para registrar tu progreso.');

  const course = await getCourseById(payload.courseId);
  if (!course) return fail('No se encontró la lección.');

  const wasCompleted = (course.progress ?? 0) >= 100;
  const nextProgress = wasCompleted ? 0 : 100;
  const lessonId = realLessonId(payload.lessonId, payload.courseId);

  try {
    const json = await api<Record<string, unknown>>(`/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: { progress: nextProgress },
    });

    const gamification = (json.gamification ?? null) as
      | {
          leveled_up?: boolean;
          new_level?: string;
          total_xp?: number;
          xp?: number;
          new_achievements?: { slug: string; name: string; icon: string }[];
        }
      | null;

    return {
      success: true,
      newState: nextProgress === 100,
      newProgress: nextProgress,
      leveledUp: gamification?.leveled_up ?? false,
      newLevel: gamification?.new_level ?? null,
      totalXp: gamification?.total_xp ?? 0,
      newAchievements: gamification?.new_achievements ?? [],
    };
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Importa recursos físicos desde el storage del backend a la lección. */
export async function importLessonResources(
  courseId: string,
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    const json = await api<Record<string, unknown>>(`/lessons/${courseId}/resources/import`, {
      method: 'POST',
    });
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/learn/${courseId}`);
    const message = typeof json.message === 'string'
      ? json.message
      : 'Recursos importados correctamente.';
    return { success: true, message };
  } catch (error) {
    return { success: false, error: apiErrorMessage(error) };
  }
}

/** Agrega un recurso a la lección (docente). */
export async function createLesson(courseId: string, formData: FormData) {
  const type = String(formData.get('type') ?? 'link');
  const url = String(formData.get('url') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();

  if (!url || !title) return fail('El título y la URL del recurso son obligatorios.');

  try {
    await api(`/lessons/${courseId}/resources`, {
      method: 'POST',
      body: { type, url, title },
    });
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/learn/${courseId}`);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/**
 * Actualiza el contenido HTML de la lección (el ítem "contenido").
 * Los recursos adjuntos no se editan uno a uno: se agregan o eliminan.
 */
export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  if (lessonId.startsWith('resource-')) {
    return fail('Los recursos adjuntos no se pueden editar: elimínalo y vuelve a agregarlo.');
  }

  const content = String(formData.get('content') ?? '').trim();
  if (!content) return fail('El contenido no puede estar vacío.');

  try {
    await api(`/lessons/${courseId}`, { method: 'PUT', body: { content } });
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/learn/${courseId}`);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Elimina un recurso adjunto de la lección (docente). */
export async function deleteLesson(resourceId: string, courseId: string) {
  if (resourceId.startsWith('content-')) {
    return fail('El contenido de la lección no se puede eliminar.');
  }

  try {
    await api(`/lessons/${courseId}/resources/${resourceId}`, { method: 'DELETE' });
    revalidatePath(`/admin/courses/${courseId}/content`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/learn/${courseId}`);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Recursos adjuntos de una lección (para el panel de contenido). */
export async function getLessonResources(courseId: string): Promise<LessonResource[]> {
  const course = await getCourseById(courseId);
  return course?.resources ?? [];
}
