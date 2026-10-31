'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError, apiErrorMessage, toList, unwrap } from '@/lib/api/client';
import {
  type BackendLesson,
  buildLessonItems,
  levelToDifficulty,
  mapLessonToCourse,
} from '@/lib/api/adapters';
import { getSession } from '@/lib/session';
import { byNewest, fail, formatDateToPeruTime, ok } from '@/lib/result';
import type { Course } from '@/lib/types';

/**
 * En el modelo Aulamate, cada "curso" de la interfaz es una LECCIÓN del
 * backend (título, contenido, dificultad, unidad y grado).
 * El catálogo requiere iniciar sesión: los estudiantes ven las lecciones
 * publicadas de su grado y los docentes las suyas propias.
 */

/** Descarga todas las lecciones visibles para el usuario autenticado. */
async function fetchLessonRows(extraParams = ''): Promise<BackendLesson[]> {
  const session = await getSession();
  if (!session) return [];

  const rows: BackendLesson[] = [];
  let page = 1;

  // La API pagina de a 50; recorremos hasta 4 páginas por seguridad.
  while (page <= 4) {
    try {
      const json = await api<Record<string, unknown>>(`/lessons?per_page=50&page=${page}${extraParams}`);
      const paginator = json.data as { data?: BackendLesson[]; last_page?: number } | undefined;
      const pageRows = Array.isArray(paginator?.data) ? paginator.data : [];
      rows.push(...pageRows);
      if (!paginator?.last_page || page >= paginator.last_page) break;
      page++;
    } catch {
      break;
    }
  }

  return rows;
}

export async function fetchAllCourses(): Promise<Course[]> {
  const rows = await fetchLessonRows();
  return rows.map(mapLessonToCourse);
}

/** Catálogo público (requiere sesión): lecciones visibles para el usuario. */
export async function getPublicCourses() {
  return fetchAllCourses();
}

/** Niveles únicos del catálogo (dificultades del backend). */
export async function getDistinctLevels(): Promise<string[]> {
  const courses = await fetchAllCourses();
  return [...new Set(courses.map(c => c.level))].sort();
}

/** Categorías únicas del catálogo (unidades temáticas del backend). */
export async function getDistinctCategories(): Promise<string[]> {
  const courses = await fetchAllCourses();
  return [...new Set(courses.map(c => c.category).filter((c): c is string => !!c))].sort();
}

/** Detalle de una lección con sus "lecciones internas" (contenido + recursos). */
export async function getCourseById(courseId: string): Promise<Course | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const json = await api<Record<string, unknown>>(`/lessons/${courseId}`);
    const lesson = unwrap<BackendLesson>(json);
    const course = mapLessonToCourse(lesson);
    course.lessons = buildLessonItems(course.id, course);
    return course;
  } catch {
    return null;
  }
}

export interface AdminLessonRow {
  id: string;
  title: string;
  description: string;
  unit: string | null;
  level: string;
  grade: string | null;
  estimatedTime: number | null;
  isPublished: boolean;
  instructorName: string;
  resourceCount: number;
  evaluationCount: number;
  created: string;
}

/** Listado para el panel de administración (rol docente/admin). */
export async function getCourses(): Promise<AdminLessonRow[]> {
  const session = await getSession();
  if (!session || !['admin', 'docente'].includes(session.profile.role)) return [];

  const courses = await fetchAllCourses();
  return courses
    .slice()
    .sort(byNewest)
    .map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      unit: course.category,
      level: course.level,
      grade: course.grade ?? null,
      estimatedTime: course.estimatedTime ?? null,
      isPublished: course.is_active,
      instructorName: course.instructor.name,
      resourceCount: course.resources?.length ?? 0,
      evaluationCount: course.evaluations?.length ?? 0,
      created: formatDateToPeruTime(course.created_at),
    }));
}

/** Normaliza la entrada del formulario: acepta FormData o un objeto plano. */
function lessonPayloadFromInput(input: FormData | Record<string, unknown>) {
  const get = (key: string): string => {
    if (typeof input === 'object' && input instanceof FormData) {
      return String(input.get(key) ?? '');
    }
    const record = input as Record<string, unknown>;
    return record[key] === undefined || record[key] === null ? '' : String(record[key]);
  };
  const getBool = (key: string, fallback = false): boolean => {
    const raw = get(key);
    if (raw === '') return fallback;
    return raw === 'true' || raw === 'on' || raw === '1';
  };
  const getNumber = (key: string): number | null => {
    const raw = get(key);
    return raw === '' ? null : Number(raw);
  };

  const title = get('title').trim();
  const content = get('content').trim();
  const level = get('level') || 'Principiante';
  const unit = get('category').trim();
  const topic = get('topic').trim();
  const grade = get('grade').trim();
  const description = get('description').trim();
  const tagsRaw = get('tags').trim();

  return {
    title,
    content,
    description: description || null,
    difficulty: levelToDifficulty(level),
    unit: unit || null,
    topic: topic || null,
    grade: grade || null,
    estimated_time: getNumber('estimated_time'),
    tags: tagsRaw
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      : [],
    is_published: getBool('is_published', getBool('is_active', true)),
  };
}

