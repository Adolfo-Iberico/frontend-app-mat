'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Play,
  CheckCircle,
  HelpCircle,
  Award,
  ArrowLeft,
  ArrowRight,
  Download,
  Paperclip,
  ClipboardCheck,
  FileText,
  Link as LinkIcon,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useTransition, Suspense, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QAndASection } from './q-and-a-section';
import { getLessonProgressForCourse, toggleLessonCompleted } from '@/app/actions';
import type { Course, Lesson } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function LearnPageSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <Card className="mb-6 overflow-hidden">
            <Skeleton className="w-full aspect-video" />
          </Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="h-12 w-56" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
      <aside className="w-96 border-l bg-card hidden xl:flex flex-col">
        <div className="p-4 border-b space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <Skeleton className="h-12 w-full mb-2" />
          <div className="space-y-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function getEmbeddableDriveUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('drive.google.com/file')) {
    const fileId = url.split('/d/')[1]?.split('/')[0];
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  return url;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    let videoId: string | null = null;
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      videoId =
        parsed.searchParams.get('v') ??
        parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ??
        null;
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
  } catch {
    return null;
  }
}

function ResourceIcon({ type }: { type?: string | null }) {
  if (type === 'pdf') return <FileText className="w-5 h-5 text-muted-foreground/50" />;
  return <LinkIcon className="w-5 h-5 text-muted-foreground/50" />;
}

