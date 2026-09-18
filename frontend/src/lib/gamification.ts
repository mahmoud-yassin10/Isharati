import type { Lesson, ProgressItem } from "./types";

export type BadgeTier = "bronze" | "silver" | "gold";

export type Badge = {
  tier: BadgeTier;
  label_ar: string;
  label_en: string;
};

const TIER_LABELS: Record<BadgeTier, { ar: string; en: string }> = {
  bronze: { ar: "برونزي", en: "Bronze" },
  silver: { ar: "فضي", en: "Silver" },
  gold: { ar: "ذهبي", en: "Gold" },
};

function requiredStepIds(lesson: Lesson): string[] {
  return lesson.steps.filter((step) => step.type !== "sign_check").map((step) => step.id);
}

function doneStepIds(progress: ProgressItem[]): Set<string> {
  return new Set(progress.filter((item) => item.status === "done").map((item) => item.step_id));
}

/** Fraction (0-100) of required (non sign_check) steps marked done for this student. */
export function computeMastery(lesson: Lesson, progress: ProgressItem[]): number {
  const required = requiredStepIds(lesson);
  if (required.length === 0) return 0;
  const done = doneStepIds(progress);
  const completed = required.filter((id) => done.has(id)).length;
  return Math.round((completed / required.length) * 100);
}

/**
 * bronze: lesson started (at least one step done)
 * silver: every required step (excluding sign_check) done
 * gold: silver, plus the sign_check step (if the lesson has one) was attempted
 */
export function badgeForLesson(lesson: Lesson, progress: ProgressItem[]): Badge | null {
  const mastery = computeMastery(lesson, progress);
  if (mastery <= 0) return null;

  const signCheckSteps = lesson.steps.filter((step) => step.type === "sign_check");
  const attempted = new Set(
    progress
      .filter((item) => item.status === "done" || item.status === "attempted")
      .map((item) => item.step_id),
  );
  const signChecksAttempted =
    signCheckSteps.length === 0 || signCheckSteps.every((step) => attempted.has(step.id));

  let tier: BadgeTier = "bronze";
  if (mastery >= 100) {
    tier = signChecksAttempted ? "gold" : "silver";
  }

  return { tier, label_ar: TIER_LABELS[tier].ar, label_en: TIER_LABELS[tier].en };
}

export type LessonStats = {
  /** Required steps (everything except sign_check). */
  total: number;
  /** Required steps this student has finished. */
  done: number;
  mastery: number;
  badge: Badge | null;
  state: "new" | "learning" | "complete";
};

/** Per-lesson counts used by the student lesson list and the continue card. */
export function lessonStats(lesson: Lesson, progress: ProgressItem[]): LessonStats {
  const required = requiredStepIds(lesson);
  const done = doneStepIds(progress);
  const completed = required.filter((id) => done.has(id)).length;
  const mastery = computeMastery(lesson, progress);
  return {
    total: required.length,
    done: completed,
    mastery,
    badge: badgeForLesson(lesson, progress),
    state: completed === 0 ? "new" : mastery >= 100 ? "complete" : "learning",
  };
}

export type Score = { points: number; stars: number; level: number; toNext: number };

const POINTS_PER_LEVEL = 150;

/** 10 points per finished step, plus 10 per game star. */
export function scoreFor(progress: ProgressItem[]): Score {
  let points = 0;
  let stars = 0;
  for (const item of progress) {
    if (item.status !== "done") continue;
    const itemStars = item.sim_snapshot?.stars ?? 0;
    points += 10 + itemStars * 10;
    stars += itemStars;
  }
  return {
    points,
    stars,
    level: Math.floor(points / POINTS_PER_LEVEL) + 1,
    toNext: POINTS_PER_LEVEL - (points % POINTS_PER_LEVEL),
  };
}

export const LEVEL_SIZE = POINTS_PER_LEVEL;
