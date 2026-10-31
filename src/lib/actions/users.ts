'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, apiErrorMessage, toList, unwrap } from '@/lib/api/client';
import { type BackendUser, mapBackendRole, mapUserToProfile, splitFullName } from '@/lib/api/adapters';
import { getSession } from '@/lib/session';
import { byNewest, fail, ok } from '@/lib/result';
import type { Profile } from '@/lib/types';

/** Usuario del panel admin: perfil de la UI + datos del backend. */
export interface AdminUserRow extends Profile {
  full_name: string;
  backendRole: string;
  is_active: boolean;
  institution: string | null;
  grade: string | null;
}

function toAdminRow(user: BackendUser): AdminUserRow {
  const profile = mapUserToProfile(user);
  return {
    ...profile,
    full_name: user.full_name ?? [profile.first_name, profile.last_name].filter(Boolean).join(' '),
    backendRole: user.role?.name ?? 'student',
    is_active: user.is_active ?? true,
    institution: user.institution ?? null,
    grade: user.grade ?? null,
  };
}

export async function redirectToUsers() {
  redirect('/admin/users');
}

/** Crea una cuenta desde el panel de administración. */
export async function createUser(input: {
  full_name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
}) {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') {
    return fail('Solo los administradores pueden crear usuarios.');
  }

  try {
    const json = await api<{ user: BackendUser }>('/admin/users', {
      method: 'POST',
      body: input,
    });
    revalidatePath('/admin/users');
    return ok(toAdminRow(json.user));
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Todos los usuarios (solo admin, vía GET /admin/users). */
export async function getUsers(): Promise<AdminUserRow[]> {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') return [];

  try {
    const json = await api<Record<string, unknown>>('/admin/users?per_page=1000');
    const rows = toList<BackendUser>(json);
    return rows.map(toAdminRow).sort(byNewest);
  } catch {
    return [];
  }
}

/** Un usuario con su perfil académico (solo admin). */
export async function getUserById(userId: string): Promise<AdminUserRow | null> {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') return null;

  try {
    const json = await api<Record<string, unknown>>(`/admin/users/${userId}`);
    return toAdminRow(json as unknown as BackendUser);
  } catch {
    return null;
  }
}

/** Cambia el rol de un usuario (solo admin; el backend no permite asignar admin). */
export async function updateUserRole(userId: string, role: Profile['role']) {
  const backendRole = role === 'docente' ? 'teacher' : role === 'user' ? 'student' : null;

  if (!backendRole) {
    return fail('El rol de administrador solo se gestiona directamente en la base de datos.');
  }

  try {
    const json = await api<Record<string, unknown>>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: { role: backendRole },
    });
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/edit/${userId}`);
    return ok(toAdminRow(unwrap<BackendUser>(json)));
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Activa o desactiva una cuenta (solo admin). */
export async function setUserActive(userId: string, active: boolean) {
  try {
    await api(`/admin/users/${userId}/${active ? 'activate' : 'deactivate'}`, { method: 'POST' });
    revalidatePath('/admin/users');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Elimina una cuenta (solo admin; el backend protege a los admins). */
export async function deleteUser(userId: string) {
  try {
    await api(`/admin/users/${userId}`, { method: 'DELETE' });
    revalidatePath('/admin/users');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Docentes registrados (solo admin) — para filtros del panel. */
export async function getInstructors() {
  const users = await getUsers();
  return users
    .filter(user => user.role === 'docente')
    .map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      specialty: user.specialty ?? null,
    }));
}

/** Actualiza el perfil del usuario autenticado (PUT /user/profile). */
export async function updateProfile(_userId: string, formData: FormData) {
  const firstName = String(formData.get('first_name') ?? '').trim();
  const lastName = String(formData.get('last_name') ?? '').trim();
  const grade = String(formData.get('grade') ?? '').trim();

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (!fullName) return fail('El nombre no puede estar vacío.');

  try {
    await api('/user/profile', {
      method: 'PUT',
      body: {
        full_name: fullName,
        ...(grade ? { grade } : {}),
      },
    });
    revalidatePath('/profile');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

/** Actualiza el perfil de OTRO usuario (solo admin, vía PUT /admin/users/{id}). */
export async function adminUpdateUser(userId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') {
    return fail('Solo los administradores pueden editar otros usuarios.');
  }

  const firstName = String(formData.get('first_name') ?? '').trim();
  const lastName = String(formData.get('last_name') ?? '').trim();
  const grade = String(formData.get('grade') ?? '').trim();

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (!fullName) return fail('El nombre no puede estar vacío.');

  try {
    await api(`/admin/users/${userId}`, {
      method: 'PUT',
      body: {
        full_name: fullName,
        ...(grade ? { grade } : {}),
      },
    });
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/profile/${userId}`);
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}
