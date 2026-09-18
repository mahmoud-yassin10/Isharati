"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, Check, Clock, TrendingDown, TriangleAlert, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { LoadingBlock } from "@/components/ui";
import { listLessons, listStudents } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { loadLessonCompletion, type LessonCompletion } from "@/lib/reports";
import { SubjectIcon } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson, TeacherStudent } from "@/lib/types";

export default function TeacherReportsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [students, setStudents] = useState<TeacherStudent[] | null>(null);
  const [completion, setCompletion] = useState<Record<string, LessonCompletion>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    Promise.all([listLessons(), listStudents()])
      .then(async ([loadedLessons, loadedStudents]) => {
        setLessons(loadedLessons);
        setStudents(loadedStudents);
        setCompletion(await loadLessonCompletion(loadedLessons));
      })
      .catch(() => setError(true));
  }, [ready, user, router]);

  const publishedLessons = useMemo(() => lessons?.filter((lesson) => lesson.status === "published") ?? [], [lessons]);

  const overallCompletion = useMemo(() => {
    const withStudents = publishedLessons.filter((lesson) => (completion[lesson.id]?.studentCount ?? 0) > 0);
    if (withStudents.length === 0) return 0;
    const sum = withStudents.reduce((total, lesson) => total + (completion[lesson.id]?.avgMastery ?? 0), 0);
    return Math.round(sum / withStudents.length);
  }, [publishedLessons, completion]);

  const strugglingLessons = useMemo(
    () =>
      [...publishedLessons]
        .filter((lesson) => (completion[lesson.id]?.studentCount ?? 0) > 0)
        .sort((a, b) => (completion[a.id]?.avgMastery ?? 0) - (completion[b.id]?.avgMastery ?? 0))
        .slice(0, 5),
    [publishedLessons, completion],
  );

  const recentStudents = useMemo(
    () =>
      [...(students ?? [])]
        .filter((student) => student.last_activity)
        .sort((a, b) => new Date(b.last_activity as string).getTime() - new Date(a.last_activity as string).getTime())
        .slice(0, 6),
    [students],
  );

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <div className="wrap page">
          <LoadingBlock rows={2} />
        </div>
      </AppShell>
    );
  }

  const loading = (lessons === null || students === null) && !error;

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <div className="page-head">
          <div className="titles">
            <h1>
              <Dual ar="التقارير" en="Reports" />
            </h1>
            <Dual
              as="p"
              className="muted"
              ar="نظرة سريعة على تقدّم الطلاب في دروسك، والدروس التي تحتاج مراجعة."
              en="A quick view of student progress across your lessons, and which lessons need a second look."
            />
          </div>
        </div>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل التقارير. حدّث الصفحة." en="Could not load the reports. Refresh the page." />
          </p>
        ) : null}

        {loading ? <LoadingBlock rows={3} height={96} /> : null}

        {!loading && !error ? (
          <>
            <div className="stat-grid">
              <div className="stat-tile">
                <span className="label">
                  <Users size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="إجمالي الطلاب" en="Total students" />
                </span>
                <span className="value mono">{students?.length ?? 0}</span>
              </div>
              <div className="stat-tile">
                <span className="label">
                  <BookOpen size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="دروس منشورة" en="Published lessons" />
                </span>
                <span className="value mono">{publishedLessons.length}</span>
              </div>
              <div className="stat-tile">
                <span className="label">
                  <Check size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="متوسط الإكمال" en="Average completion" />
                </span>
                <span className="value mono">{overallCompletion}%</span>
              </div>
              <div className="stat-tile">
                <span className="label">
                  <BarChart3 size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                  <Dual ar="دروس تُتابَع" en="Lessons with activity" />
                </span>
                <span className="value mono">
                  {Object.values(completion).filter((item) => item.studentCount > 0).length}
                </span>
              </div>
            </div>

            <section className="stack-sm">
              <h2>
                <Dual ar="إكمال الدروس" en="Lesson completion" />
              </h2>
              {publishedLessons.length === 0 ? (
                <div className="empty">
                  <BookOpen size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
                  <Dual as="p" ar="لا توجد دروس منشورة بعد." en="No published lessons yet." />
                </div>
              ) : (
                <ul className="lesson-list">
                  {publishedLessons.map((lesson) => {
                    const stat = completion[lesson.id];
                    return (
                      <li className="lesson-item rich" key={lesson.id}>
                        <span className={`subject-icon subj-${lesson.subject}`} aria-hidden="true">
                          <SubjectIcon subject={lesson.subject} size={22} />
                        </span>
                        <div className="meta">
                          <h3>
                            <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                          </h3>
                          <div className="chips">
                            <span className="chip">
                              <Dual
                                ar={stat && stat.studentCount > 0 ? `${stat.studentCount} طالب` : "لا نشاط بعد"}
                                en={stat && stat.studentCount > 0 ? `${stat.studentCount} students` : "No activity yet"}
                              />
                            </span>
                          </div>
                          <div className="progress compact">
                            <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stat?.avgMastery ?? 0}>
                              <div className="progress-fill" style={{ width: `${stat?.avgMastery ?? 0}%` }} />
                            </div>
                          </div>
                        </div>
                        <span className="chip mono">{stat?.avgMastery ?? 0}%</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="stack-sm">
              <h2>
                <TrendingDown size={20} strokeWidth={1.75} className="icon" aria-hidden="true" style={{ display: "inline", verticalAlign: "-4px" }} />{" "}
                <Dual ar="دروس تحتاج متابعة" en="Lessons that need attention" />
              </h2>
              {strugglingLessons.length === 0 ? (
                <div className="empty">
                  <Dual as="p" ar="لا توجد بيانات كافية بعد." en="Not enough data yet." />
                </div>
              ) : (
                <div className="panel">
                  {strugglingLessons.map((lesson) => (
                    <div className="student-row" key={lesson.id}>
                      <span className="who">
                        <SubjectIcon subject={lesson.subject} size={18} />
                        <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                      </span>
                      <span className="chip miss">{completion[lesson.id]?.avgMastery ?? 0}%</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="stack-sm">
              <h2>
                <Dual ar="نشاط الطلاب الأخير" en="Recent student activity" />
              </h2>
              {recentStudents.length === 0 ? (
                <div className="empty">
                  <Clock size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
                  <Dual as="p" ar="لا يوجد نشاط بعد." en="No activity yet." />
                </div>
              ) : (
                <div className="panel">
                  {recentStudents.map((student) => (
                    <div className="student-row" key={student.id}>
                      <span className="who">
                        <span className="avatar" aria-hidden="true">
                          {student.name.trim().charAt(0)}
                        </span>
                        {student.name}
                      </span>
                      <span className="chip">
                        <Dual
                          ar={`${student.completed_count} من ${student.assigned_count} مكتمل`}
                          en={`${student.completed_count} of ${student.assigned_count} completed`}
                        />
                      </span>
                      <span className="small muted">
                        {student.last_activity ? new Date(student.last_activity).toLocaleString(lang === "ar" ? "ar-EG" : "en-US") : pick(lang, "—", "—")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
