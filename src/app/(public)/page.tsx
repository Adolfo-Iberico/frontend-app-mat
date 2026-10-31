
import { HomePageClient } from '@/components/home-page-client';
import {
  getPublicCourses,
  getUnitPaths,
  getPlatformStats,
  getNewsArticles,
} from '@/app/actions';

// Server Component: carga lecciones, unidades, métricas y anuncios reales.
export default async function HomePage() {
  const [coursesData, pathsData, statsData, recentNewsData] = await Promise.all([
    getPublicCourses(),
    getUnitPaths(),
    getPlatformStats(),
    getNewsArticles(),
  ]);

  const featuredCourses = coursesData.slice(0, 3);
  const learningPaths = pathsData.slice(0, 3);
  const recentNews = recentNewsData.slice(0, 3);

  return (
    <HomePageClient
      courses={featuredCourses}
      learningPaths={learningPaths}
      stats={statsData}
      recentNews={recentNews}
    />
  );
}
