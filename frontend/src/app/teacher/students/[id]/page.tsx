"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarChart3, Check, Clock, FileEdit, Mail, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { BackIcon, LoadingBlock, ProgressBar } from "@/components/ui";
import { getStudent, lessonProgress, listLessons } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { computePersonLessonStat, formatDuration, type PersonLessonStat } from "@/lib/reports";
import { SubjectIcon, subjectMeta } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson, TeacherStudentDetail } from "@/lib/types";

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

type LessonRow = { lesson: Lesson; stat: PersonLessonStat };

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [student, setStudent] = useState<TeacherStudentDetail | null>(null);
  const [rows, setRows] = useState<LessonRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    Promise.all([getStudent(id), listLessons()])
      .then(async ([studentDetail, lessons]) => {
        setStudent(studentDetail);
        const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
        const assigned = studentDetail.lesson_ids
          .map((lessonId) => byId.get(lessonId))
          .filter((lesson): lesson is Lesson => Boolean(lesson));
        const withStats = await Promise.all(
          assigned.map(async (lesson) => {
            const progress = await lessonProgress(lesson.id).catch(() => []);
            const mine = progress.filter((item) => item.student_id === id);
            return { lesson, stat: computePersonLessonStat(lesson, mine) };
          }),
        );
        withStats.sort((a, b) => (b.stat.lastActivity ?? "").localeCompare(a.stat.lastActivity ?? ""));
        setRows(withStats);
      })
      .catch(() => setError(true));
  }, [ready, user, router, id]);

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <div className="wrap page">
          <LoadingBlock rows={2} />
        </div>
      </AppShell>
    );
  }

  const loading = (student === null || rows === null) && !error;
  const completedCount = rows?.filter((row) => row.stat.mastery >= 100).length ?? 0;
  const avgMastery =
    rows && rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row.stat.mastery, 0) / rows.length) : 0;
  const lastActivity = rows?.reduce<string | null>(
    (latest, row) => (row.stat.lastActivity && (!latest || row.stat.lastActivity > latest) ? row.stat.lastActivity : latest),
    null,
  );

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <p>
          <a className="back-link" href="/teacher/students">
            <BackIcon />
            <Dual ar="كل الطلاب" en="All students" />
          </a>
        </p>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل بيانات الطالب. حدّث الصفحة." en="Could not load the student. Refresh the page." />
          </p>
        ) : null}

        {loading ? <LoadingBlock rows={3} height={96} /> : null}

        {!loading && !error && student ? (
          <div className="stack">
            <div className="page-head">
              <div className="titles">
                <h1>
                  <span className="avatar" aria-hidden="true" style={{ display: "inline-grid", verticalAlign: "-10px", marginInlineEnd: "var(--s-3)" }}>
                    {student.name.trim().charAt(0)}
                  </span>
                  {student.name}
                </h1>
                <div className="chips">
                  <span className="chip">
                    <Mail size={14} strokeWidth={2} className="icon" aria-hidden="true" />
                    {student.email}
                  </span>
                  <span className="chip">
                    <Clock size={14} strokeWidth={2} className="icon" aria-hidden="true" />
                    {relativeTime(lastActivity ?? null, lang)}
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-grid">
              <div className="stat-tile">
                <span className="label">
                  <Dual ar="دروس معيّنة" en="Assigned lessons" />
                </span>
                <span className="value mono">{rows?.length ?? 0}</span>
              </div>
              <div className="stat-tile">
                <span className="label">
                  <Check size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="دروس مكتملة" en="Completed lessons" />
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
            </div>

            <section className="stack-sm">
              <h2>
                <Dual ar="الدروس المعيّنة" en="Assigned lessons" />
              </h2>
              {rows && rows.length === 0 ? (
                <div className="empty">
                  <FileEdit size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
                  <Dual as="p" ar="لا توجد دروس معيّنة لهذا الطالب بعد." en="No lessons assigned to this student yet." />
                </div>
              ) : (
                <ul className="lesson-list">
                  {rows?.map(({ lesson, stat }) => (
                    <li key={lesson.id}>
                      <a className="lesson-item rich" href={`/teacher/reports/${lesson.id}`}>
                        <span className={`subject-icon subj-${lesson.subject}`} aria-hidden="true">
                          <SubjectIcon subject={lesson.subject} size={22} />
                        </span>
                        <div className="meta">
                          <h3>
                            <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                          </h3>
                          <div className="chips">
                            <span className="chip">
                              <Dual ar={subjectMeta(lesson.subject).ar} en={subjectMeta(lesson.subject).en} />
                            </span>
                            <span className="chip">
                              <Dual ar={`${stat.done} من ${stat.total} خطوات`} en={`${stat.done} of ${stat.total} steps`} />
                            </span>
                            <span className="chip">
                              <Clock size={14} strokeWidth={2} className="icon" aria-hidden="true" />
                              <Dual
                                ar={`استغرق ${formatDuration(stat.durationSeconds, "ar")}`}
                                en={`Took ${formatDuration(stat.durationSeconds, "en")}`}
                              />
                            </span>
                            <span className="small muted">{relativeTime(stat.lastActivity, lang)}</span>
                          </div>
                          <ProgressBar value={stat.done} total={stat.total} compact />
                        </div>
                        <span className={`chip mono ${stat.mastery >= 100 ? "ok" : ""}`}>{stat.mastery}%</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
