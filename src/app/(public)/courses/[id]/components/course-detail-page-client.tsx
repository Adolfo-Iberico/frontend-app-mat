
'use client';

import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Clock,
  BarChart,
  Calendar,
  PlayCircle,
  ClipboardCheck,
  FileText,
  Link as LinkIcon,
  GraduationCap,
  Layers,
} from 'lucide-react';
import type { Course, Lesson } from '@/lib/types';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { notFound } from 'next/navigation';

export function CourseDetailPageContent({ course, lessons }: { course: Course; lessons: Lesson[] }) {
  if (!course) {
    notFound();
  }

  const totalItems = lessons.length;
  const evaluations = (course.evaluations ?? []).filter(evaluation => evaluation.isPublished);
  const resources = course.resources ?? [];

  return (
    <div className="bg-muted/30">
        <header className="bg-primary text-primary-foreground py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {course.category && <Badge variant="secondary">{course.category}</Badge>}
                            <Badge variant="outline" className="border-white/40 text-primary-foreground">
                              Nivel {course.level}
                            </Badge>
                            {course.grade && (
                              <Badge variant="outline" className="border-white/40 text-primary-foreground">
                                {course.grade} de secundaria
                              </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold font-headline">{course.title}</h1>
                        <p className="text-lg text-primary-foreground/80">{course.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            {course.estimatedTime ? (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{course.estimatedTime} minutos de estudio</span>
                                </div>
                            ) : null}
                            {evaluations.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <ClipboardCheck className="w-4 h-4" />
                                    <span>{evaluations.length} {evaluations.length === 1 ? 'evaluación' : 'evaluaciones'}</span>
                                </div>
                            )}
                        </div>
                         <Button asChild variant="secondary" className="h-auto p-0.5 pr-3 rounded-full bg-white/10 hover:bg-white/20 text-primary-foreground">
                            <Link href={`/instructors/${course.instructor.id}`} className="flex items-center gap-2">
                                <ImagePlaceholder alt={course.instructor.name} width={32} height={32} className="rounded-full"/>
                                <span className="text-sm">Docente: {course.instructor.name}</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-3 lg:gap-12">
        <main className="lg:col-span-2">
           <div className="space-y-12">

            <div>
              <h2 className="text-2xl font-bold mb-4 font-headline">Contenido de la lección</h2>
              <Card>
                <CardContent className="p-0">
                  <div
                    className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-6"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.long_description ?? course.description) }}
                  />
                </CardContent>
              </Card>
            </div>

            {evaluations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 font-headline">Evaluaciones de la lección</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {evaluations.map(evaluation => (
                    <Card key={evaluation.id}>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <ClipboardCheck className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="font-semibold">{evaluation.title}</h3>
                            <p className="text-xs text-muted-foreground capitalize">
                              {evaluation.type} · {evaluation.difficulty === 'basic' ? 'Básico' : evaluation.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {evaluation.description ?? 'Demuestra lo aprendido en esta lección.'}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {evaluation.totalQuestions > 0 && <span>{evaluation.totalQuestions} preguntas</span>}
                          {evaluation.timeLimit && <span>Límite: {evaluation.timeLimit} min</span>}
                          <span>{evaluation.maxAttempts} {evaluation.maxAttempts === 1 ? 'intento' : 'intentos'}</span>
                        </div>
                        <Button asChild className="w-full" variant="outline">
                          <Link href={`/learn/${course.id}/evaluation`}>Rendir evaluación</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {resources.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 font-headline">Recursos de la lección</h2>
                <Accordion type="single" collapsible className="w-full bg-card rounded-lg border">
                  {lessons.map((lesson, index) => (
                    <AccordionItem value={`item-${index}`} key={lesson.id}>
                      <AccordionTrigger className="px-4 sm:px-6 text-left hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          {lesson.isContent ? (
                            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <LinkIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="font-medium">{lesson.title}</span>
                          {lesson.isContent && <Badge variant="outline">Lectura</Badge>}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-6">
                        <div className="space-y-4">
                          {lesson.isContent ? (
                            <p className="text-sm text-muted-foreground">
                              Material de estudio principal de la lección. Ábrelo desde el reproductor para leerlo completo.
                            </p>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                              <div className="flex-shrink-0 w-full sm:w-40 aspect-video bg-muted/50 rounded-md flex items-center justify-center">
                                <LinkIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-semibold capitalize">{lesson.resourceType}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Recurso adjunto de la lección, disponible en el reproductor.
                                </p>
                                {lesson.url && (
                                  <a
                                    href={lesson.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline mt-2 inline-block"
                                  >
                                    Abrir recurso
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6 sticky top-24 self-start mt-8 lg:mt-0">
           <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <Button asChild size="lg" className="w-full">
                      <Link href={`/learn/${course.id}`}>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        {(course.progress ?? 0) > 0 ? 'Continuar lección' : 'Empezar lección'}
                      </Link>
                    </Button>

                    <ul className="text-sm space-y-3 pt-4 border-t">
                        <li className="flex items-center gap-3">
                          <BarChart className="w-4 h-4 text-muted-foreground" />
                          <span>Nivel: {course.level}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          <span>Unidad: {course.category ?? 'General'}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{totalItems} {totalItems === 1 ? 'ítem' : 'ítems'} de contenido</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                          <span>{evaluations.length} {evaluations.length === 1 ? 'evaluación' : 'evaluaciones'}</span>
                        </li>
                        {course.grade && (
                          <li className="flex items-center gap-3">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <span>Grado: {course.grade}</span>
                          </li>
                        )}
                        <li className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Actualizada: {new Date(course.updated_at).toLocaleDateString('es-PE')}</span>
                        </li>
                    </ul>
                </CardContent>
           </Card>
        </aside>
      </div>
    </div>
  );
}
