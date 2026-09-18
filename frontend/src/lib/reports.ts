import { lessonProgress } from "./api";
import { computeMastery } from "./gamification";
import { pick, type Lang } from "./lang";
import type { Lesson, ProgressItem } from "./types";

export type LessonCompletion = {
  studentCount: number;
  avgMastery: number;
  completedCount: number;
};

/** Per-lesson completion, computed by grouping progress rows by student and
 * averaging each student's mastery. Used by the lessons list and reports page. */
export async function loadLessonCompletion(lessons: Lesson[]): Promise<Record<string, LessonCompletion>> {
  const entries = await Promise.all(
    lessons.map(async (lesson) => {
      try {
        const progress = await lessonProgress(lesson.id);
        const byStudent = new Map<string, ProgressItem[]>();
        for (const item of progress) {
          const list = byStudent.get(item.student_id) ?? [];
          list.push(item);
          byStudent.set(item.student_id, list);
        }
        const masteries = Array.from(byStudent.values()).map((items) => computeMastery(lesson, items));
        const studentCount = masteries.length;
        const avgMastery = studentCount ? Math.round(masteries.reduce((sum, value) => sum + value, 0) / studentCount) : 0;
        const completedCount = masteries.filter((value) => value >= 100).length;
        return [lesson.id, { studentCount, avgMastery, completedCount }] as const;
      } catch {
        return [lesson.id, { studentCount: 0, avgMastery: 0, completedCount: 0 }] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

export type PersonLessonStat = {
  mastery: number;
  done: number;
  total: number;
  firstActivity: string | null;
  lastActivity: string | null;
  /** Seconds between the first and last recorded step for this lesson. Null
   * when there isn't enough data (no activity, or only a single timestamp). */
  durationSeconds: number | null;
};

/** One student's progress on one lesson: mastery, step counts, and how long
 * they spent (first to last recorded step). Used by the student detail page
 * and the per-lesson report page, so both agree on the same numbers. */
export function computePersonLessonStat(lesson: Lesson, progress: ProgressItem[]): PersonLessonStat {
  const required = lesson.steps.filter((step) => step.type !== "sign_check");
  const doneIds = new Set(progress.filter((item) => item.status === "done").map((item) => item.step_id));
  const done = required.filter((step) => doneIds.has(step.id)).length;
  const times = progress
    .map((item) => item.updated_at)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .sort((a, b) => a - b);
  const firstActivity = times.length ? new Date(times[0]).toISOString() : null;
  const lastActivity = times.length ? new Date(times[times.length - 1]).toISOString() : null;
  const durationSeconds = times.length >= 2 ? Math.round((times[times.length - 1] - times[0]) / 1000) : null;
  return {
    mastery: computeMastery(lesson, progress),
    done,
    total: required.length,
    firstActivity,
    lastActivity,
    durationSeconds,
  };
}

/** Bilingual "12 min" / "1h 20m" style formatting for a duration in seconds. */
export function formatDuration(seconds: number | null, lang: Lang): string {
  if (seconds === null) return pick(lang, "—", "—");
  if (seconds < 60) return pick(lang, "أقل من دقيقة", "Under a minute");
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return pick(lang, `${minutes} د`, `${minutes}m`);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return pick(lang, `${hours} س${remainder ? ` ${remainder} د` : ""}`, `${hours}h${remainder ? ` ${remainder}m` : ""}`);
}
