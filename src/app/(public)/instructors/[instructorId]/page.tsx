
import { getInstructorDetails } from '@/app/actions';
import { notFound } from 'next/navigation';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Linkedin, Mail, Star, Users, BookOpen, PlayCircle, Quote } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import type { Course } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function InstructorDetailPage(props: {
  params: Promise<{ instructorId: string }>;
}) {
  const params = await props.params;
  const { instructorId } = params;
  const instructor = await getInstructorDetails(instructorId);

  if (!instructor) {
    notFound();
  }

  const instructorCourses = instructor.courses || [];
  const instructorProfile = instructor.profile;

  const instructorName = `${instructorProfile.first_name || ''} ${instructorProfile.last_name || ''}`.trim();
  const initials = `${instructorProfile.first_name?.[0] || ''}${instructorProfile.last_name?.[0] || ''}`;

  const getFullLinkedInUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const linkedInUrl = getFullLinkedInUrl(instructorProfile.linkedin_url || null);

  return (
    <div className="bg-background">
      <header className="py-16 sm:py-20 bg-muted/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-lg border-4 border-background">
                <ImagePlaceholder 
                    alt={instructorName}
                    fill
                    className="object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-2 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold font-headline">{instructorName}</h1>
              {instructor.specialty && (
                <p className="text-xl text-primary font-semibold mt-2">{instructor.specialty}</p>
              )}
               <div className="mt-4 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                  {linkedInUrl && (
                    <Button asChild variant="outline" className="text-muted-foreground hover:text-primary">
                        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                        </a>
                    </Button>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground italic">
                        <Quote className="h-4 w-4" />
                        <span>Comprometido con la excelencia educativa.</span>
                    </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2">
                 {instructorProfile.bio && (
                    <div className="prose dark:prose-invert max-w-none">
                        <p>{instructorProfile.bio}</p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-1 flex items-center justify-center">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                    <ImagePlaceholder
                        alt="Instructor enseñando"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
          </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-3xl font-bold mb-8 font-headline text-center">Lecciones del Docente</h2>
        {instructorCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructorCourses.map((course) => (
              <CourseCard key={course.id} course={course as Course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-card">
             <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Aún no hay lecciones</h3>
            <p className="text-muted-foreground mt-2">Este docente todavía no tiene lecciones publicadas para ti.</p>
          </div>
        )}
      </main>
    </div>
  );
}
