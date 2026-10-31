
import { Newspaper } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { NewsCard } from "@/components/news-card";
import { getNewsArticles } from "@/app/actions";
import type { NewsArticle } from "@/lib/types";

export default async function NewsPage() {
  const articles = (await getNewsArticles()) as NewsArticle[];

  return (
    <div className="container mx-auto max-w-5xl py-12 sm:py-16 md:py-20">
      <div className="flex flex-col items-center text-center mb-12">
          <Newspaper className="h-12 w-12 text-primary mb-4" />
          <Heading
              title="Novedades y Noticias"
              description="Mantente al día con los últimos anuncios, lanzamientos de cursos y eventos de E-Lean."
          />
      </div>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
            ))}
        </div>
        ) : (
        <p className="text-center text-muted-foreground mt-16">Aún no hay noticias publicadas.</p>
        )}
    </div>
  );
}
