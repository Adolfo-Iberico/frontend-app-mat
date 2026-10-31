import { requireRole } from '@/lib/session';
import { getAdminNewsArticles } from '@/app/actions';
import { NewsForm } from '../components/news-form';

export default async function NewsArticlePage(props: {
  params: Promise<{ newsId: string }>;
}) {
  const params = await props.params;
  const { newsId } = params;
  await requireRole(['admin']);

  const articles = await getAdminNewsArticles();
  const article = newsId === 'new' ? null : articles.find(item => item.id === newsId) ?? null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NewsForm
          initialData={article}
        />
      </div>
    </div>
  );
}
