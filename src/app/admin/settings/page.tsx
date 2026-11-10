import { requireRole } from '@/lib/session';
import SettingsPageClient from './settings-page-client';

export default async function SettingsPage() {
  await requireRole(['admin']);

  return <SettingsPageClient />;
}
