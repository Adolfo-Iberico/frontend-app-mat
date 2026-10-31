/**
 * Cliente HTTP para la API de Aulamate (backend Laravel, prefijo /api/v1).
 *
 * - La URL base se configura con la variable de entorno API_BASE_URL.
 * - El token de Sanctum se guarda en una cookie httpOnly (solo servidor),
 *   por lo que nunca se expone al navegador.
 * - Todas las llamadas se hacen desde el servidor (server actions / server
 *   components), así que el CORS del navegador no interviene.
 */
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/api/config';

export const API_BASE_URL = getApiBaseUrl();

/** Cookie donde se guarda el token Bearer de Sanctum. */
export const AUTH_COOKIE = 'aulamate_session';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Token explícito; si no se pasa se usa el de la cookie. */
  token?: string | null;
  /** Cabeceras extra. */
  headers?: Record<string, string>;
}

/** Lee el token de la cookie de sesión (solo servidor). */
export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

/** Guarda el token en la cookie httpOnly. Usar solo dentro de server actions. */
export async function setAuthToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

/** Borra la cookie del token. Usar solo dentro de server actions. */
export async function clearAuthToken(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

/**
 * Ejecuta una petición contra la API y devuelve el JSON de respuesta.
 * Lanza ApiError con el mensaje del backend si la respuesta no es 2xx.
 */
export async function api<T = Record<string, unknown>>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = options.token !== undefined ? options.token : await getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Platform': 'web',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const payload = (json ?? {}) as { message?: string; errors?: Record<string, string[]> };
    const message = payload.message ?? `Error ${res.status} al contactar la API`;
    throw new ApiError(message, res.status, payload.errors);
  }

  return (json ?? {}) as T;
}

/**
 * Extrae una lista de cualquier formato de respuesta del backend:
 * - `{ data: { data: [...] } }`  → paginador dentro de envelope (p. ej. /lessons)
 * - `{ data: [...] }`           → lista directa o paginador de primer nivel
 * - `[...]`                      → arreglo plano
 */
export function toList<T = Record<string, unknown>>(json: unknown): T[] {
  const root = json as Record<string, unknown> | null;
  if (Array.isArray(json)) return json as T[];
  const data = root?.data;
  if (Array.isArray(data)) return data as T[];
  const inner = (data as Record<string, unknown> | undefined)?.data;
  if (Array.isArray(inner)) return inner as T[];
  return [];
}

/** Devuelve el contenido de `data` si existe, o el objeto completo. */
export function unwrap<T = Record<string, unknown>>(json: unknown): T {
  const root = json as Record<string, unknown> | null;
  if (root && 'data' in root) return root.data as T;
  return (json ?? {}) as T;
}

/** Convierte un error de API o de red en un mensaje legible para el usuario. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
    if (error.status === 403) return 'No tienes permisos para realizar esta acción.';
    if (error.status === 422 && error.errors) {
      const first = Object.values(error.errors)[0];
      if (first?.[0]) return first[0];
    }
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
