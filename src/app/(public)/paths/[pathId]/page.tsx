
import { getUnitPathDetails } from '@/app/actions';
import { notFound } from 'next/navigation';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import type { Course } from '@/lib/types';
import { CourseCard } from '@/components/course-card';
import { cn } from '@/lib/utils';
import { CheckCircle, Layers } from 'lucide-react';

export default async function UnitPathDetailPage(props: {
  params: Promise<{ pathId: string }>;
}) {
  const params = await props.params;
  const { pathId } = params;
  const unit = decodeURIComponent(pathId);
  const path = await getUnitPathDetails(unit);

  if (!path) {
    notFound();
  }

  const lessonsInPath = path.courses;

  return (
    <div className="bg-white dark:bg-muted/30">
        <header className="relative overflow-hidden min-h-[400px] md:min-h-[480px] flex items-center justify-center text-center md:text-left">
            <div className="absolute inset-0 -z-10">
                <ImagePlaceholder
                    alt={path.title}
                    fill
                    className="object-cover"
                />
                 <div className="absolute inset-0 bg-white/40 dark:bg-black/60" />
            </div>
            <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
                <div className="max-w-3xl space-y-4">
                    <p className="font-semibold text-primary">Unidad temática</p>
                    <h1 className="text-4xl sm:text-5xl font-bold font-headline text-gray-900 dark:text-white" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.2)'}}>{path.title}</h1>
                    <p className="text-lg text-gray-800 dark:text-white/90" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>{path.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm pt-2 justify-center md:justify-start">
                        <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
                            <Layers className="w-4 h-4" />
                            <span>{lessonsInPath.length} Lecciones</span>
                        </div>
                        <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Aprende paso a paso</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="text-3xl font-bold mb-12 font-headline text-center text-gray-900 dark:text-white">
          Lecciones de esta unidad
        </h2>
        <div className="relative">
             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-border/80 hidden md:block" aria-hidden="true"></div>
            <div className="space-y-8 md:space-y-0">
                {lessonsInPath.map((course, index) => (
                    <div key={course.id} className="relative md:grid md:grid-cols-2 md:gap-8 items-center">
                        <div className={cn(
                            "md:max-w-md",
                            index % 2 === 0 ? 'md:col-start-1 md:justify-self-end md:mr-8' : 'md:col-start-2 md:justify-self-start md:ml-8'
                        )}>
                           <CourseCard course={course as Course} />
                        </div>

                        <div className={cn(
                            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl border-4 border-white dark:border-card hidden md:flex items-center justify-center z-10",
                            index % 2 === 0 ? 'md:left-1/2' : 'md:left-1/2'
                        )}>
                           {index + 1}
                        </div>

                         <div className="absolute left-4 top-4 md:hidden w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center z-10 shadow">
                            {index + 1}
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
