'use client';

import { useState, useEffect } from 'react';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const features = [
  {
    title: 'Consultoría',
    description: 'Transformación digital',
    hint: 'digital transformation'
  },
  {
    title: 'BIM – LEAN',
    description: 'Eficiencia operativa',
    hint: 'operational efficiency'
  },
  {
    title: 'Capacitación',
    description: 'Plataformas BIM',
    hint: 'BIM platforms'
  },
  {
    title: 'Sostenibilidad',
    description: 'Seguimiento e impacto',
    hint: 'sustainability impact'
  },
];

function InteractiveDesktopHero() {
  const [activeImage, setActiveImage] = useState(features[0].title);
  const [isFading, setIsFading] = useState(false);

  const handleFeatureHover = (imgSrc: string) => {
    if (activeImage !== imgSrc) {
      setIsFading(true);
      setTimeout(() => {
        setActiveImage(imgSrc);
        setTimeout(() => setIsFading(false), 50);
      }, 120);
    }
  };

  return (
    <section
      className="
        relative overflow-hidden rounded-3xl border shadow-xl
        p-4 sm:p-6
        bg-gradient-to-br from-sky-50/80 via-white/70 to-sky-100/60
        dark:from-[#0b1220] dark:via-[#0e1628] dark:to-[#0b1220]
        ring-1 ring-border/60
      "
    >
      {/* decor de fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_50%_-10%,rgba(2,132,199,.10),transparent_60%)] dark:bg-[radial-gradient(110%_90%_at_50%_-10%,rgba(56,189,248,.10),transparent_60%)]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* PREVIEW */}
        <div
          className="
            relative overflow-hidden rounded-2xl grid place-items-center
            h-72 lg:h-[520px]
            ring-1 ring-border/60 bg-muted/30
          "
        >
          <ImagePlaceholder
            alt={activeImage}
            fill
            className={cn(
              "object-cover transition-opacity duration-300 ease-in-out",
              isFading ? 'opacity-20' : 'opacity-100'
            )}
          />
          {/* overlays sutiles */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent mix-blend-multiply" />
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(120%_120%_at_50%_100%,rgba(0,0,0,.35),transparent_60%)]" />
        </div>

        {/* LISTA */}
        <div className="flex flex-col gap-4 justify-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Tecnología para la construcción
          </h2>
          <p className="text-muted-foreground">
            Pasa el mouse o selecciona una opción para cambiar la imagen.
          </p>

          <ul className="flex flex-col gap-3 mt-2" role="list">
            {features.map((feature, index) => {
              const isActive = activeImage === feature.title; // solo estilo
              return (
                <li key={index}>
                  <button
                    className={cn(
                      "group relative w-full text-left grid grid-cols-[auto,1fr] gap-4 rounded-2xl transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "p-[1.5px] bg-gradient-to-r from-sky-200/60 via-sky-100/10 to-indigo-200/60",
                      isActive
                        ? "shadow-md"
                        : "hover:from-sky-300/70 hover:to-indigo-300/70"
                    )}
                    onMouseEnter={() => handleFeatureHover(feature.title)}
                    onFocus={() => handleFeatureHover(feature.title)}
                    onClick={() => handleFeatureHover(feature.title)}
                  >
                    <div
                      className={cn(
                        "rounded-2xl bg-card border border-border p-4 transition-all duration-200",
                        isActive && "border-primary/40 ring-1 ring-primary/30 bg-primary/5"
                      )}
                    >
                      <span
                        className={cn(
                          "grid place-items-center w-11 h-11 rounded-lg font-bold transition-colors",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {`0${index + 1}`}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "self-center rounded-2xl bg-card border border-border p-4 transition-all duration-200",
                        isActive && "border-primary/40 ring-1 ring-primary/30 bg-primary/5"
                      )}
                    >
                      <strong
                        className={cn(
                          "block text-base sm:text-lg font-semibold",
                          isActive ? "text-foreground" : "text-foreground"
                        )}
                      >
                        {feature.title}
                      </strong>
                      <small
                        className={cn(
                          "block text-sm mt-0.5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {feature.description}
                      </small>
                    </div>

                    {/* barrita activa a la izquierda */}
                    <span
                      className={cn(
                        "pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-opacity",
                        isActive ? "bg-gradient-to-b from-sky-500 to-indigo-500 opacity-100" : "opacity-0 group-hover:opacity-100 bg-gradient-to-b from-sky-300 to-indigo-300"
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SimpleMobileHero() {
  return (
    <section className="bg-transparent">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Tecnología para la construcción
          </h2>
          <p className="text-muted-foreground mt-2">
            Nuestros servicios de consultoría y capacitación.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
          {features.map((feature, index) => (
            <li
              key={index}
              className="
                group relative rounded-2xl p-[1.5px]
                bg-gradient-to-br from-sky-200/60 via-sky-100/10 to-indigo-200/60
              "
            >
              <div className="rounded-2xl overflow-hidden bg-card border border-border transition-all duration-200 group-hover:shadow-lg">
                <div className="relative h-40 w-full ring-1 ring-border/60">
                  <ImagePlaceholder
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <strong className="block text-base font-semibold text-foreground">
                    {feature.title}
                  </strong>
                  <small className="block text-sm text-muted-foreground mt-0.5">
                    {feature.description}
                  </small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function InteractiveHero() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server
  }

  if (isMobile) {
    return <SimpleMobileHero />;
  }

  return <InteractiveDesktopHero />;
}
