"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarChart3, Check, ChevronDown, Clock, FileEdit, TriangleAlert, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { BackIcon, LoadingBlock, ProgressBar } from "@/components/ui";
import { getLesson, lessonProgress } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { computePersonLessonStat, formatDuration, type PersonLessonStat } from "@/lib/reports";
import { SubjectIcon, subjectMeta } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson, ProgressItem } from "@/lib/types";

function relativeTime(iso: string | null, lang: "ar" | "en"): string {
  if (!iso) return pick(lang, "لا نشاط بعد", "No activity yet");
  const then = new Date(iso).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (diffMinutes < 1) return pick(lang, "الآن", "Just now");
  if (diffMinutes < 60) return pick(lang, `منذ ${diffMinutes} دقيقة`, `${diffMinutes} min ago`);
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return pick(lang, `منذ ${diffHours} ساعة`, `${diffHours} h ago`);
  const diffDays = Math.round(diffHours / 24);
  return pick(lang, `منذ ${diffDays} يوم`, `${diffDays} d ago`);
}

const STATUS_LABEL: Record<string, { ar: string; en: string }> = {
  done: { ar: "منتهية", en: "Done" },
  attempted: { ar: "قيد المحاولة", en: "Attempted" },
};

type StudentRow = { studentId: string; studentName: string; stat: PersonLessonStat; steps: ProgressItem[] };

