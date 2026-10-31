'use server';

import { api, ApiError, API_BASE_URL, apiErrorMessage, clearAuthToken, setAuthToken } from '@/lib/api/client';
import { mapUserToProfile } from '@/lib/api/adapters';
import { getSession } from '@/lib/session';
import { ok, fail } from '@/lib/result';

/**
 * Autenticación real contra la API de Aulamate (Laravel Sanctum).
 * El token Bearer se guarda en una cookie httpOnly del lado del servidor.
 */

export async function getCurrentSession() {
  return getSession();
}

/** URL del flujo OAuth web de Google configurado en el backend. */
export async function getGoogleSignInUrl() {
  return `${API_BASE_URL}/auth/google/redirect`;
}

/** Canjea el código OAuth temporal por una sesión local. */
export async function completeGoogleSignIn(code: string) {
  if (!code) return fail('No se recibió el código de autenticación de Google.');

  try {
    const json = await api<{ access_token?: string }>('/auth/google/exchange-code', {
      method: 'POST',
      token: null,
      body: { code },
    });

    if (!json.access_token) return fail('Google no devolvió un token de acceso.');

    await setAuthToken(json.access_token);
    const session = await getSession();
    if (!session) {
      await clearAuthToken();
      return fail('No se pudo verificar la sesión de Google. Inténtalo de nuevo.');
    }

    return ok({ role: session.profile.role });
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Inicio de sesión real: email + contraseña contra POST /auth/login. */
export async function signIn({ email, password }: { email: string; password?: string }) {
  try {
    const json = await api<{ access_token?: string; user?: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      token: null,
      body: { email: email.trim().toLowerCase(), password: password ?? '' },
    });

    if (!json.access_token) return fail('La API no devolvió un token de acceso.');

    await setAuthToken(json.access_token);
    const profile = mapUserToProfile((json.user ?? {}) as never);
    return ok({ role: profile.role });
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Registro real de estudiante: POST /auth/register. */
export async function signUp(payload: {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  academicLevel?: string;
  grade?: string;
}) {
  if (!payload.password || payload.password.length < 8) {
    return fail('La contraseña debe tener al menos 8 caracteres.');
  }

  try {
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const json = await api<{ access_token?: string }>('/auth/register', {
      method: 'POST',
      token: null,
      body: {
        full_name: fullName || payload.email,
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        password_confirmation: payload.password,
        role: 'student',
        academic_level: payload.academicLevel ?? 'basic',
        grade: payload.grade ?? '1ro',
      },
    });

    if (!json.access_token) return fail('La API no devolvió un token de acceso.');

    await setAuthToken(json.access_token);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Cierra la sesión en el backend y borra la cookie local. */
export async function signOut() {
  try {
    await api('/user/logout', { method: 'POST' });
  } catch {
    // Si el token ya expiró, el backend devolverá 401: igual limpiamos la cookie.
  }
  await clearAuthToken();
  return ok();
}

/** Envía el enlace de recuperación a través del backend. */
export async function requestPasswordReset(email: string) {
  try {
    const json = await api<{ message?: string }>('/auth/forgot-password', {
      method: 'POST',
      token: null,
      body: { email: email.trim().toLowerCase() },
    });
    return ok(null, json.message ?? 'Se envió el enlace de recuperación.');
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Cambia la contraseña usando la API (requiere la contraseña actual). */
export async function updatePassword(payload: {
  currentPassword?: string;
  newPassword: string;
}) {
  if (!payload.currentPassword) return fail('Ingresa tu contraseña actual.');
  if (payload.newPassword.length < 8) return fail('La nueva contraseña debe tener al menos 8 caracteres.');

  try {
    const json = await api<{ message?: string }>('/user/change-password', {
      method: 'PUT',
      body: {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
        new_password_confirmation: payload.newPassword,
      },
    });
    return ok(null, json.message ?? 'Contraseña actualizada.');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return fail('Tu sesión ha expirado. Vuelve a iniciar sesión para cambiar la contraseña.');
    }
    return fail(apiErrorMessage(error));
  }
}
