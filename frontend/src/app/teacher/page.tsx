"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Check,
  FileEdit,
  LayoutDashboard,
  Rocket,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CreateLessonButton } from "@/components/CreateLessonButton";
import { Dual } from "@/components/Dual";
import { ForwardIcon, LoadingBlock } from "@/components/ui";
import { listLessons, listStudents } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { SUBJECTS, SubjectIcon } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson, TeacherStudent } from "@/lib/types";

export default function TeacherHome() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [students, setStudents] = useState<TeacherStudent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    listLessons()
      .then(setLessons)
      .catch(() => setError(true));
    listStudents()
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <div className="wrap page">
          <LoadingBlock rows={2} />
        </div>
      </AppShell>
    );
  }

  const firstName = user.name.trim().split(" ")[0];
  const total = lessons?.length ?? 0;
  const published = lessons?.filter((lesson) => lesson.status === "published").length ?? 0;
  const drafts = total - published;
  const studentCount = students?.length ?? 0;
  const presentSubjects = SUBJECTS.filter((subject) => lessons?.some((lesson) => lesson.subject === subject.id));

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <div className="student-top">
          <div className="greeting">
            <h1>
              <Dual ar="أهلاً أستاذي" en="Hello, teacher" />
            </h1>
            <Dual
              as="p"
              className="muted"
              ar="أنشئ دروسك، تابع طلابك، وراقب تقدمهم من مكان واحد."
              en="Create your lessons, follow your students, and watch their progress in one place."
            />
          </div>

          <section className="score-card" aria-label={pick(lang, "إحصائيات الدروس", "Lesson stats")}>
            <div className="score-level">
              <LayoutDashboard size={28} strokeWidth={1.5} className="icon" aria-hidden="true" />
              <div>
                <p className="small muted">
                  <Dual ar="إجمالي الدروس" en="Total lessons" />
                </p>
                <p className="score-big">{lessons === null && !error ? "…" : total}</p>
              </div>
            </div>
            <div className="score-stats">
              <p>
                <Check size={18} strokeWidth={2.5} className="icon" aria-hidden="true" />
                <Dual ar={`${published} منشور`} en={`${published} published`} />
              </p>
              <p>
                <FileEdit size={18} strokeWidth={2} className="icon" aria-hidden="true" />
                <Dual ar={`${drafts} مسودة`} en={`${drafts} drafts`} />
              </p>
            </div>
            <div className="score-next">
              <div className="progress-label">
                <span>
                  <Users size={16} strokeWidth={2} className="icon" aria-hidden="true" style={{ display: "inline", verticalAlign: "-3px" }} />{" "}
                  <Dual ar={`${studentCount} طالب`} en={`${studentCount} students`} />
                </span>
              </div>
            </div>
          </section>
        </div>

        {error ? (
          <p className="feedback error" role="status">
            <Dual ar="تعذّر تحميل الدروس. حدّث الصفحة." en="Could not load the lessons. Refresh the page." />
          </p>
        ) : null}

        <section className="continue-card" aria-labelledby="content-title">
          <div className="lesson-thumb subj-physics" aria-hidden="true">
            <Rocket size={56} strokeWidth={1.25} />
          </div>
          <div className="body">
            <div className="stack-sm">
              <p className="chip primary" style={{ justifySelf: "start" }}>
                <Dual ar="إدارة المحتوى" en="Content management" />
              </p>
              <h2 id="content-title">
                <Dual ar="أنشئ درساً جديداً وابدأ بإضافة الخطوات والألعاب." en="Create a new lesson and start adding steps and games." />
              </h2>
            </div>
            <div className="btn-row">
              <CreateLessonButton>
                <Dual ar="إنشاء درس" en="Create lesson" />
              </CreateLessonButton>
              <a className="btn secondary" href="/teacher/lessons">
                <BookOpen size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="إدارة المواد" en="Manage lessons" />
              </a>
              <a className="btn secondary" href="/teacher/students">
                <Users size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="عرض الطلاب" en="View students" />
              </a>
              <a className="btn secondary" href="/teacher/reports">
                <BarChart3 size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="التقارير" en="Reports" />
              </a>
            </div>
          </div>
        </section>

        {lessons && lessons.length > 0 ? (
          <div className="subject-filter" role="group" aria-label={pick(lang, "المواد", "Subjects")}>
            {presentSubjects.map((subject) => (
              <a key={subject.id} href={`/teacher/lessons?subject=${subject.id}`}>
                <SubjectIcon subject={subject.id} size={18} />
                <Dual ar={subject.ar} en={subject.en} />
                <span className="count mono">{lessons.filter((lesson) => lesson.subject === subject.id).length}</span>
              </a>
            ))}
          </div>
        ) : null}

        {lessons === null && !error ? <LoadingBlock rows={2} height={104} /> : null}

        {lessons?.length === 0 ? (
          <div className="empty">
            <BookOpen size={40} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="لا توجد دروس بعد." en="No lessons yet." />
            <Dual as="p" className="small" ar="أنشئ أول درس من البطاقة أعلاه." en="Create your first lesson from the card above." />
          </div>
        ) : null}

        {lessons && lessons.length > 0 ? (
          <section className="stack-sm" aria-labelledby="recent-title">
            <div className="page-head" style={{ marginBottom: "var(--s-4)" }}>
              <h2 id="recent-title">
                <Dual ar="أحدث الدروس" en="Recent lessons" />
              </h2>
              <a className="text-link" href="/teacher/lessons">
                <Dual ar="كل الدروس" en="All lessons" />
                <ForwardIcon size={16} />
              </a>
            </div>
            <ul className="lesson-list">
              {lessons.slice(0, 4).map((lesson) => (
                <li className="lesson-item" key={lesson.id}>
                  <div className="meta">
                    <h3>
                      <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                    </h3>
                    <div className="chips">
                      {lesson.status === "published" ? (
                        <span className="chip ok">
                          <Check size={16} strokeWidth={2.5} className="icon" aria-hidden="true" />
                          <Dual ar="منشور" en="Published" />
                        </span>
                      ) : (
                        <span className="chip draft">
                          <FileEdit size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                          <Dual ar="مسودة" en="Draft" />
                        </span>
                      )}
                      <span className="chip">
                        <Dual ar={`${lesson.steps.length} خطوات`} en={`${lesson.steps.length} steps`} />
                      </span>
                    </div>
                  </div>
                  <a className="btn secondary" href={`/teacher/lessons/${lesson.id}`}>
                    <Dual ar="تعديل الدرس" en="Edit lesson" />
                    <ForwardIcon />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
