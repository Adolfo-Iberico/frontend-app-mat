
import type { LearningPath } from '@/lib/types';
import Link from 'next/link';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, ArrowRight } from 'lucide-react';

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/paths/${path.id}`} className="block">
          <ImagePlaceholder
            alt={path.title}
            width={600}
            height={400}
            className="object-cover w-full h-48 aspect-video"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-grow">
        <CardTitle className="text-lg mb-2">
          <Link href={`/paths/${path.id}`} className="hover:text-primary transition-colors">{path.title}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Layers className="w-4 h-4 mr-2" />
          <span>{path.coursesCount} Cursos</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/paths/${path.id}`}>
            Explorar Especialización <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
