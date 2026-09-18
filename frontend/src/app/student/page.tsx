"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Star, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { GAME_TYPES } from "@/components/games/GameStep";
import { ProgressBadge } from "@/components/ProgressBadge";
import { ForwardIcon, LoadingBlock, ProgressBar } from "@/components/ui";
import { LEVEL_SIZE, lessonStats, scoreFor, type LessonStats } from "@/lib/gamification";
import { lessonProgress, listLessons, resetProgress } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { SUBJECTS, subjectMeta } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson, ProgressItem, Subject } from "@/lib/types";

function gameCount(lesson: Lesson) {
  return lesson.steps.filter((step) => GAME_TYPES.includes(step.type) || step.type === "challenge").length;
}

export default function StudentHome() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [stats, setStats] = useState<Record<string, LessonStats>>({});
  const [allProgress, setAllProgress] = useState<ProgressItem[]>([]);
  const [filter, setFilter] = useState<Subject | "all">("all");
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [resetState, setResetState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "student") {
      router.replace("/login?role=student");
      return;
    }
    listLessons()
      .then(async (loaded) => {
        setLessons(loaded);
        const entries = await Promise.all(
          loaded.map(async (lesson) => {
            try {
              return [lesson.id, await lessonProgress(lesson.id)] as const;
            } catch {
              return [lesson.id, [] as ProgressItem[]] as const;
            }
          }),
        );
        setAllProgress(entries.flatMap(([, items]) => items));
        setStats(
          Object.fromEntries(
            entries.map(([lessonId, items]) => {
              const lesson = loaded.find((candidate) => candidate.id === lessonId) as Lesson;
              return [lessonId, lessonStats(lesson, items)];
            }),
          ),
        );
      })
      .catch(() => setError(true));
  }, [ready, user, router, reload]);

  async function onReset() {
    setResetState("busy");
    try {
      await resetProgress();
      setResetState("done");
      dialogRef.current?.close();
      setReload((value) => value + 1);
    } catch {
      setResetState("error");
    }
  }

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <div className="wrap page">
          <LoadingBlock rows={2} />
        </div>
      </AppShell>
    );
  }

  const score = scoreFor(allProgress);
  const next = lessons?.find((lesson) => (stats[lesson.id]?.state ?? "new") === "learning")
    ?? lessons?.find((lesson) => (stats[lesson.id]?.state ?? "new") === "new")
    ?? null;
  const nextStats = next ? stats[next.id] : undefined;
  const firstName = user.name.trim().split(" ")[0];
  const presentSubjects = SUBJECTS.filter((subject) => lessons?.some((lesson) => lesson.subject === subject.id));
  const shownSubjects = filter === "all" ? presentSubjects : presentSubjects.filter((subject) => subject.id === filter);
  const completed = Object.values(stats).filter((stat) => stat.state === "complete").length;

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <header className="page-intro student-intro">
          <h1>
            <Dual ar={`أهلاً ${firstName}`} en={`Hello ${firstName}`} />
          </h1>
          <p className="score-line" aria-label={pick(lang, "نقاطي", "My points")}>
            <Dual as="span" ar={`المستوى ${score.level}`} en={`Level ${score.level}`} />
            <span aria-hidden="true">·</span>
            <span className="score-stars">
              <Star size={15} strokeWidth={2} className="icon star on" aria-hidden="true" />
              <Dual ar={`${score.stars} نجمة`} en={`${score.stars} stars`} />
            </span>
            <span aria-hidden="true">·</span>
            <Dual ar={`${completed} درس مكتمل`} en={`${completed} lessons done`} />
            <span className="score-next">
              <span className="progress-track" aria-hidden="true">
                <span className="progress-fill" style={{ width: `${((LEVEL_SIZE - score.toNext) / LEVEL_SIZE) * 100}%` }} />
              </span>
              <Dual ar={`${score.toNext} نقطة للمستوى التالي`} en={`${score.toNext} points to the next level`} />
            </span>
          </p>
        </header>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={20} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل دروسك. حدّث الصفحة." en="Could not load your lessons. Refresh the page." />
          </p>
        ) : null}

        {resetState === "done" ? (
          <p className="feedback info" role="status">
            <RotateCcw size={20} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="بدأت من جديد. كل الدروس جاهزة." en="You are starting fresh. Every lesson is ready." />
          </p>
        ) : null}

        {next && nextStats ? (
          <section className="continue" aria-labelledby="continue-title">
            <Dual
              as="p"
              className="continue-kicker"
              ar={nextStats.state === "new" ? `درس جديد · ${subjectMeta(next.subject).ar}` : `أكمل من حيث توقفت · ${subjectMeta(next.subject).ar}`}
              en={nextStats.state === "new" ? `New lesson · ${subjectMeta(next.subject).en}` : `Pick up where you left off · ${subjectMeta(next.subject).en}`}
            />
            <h2 id="continue-title">
              <Dual ar={next.title_ar} en={next.title_en ?? next.title_ar} />
            </h2>
            <ProgressBar value={nextStats.done} total={nextStats.total} />
            <a className="btn" href={`/student/lessons/${next.id}`}>
              <Dual
                ar={nextStats.state === "new" ? "ابدأ الدرس" : "أكمل الدرس"}
                en={nextStats.state === "new" ? "Start the lesson" : "Continue the lesson"}
              />
              <ForwardIcon size={18} />
            </a>
          </section>
        ) : null}

        {lessons && lessons.length > 0 ? (
          <nav className="subject-tabs" aria-label={pick(lang, "المواد", "Subjects")}>
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              <Dual ar="كل المواد" en="All subjects" />
              <span className="count">{lessons.length}</span>
            </button>
            {presentSubjects.map((subject) => (
              <button key={subject.id} type="button" aria-pressed={filter === subject.id} onClick={() => setFilter(subject.id)}>
                <Dual ar={subject.ar} en={subject.en} />
                <span className="count">{lessons.filter((lesson) => lesson.subject === subject.id).length}</span>
              </button>
            ))}
          </nav>
        ) : null}

        {lessons === null && !error ? <LoadingBlock rows={2} height={120} /> : null}

        {lessons?.length === 0 ? (
          <div className="empty">
            <Dual as="p" ar="لا يوجد درس معيّن لك بعد." en="No lesson has been assigned to you yet." />
            <Dual as="p" className="small" ar="اطلب من معلمك أن يعيّن درساً." en="Ask your teacher to assign one." />
          </div>
        ) : null}

        {shownSubjects.map((subject) => {
          const list = (lessons ?? []).filter((lesson) => lesson.subject === subject.id);
          const subjectDone = list.filter((lesson) => stats[lesson.id]?.state === "complete").length;
          return (
            <section key={subject.id} className={`subject-section subj-${subject.id}`} aria-labelledby={`subj-${subject.id}`}>
              <header className="subject-head">
                <h2 id={`subj-${subject.id}`}>
                  <Dual ar={subject.ar} en={subject.en} />
                </h2>
                <Dual as="span" className="muted small" ar={`${subjectDone} من ${list.length} مكتمل`} en={`${subjectDone} of ${list.length} done`} />
              </header>

              <ul className="course-grid">
                {list.map((lesson) => {
                  const stat = stats[lesson.id];
                  const games = gameCount(lesson);
                  return (
                    <li key={lesson.id} className="course-card">
                      <h3>
                        <a href={`/student/lessons/${lesson.id}`}>
                          <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                        </a>
                      </h3>
                      {lesson.summary_ar ? (
                        <Dual as="p" className="course-summary" ar={lesson.summary_ar} en={lesson.summary_en ?? lesson.summary_ar} />
                      ) : null}
                      <p className="course-meta">
                        <Dual ar={`${lesson.steps.length} خطوات`} en={`${lesson.steps.length} steps`} />
                        <span aria-hidden="true">·</span>
                        <Dual ar={`${games} ألعاب`} en={`${games} games`} />
                        {lesson.minutes ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <Dual ar={`${lesson.minutes} دقيقة`} en={`${lesson.minutes} min`} />
                          </>
                        ) : null}
                        {stat?.badge ? <ProgressBadge badge={stat.badge} /> : null}
                      </p>
                      {stat && stat.state !== "new" ? <ProgressBar value={stat.done} total={stat.total} compact /> : null}
                      <a className="text-link" href={`/student/lessons/${lesson.id}`} tabIndex={-1} aria-hidden="true">
                        <Dual
                          ar={stat?.state === "complete" ? "راجع الدرس" : stat?.state === "learning" ? "أكمل" : "ابدأ"}
                          en={stat?.state === "complete" ? "Review" : stat?.state === "learning" ? "Continue" : "Start"}
                        />
                        {stat?.state === "complete" ? (
                          <Check size={16} strokeWidth={2.5} className="icon done-tick" aria-hidden="true" />
                        ) : (
                          <ForwardIcon size={16} />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {lessons && lessons.length > 0 ? (
          <div className="reset-zone">
            <button
              type="button"
              className="reset-link"
              onClick={() => {
                setResetState("idle");
                dialogRef.current?.showModal();
              }}
            >
              <Dual ar="إعادة ضبط التقدّم" en="Reset progress" />
            </button>
          </div>
        ) : null}

        <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby="reset-title">
          <h2 id="reset-title">
            <Dual ar="إعادة ضبط كل التقدّم؟" en="Reset all progress?" />
          </h2>
          <Dual
            as="p"
            className="muted"
            ar="ستُمسح كل الخطوات المكتملة والنجوم والنقاط في كل الدروس. لا يمكن التراجع."
            en="Every finished step, star, and point in every lesson will be erased. This cannot be undone."
          />
          {resetState === "error" ? (
            <p className="feedback error" role="status">
              <TriangleAlert size={20} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual ar="تعذّرت إعادة الضبط. حاول مرة أخرى." en="Could not reset. Try again." />
            </p>
          ) : null}
          <div className="btn-row">
            <button type="button" className="btn danger" onClick={onReset} disabled={resetState === "busy"}>
              <Dual ar={resetState === "busy" ? "جارٍ المسح…" : "امسح تقدّمي"} en={resetState === "busy" ? "Erasing…" : "Erase my progress"} />
            </button>
            <button type="button" className="btn secondary" onClick={() => dialogRef.current?.close()}>
              <Dual ar="إلغاء" en="Cancel" />
            </button>
          </div>
        </dialog>
      </div>
    </AppShell>
  );
}
