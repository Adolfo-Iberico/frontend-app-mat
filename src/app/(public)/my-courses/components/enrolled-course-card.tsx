
import type { Course } from '@/lib/types';
import Link from 'next/link';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { CourseCover } from '@/components/course-cover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlayCircle } from 'lucide-react';

interface EnrolledCourseCardProps {
  course: Course;
  progress: number; // Percentage from 0 to 100
}

export function EnrolledCourseCard({ course, progress }: EnrolledCourseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/learn/${course.id}`} className="block">
          <CourseCover course={course} className="h-48 w-full" />
        </Link>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-grow">
        <CardTitle className="text-lg mb-2">
          <Link href={`/learn/${course.id}`} className="hover:text-primary transition-colors">{course.title}</Link>
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <ImagePlaceholder alt={course.instructor.name} width={24} height={24} className="rounded-full mr-2" />
          <span>{course.instructor.name}</span>
        </div>
        <div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% completado</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/learn/${course.id}`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            {progress > 0 ? 'Continuar Lección' : 'Empezar Lección'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
