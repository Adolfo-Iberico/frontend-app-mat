'use server';

import { revalidatePath } from 'next/cache';
import { api, apiErrorMessage, toList } from '@/lib/api/client';
import {
  type BackendPost,
  type BackendThread,
  mapPostToAnswer,
  mapThreadToQuestion,
} from '@/lib/api/adapters';
import { getSession } from '@/lib/session';
import { byNewest, fail, ok } from '@/lib/result';
import type { Answer, Question } from '@/lib/types';

/**
 * Preguntas y respuestas sobre el foro real del backend:
 * - "Pregunta" → ForumThread (creado por docentes; los estudiantes responden).
 * - "Respuesta" → ForumPost (cualquier usuario con relación académica).
 */

/** Hilos del foro con sus respuestas cargadas. */
async function fetchThreads(lessonId?: string): Promise<Question[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const json = await api<Record<string, unknown>>('/forum');
    const rows = toList<BackendThread>(json);
    const threads = rows
      .filter(thread => (lessonId ? thread.lesson_id === lessonId : true))
      .map(mapThreadToQuestion);

    // Cargar respuestas de cada hilo (peticiones en paralelo).
    const withAnswers = await Promise.all(
      threads.map(async question => {
        try {
          const detail = await api<Record<string, unknown>>(`/forum/${question.id}`);
          const posts = Array.isArray(detail.posts) ? (detail.posts as BackendPost[]) : [];
          return {
            ...question,
            answers: posts.map(mapPostToAnswer).sort((a, b) => a.created_at.localeCompare(b.created_at)),
          };
        } catch {
          return { ...question, answers: [] as Answer[] };
        }
      })
    );

    return withAnswers.sort(byNewest);
  } catch {
    return [];
  }
}

export async function getQuestionsByLessonId(lessonId: string): Promise<Question[]> {
  return fetchThreads(lessonId);
}

/** El "curso" es la lección real: mismos hilos. */
export async function getQuestionsByCourseId(courseId: string): Promise<Question[]> {
  return fetchThreads(courseId);
}

/** Crea un hilo de discusión (docentes y estudiantes autenticados). */
export async function postQuestion(payload: {
  lessonId?: string;
  course_id: string;
  userId: string;
  title: string;
  content: string;
}) {
  const session = await getSession();
  if (!session) return fail('Debes iniciar sesión.');

  // Los estudiantes deben asociar su pregunta a la lección (el backend la
  // dirige al docente de la lección); el "curso" de la UI ES la lección real.
  const lessonId = payload.course_id;

  try {
    await api('/forum', {
      method: 'POST',
      body: {
        title: payload.title,
        body: payload.content,
        lesson_id: lessonId,
      },
    });
    revalidatePath(`/learn/${lessonId}`);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Responder en un hilo (cualquier usuario autenticado con acceso). */
export async function postAnswer(payload: { question_id: string; user_id: string; content: string }) {
  const session = await getSession();
  if (!session) return fail('Debes iniciar sesión.');

  try {
    const json = await api<Record<string, unknown>>(`/forum/${payload.question_id}/post`, {
      method: 'POST',
      body: { body: payload.content },
    });
    const data = (json.data ?? null) as BackendPost | null;
    if (data) {
      return ok(mapPostToAnswer(data));
    }
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Elimina una respuesta (su autor o el docente dueño del hilo). */
export async function deleteAnswer({ answerId }: { answerId: string; userId?: string }) {
  try {
    await api(`/forum/posts/${answerId}`, { method: 'DELETE' });
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Los hilos no se eliminan por API; los docentes pueden cerrarlos. */
export async function deleteQuestion(_payload: { questionId: string; userId?: string }) {
  return fail('Los hilos de discusión no se pueden eliminar. Un docente puede cerrarlos.');
}

/** Cierra un hilo (docente dueño del hilo). */
export async function closeThread(threadId: string) {
  try {
    await api(`/forum/${threadId}/close`, { method: 'POST' });
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Votos: el foro del backend no los soporta; se mantiene la compatibilidad. */
export async function incrementVote(_payload: { id: string; type: 'question' | 'answer' }) {
  return ok();
}
