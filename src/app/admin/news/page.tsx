import { requireRole } from '@/lib/session';
import { NewsClient } from './components/client';
import { getAdminNewsArticles } from '@/app/actions';

export default async function NewsAdminPage() {
  await requireRole(['admin']);

  const newsArticles = await getAdminNewsArticles();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NewsClient data={newsArticles} />
      </div>
    </div>
  );
}
