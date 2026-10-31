import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

// Logo provisional (sin imagen). El tamaño lo define `className` (p. ej. "h-6 w-6").
export function Logo(props: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="E-Lean"
      className={cn('inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground', props.className)}
    >
      <GraduationCap className="h-[65%] w-[65%]" />
    </span>
  );
}
