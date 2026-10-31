import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  alt?: string;
  /** Ocupa todo el contenedor padre (que debe ser `relative`), igual que `next/image`. */
  fill?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const SMALL_SIZE = 48;

function initials(text = '') {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || '?';
}

/**
 * Reemplazo visual de las imágenes mientras el proyecto no tenga contenido real.
 * Acepta las mismas props de tamaño que `next/image` para no romper el layout.
 */
export function ImagePlaceholder({ alt = '', fill, width, height, className, style }: ImagePlaceholderProps) {
  const isSmall = !fill && Number(width) > 0 && Number(width) <= SMALL_SIZE;

  return (
    <div
      role="img"
      aria-label={alt}
      title={alt}
      className={cn(
        'flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-muted to-accent/20 text-muted-foreground',
        fill && 'absolute inset-0 h-full w-full',
        isSmall && 'rounded-full text-[10px] font-semibold text-foreground/70',
        className,
      )}
      style={fill ? style : { width: width ? Number(width) || width : undefined, height: height ? Number(height) || height : undefined, maxWidth: '100%', ...style }}
    >
      {isSmall ? (
        initials(alt)
      ) : (
        <div className="flex flex-col items-center gap-2 p-2 text-center">
          <ImageIcon className="h-8 w-8 opacity-60" />
          {alt && <span className="line-clamp-2 max-w-[80%] text-xs font-medium opacity-80">{alt}</span>}
        </div>
      )}
    </div>
  );
}