/** Crea una lección (docente). */
export async function createCourse(input: FormData | Record<string, unknown>) {
  const payload = lessonPayloadFromInput(input);
  if (!payload.title || !payload.content) {
    return fail('El título y el contenido de la lección son obligatorios.');
  }

  try {
    await api('/lessons', { method: 'POST', body: payload });
    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    revalidatePath('/');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Actualiza una lección (docente propietario). */
export async function updateCourse(id: string, input: FormData | Record<string, unknown>) {
  const payload = lessonPayloadFromInput(input);
  if (!payload.title || !payload.content) {
    return fail('El título y el contenido de la lección son obligatorios.');
  }

  try {
    await api(`/lessons/${id}`, { method: 'PUT', body: payload });
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${id}`);
    revalidatePath(`/courses/${id}`);
    revalidatePath(`/learn/${id}`);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Elimina una lección (bloqueada por el backend si tiene evaluaciones). */
export async function deleteCourse(id: string) {
  try {
    await api(`/lessons/${id}`, { method: 'DELETE' });
    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Publica o despublica una lección. */
export async function setCoursePublished(id: string, published: boolean) {
  try {
    await api(`/lessons/${id}/${published ? 'publish' : 'unpublish'}`, { method: 'POST' });
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${id}`);
    revalidatePath('/courses');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Detalle público de un docente: datos visibles + sus lecciones. */
export async function getInstructorDetails(instructorId: string) {
  const courses = await fetchAllCourses();
  const byTeacher = courses.filter(c => c.instructor_id === instructorId);

  if (byTeacher.length === 0) return null;

  const instructor = byTeacher[0].instructor;
  const nameParts = instructor.name.split(' ');

  return {
    id: instructorId,
    name: instructor.name,
    specialty: byTeacher[0].topic ?? null,
    courses: byTeacher,
    stats: {
      courseCount: byTeacher.length,
      studentCount: byTeacher.reduce((sum, c) => sum + c.students, 0),
    },
    profile: {
      id: instructorId,
      first_name: nameParts[0] ?? instructor.name,
      last_name: nameParts.slice(1).join(' ') || null,
      role: 'docente' as const,
      avatar_url: instructor.avatarUrl || null,
      email: null,
      specialty: null,
      bio: null,
      bio_image_url: null,
      linkedin_url: null,
      institution: null,
      created_at: byTeacher[0].created_at,
      updated_at: byTeacher[0].updated_at,
    },
  };
}

/** Lecciones recomendadas para el estudiante (GET /lessons/recommended). */
export async function getRecommendedCourses(): Promise<Course[]> {
  const session = await getSession();
  if (!session || session.profile.role !== 'user') return [];

  try {
    const json = await api<Record<string, unknown>>('/lessons/recommended');
    const data = unwrap<{ lessons?: BackendLesson[] }>(json);
    const rows = Array.isArray(data?.lessons) ? data.lessons : [];
    return rows.map(mapLessonToCourse);
  } catch {
    return [];
  }
}

/**
 * Rutas de aprendizaje (unidad temática): lecciones agrupadas por unidad.
 * Cada "ruta" es una unidad con sus lecciones ordenadas.
 */
export interface UnitPath {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  courses: Course[];
  coursesCount: number;
  created_at: string;
  updated_at: string;
}

const LEVEL_ORDER: Record<string, number> = {
  Principiante: 0,
  Intermedio: 1,
  Avanzado: 2,
};

function sortByLearningProgress<T extends { level: Course['level']; estimatedTime?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const levelDelta = (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99);
    if (levelDelta !== 0) return levelDelta;
    return (a.estimatedTime ?? 0) - (b.estimatedTime ?? 0);
  });
}

export async function getUnitPaths(): Promise<UnitPath[]> {
  const courses = await fetchAllCourses();
  const units = new Map<string, Course[]>();

  for (const course of courses) {
    const unit = course.category ?? 'General';
    if (!units.has(unit)) units.set(unit, []);
    units.get(unit)!.push(course);
  }

  return [...units.entries()]
    .map(([unit, unitCourses]) => ({
      id: unit,
      title: unit,
      description: `Avanza de lo básico a lo avanzado en ${unit.toLowerCase()} con una secuencia didáctica clara y progresiva.`,
      image_url: null,
      courses: sortByLearningProgress(unitCourses),
      coursesCount: unitCourses.length,
      created_at: unitCourses[0]?.created_at ?? new Date().toISOString(),
      updated_at: unitCourses[0]?.updated_at ?? new Date().toISOString(),
    }))
    .sort((a, b) => {
      const firstLevelA = LEVEL_ORDER[a.courses[0]?.level ?? 'Principiante'] ?? 99;
      const firstLevelB = LEVEL_ORDER[b.courses[0]?.level ?? 'Principiante'] ?? 99;
      if (firstLevelA !== firstLevelB) return firstLevelA - firstLevelB;
      return a.title.localeCompare(b.title);
    });
}

/** Lecciones de una unidad específica (respetando el aislamiento por grado). */
export async function getUnitPathDetails(unit: string): Promise<UnitPath | null> {
  const rows = await fetchLessonRows();
  const courses = sortByLearningProgress(
    rows
      .filter(row => (row.unit ?? '') === unit)
      .map(mapLessonToCourse)
  );

  if (courses.length === 0) return null;

  return {
    id: unit,
    title: unit,
    description: `Sigue una ruta de aprendizaje progresiva en ${unit}, desde los conceptos básicos hasta los más desafiantes.`,
    image_url: null,
    courses,
    coursesCount: courses.length,
    created_at: courses[0].created_at,
    updated_at: courses[0].updated_at,
  };
}