export default function LessonReportPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    Promise.all([getLesson(lessonId), lessonProgress(lessonId)])
      .then(([loadedLesson, progress]) => {
        setLesson(loadedLesson);
        const byStudent = new Map<string, ProgressItem[]>();
        for (const item of progress) {
          const list = byStudent.get(item.student_id) ?? [];
          list.push(item);
          byStudent.set(item.student_id, list);
        }
        const built = Array.from(byStudent.entries()).map(([studentId, steps]) => ({
          studentId,
          studentName: steps[0]?.student_name ?? studentId,
          stat: computePersonLessonStat(loadedLesson, steps),
          steps,
        }));
        built.sort((a, b) => b.stat.mastery - a.stat.mastery);
        setRows(built);
      })
      .catch(() => setError(true));
  }, [ready, user, router, lessonId]);

  const stepTitleById = useMemo(() => {
    const map = new Map<string, string>();
    lesson?.steps.forEach((step) => map.set(step.id, step.title_ar));
    return map;
  }, [lesson]);

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <div className="wrap page">
          <LoadingBlock rows={2} />
        </div>
      </AppShell>
    );
  }

  const loading = (lesson === null || rows === null) && !error;
  const attempted = rows?.length ?? 0;
  const completedCount = rows?.filter((row) => row.stat.mastery >= 100).length ?? 0;
  const avgMastery = attempted > 0 ? Math.round((rows ?? []).reduce((sum, row) => sum + row.stat.mastery, 0) / attempted) : 0;
  const durations = (rows ?? []).map((row) => row.stat.durationSeconds).filter((value): value is number => value !== null);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null;

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <p>
          <a className="back-link" href="/teacher/reports">
            <BackIcon />
            <Dual ar="كل التقارير" en="All reports" />
          </a>
        </p>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل التقرير. حدّث الصفحة." en="Could not load the report. Refresh the page." />
          </p>
        ) : null}

        {loading ? <LoadingBlock rows={3} height={96} /> : null}

        {!loading && !error && lesson ? (
          <div className="stack">
            <div className="page-head">
              <div className="titles">
                <h1>
                  <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                </h1>
                <div className="chips">
                  <span className="chip">
                    <SubjectIcon subject={lesson.subject} size={14} />
                    <Dual ar={subjectMeta(lesson.subject).ar} en={subjectMeta(lesson.subject).en} />
                  </span>
                  <span className="chip">
                    <Dual ar={`${lesson.steps.length} خطوات`} en={`${lesson.steps.length} steps`} />
                  </span>
                </div>
              </div>
              <a className="btn secondary" href={`/teacher/lessons/${lesson.id}`}>
                <FileEdit size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="تعديل الدرس" en="Edit lesson" />
              </a>
            </div>

            <div className="stat-grid">
              <div className="stat-tile">
                <span className="label">
                  <Users size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="حاول هذا الدرس" en="Attempted" />
                </span>
                <span className="value mono">{attempted}</span>
              </div>
              <div className="stat-tile">
                <span className="label">
                  <Check size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="أكملوه" en="Completed" />
                </span>
                <span className="value mono">{completedCount}</span>
              </div>
              <div className="stat-tile">
                <span className="label">
                  <BarChart3 size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="متوسط التمكّن" en="Average mastery" />
                </span>
                <span className="value mono">{avgMastery}%</span>
              </div>
              <div className="stat-tile">
                <span className="label">
                  <Clock size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="متوسط الوقت" en="Average time" />
                </span>
                <span className="value mono">{formatDuration(avgDuration, lang)}</span>
              </div>
            </div>

            <section className="stack-sm">
              <h2>
                <Dual ar="نتائج الطلاب" en="Student results" />
              </h2>
              {rows && rows.length === 0 ? (
                <div className="empty">
                  <Users size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
                  <Dual as="p" ar="لم يبدأ أي طالب هذا الدرس بعد." en="No student has started this lesson yet." />
                </div>
              ) : (
                <ul className="lesson-list">
                  {rows?.map((row) => {
                    const isOpen = expanded === row.studentId;
                    return (
                      <li key={row.studentId}>
                        <button
                          type="button"
                          className="lesson-item rich report-row"
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : row.studentId)}
                        >
                          <span className="avatar" aria-hidden="true">
                            {row.studentName.trim().charAt(0)}
                          </span>
                          <div className="meta">
                            <h3>{row.studentName}</h3>
                            <div className="chips">
                              <span className="chip">
                                <Dual ar={`${row.stat.done} من ${row.stat.total} خطوات`} en={`${row.stat.done} of ${row.stat.total} steps`} />
                              </span>
                              <span className="chip">
                                <Clock size={14} strokeWidth={2} className="icon" aria-hidden="true" />
                                <Dual
                                  ar={`استغرق ${formatDuration(row.stat.durationSeconds, "ar")}`}
                                  en={`Took ${formatDuration(row.stat.durationSeconds, "en")}`}
                                />
                              </span>
                              <span className="small muted">{relativeTime(row.stat.lastActivity, lang)}</span>
                            </div>
                            <ProgressBar value={row.stat.done} total={row.stat.total} compact />
                          </div>
                          <span className="report-row-end">
                            <span className={`chip mono ${row.stat.mastery >= 100 ? "ok" : ""}`}>{row.stat.mastery}%</span>
                            <ChevronDown size={18} strokeWidth={2} className={`icon chev${isOpen ? " open" : ""}`} aria-hidden="true" />
                          </span>
                        </button>

                        {isOpen ? (
                          <div className="panel tinted step-timeline">
                            <a className="text-link" href={`/teacher/students/${row.studentId}`}>
                              <Dual ar="عرض ملف الطالب" en="View student profile" />
                            </a>
                            <ol>
                              {row.steps
                                .slice()
                                .sort((a, b) => (a.updated_at ?? "").localeCompare(b.updated_at ?? ""))
                                .map((item) => (
                                  <li key={item.step_id} className="step-timeline-row">
                                    <span className={`chip ${item.status === "done" ? "ok" : ""}`}>
                                      <Dual
                                        ar={STATUS_LABEL[item.status]?.ar ?? item.status}
                                        en={STATUS_LABEL[item.status]?.en ?? item.status}
                                      />
                                    </span>
                                    <span className="step-timeline-title">
                                      {stepTitleById.get(item.step_id) ?? item.step_id}
                                    </span>
                                    <span className="small muted">
                                      {item.updated_at ? new Date(item.updated_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US") : "—"}
                                    </span>
                                  </li>
                                ))}
                            </ol>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