export function LearnPageComponent({
  courseId,
  initialCourse,
  initialLessons,
}: {
  courseId: string;
  initialCourse: Course;
  initialLessons: Lesson[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course>(initialCourse);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [activeLesson, setActiveLesson] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLessonComplete, setIsLessonComplete] = useState((initialCourse.progress ?? 0) >= 100);

  const [isPending, startTransition] = useTransition();
  const lessonFromUrl = searchParams.get('lesson');
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return;
      try {
        const progressData = await getLessonProgressForCourse(user.id, courseId);
        const completedSet = new Set(progressData || []);
        setCompletedLessons(completedSet);
        setIsLessonComplete(progressData.length > 0);

        if (lessons.length > 0) {
          let lessonToShow = '';
          if (lessonFromUrl && lessons.some(l => l.id === lessonFromUrl)) {
            lessonToShow = lessonFromUrl;
          } else {
            const firstUncompleted = lessons.find(lesson => !completedSet.has(lesson.id));
            lessonToShow = firstUncompleted ? firstUncompleted.id : lessons[0].id;
          }
          setActiveLesson(lessonToShow);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el progreso de la lección.',
          variant: 'destructive',
        });
      }
    }
    if (course && lessons.length > 0) {
      fetchProgress();
    }
  }, [courseId, user, lessons, course, lessonFromUrl, toast]);

  useEffect(() => {
    if (activeLesson) {
      const newUrl = `${window.location.pathname}?lesson=${activeLesson}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [activeLesson]);

  useEffect(() => {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    const currentLesson = lessons.find(l => l.id === activeLesson);
    if (currentLesson && !completedLessons.has(currentLesson.id)) {
      const waitTime = (currentLesson.estimated_time || 5) * 60 * 1000;
      completionTimerRef.current = setTimeout(() => {
        handleToggleComplete();
        toast({
          title: '?Progreso registrado!',
          description: 'Hemos detectado que terminaste la lecci?n.',
          variant: 'success',
        });
      }, waitTime);
    }
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, [activeLesson, completedLessons, lessons]);

  const currentLessonIndex = lessons.findIndex(l => l.id === activeLesson);
  const currentLesson = lessons.length > 0 ? (lessons[currentLessonIndex] ?? lessons[0]) : null;
  const hasNextLesson = currentLessonIndex < lessons.length - 1;
  const hasEvaluations = (course.evaluations ?? []).some(evaluation => evaluation.isPublished);

  const goToNextLesson = () => {
    if (hasNextLesson) {
      setActiveLesson(lessons[currentLessonIndex + 1].id);
    }
  };

  const goToPrevLesson = () => {
    const prevLesson = lessons[currentLessonIndex - 1];
    if (prevLesson) setActiveLesson(prevLesson.id);
  };

  const handleToggleComplete = () => {
    if (!user || !currentLesson) return;
    startTransition(async () => {
      const result = await toggleLessonCompleted({
        userId: user.id,
        courseId,
        lessonId: currentLesson.id,
        totalLessons: lessons.length,
      });
      if (result.success) {
        setCompletedLessons(prev => {
          const newSet = new Set(prev);
          if (result.newState) {
            newSet.add(currentLesson.id);
          } else {
            newSet.delete(currentLesson.id);
          }
          return newSet;
        });
        setIsLessonComplete(result.newState);
        if (result.newState) {
          const achievementNames = (result.newAchievements ?? []).map(achievement => achievement.name);
          toast({
            title: '¡Lección completada!',
            description: [
              result.leveledUp ? `¡Subiste al nivel ${result.newLevel}!` : null,
              achievementNames.length > 0 ? `Nuevo logro: ${achievementNames.join(', ')}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Tu progreso quedó registrado.',
            variant: 'success',
          });
        }
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleVideoEnd = () => {
    if (currentLesson && !completedLessons.has(currentLesson.id)) {
      handleToggleComplete();
    }
  };

  const progress = isLessonComplete ? 100 : (course.progress ?? 0);

  if (!user) {
    return <LearnPageSkeleton />;
  }

  const renderLessonContent = () => {
    if (!currentLesson) {
      return (
        <div className="w-full h-full flex items-center justify-center text-center p-4">
          {lessons.length > 0 ? (
            <div>
              <Play className="w-16 h-16 text-white/70 mx-auto" />
              <p className="text-white/70 mt-2">Selecciona un ítem para comenzar.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white">¡Lección en construcción!</h2>
              <p className="text-white/70 mt-2">El contenido estará disponible pronto.</p>
            </div>
          )}
        </div>
      );
    }
    if (currentLesson.isContent) {
      return (
        <div className="w-full h-full overflow-y-auto bg-background">
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-6 sm:p-10 [&_code]::bg-muted [&_code]:rounded [&_code]:px-1"
            dangerouslySetInnerHTML={{ __html: course.long_description ?? '' }}
          />
        </div>
      );
    }
    if (currentLesson.resourceType === 'video' && currentLesson.url) {
      const videoSrc = getEmbeddableDriveUrl(currentLesson.url);
      const youtubeSrc = getYouTubeEmbedUrl(currentLesson.url);
      if (youtubeSrc || videoSrc.includes('drive.google.com')) {
        return (
          <iframe
            src={youtubeSrc ?? videoSrc}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={currentLesson.title}
          />
        );
      }
      return (
        <video
          controls
          playsInline
          controlsList="nodownload"
          onContextMenu={e => e.preventDefault()}
          onEnded={handleVideoEnd}
          key={currentLesson.id}
          className="w-full h-full"
          src={videoSrc}
        >
          Tu navegador no soporta el elemento de video.
        </video>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center text-center p-4 bg-muted/30">
        <div className="max-w-md">
          <ResourceIcon type={currentLesson.resourceType} />
          <h3 className="text-xl font-bold text-foreground mt-3">{currentLesson.title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Este recurso se abre en una pestaña nueva.
          </p>
          {currentLesson.url && (
            <Button asChild className="mt-4">
              <a href={currentLesson.url} target="_blank" rel="noopener noreferrer">
                <Paperclip className="h-4 w-4 mr-2" />
                Abrir recurso
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">{course.title}</h2>
        <div className="flex items-center gap-2 mt-2">
          <Progress value={progress} className="h-2" />
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          disabled={!hasEvaluations}
          onClick={() => router.push(`/learn/${course.id}/evaluation`)}
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          {hasEvaluations ? 'Realizar Evaluación' : 'Sin evaluación disponible'}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
          <AccordionItem value="item-0">
            <AccordionTrigger className="px-4 font-semibold hover:no-underline">
              Contenido de la lección
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {lessons.length > 0 ? (
                <ul className="space-y-px">
                  {lessons.map(lesson => (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        className={cn(
                          'w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer',
                          activeLesson === lesson.id &&
                            'bg-primary/10 text-primary border-r-2 border-primary'
                        )}
                        onClick={() => setActiveLesson(lesson.id)}
                      >
                        <CheckCircle
                          className={cn(
                            'w-5 h-5',
                            completedLessons.has(lesson.id)
                              ? 'text-green-500'
                              : 'text-muted-foreground/30'
                          )}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.isContent
                              ? lesson.duration ?? 'Lectura'
                              : lesson.resourceType?.toUpperCase() ?? 'Recurso'}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground p-4">
                  Esta lección aún no tiene recursos adjuntos.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Link href="/courses" className="text-sm text-primary hover:underline inline-block">
                &larr; Volver al catálogo
              </Link>
              <Button variant="outline" size="sm" className="xl:hidden" asChild>
                <SheetTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    Contenido
                  </div>
                </SheetTrigger>
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">{course.title}</h1>
            <p className="text-muted-foreground">
              {currentLesson?.title || (lessons.length > 0 ? 'Selecciona un ítem para comenzar' : 'Bienvenido a la lección')}
            </p>
          </div>

          <Card className="mb-6 overflow-hidden">
            <div className="relative aspect-video bg-black">{renderLessonContent()}</div>
          </Card>

          {currentLesson && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex gap-2">
                <Button onClick={goToPrevLesson} variant="outline" disabled={currentLessonIndex === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
                </Button>
                <Button onClick={goToNextLesson} variant="outline" disabled={!hasNextLesson}>
                  Siguiente <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <Button onClick={handleToggleComplete} size="lg" disabled={isPending}>
                {isPending ? (
                  <Skeleton className="h-5 w-5 mr-2 animate-spin rounded-full" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                {isLessonComplete ? 'Lección Completada' : 'Marcar como Completado'}
              </Button>
            </div>
          )}

          {isLessonComplete && (
            <Alert className="mb-6 border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950/50 dark:text-green-200 dark:border-green-500/30 flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-3 text-green-600 dark:text-green-400" />
                <div>
                  <AlertTitle className="font-semibold">¡Lección Completada!</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    ¡Felicidades! Terminaste esta lección.
                    {hasEvaluations && ' El siguiente paso es la evaluación.'}
                  </AlertDescription>
                </div>
              </div>
              {hasEvaluations && (
                <Button asChild className="ml-4 flex-shrink-0">
                  <Link href={`/learn/${course.id}/evaluation`}>
                    <Award className="mr-2 h-4 w-4" />
                    Realizar Evaluación
                  </Link>
                </Button>
              )}
            </Alert>
          )}

          <Tabs defaultValue="q&a" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="q&a">
                <HelpCircle className="w-4 h-4 mr-2" />
                Q&A
              </TabsTrigger>
              <TabsTrigger value="downloads">
                <Download className="w-4 h-4 mr-2" />
                Recursos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="q&a" className="py-6">
              <QAndASection lessonId={currentLesson?.id} courseId={course.id} />
            </TabsContent>
            <TabsContent value="downloads" className="py-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Recursos de la lección</h3>
                  {currentLesson && !currentLesson.isContent && currentLesson.url ? (
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Button variant="outline" asChild>
                          <a href={currentLesson.url} download target="_blank" rel="noopener noreferrer">
                            <Paperclip className="h-4 w-4 mr-2" />
                            Descargar {currentLesson.title}
                          </a>
                        </Button>
                      </li>
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {currentLesson?.isContent
                        ? 'Estás viendo el contenido de la lección. Los recursos adjuntos aparecen en la lista lateral.'
                        : 'No hay recursos adjuntos para este ítem.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <aside className="w-96 border-l bg-card hidden xl:flex flex-col">
        <SidebarContent />
      </aside>

      <div className="xl:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12 p-0">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-lg font-bold">Contenido del Curso</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
