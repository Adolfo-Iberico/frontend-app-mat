'use server';

import { revalidatePath } from 'next/cache';
import { api, apiErrorMessage, toList, unwrap } from '@/lib/api/client';
import {
  type BackendEvaluation,
  type BackendLesson,
  mapEvaluationQuestion,
  mapEvaluationSummary,
} from '@/lib/api/adapters';
import { getSession } from '@/lib/session';
import { fail, ok } from '@/lib/result';
import type {
  EvaluationQuestion,
  EvaluationSubmissionResult,
  EvaluationSummary,
  QuizQuestion,
} from '@/lib/types';

/**
 * Evaluaciones reales del backend:
 * - Las preguntas se sirven con GET /evaluations/{id}/questions
 *   (al estudiante se le oculta la respuesta correcta).
 * - El envío se califica EN EL SERVIDOR con POST /evaluations/{id}/submit
 *   (escala 0–20; se exige ≥ 11 para aprobar).
 */

/** Evaluación principal de la lección (la primera publicada). */
export async function getEvaluationByCourseId(courseId: string): Promise<EvaluationSummary | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const json = await api<Record<string, unknown>>(`/lessons/${courseId}`);
    const lesson = unwrap<BackendLesson>(json);
    const evaluations = lesson.evaluations ?? [];
    const published = evaluations.filter(e => e.is_published);
    const chosen = published[0] ?? evaluations[0];
    if (!chosen) return null;
    return mapEvaluationSummary(chosen);
  } catch {
    return null;
  }
}

