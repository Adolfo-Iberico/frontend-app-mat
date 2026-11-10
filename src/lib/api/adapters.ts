/**
 * Adaptadores: convierten las respuestas de la API de Aulamate en las
 * formas de datos que consumen las pantallas del frontend.
 *
 * Correspondencia de conceptos (frontend -> backend):
 * - "Curso" de la UI -> Lesson del backend (con dificultad, unidad y grado)
 * - "Lección" interna -> recursos del backend (pdf/video/link) + contenido
 * - "Pregunta" -> ForumThread; "Respuesta" -> ForumPost
 * - "Novedad" -> Announcement
 * - Roles: admin -> admin; teacher/coordinador/director -> docente; student -> user
 */
import type {
  Answer,
  Course,
  EvaluationQuestion,
  EvaluationSummary,
  Lesson,
  LessonResource,
  NewsArticle,
  Notification,
  Profile,
  Question,
} from '@/lib/types';
import { getApiBaseUrl } from '@/lib/api/config';

export interface BackendUser {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: { id?: string; name?: string } | null;
  profile_image?: string | null;
  institution?: string | null;
  grade?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  studentProfile?: Record<string, unknown> | null;
  teacherProfile?: { department?: string | null; specialization?: string | null } | null;
}

export interface BackendLesson {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  teacher_id?: string;
  teacher?: { id?: string; full_name?: string; profile_image?: string | null } | null;
  grade?: string | null;
  unit?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  estimated_time?: number | null;
  is_published?: boolean;
  resources?: LessonResource[] | null;
  order?: number | null;
  views_count?: number;
  created_at?: string;
  updated_at?: string;
  user_progress?: { progress?: number; status?: string } | null;
  evaluations?: BackendEvaluation[] | null;
}

export interface BackendEvaluation {
  id: string;
  title: string;
  description?: string | null;
  type?: string;
  difficulty?: string;
  time_limit?: number | null;
  max_attempts?: number;
  is_published?: boolean;
  total_questions?: number;
  due_date?: string | null;
  created_at?: string;
}

export interface BackendThread {
  id: string;
  teacher_id?: string;
  author_id?: string | null;
  lesson_id?: string | null;
  title: string;
  body?: string;
  status?: string;
  posts_count?: number;
  created_at?: string;
  teacher?: { id?: string; full_name?: string } | null;
  author?: { id?: string; full_name?: string } | null;
  lesson?: { id?: string; title?: string } | null;
}

export interface BackendPost {
  id: string;
  thread_id?: string;
  user_id?: string;
  body: string;
  created_at?: string;
  user?: { id?: string; full_name?: string; role?: { name?: string } } | null;
}

export interface BackendAnnouncement {
  id: string;
  title: string;
  body: string;
  type?: string;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  author?: { id?: string; full_name?: string } | null;
}

export interface BackendNotification {
  id: string;
  user_id?: string;
  title?: string | null;
  message?: string | null;
  link?: string | null;
  is_read?: boolean;
  created_at?: string;
}

/** Mapea el rol del backend al rol de la UI. */
export function mapBackendRole(roleName?: string | null): Profile['role'] {
  if (roleName === 'admin') return 'admin';
  if (roleName && ['teacher', 'coordinador', 'director'].includes(roleName)) return 'docente';
  return 'user';
}

/** Divide "Nombre Apellido Apellido" en first/last name. */
export function splitFullName(fullName?: string | null): { first_name: string | null; last_name: string | null } {
  const name = (fullName ?? '').trim();
  if (!name) return { first_name: null, last_name: null };
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: null };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

export function mapUserToProfile(user: BackendUser): Profile {
  const { first_name, last_name } = splitFullName(user.full_name);
  return {
    id: user.id,
    first_name,
    last_name,
    role: mapBackendRole(user.role?.name),
    avatar_url: user.profile_image ?? null,
    email: user.email ?? null,
    institution: user.institution ?? null,
    grade: user.grade ?? null,
    is_active: user.is_active ?? true,
    specialty: user.teacherProfile?.specialization ?? null,
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: user.updated_at ?? new Date().toISOString(),
  };
}

