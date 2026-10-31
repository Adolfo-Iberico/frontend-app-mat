
'use client';

import Link from "next/link";
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { AiResourceSuggester } from "@/components/ai-resource-suggester";
import { ArrowRight, Book, ChevronRight, Milestone } from "lucide-react";
import HeroVisual from "@/components/hero-visual";
import type { LearningPath, Course, NewsArticle, PlatformStats } from "@/lib/types";
import { InteractiveHero } from "@/components/interactive-hero";
import { ChangingText } from '@/components/changing-text';
import { NewsCard } from "./news-card";
import { SimpleLearningPathCard } from "./simple-learning-path-card";

// Client Component: recibe lecciones, unidades, métricas y anuncios reales.
export function HomePageClient({
    courses,
    learningPaths,
    stats,
    recentNews,
}: {
    courses: Course[];
    learningPaths: LearningPath[];
    stats: PlatformStats;
    recentNews: NewsArticle[];
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
         <section className="relative w-full overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32 xl:py-40">
        <div className="container relative z-10 mx-auto max-w-7xl px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            {/* Título */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <h1
                className="animate-fade-up font-headline text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight"
                style={{ animationDelay: '0.2s' }}
              >
                <span className="text-gray-800 dark:text-gray-100">
                  <ChangingText /> {' '}
                </span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-700 drop-shadow-lg tracking-wider uppercase  ">
                  Aulamate
                </span>
              </h1>

              <p
                className="animate-fade-up mt-4 sm:mt-6 max-w-xs xs:max-w-sm sm:max-w-lg md:max-w-2xl mx-auto text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground px-4 sm:px-0"
                style={{ animationDelay: '0.4s' }}
              >
                Lecciones de matemáticas por grado escolar: estudia a tu ritmo,
                evalúate en línea y sigue tu progreso.
              </p>
            </div>

            {/* ===== Visual integrado (sin "marco") ===== */}
            <div
              className="w-full max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mb-8 sm:mb-10 md:mb-12 lg:mb-16 animate-fade-up px-4 sm:px-0"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 [background-image:radial-gradient(900px_320px_at_50%_0%,theme(colors.sky.100)/45,transparent_70%)]" />
              </div>

              <div className="z-20">
                <div className="overlay-scene edge-fade h-[320px] xs:h-[360px] sm:h-[420px] md:h-[480px] lg:h-[560px]">
                  <div className="overlay-layer base">
                    <ImagePlaceholder
                      alt="Fondo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div
              className="flex animate-fade-up flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full max-w-4xl px-4 sm:px-0"
              style={{ animationDelay: '0.6s' }}
            >
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <Link href="/courses" className="flex items-center justify-center">
                  <span className="truncate">Explorar Lecciones</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-medium border-2 border-blue-500 hover:border-blue-600 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/paths" className="flex items-center justify-center">
                  <span className="truncate">Unidades Temáticas</span>
                  <Book className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

        {/* Métricas reales según el rol del usuario */}
        {stats.cards.length > 0 && (
          <section className="w-full bg-muted/40 border-y">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {stats.cards.map(card => (
                  <div key={card.label} className="text-center">
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                      {card.value}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{card.label}</p>
                    <p className="text-xs text-muted-foreground">{card.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-12 md:my-20 lg:my-24">
            <InteractiveHero />
        </div>

        <section
          id="featured-courses"
          className="relative w-full bg-background py-12 md:py-20 lg:py-24 overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 [background-image:radial-gradient(800px_260px_at_50%_0%,theme(colors.sky.100)/55,transparent_70%)]" />
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                  Selección curada
                </div>
                <h2 className="mt-3 font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                  Lecciones{" "}
                  <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    Destacadas
                  </span>
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Comienza con las lecciones publicadas para tu grado.
                </p>
              </div>

              <Button
                asChild
                variant="ghost"
                className="mt-2 rounded-full border border-border/60 px-4 backdrop-blur transition-all hover:border-transparent hover:bg-white/60 hover:shadow-[0_8px_24px_-12px_rgba(56,189,248,.45)]"
              >
                <Link href="/courses">
                  Ver Todas las Lecciones
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-sky-200/50 via-sky-100/10 to-indigo-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-100/60"
                    style={{ perspective: 1000 }}
                  >
                    <div className="rounded-2xl ring-1 ring-border/60 bg-card transition-transform duration-300 group-hover:-rotate-[0.6deg]">
                      <CourseCard course={course} />
                    </div>
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 [background:linear-gradient(120deg,transparent,rgba(255,255,255,.35),transparent)] transition-opacity duration-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg bg-card/50">
                <h3 className="text-xl font-semibold mb-2">Inicia sesión para ver las lecciones</h3>
                <p className="text-muted-foreground mb-6">
                  El catálogo de lecciones está disponible para estudiantes y docentes.
                </p>
                <Button asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        <section
          id="learning-paths"
          className="relative w-full bg-muted/30 py-12 md:py-20 lg:py-24"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
             <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="max-w-2xl text-center md:text-left">
                 <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                  <Milestone className="h-4 w-4" />
                  Ruta de aprendizaje
                </div>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl font-headline">
                  Nuestras{" "}
                  <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    Unidades Temáticas
                  </span>
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Agrupamos las lecciones por unidad: Álgebra, Geometría, Trigonometría y más.
                </p>
              </div>

               <Button
                asChild
                variant="ghost"
              >
                <Link href="/paths">
                  Ver Todas las Unidades
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {learningPaths.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {learningPaths.map((path) => (
                  <SimpleLearningPathCard key={path.id} path={path} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Aún no hay unidades con lecciones publicadas para ti.
              </p>
            )}
          </div>
        </section>

        <section
          id="recent-news"
          className="relative w-full bg-background py-12 md:py-20 lg:py-24"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="max-w-2xl text-center md:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                    Mantente informado
                    </div>
                    <h2 className="mt-3 font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                      Últimas{" "}
                      <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                        Novedades
                      </span>
                    </h2>
                    <p className="mt-3 text-lg text-muted-foreground">
                      Anuncios y avisos del sistema.
                    </p>
                </div>

               <Button
                asChild
                variant="ghost"
                className="mt-2 rounded-full border border-border/60 px-4 backdrop-blur transition-all hover:border-transparent hover:bg-white/60 hover:shadow-[0_8px_24px_-12px_rgba(56,189,248,.45)]"
              >
                <Link href="/news">
                  Ver Todas las Novedades
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {recentNews && recentNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentNews.map((article) => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">No hay anuncios recientes.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
