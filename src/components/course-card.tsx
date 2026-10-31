'use client';

import type { Course } from '@/lib/types';
import Link from 'next/link';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-card/80 hover:bg-card hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 group">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="p-0">
        <Link href={`/courses/${course.id}`} className="block">
          <ImagePlaceholder
            alt={course.title}
            width={600}
            height={400}
            className="object-cover w-full h-48 aspect-video"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          {course.category && <Badge variant="secondary">{course.category}</Badge>}
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <CardTitle className="text-lg mb-2">
          <Link href={`/courses/${course.id}`} className="hover:text-primary transition-colors">{course.title}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ImagePlaceholder alt={course.instructor.name} width={24} height={24} className="rounded-full" />
            <span className="ml-1">{course.instructor.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {course.estimatedTime ? (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.estimatedTime} min
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.students ?? 0}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 pt-0 flex justify-between items-center">
        <div className="text-sm font-semibold text-green-600 dark:text-green-400">Acceso libre</div>
        <Button asChild size="sm">
          <Link href={`/courses/${course.id}`}>
            Ver Lección <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
