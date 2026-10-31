'use server';

import { revalidatePath } from 'next/cache';
import { api, apiErrorMessage, toList } from '@/lib/api/client';
import { type BackendAnnouncement, mapAnnouncementToNews } from '@/lib/api/adapters';
import { getSession } from '@/lib/session';
import { byNewest, fail, ok } from '@/lib/result';
import type { NewsArticle } from '@/lib/types';

/**
 * "Novedades" = anuncios globales del backend.
 * - Cualquier usuario autenticado ve los activos (GET /announcements).
 * - El admin los gestiona con /admin/announcements.
 */

export async function getNewsArticles(): Promise<NewsArticle[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const json = await api<Record<string, unknown>>('/announcements');
    const rows = toList<BackendAnnouncement>(json);
    return rows.map(mapAnnouncementToNews).sort(byNewest);
  } catch {
    return [];
  }
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
  const articles = await getNewsArticles();
  return articles.find(article => article.id === id) ?? null;
}

/** Todos los anuncios, incluidos inactivos (solo admin). */
export async function getAdminNewsArticles(): Promise<(NewsArticle & { isActive: boolean; type: string })[]> {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') return [];

  try {
    const json = await api<Record<string, unknown>>('/admin/announcements');
    const rows = toList<BackendAnnouncement>(json);
    return rows
      .map(announcement => ({
        ...mapAnnouncementToNews(announcement),
        isActive: !!announcement.is_active,
        type: announcement.type ?? 'info',
      }))
      .sort(byNewest);
  } catch {
    return [];
  }
}

/** Normaliza la entrada del formulario de anuncios: FormData o objeto plano. */
function announcementPayloadFrom(input: FormData | Record<string, unknown>) {
  const get = (key: string): string => {
    if (typeof input === 'object' && input instanceof FormData) {
      return String(input.get(key) ?? '');
    }
    const record = input as Record<string, unknown>;
    return record[key] === undefined || record[key] === null ? '' : String(record[key]);
  };
  const getBool = (key: string, fallback = true): boolean => {
    const raw = get(key);
    if (raw === '') return fallback;
    return raw === 'true' || raw === 'on' || raw === '1';
  };

  return {
    title: get('title').trim(),
    body: get('description').trim(),
    type: get('type') || 'info',
    is_active: getBool('is_active', true),
  };
}

export async function createNewsArticle(input: FormData | Record<string, unknown>) {
  const payload = announcementPayloadFrom(input);
  if (!payload.title || !payload.body) return fail('El título y el contenido son obligatorios.');

  try {
    await api('/admin/announcements', {
      method: 'POST',
      body: { ...payload, notify: true },
    });
    revalidatePath('/admin/news');
    revalidatePath('/news');
    revalidatePath('/');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

export async function updateNewsArticle(id: string, input: FormData | Record<string, unknown>) {
  const payload = announcementPayloadFrom(input);
  if (!payload.title || !payload.body) return fail('El título y el contenido son obligatorios.');

  try {
    await api(`/admin/announcements/${id}`, {
      method: 'PUT',
      body: payload,
    });
    revalidatePath('/admin/news');
    revalidatePath('/news');
    revalidatePath('/');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}

export async function deleteNewsArticle(id: string) {
  try {
    await api(`/admin/announcements/${id}`, { method: 'DELETE' });
    revalidatePath('/admin/news');
    revalidatePath('/news');
    revalidatePath('/');
    return ok();
  } catch (error) {
    return fail(apiErrorMessage(error));
  }
}