/** Preguntas de la evaluación principal de la lección. */
export async function getQuizQuestionsByCourseId(courseId: string): Promise<QuizQuestion[]> {
  const evaluation = await getEvaluationByCourseId(courseId);
  if (!evaluation) return [];

  try {
    const json = await api<Record<string, unknown>>(`/evaluations/${evaluation.id}/questions`);
    const rows = toList<Record<string, unknown>>(json);
    const questions = rows.map(mapEvaluationQuestion);

    return questions.map<QuizQuestion>(question => ({
      id: question.id,
      course_id: courseId,
      question: question.question_text,
      options: question.options.map(option => option.value),
      correctAnswer: question.correct_answer ?? '',
      type: (question.type as QuizQuestion['type']) ?? 'multiple_choice',
      points: question.points,
      explanation: question.explanation,
      evaluationId: evaluation.id,
      created_at: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/** Preguestas crudas (con tipo y pares label/value) para la página de evaluación. */
export async function getEvaluationQuestions(courseId: string): Promise<EvaluationQuestion[]> {
  const evaluation = await getEvaluationByCourseId(courseId);
  if (!evaluation) return [];

  try {
    const json = await api<Record<string, unknown>>(`/evaluations/${evaluation.id}/questions`);
    const rows = toList<Record<string, unknown>>(json);
    return rows.map(mapEvaluationQuestion);
  } catch {
    return [];
  }
}

/** Envía las respuestas y devuelve la calificación del servidor (0–20). */
export async function submitEvaluation(
  courseId: string,
  answers: { question_id: string; answer: string }[],
  timeTaken?: number
): Promise<EvaluationSubmissionResult | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return fail('Debes iniciar sesión para rendir la evaluación.');

  const evaluation = await getEvaluationByCourseId(courseId);
  if (!evaluation) return fail('Esta lección no tiene una evaluación publicada.');

  try {
    const json = await api<Record<string, unknown>>(`/evaluations/${evaluation.id}/submit`, {
      method: 'POST',
      body: {
        answers,
        ...(timeTaken ? { time_taken: timeTaken } : {}),
      },
    });

    const data = unwrap<{
      score?: number;
      correct_answers?: number;
      total_questions?: number;
      grading_warning?: boolean;
      result?: {
        score?: number;
        max_score?: number;
        correct_answers?: number;
        total_questions?: number;
        student_answers?: {
          question_id?: string;
          answer?: string;
          answer_display?: string;
          is_correct?: boolean;
          question?: {
            question_text?: string;
            correct_answer_display?: string;
            explanation?: string | null;
          } | null;
        }[];
      };
    }>(json);

    revalidatePath(`/learn/${courseId}`);

    return {
      success: true as const,
      score: Number(data?.score ?? data?.result?.score ?? 0),
      maxScore: Number(data?.result?.max_score ?? 20),
      correctAnswers: Number(data?.correct_answers ?? data?.result?.correct_answers ?? 0),
      totalQuestions: Number(data?.total_questions ?? data?.result?.total_questions ?? 0),
      answers: (data?.result?.student_answers ?? []).map(answer => ({
        questionId: String(answer.question_id ?? ''),
        question: String(answer.question?.question_text ?? 'Pregunta'),
        answer: String(answer.answer_display ?? answer.answer ?? ''),
        correctAnswer: answer.question?.correct_answer_display ?? null,
        isCorrect: Boolean(answer.is_correct),
        explanation: answer.question?.explanation ?? null,
      })),
      gradingWarning: !!data?.grading_warning,
      message: typeof json.message === 'string' ? json.message : undefined,
    };
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/**
 * Sincroniza las preguntas de la evaluación de la lección (docente):
 * crea la evaluación si no existe y reemplaza todas sus preguntas.
 */
export async function saveQuizQuestions(
  courseId: string,
  questions: Array<{
    id?: string;
    question: string;
    options?: string[];
    correctAnswer?: string;
    type?: string;
    points?: number;
    explanation?: string;
  }>
) {
  const session = await getSession();
  if (!session || !['admin', 'docente'].includes(session.profile.role)) {
    return fail('No tienes permisos para editar evaluaciones.');
  }

  try {
    // 1. Localizar (o crear) la evaluación de la lección.
    const lessonJson = await api<Record<string, unknown>>(`/lessons/${courseId}`);
    const lesson = unwrap<BackendLesson>(lessonJson);
    const existing = (lesson.evaluations ?? []).find(e => e.is_published) ?? (lesson.evaluations ?? [])[0];

    let evaluationId: string;

    if (existing) {
      evaluationId = existing.id;
      // Quitar publicación si ya no hay preguntas.
      if (questions.length === 0) {
        await api(`/evaluations/${evaluationId}/unpublish`, { method: 'POST' });
      }
    } else {
      if (questions.length === 0) return ok(); // Nada que crear.

      const created = await api<Record<string, unknown>>('/evaluations', {
        method: 'POST',
        body: {
          title: `Evaluación: ${lesson.title}`,
          description: `Evaluación de la lección ${lesson.title}.`,
          lesson_id: courseId,
          type: 'practice',
          difficulty: lesson.difficulty ?? 'basic',
          time_limit: 20,
          max_attempts: 3,
          auto_correct: true,
          is_published: false,
        },
      });
      evaluationId = String(unwrap<BackendEvaluation>(created).id ?? '');
    }

    // 2. Eliminar las preguntas actuales.
    const currentJson = await api<Record<string, unknown>>(`/evaluations/${evaluationId}/questions`);
    const currentQuestions = toList<{ id?: string }>(currentJson);
    for (const question of currentQuestions) {
      if (question.id) {
        await api(`/evaluations/questions/${question.id}`, { method: 'DELETE' });
      }
    }

    // 3. Crear las preguntas nuevas.
    for (const [index, question] of questions.entries()) {
      const type = (question.type as 'multiple_choice' | 'fill_blank') ?? (question.options && question.options.length > 0 ? 'multiple_choice' : 'fill_blank');
      const options = (question.options ?? []).map((option, optionIndex) => ({
        label: String.fromCharCode(65 + optionIndex),
        value: option,
      }));

      await api(`/evaluations/${evaluationId}/questions`, {
        method: 'POST',
        body: {
          type,
          question_text: question.question,
          options: type === 'multiple_choice' ? options : null,
          correct_answer: question.correctAnswer ?? '',
          explanation: question.explanation ?? null,
          points: question.points && question.points > 0 ? question.points : 1,
          order: index + 1,
        },
      });
    }

    // 4. Publicar la evaluación si tiene preguntas.
    if (questions.length > 0) {
      const summary = await api<Record<string, unknown>>(`/evaluations/${evaluationId}`);
      const evaluation = unwrap<BackendEvaluation>(summary);
      if (!evaluation.is_published) {
        await api(`/evaluations/${evaluationId}/publish`, { method: 'POST' });
      }
    }

    revalidatePath(`/admin/courses/${courseId}/evaluation`);
    revalidatePath(`/learn/${courseId}/evaluation`);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}
