
import { cn } from "@/lib/utils";
import type { Testimonial } from '@/lib/types';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Star, BookOpen } from "lucide-react";

interface ReviewCardProps {
  testimonial: Testimonial;
}

const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Star
                key={i}
                className={cn(
                    "w-4 h-4",
                    i <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                )}
            />
        );
    }
    return stars;
};

export const ReviewCard = ({ testimonial }: ReviewCardProps) => {
  return (
    <figure
      className={cn(
        "relative flex flex-col h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/10 bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/15"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <ImagePlaceholder className="rounded-full" width="32" height="32" alt={testimonial.name} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {testimonial.name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{testimonial.role}</p>
        </div>
      </div>
      {testimonial.rating > 0 && (
          <div className="flex items-center gap-0.5 mt-2">
              {renderStars(testimonial.rating)}
          </div>
      )}
      <blockquote className="mt-2 text-sm flex-grow">{testimonial.comment}</blockquote>
      
      {testimonial.courseTitle && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-950/20 dark:border-gray-50/20">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            Comentó en <span className="font-semibold">{testimonial.courseTitle}</span>
          </p>
        </div>
      )}
    </figure>
  );
};
