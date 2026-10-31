
'use client';

import { Progress } from '@/components/ui/progress';
import {
  Footprints,
  BookOpen,
  Brain,
  ClipboardCheck,
  Trophy,
  Flame,
  CalendarCheck,
  MessagesSquare,
  Compass,
  Crown,
  Star,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, categoryIcon, type UiBadge, type BadgeIconName } from '@/lib/gamification';

const ICONS: Record<BadgeIconName, LucideIcon> = {
  footprints: Footprints,
  'book-open': BookOpen,
  brain: Brain,
  'clipboard-check': ClipboardCheck,
  trophy: Trophy,
  flame: Flame,
  'calendar-check': CalendarCheck,
  'messages-square': MessagesSquare,
  compass: Compass,
  crown: Crown,
  star: Star,
};

interface BadgeCardProps {
  badge: UiBadge;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const Icon = ICONS[categoryIcon(badge.category)];

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border p-6 text-center transition-all',
        badge.unlocked
          ? 'border-amber-300/60 bg-gradient-to-b from-amber-50 to-card shadow-sm dark:from-amber-950/30'
          : 'border-dashed opacity-70'
      )}
    >
      <div
        className={cn(
          'relative flex h-16 w-16 items-center justify-center rounded-full',
          badge.unlocked
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {badge.emoji ? (
          <span className="text-3xl leading-none" role="img" aria-label={badge.name}>
            {badge.emoji}
          </span>
        ) : (
          <Icon className="h-8 w-8" />
        )}
        {!badge.unlocked && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border">
            <Lock className="h-3 w-3 text-muted-foreground" />
          </span>
        )}
      </div>

      <h3 className="mt-4 font-semibold leading-tight">{badge.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground min-h-8">{badge.description}</p>

      <span className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        {CATEGORY_LABELS[badge.category] ?? 'General'}
      </span>

      {badge.unlocked ? (
        <p className="mt-2 text-sm font-semibold text-primary">+{badge.xpReward} XP</p>
      ) : badge.progressPercent !== null ? (
        <div className="mt-3 w-full">
          <Progress value={badge.progressPercent} className="h-2" />
          {badge.progressLabel && (
            <p className="mt-1 text-xs text-muted-foreground">{badge.progressLabel}</p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Recompensa: <span className="font-semibold text-foreground">+{badge.xpReward} XP</span>
        </p>
      )}
    </div>
  );
}
