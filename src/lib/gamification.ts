
// ============================================================
// Módulo de Gamificación: insignias, niveles y puntajes.
//
// Fuente de verdad: backend Laravel (ver src/lib/actions/gamification.ts).
// Este archivo provee tipos UI compartidos, etiquetas de categorías,
// iconos y un cálculo local de respaldo que se usa únicamente
// cuando la API no responde (misma estrategia que el resto de la app).
// ============================================================

import type { StudentLessonItem } from '@/lib/actions/dashboard';
import type { BackendAchievement } from '@/lib/actions/gamification';

// ------------------------------------------------------------
// Etiquetas de categorías (claves del backend y locales)
// ------------------------------------------------------------

export type BadgeIconName =
  | 'footprints'
  | 'book-open'
  | 'brain'
  | 'clipboard-check'
  | 'trophy'
  | 'flame'
  | 'calendar-check'
  | 'messages-square'
  | 'compass'
  | 'crown'
  | 'star';

/** Etiquetas en español para las categorías del backend y las locales. */
export const CATEGORY_LABELS: Record<string, string> = {
  // Claves del backend
  lessons: 'Lecciones',
  exams: 'Evaluaciones',
  streak: 'Constancia',
  level: 'Nivel',
  general: 'General',
  // Claves locales (fallback)
  lecciones: 'Lecciones',
  evaluaciones: 'Evaluaciones',
  participacion: 'Participación',
  constancia: 'Constancia',
};

/** Icono por defecto según la categoría (si el badge no trae emoji). */
export function categoryIcon(category: string): BadgeIconName {
  switch (category) {
    case 'lessons':
    case 'lecciones':
      return 'book-open';
    case 'exams':
    case 'evaluaciones':
      return 'clipboard-check';
    case 'streak':
    case 'constancia':
      return 'flame';
    case 'level':
      return 'star';
    case 'participacion':
      return 'messages-square';
    default:
      return 'trophy';
  }
}

// ------------------------------------------------------------
// Insignia normalizada para la UI (backend o cálculo local)
// ------------------------------------------------------------

export interface UiBadge {
  slug: string;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
  /** Emoji proveniente del backend (si existe). */
  emoji: string | null;
  /** Progreso 0-100 hacia el requisito; null si el backend no lo provee. */
  progressPercent: number | null;
  /** Texto de avance, p. ej. "3 / 5". */
  progressLabel: string | null;
}

/** Normaliza un logro del backend a la forma que consume la UI. */
export function badgeFromBackend(achievement: BackendAchievement): UiBadge {
  return {
    slug: achievement.slug,
    name: achievement.name,
    description: achievement.description,
    category: achievement.category,
    xpReward: achievement.xp_reward,
    unlocked: achievement.unlocked,
    unlockedAt: achievement.unlocked_at,
    emoji: achievement.icon || null,
    progressPercent: null,
    progressLabel: null,
  };
}

// ------------------------------------------------------------
// Resumen de nivel para la UI
// ------------------------------------------------------------

export interface UiLevelInfo {
  /** Nombre visible del nivel ("Nivel 3", "Aprendiz", ...). */
  name: string;
  levelNumber: number;
  /** Progreso 0-100 hacia el siguiente nivel. */
  progressPercent: number;
  /** Texto de avance, p. ej. "35 / 100 XP". */
  progressLabel: string;
  /** Mensaje motivacional hacia el siguiente nivel. */
  hint: string;
}

// ------------------------------------------------------------
// Fallback local: cálculo con reglas propias.
// Solo se usa si la API de gamificación no está disponible.
// ------------------------------------------------------------

export interface GamificationMetrics {
  lessonsCompleted: number;
  unitsExplored: number;
  evaluationsPassed: number;
  perfectScores: number;
  streakDays: number;
  qaParticipation: number;
}

interface LocalBadgeDefinition {
  slug: string;
  name: string;
  description: string;
  category: string;
  requirement: number;
  xpReward: number;
  metric: keyof GamificationMetrics;
}

const LOCAL_BADGES: LocalBadgeDefinition[] = [
  { slug: 'primer-paso', name: 'Primer Paso', description: 'Completa tu primera lección.', category: 'lecciones', requirement: 1, xpReward: 50, metric: 'lessonsCompleted' },
  { slug: 'estudiante-dedicado', name: 'Estudiante Dedicado', description: 'Completa 5 lecciones.', category: 'lecciones', requirement: 5, xpReward: 100, metric: 'lessonsCompleted' },
  { slug: 'sabio-matematico', name: 'Sabio Matemático', description: 'Completa 15 lecciones.', category: 'lecciones', requirement: 15, xpReward: 250, metric: 'lessonsCompleted' },
  { slug: 'maestro-aulamate', name: 'Maestro Aulamate', description: 'Completa 30 lecciones.', category: 'lecciones', requirement: 30, xpReward: 500, metric: 'lessonsCompleted' },
  { slug: 'explorador-unidades', name: 'Explorador de Unidades', description: 'Completa lecciones de 3 unidades temáticas distintas.', category: 'lecciones', requirement: 3, xpReward: 150, metric: 'unitsExplored' },
  { slug: 'evaluador', name: 'Evaluador', description: 'Aprueba tu primera evaluación.', category: 'evaluaciones', requirement: 1, xpReward: 75, metric: 'evaluationsPassed' },
  { slug: 'puntuacion-perfecta', name: 'Puntuación Perfecta', description: 'Obtén 20/20 en una evaluación.', category: 'evaluaciones', requirement: 1, xpReward: 150, metric: 'perfectScores' },
  { slug: 'voz-activa', name: 'Voz Activa', description: 'Participa 5 veces en el foro de preguntas.', category: 'participacion', requirement: 5, xpReward: 75, metric: 'qaParticipation' },
  { slug: 'racha-inicial', name: 'Racha Inicial', description: 'Mantén 3 días seguidos de estudio.', category: 'constancia', requirement: 3, xpReward: 100, metric: 'streakDays' },
  { slug: 'constante', name: 'Constante', description: 'Mantén 7 días seguidos de estudio.', category: 'constancia', requirement: 7, xpReward: 200, metric: 'streakDays' },
];

