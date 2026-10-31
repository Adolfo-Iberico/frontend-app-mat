'use server';

import { api, apiErrorMessage, toList } from '@/lib/api/client';
import { type BackendNotification, mapNotification } from '@/lib/api/adapters';
import { fail, ok } from '@/lib/result';
import type { Notification } from '@/lib/types';

/** Notificaciones reales del usuario autenticado (GET /notifications). */

export async function getUnreadNotifications(_userId: string): Promise<Notification[]> {
  try {
    const json = await api<Record<string, unknown>>('/notifications?unread=1&per_page=20');
    const rows = toList<BackendNotification>(json);
    return rows.map(mapNotification);
  } catch {
    return [];
  }
}

/** Marca notificaciones como leídas (PUT /notifications/{id}/read por ítem). */
export async function markNotificationsAsRead(ids: string[]) {
  try {
    await Promise.all(
      ids.map(id =>
        api(`/notifications/${id}/read`, { method: 'PUT' }).catch(() => undefined)
      )
    );
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}
