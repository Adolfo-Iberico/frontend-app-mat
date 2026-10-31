/**
 * Convención de resultados de las server actions:
 * `{ success: true, data?, message? }` o `{ success: false, error }`.
 */

export interface OkResult<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface FailResult {
  success: false;
  error: string;
}

export type ActionResult<T = unknown> = OkResult<T> | FailResult;

export function ok<T>(data?: T, message?: string): OkResult<T> {
  return { success: true, data, message };
}

export function fail(error: string): FailResult {
  return { success: false, error };
}

/** Comparador por fecha de creación (más reciente primero). */
export function byNewest<T extends { created_at?: string }>(a: T, b: T): number {
  return (b.created_at ?? '').localeCompare(a.created_at ?? '');
}

/** Formatea una fecha ISO en hora de Perú (America/Lima). */
export function formatDateToPeruTime(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return '';
  }
}