export interface LocalGamificationResult {
  badges: UiBadge[];
  totalXp: number;
  level: UiLevelInfo;
  unlockedCount: number;
}

/** Deriva las métricas locales de las lecciones del estudiante. */
export function metricsFromStudentLessons(lessons: StudentLessonItem[]): GamificationMetrics {
  const units = new Set(
    lessons.map(lesson => lesson.unit).filter((unit): unit is string => !!unit)
  );
  return {
    lessonsCompleted: lessons.length,
    unitsExplored: units.size,
    // Pendientes de integración con el backend (se muestran con progreso 0).
    evaluationsPassed: 0,
    perfectScores: 0,
    streakDays: 0,
    qaParticipation: 0,
  };
}

/** Niveles del cálculo local de respaldo. */
const LOCAL_LEVELS = [
  { name: 'Explorador', minPoints: 0 },
  { name: 'Aprendiz', minPoints: 200 },
  { name: 'Practicante', minPoints: 500 },
  { name: 'Avanzado', minPoints: 1000 },
  { name: 'Experto Matemático', minPoints: 2000 },
];

function localLevelInfo(totalXp: number): UiLevelInfo {
  let index = 0;
  for (let i = 0; i < LOCAL_LEVELS.length; i++) {
    if (totalXp >= LOCAL_LEVELS[i].minPoints) index = i;
  }
  const current = LOCAL_LEVELS[index];
  const next = index < LOCAL_LEVELS.length - 1 ? LOCAL_LEVELS[index + 1] : null;

  let progressPercent = 100;
  if (next) {
    const span = next.minPoints - current.minPoints;
    progressPercent = Math.min(100, Math.round(((totalXp - current.minPoints) / span) * 100));
  }

  return {
    name: current.name,
    levelNumber: index + 1,
    progressPercent,
    progressLabel: next ? `${totalXp} / ${next.minPoints} XP` : `${totalXp} XP`,
    hint: next
      ? `Te faltan ${(next.minPoints - totalXp)} XP para alcanzar "${next.name}".`
      : '¡Felicidades! Alcanzaste el nivel máximo.',
  };
}

/** Cálculo local de respaldo (solo cuando la API no está disponible). */
export function computeLocalGamification(metrics: GamificationMetrics): LocalGamificationResult {
  const badges: UiBadge[] = LOCAL_BADGES.map(badge => {
    const current = metrics[badge.metric];
    const unlocked = current >= badge.requirement;
    const progressPercent = Math.min(100, Math.round((current / badge.requirement) * 100));
    return {
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      xpReward: badge.xpReward,
      unlocked,
      unlockedAt: null,
      emoji: null,
      progressPercent: unlocked ? null : progressPercent,
      progressLabel: unlocked ? null : `${current} / ${badge.requirement}`,
    };
  });

  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const totalXp =
    unlockedBadges.reduce((total, badge) => total + badge.xpReward, 0) +
    metrics.lessonsCompleted * 25;

  return {
    badges,
    totalXp,
    level: localLevelInfo(totalXp),
    unlockedCount: unlockedBadges.length,
  };
}

// ------------------------------------------------------------
// Ranking de demostración (fallback local)
// ------------------------------------------------------------

export interface DemoLeaderboardEntry {
  rank: number;
  name: string;
  grade: string | null;
  points: number;
  badges: number;
}

/** Estudiantes de demostración (datos locales, no vienen de la API). */
const DEMO_STUDENTS = [
  { name: 'Valentina Ríos', grade: '5to', points: 2450, badges: 8 },
  { name: 'Mateo Salazar', grade: '5to', points: 2100, badges: 7 },
  { name: 'Lucía Fernández', grade: '4to', points: 1780, badges: 7 },
  { name: 'Diego Cárdenas', grade: '4to', points: 1500, badges: 6 },
  { name: 'Sofía Mendoza', grade: '3ro', points: 1250, badges: 5 },
  { name: 'Andrés Quispe', grade: '3ro', points: 980, badges: 5 },
  { name: 'Camila Torres', grade: '2do', points: 760, badges: 4 },
  { name: 'Joaquín Herrera', grade: '2do', points: 540, badges: 3 },
  { name: 'Isabela Rojas', grade: '1ro', points: 320, badges: 2 },
  { name: 'Sebastián Núñez', grade: '1ro', points: 150, badges: 1 },
];

/**
 * Construye el ranking de demostración con el usuario autenticado
 * insertado con sus puntos reales. Solo se usa si la API falla.
 */
export function buildDemoLeaderboard(
  currentUser: { name: string; grade: string | null; points: number; badges: number } | null
): DemoLeaderboardEntry[] {
  const rows: Omit<DemoLeaderboardEntry, 'rank'>[] = DEMO_STUDENTS.map(student => ({
    name: student.name,
    grade: student.grade,
    points: student.points,
    badges: student.badges,
  }));

  if (currentUser) {
    rows.push({
      name: currentUser.name,
      grade: currentUser.grade,
      points: currentUser.points,
      badges: currentUser.badges,
    });
  }

  return rows
    .sort((a, b) => b.points - a.points)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
