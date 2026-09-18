import { lessonProgress } from "./api";
import { computeMastery } from "./gamification";
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
