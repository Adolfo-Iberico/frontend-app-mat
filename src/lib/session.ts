import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api, ApiError, AUTH_COOKIE, getAuthToken } from '@/lib/api/client';
import { mapUserToProfile } from '@/lib/api/adapters';
import type { AuthUser, Profile } from '@/lib/types';

/**
 * Sesión real contra la API de Aulamate:
 * el token Bearer de Sanctum vive en una cookie httpOnly y el perfil se
 * resuelve en cada petición con GET /user/profile.
 */
export const SESSION_COOKIE = AUTH_COOKIE;

export interface Session {
  user: AuthUser;
  profile: Profile;
}

export async function getSession(): Promise<Session | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const json = await api<{ user?: Record<string, unknown> }>('/user/profile', { token });
    if (!json?.user) return null;

    const profile = mapUserToProfile(json.user as never);
    return { user: { id: profile.id, email: profile.email ?? '' }, profile };
  } catch (error) {
    // Token inválido/expirado o API caída: tratamos al usuario como anónimo.
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    return null;
  }
}

/** Exige una sesión con alguno de los roles indicados; si no, redirige. */
export async function requireRole(
  roles: Array<Profile['role']> = ['admin', 'docente'],
  next?: string
): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
  if (!roles.includes(session.profile.role)) redirect('/');
  return session;
}

/** Reservado para uso futuro: limpia la cookie de sesión desde un server action. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
