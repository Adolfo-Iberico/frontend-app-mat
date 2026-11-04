
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Link as LinkIcon, Copy } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface LiveCountdownProps {
  targetDate: string;
  sessionUrl: string | null;
}

export function LiveCountdown({ targetDate, sessionUrl }: LiveCountdownProps) {
  const { toast } = useToast();
  
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        Días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        Horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        Minutos: Math.floor((difference / 1000 / 60) % 60),
        Segundos: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const timerComponents: JSX.Element[] = [];
  
  if (isClient) {
      Object.keys(timeLeft).forEach((interval) => {
        const value = timeLeft[interval as keyof typeof timeLeft];
        if (value === undefined) return;

        timerComponents.push(
          <div key={interval} className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-bold text-primary tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
              {interval}
            </span>
          </div>
        );
      });
  }

  const handleCopyLink = () => {
    if (sessionUrl) {
      navigator.clipboard.writeText(sessionUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace de la conferencia ha sido copiado al portapapeles.",
        variant: "success",
      });
    }
  };

  const sessionTime = new Date(targetDate);
  const now = new Date();
  // The session is considered "live" for 12 hours after the start time.
  const isSessionLive = now >= sessionTime && now < new Date(sessionTime.getTime() + 12 * 60 * 60 * 1000); 
  const isSessionOver = now >= new Date(sessionTime.getTime() + 12 * 60 * 60 * 1000);

  return (
    <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center text-center p-4">
      {timerComponents.length ? (
        <>
          <h2 className="text-2xl font-bold mb-2">La sesión en vivo comenzará en:</h2>
          <div className="flex gap-4 md:gap-8 my-4">
            {timerComponents}
          </div>
           {sessionUrl && (
            <div className="flex items-center gap-2 mt-4">
                <Button asChild>
                    <Link href={sessionUrl} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4"/>
                        Ir a la Conferencia
                    </Link>
                </Button>
            </div>
          )}
        </>
      ) : isSessionLive ? (
        <div className="flex flex-col items-center gap-4">
            <h2 className="text-3xl font-bold text-green-500 mb-2 animate-pulse">¡La sesión está en vivo ahora!</h2>
            <p className="text-muted-foreground">Utiliza el siguiente enlace para unirte a la conferencia.</p>
            {sessionUrl ? (
                <>
                    <div className="flex items-center gap-2 bg-background/50 border rounded-lg px-4 py-2 text-sm mt-2">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-muted-foreground truncate">{sessionUrl}</span>
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyLink}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                    <Button asChild size="lg" className="mt-4">
                        <Link href={sessionUrl} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2 h-5 w-5"/>
                            Unirse a la Sesión
                        </Link>
                    </Button>
                </>
            ) : <p className="text-red-500">URL de la sesión no disponible.</p>}
        </div>
      ) : isSessionOver ? (
         <h2 className="text-2xl font-bold text-muted-foreground">La sesión en vivo ha finalizado.</h2>
      ) : (
        <h2 className="text-2xl font-bold">Cargando contador...</h2>
      )}
    </div>
  );
}