export function difficultyToLevel(difficulty?: string | null): Course['level'] {
  if (difficulty === 'intermediate') return 'Intermedio';
  if (difficulty === 'advanced') return 'Avanzado';
  return 'Principiante';
}

export function levelToDifficulty(level?: string | null): string {
  if (level === 'Intermedio') return 'intermediate';
  if (level === 'Avanzado') return 'advanced';
  return 'basic';
}

export function mapEvaluationSummary(evaluation: BackendEvaluation): EvaluationSummary {
  return {
    id: evaluation.id,
    title: evaluation.title,
    description: evaluation.description ?? null,
    type: evaluation.type ?? 'practice',
    difficulty: evaluation.difficulty ?? 'basic',
    timeLimit: evaluation.time_limit ?? null,
    maxAttempts: evaluation.max_attempts ?? 1,
    isPublished: !!evaluation.is_published,
    totalQuestions: evaluation.total_questions ?? 0,
    dueDate: evaluation.due_date ?? null,
  };
}

/**
 * Convierte una lección del backend en el "Course" que consume la UI.
 */
export function mapLessonToCourse(lesson: BackendLesson): Course {
  const teacherId = lesson.teacher?.id ?? lesson.teacher_id ?? '';
  const apiOrigin = new URL(getApiBaseUrl()).origin;

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description ?? '',
    long_description: lesson.content ?? null,
    instructor_id: teacherId,
    price: 0,
    price_usd: 0,
    original_price: null,
    presale_price: null,
    is_active: !!lesson.is_published,
    category: lesson.unit ?? null,
    category_id: lesson.unit ?? '',
    image_url: lesson.image_url ?? null,
    level: difficultyToLevel(lesson.difficulty),
    language: 'Español',
    created_at: lesson.created_at ?? new Date().toISOString(),
    updated_at: lesson.updated_at ?? lesson.created_at ?? new Date().toISOString(),
    lessons: [],
    instructor: {
      id: teacherId,
      name: lesson.teacher?.full_name ?? 'Docente',
      avatarUrl: lesson.teacher?.profile_image ?? '',
    },
    rating: 0,
    reviews: 0,
    students: lesson.views_count ?? 0,
    lastUpdated: lesson.updated_at ?? lesson.created_at ?? new Date().toISOString(),
    brochure: null,
    grade: lesson.grade ?? null,
    estimatedTime: lesson.estimated_time ?? null,
    topic: lesson.topic ?? null,
    tags: lesson.tags ?? [],
    resources: (lesson.resources ?? []).map(resource => ({
      ...resource,
      url: resource.url.startsWith('/materiales/')
        ? new URL(resource.url, apiOrigin).toString()
        : resource.url,
    })),
    progress: lesson.user_progress?.progress ?? null,
    progressStatus: lesson.user_progress?.status ?? null,
    evaluations: (lesson.evaluations ?? []).map(mapEvaluationSummary),
    viewsCount: lesson.views_count ?? 0,
  };
}

/**
 * Construye la lista de "lecciones internas" del curso (la UI del reproductor):
 * el primer ítem es el contenido HTML de la lección y el resto son recursos.
 */
export function buildLessonItems(courseId: string, course: Course): Lesson[] {
  const items: Lesson[] = [];

  if (course.long_description) {
    items.push({
      id: `content-${courseId}`,
      course_id: courseId,
      title: 'Contenido de la lección',
      description: null,
      duration: course.estimatedTime ? `${course.estimatedTime} min` : null,
      video_url: null,
      resource_url: null,
      live_session_url: null,
      live_session_datetime: null,
      is_free: true,
      order: 0,
      created_at: course.created_at,
      updated_at: course.updated_at,
      lesson_type: 'video',
      estimated_time: course.estimatedTime ?? null,
      isContent: true,
    });
  }

  (course.resources ?? []).forEach((resource, index) => {
    items.push({
      id: resource.id ?? `resource-${index}-${courseId}`,
      course_id: courseId,
      title: resource.title || resource.type || 'Recurso',
      description: resource.description ?? null,
      duration: null,
      video_url: resource.type === 'video' ? resource.url : null,
      resource_url: ['pdf', 'link', 'audio'].includes(resource.type) ? resource.url : null,
      live_session_url: null,
      live_session_datetime: null,
      is_free: true,
      order: index + 1,
      created_at: resource.created_at ?? course.created_at,
      updated_at: course.updated_at,
      lesson_type: 'video',
      estimated_time: null,
      resourceType: (resource.type as Lesson['resourceType']) ?? null,
      url: resource.url,
    });
  });

  return items;
}

