"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, FileEdit, Gamepad2, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { GAME_TYPES } from "@/components/games/GameStep";
import { ForwardIcon, LoadingBlock } from "@/components/ui";
import { listLessons } from "@/lib/api";
import { SUBJECTS, SubjectIcon } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson } from "@/lib/types";

export default function TeacherHome() {
  const router = useRouter();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
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

  const published = lessons?.filter((lesson) => lesson.status === "published").length ?? 0;

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <div className="page-head">
          <div className="titles">
            <h1>
              <Dual ar="الدروس" en="Lessons" />
            </h1>
            <Dual
              as="p"
              className="muted"
              ar="عاين الدرس والمختبر، ثم انشره وعيّنه لطلابك."
              en="Preview the lesson and the lab, then publish it and assign it to your students."
            />
          </div>
          {lessons ? (
            <div className="teacher-summary">
              <span className="chip">
                <BookOpen size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                <Dual ar={`${lessons.length} درس`} en={`${lessons.length} lessons`} />
              </span>
              <span className="chip ok">
                <Check size={16} strokeWidth={2.5} className="icon" aria-hidden="true" />
                <Dual ar={`${published} منشور`} en={`${published} published`} />
              </span>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل الدروس. حدّث الصفحة." en="Could not load the lessons. Refresh the page." />
          </p>
        ) : null}

        {lessons === null && !error ? <LoadingBlock rows={2} height={104} /> : null}

        {lessons?.length === 0 ? (
          <div className="empty">
            <BookOpen size={40} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="لا توجد دروس بعد." en="No lessons yet." />
          </div>
        ) : null}

        {SUBJECTS.filter((subject) => lessons?.some((lesson) => lesson.subject === subject.id)).map((subject) => (
          <section key={subject.id} className="subject-section" aria-labelledby={`t-subj-${subject.id}`}>
            <header className="subject-head">
              <span className={`subject-icon subj-${subject.id}`} aria-hidden="true">
                <SubjectIcon subject={subject.id} size={24} />
              </span>
              <h2 id={`t-subj-${subject.id}`}>
                <Dual ar={subject.ar} en={subject.en} />
              </h2>
            </header>
            <ul className="lesson-list">
              {lessons
                ?.filter((lesson) => lesson.subject === subject.id)
                .map((lesson) => (
                  <li className="lesson-item" key={lesson.id}>
                    <div className={`lesson-thumb subj-${lesson.subject}`} aria-hidden="true">
                      <SubjectIcon subject={lesson.subject} size={40} />
                    </div>
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
                        <span className="chip">
                          <Gamepad2 size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                          <Dual
                            ar={`${lesson.steps.filter((step) => GAME_TYPES.includes(step.type)).length} ألعاب`}
                            en={`${lesson.steps.filter((step) => GAME_TYPES.includes(step.type)).length} games`}
                          />
                        </span>
                      </div>
                    </div>
                    <a className="btn secondary" href={`/teacher/lessons/${lesson.id}`}>
                      <Dual ar="افتح الدرس" en="Open lesson" />
                      <ForwardIcon />
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
