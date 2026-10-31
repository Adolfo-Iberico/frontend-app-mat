'use client';

import { useCallback, useEffect, useState } from 'react';
import { Crown, Medal, Trophy, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import type { BackendMyPosition, BackendRankingEntry, RankingPeriod } from '@/lib/actions/gamification';
import type { DemoLeaderboardEntry } from '@/lib/gamification';
import { cn } from '@/lib/utils';

const PERIOD_LABELS: { value: RankingPeriod; label: string }[] = [
  { value: 'all_time', label: 'General' },
  { value: 'month', label: 'Mensual' },
  { value: 'week', label: 'Semanal' },
];

function LeaderboardSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface PodiumEntry {
  rank: number;
  name: string;
  score: string;
  highlight: boolean;
}

function Podium({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) return null;
  const [first, second, third] = entries;
  const podium = [second, first, third].filter(Boolean);

  const podiumStyles: Record<number, { bar: string; icon: typeof Trophy }> = {
    1: { bar: 'h-52 from-amber-400 to-yellow-500', icon: Crown },
    2: { bar: 'h-44 from-slate-300 to-slate-400', icon: Trophy },
    3: { bar: 'h-40 from-orange-400 to-amber-600', icon: Medal },
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-12 items-end">
      {podium.map(entry => {
        const style = podiumStyles[entry.rank];
        const Icon = style.icon;
        return (
          <div key={`${entry.rank}-${entry.name}`} className="flex flex-col items-center">
            <Avatar
              className={cn(
                'h-14 w-14 sm:h-16 sm:w-16 border-4',
                entry.rank === 1 ? 'border-amber-400' : entry.rank === 2 ? 'border-slate-300' : 'border-orange-400'
              )}
            >
              <AvatarFallback className="font-bold">{initialsOf(entry.name)}</AvatarFallback>
            </Avatar>
            <p className="mt-2 text-sm font-semibold text-center truncate max-w-full">{entry.name}</p>
            <div
              className={cn(
                'mt-3 w-full rounded-t-2xl bg-gradient-to-t text-white flex flex-col items-center justify-start pt-3 px-2',
                style.bar,
                entry.highlight && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <Icon className="h-6 w-6" />
              <p className="text-lg font-bold mt-1">{entry.score}</p>
              <p className="text-[10px] uppercase tracking-wide opacity-90">promedio</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<RankingPeriod>('all_time');
  const [entries, setEntries] = useState<BackendRankingEntry[] | null>(null);
  const [myPosition, setMyPosition] = useState<BackendMyPosition | null>(null);
  const [demoEntries, setDemoEntries] = useState<DemoLeaderboardEntry[] | null>(null);

  const fetchData = useCallback(
    async (selectedPeriod: RankingPeriod) => {
      if (authLoading) return;
      if (!user) {
        router.push('/login?next=/leaderboard');
        return;
      }

      setLoading(true);

      const gamificationActions = await import('@/lib/actions/gamification');

      // Fuente de verdad: rankings del backend.
      const [ranking, position] = await Promise.all([
        gamificationActions.getOverallRanking(selectedPeriod).catch(() => null),
        selectedPeriod === 'all_time'
          ? gamificationActions.getMyRankingPosition().catch(() => null)
          : Promise.resolve(null),
      ]);

      if (ranking && ranking.entries.length > 0) {
        setEntries(ranking.entries);
        setMyPosition(position);
        setDemoEntries(null);
      } else {
        // Respaldo local: la API de rankings no está disponible o sin datos.
        const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email;
        const { buildDemoLeaderboard } = await import('@/lib/gamification');
        setEntries(null);
        setMyPosition(null);
        setDemoEntries(buildDemoLeaderboard({
          name,
          grade: profile?.grade ?? null,
          points: 0,
          badges: 0,
        }));
      }

      setLoading(false);
    },
    [authLoading, user, profile, router]
  );

  useEffect(() => {
    fetchData(period);
  }, [fetchData, period]);

  if (loading || authLoading) {
    return <LeaderboardSkeleton />;
  }

  // ---- Construcción de datos según la fuente disponible ----
  const podiumEntries: PodiumEntry[] = [];
  let tableRows: React.ReactNode[] = [];
  let yourPositionPanel: React.ReactNode = null;

  if (entries) {
    // API real: promedio de evaluaciones/trabajos sobre 20.
    const top3 = entries.slice(0, 3);
    top3.forEach(entry => {
      podiumEntries.push({
        rank: entry.position,
        name: entry.student_name,
        score: entry.average_score.toFixed(2),
        highlight: entry.student_id === user?.id,
      });
    });

    const rest = entries.slice(3);
    tableRows = rest.map(entry => {
      const isYou = entry.student_id === user?.id;
      return (
        <TableRow key={entry.student_id} className={cn(isYou && 'bg-primary/10 font-semibold')}>
          <TableCell className="text-center text-muted-foreground">{entry.position}</TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initialsOf(entry.student_name)}</AvatarFallback>
              </Avatar>
              <span className="flex items-center gap-2">
                {entry.student_name}
                {isYou && <Badge variant="outline" className="text-[10px]">Tú</Badge>}
              </span>
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell text-center">{entry.total_works}</TableCell>
          <TableCell className="text-right font-semibold">
            {entry.average_score.toFixed(2)} <span className="text-muted-foreground font-normal">/ 20</span>
          </TableCell>
        </TableRow>
      );
    });

    const myEntry = entries.find(entry => entry.student_id === user?.id);
    yourPositionPanel = myPosition ? (
      <div className="mt-8 p-6 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Tu posición en el ranking</h2>
          <p className="text-sm text-muted-foreground">
            Promedio calculado sobre {myPosition.total_works} {myPosition.total_works === 1 ? 'trabajo' : 'trabajos'} evaluados.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              #{myPosition.position}
              <span className="text-sm text-muted-foreground font-normal"> / {myPosition.total_students}</span>
            </p>
            <p className="text-xs text-muted-foreground">Puesto</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{myPosition.overall_average.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Promedio / 20</p>
          </div>
        </div>
      </div>
    ) : null;
  } else if (demoEntries) {
    // Fallback local: datos de demostración.
    demoEntries.slice(0, 3).forEach(entry => {
      podiumEntries.push({
        rank: entry.rank,
        name: entry.name,
        score: entry.points.toLocaleString('es-PE'),
        highlight: entry.name === [profile?.first_name, profile?.last_name].filter(Boolean).join(' '),
      });
    });

    tableRows = demoEntries.slice(3).map(entry => {
      const isYou = entry.name === [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
      return (
        <TableRow key={`${entry.rank}-${entry.name}`} className={cn(isYou && 'bg-primary/10 font-semibold')}>
          <TableCell className="text-center text-muted-foreground">{entry.rank}</TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initialsOf(entry.name)}</AvatarFallback>
              </Avatar>
              <span className="flex items-center gap-2">
                {entry.name}
                {isYou && <Badge variant="outline" className="text-[10px]">Tú</Badge>}
              </span>
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell text-center">{entry.badges}</TableCell>
          <TableCell className="text-right font-semibold">{entry.points.toLocaleString('es-PE')}</TableCell>
        </TableRow>
      );
    });
  }

  const isDemoMode = !entries && demoEntries !== null;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold font-headline">Ranking de Estudiantes</h1>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {PERIOD_LABELS.map(p => (
            <Button
              key={p.value}
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium',
                period === p.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-sm md:text-base mb-10 max-w-2xl">
        Posición según el promedio de tus evaluaciones y trabajos calificados. Sigue practicando
        para escalar puestos.
      </p>

      {isDemoMode && (
        <div className="mb-8 flex items-start gap-3 p-4 rounded-lg border border-dashed text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Mostrando datos de demostración: el ranking oficial del backend no está disponible
            en este momento.
          </p>
        </div>
      )}

      <Podium entries={podiumEntries} />

      {(entries ? entries.length > 3 : (demoEntries?.length ?? 0) > 3) && (
        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">N.º</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead className="hidden sm:table-cell text-center">
                  {entries ? 'Trabajos' : 'Insignias'}
                </TableHead>
                <TableHead className="text-right">
                  {entries ? 'Promedio / 20' : 'Puntos'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </div>
      )}

      {yourPositionPanel}

      {podiumEntries.length === 0 && tableRows.length === 0 && (
        <div className="text-center py-16 border rounded-2xl bg-card/50">
          <p className="text-muted-foreground">
            Aún no hay datos de ranking. Completa evaluaciones para aparecer aquí.
          </p>
        </div>
      )}
    </div>
  );
}
