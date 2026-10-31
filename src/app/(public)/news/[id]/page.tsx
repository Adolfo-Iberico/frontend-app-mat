
import { notFound } from 'next/navigation';
import { getNewsArticleById } from '@/app/actions';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { Calendar, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export default async function NewsDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const article = await getNewsArticleById(id);

  if (!article) {
    notFound();
  }

  const authorName = article.author.name;
  const publishedDate = formatInTimeZone(new Date(article.created_at), 'America/Lima', "d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="container mx-auto max-w-4xl py-12 sm:py-16 md:py-20">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl mb-4">{article.title}</h1>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={article.author.avatarUrl || undefined} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Publicado por <strong>{authorName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={article.created_at}>{publishedDate}</time>
            </div>
          </div>
        </header>

        {article.image_urls && article.image_urls.length > 1 ? (
          <Carousel className="w-full mb-8">
            <CarouselContent>
              {article.image_urls.map((url, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="flex aspect-video items-center justify-center p-0">
                       <ImagePlaceholder
                          alt={`${article.title} - Imagen ${index + 1}`}
                          width={1200}
                          height={675}
                          className="rounded-lg object-cover w-full h-full"
                        />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
        ) : article.image_urls && article.image_urls.length === 1 ? (
          <div className="mb-8 overflow-hidden rounded-lg border">
            <AspectRatio ratio={16/9}>
                <ImagePlaceholder
                    alt={article.title}
                    fill
                    className="object-cover"
                />
            </AspectRatio>
          </div>
        ) : null}

        <div className="prose dark:prose-invert max-w-none">
          <p className="lead text-lg text-muted-foreground">{article.description}</p>
          {article.long_description && <p>{article.long_description}</p>}
        </div>
      </article>
    </div>
  );
}
