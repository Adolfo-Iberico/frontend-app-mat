'use server';

import { api, apiErrorMessage, toList } from '@/lib/api/client';
import { getSession } from '@/lib/session';

export interface AcademicReportData {
  performance: Record<string, unknown> | null;
  grades: Record<string, unknown>;
  error: string | null;
}

export async function getAcademicReports(): Promise<AcademicReportData> {
  const session = await getSession();
  if (!session || !['admin', 'docente'].includes(session.profile.role)) {
    return { performance: null, grades: {}, error: 'No tienes permiso para consultar reportes.' };
  }

  try {
    const [performance, grades] = await Promise.all([
      api<Record<string, unknown>>('/reports/performance'),
      api<Record<string, unknown>>('/reports/grades?per_page=100'),
    ]);
    return {
      performance: (performance.data ?? null) as Record<string, unknown> | null,
      grades,
      error: null,
    };
  } catch (error) {
    return { performance: null, grades: {}, error: apiErrorMessage(error) };
  }
}

export interface TeacherStudentRow {
  id: string;
  full_name: string;
  email: string;
  grade: string | null;
  section: string | null;
}

export async function getTeacherStudents(page = 1): Promise<{
  students: TeacherStudentRow[];
  error: string | null;
  currentPage: number;
  lastPage: number;
}> {
  const session = await getSession();
  if (!session || session.profile.role !== 'docente') {
    return { students: [], error: 'Solo docentes pueden consultar el seguimiento de estudiantes.', currentPage: 1, lastPage: 1 };
  }

  try {
    const json = await api<Record<string, unknown>>(`/students-manager?per_page=100&page=${Math.max(1, Math.floor(page))}`);
    const rows = toList<Record<string, unknown>>(json);
    return {
      students: rows
        .filter(row => typeof row.id === 'string')
        .map(row => ({
          id: String(row.id),
          full_name: String(row.full_name ?? 'Estudiante'),
          email: String(row.email ?? ''),
          grade: typeof row.salon_grade === 'string' ? row.salon_grade : null,
          section: typeof row.salon_section === 'string' ? row.salon_section : null,
        })),
      error: null,
      currentPage: Number((json.data as Record<string, unknown> | undefined)?.current_page ?? 1),
      lastPage: Number((json.data as Record<string, unknown> | undefined)?.last_page ?? 1),
    };
  } catch (error) {
    return { students: [], error: apiErrorMessage(error), currentPage: 1, lastPage: 1 };
  }
}

export async function getTeacherStudentReport(studentId: string): Promise<{
  data: Record<string, unknown> | null;
  error: string | null;
}> {
  const session = await getSession();
  if (!session || session.profile.role !== 'docente') {
    return { data: null, error: 'Solo docentes pueden consultar este reporte.' };
  }

  try {
    const json = await api<Record<string, unknown>>(`/reports/student/${encodeURIComponent(studentId)}`);
    return { data: json, error: null };
  } catch (error) {
    return { data: null, error: apiErrorMessage(error) };
  }
}
