
'use client';

import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, CheckCircle } from 'lucide-react';
import type { NewsArticle } from '@/lib/types';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { Badge } from './ui/badge';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const publishedDate = formatInTimeZone(new Date(article.created_at), 'America/Lima', "d 'de' MMMM, yyyy", { locale: es });

  return (
    <Link href={`/news/${article.id}`} className="flex flex-col h-full group">
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader className="p-0">
            <div className="aspect-video relative">
            <ImagePlaceholder // Show only the first image as thumbnail
                alt={article.title}
                fill
                className="object-cover"
            />
             {article.is_project && (
                <Badge variant="secondary" className="absolute top-2 right-2 bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1.5" />
                    Proyecto Entregado
                </Badge>
            )}
            </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
            <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">{article.title}</CardTitle>
            <CardDescription>{article.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-between items-center text-sm text-muted-foreground bg-muted/50">
            <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
                <AvatarImage src={article.author.avatarUrl} alt={article.author.name} />
                <AvatarFallback>{article.author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.created_at}>{publishedDate}</time>
            </div>
        </CardFooter>
        </Card>
    </Link>
  );
}