export function mapThreadToQuestion(thread: BackendThread): Question {
  const authorName = thread.author?.full_name ?? thread.teacher?.full_name ?? 'Usuario';
  const authorId = thread.author_id ?? thread.teacher_id ?? '';

  return {
    id: thread.id,
    user_id: authorId,
    course_id: thread.lesson_id ?? '',
    lesson_id: thread.lesson_id ?? '',
    author: { name: authorName, avatarUrl: '' },
    title: thread.title,
    content: thread.body ?? '',
    created_at: thread.created_at ?? new Date().toISOString(),
    votes: thread.posts_count ?? 0,
    answers: [],
    lesson: thread.lesson
      ? { id: thread.lesson.id ?? '', title: thread.lesson.title ?? '' }
      : null,
    status: thread.status,
  };
}

export function mapPostToAnswer(post: BackendPost): Answer {
  const roleName = post.user?.role?.name;
  return {
    id: post.id,
    question_id: post.thread_id ?? '',
    user_id: post.user_id ?? '',
    author: {
      name: post.user?.full_name ?? 'Usuario',
      avatarUrl: '',
      isInstructor: ['teacher', 'coordinador', 'director'].includes(roleName ?? ''),
    },
    content: post.body,
    created_at: post.created_at ?? new Date().toISOString(),
    votes: 0,
  };
}

export function mapAnnouncementToNews(announcement: BackendAnnouncement): NewsArticle {
  return {
    id: announcement.id,
    title: announcement.title,
    description: announcement.body,
    long_description: announcement.body,
    image_urls: [],
    author_id: announcement.created_by ?? '',
    author: { name: announcement.author?.full_name ?? 'Administración', avatarUrl: '' },
    created_at: announcement.created_at ?? new Date().toISOString(),
    updated_at: announcement.updated_at ?? announcement.created_at ?? new Date().toISOString(),
    is_project: false,
  };
}

export function mapNotification(notification: BackendNotification): Notification {
  return {
    id: notification.id,
    user_id: notification.user_id ?? '',
    message: notification.title && notification.message
      ? `${notification.title}: ${notification.message}`
      : notification.message ?? notification.title ?? '',
    link: mapNotificationLink(notification.link),
    read: !!notification.is_read,
    created_at: notification.created_at ?? new Date().toISOString(),
    updated_at: notification.created_at ?? new Date().toISOString(),
  };
}

export function mapNotificationLink(link?: string | null): string | null {
  if (!link) return null;
  if (link.startsWith('/announcements/')) {
    const id = link.replace('/announcements/', '');
    return `/news/${id}`;
  }
  return link;
}

export function normalizeQuestionOptions(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((option, index) => {
      if (typeof option === 'string') {
        return { label: String.fromCharCode(65 + index), value: option };
      }
      if (option && typeof option === 'object') {
        const pair = option as { label?: unknown; value?: unknown };
        const value = typeof pair.value === 'string' && pair.value !== '' ? pair.value : String(pair.label ?? '');
        const label = typeof pair.label === 'string' && pair.label !== '' ? pair.label : String.fromCharCode(65 + index);
        return { label, value };
      }
      return null;
    })
    .filter((option): option is { label: string; value: string } => !!option && option.value !== '');
}

export function mapEvaluationQuestion(raw: Record<string, unknown>): EvaluationQuestion {
  return {
    id: String(raw.id ?? ''),
    type: (raw.type as EvaluationQuestion['type']) ?? 'multiple_choice',
    question_text: String(raw.question_text ?? ''),
    options: normalizeQuestionOptions(raw.options),
    correct_answer: typeof raw.correct_answer === 'string' ? raw.correct_answer : null,
    explanation: typeof raw.explanation === 'string' ? raw.explanation : null,
    points: Number(raw.points ?? 1),
    order: typeof raw.order === 'number' ? raw.order : null,
  };
}
