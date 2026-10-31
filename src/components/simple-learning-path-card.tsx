
import type { LearningPath } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, ArrowRight } from 'lucide-react';

interface SimpleLearningPathCardProps {
  path: LearningPath;
}

export function SimpleLearningPathCard({ path }: SimpleLearningPathCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div
          className="w-full h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${path.image_url || 'https://placehold.co/600x400.png'})` }}
        />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-grow">
        <CardTitle className="text-lg mb-2">
          <Link href={`/paths/${path.id}`} className="hover:text-primary transition-colors">{path.title}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{path.description}</p>
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
