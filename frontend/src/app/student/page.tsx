"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Clock, Gamepad2, PlayCircle, RotateCcw, Star, Trophy, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { GAME_TYPES } from "@/components/games/GameStep";
import { ProgressBadge } from "@/components/ProgressBadge";
import { ForwardIcon, LoadingBlock, ProgressBar } from "@/components/ui";
import { LEVEL_SIZE, lessonStats, scoreFor, type LessonStats } from "@/lib/gamification";
import { lessonProgress, listLessons, resetProgress } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { SUBJECTS, SubjectIcon, subjectMeta } from "@/lib/subjects";
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
        <div className="student-top">
          <div className="greeting">
            <h1>
              <Dual ar={`أهلاً ${firstName}`} en={`Hello ${firstName}`} />
            </h1>
            <Dual
              as="p"
              className="muted"
              ar="اختر مادة، العب، وتعلّم. الإشارة تعمل وحدها في كل خطوة."
              en="Pick a subject, play, and learn. The sign plays by itself on every step."
            />
          </div>

          <section className="score-card" aria-label={pick(lang, "نقاطي", "My points")}>
            <div className="score-level">
              <Trophy size={28} strokeWidth={1.5} className="icon" aria-hidden="true" />
              <div>
                <p className="small muted">
                  <Dual ar="المستوى" en="Level" />
                </p>
                <p className="score-big">{score.level}</p>
              </div>
            </div>
            <div className="score-stats">
              <p>
                <Star size={18} strokeWidth={2} className="icon star on" aria-hidden="true" />
                <Dual ar={`${score.stars} نجمة`} en={`${score.stars} stars`} />
              </p>
              <p>
                <Check size={18} strokeWidth={2.5} className="icon" aria-hidden="true" />
                <Dual ar={`${completed} درس مكتمل`} en={`${completed} lessons done`} />
              </p>
            </div>
            <div className="score-next">
              <div className="progress-label">
                <Dual ar={`${score.points} نقطة`} en={`${score.points} points`} />
                <Dual ar={`${score.toNext} للمستوى التالي`} en={`${score.toNext} to next level`} />
              </div>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${((LEVEL_SIZE - score.toNext) / LEVEL_SIZE) * 100}%` }} />
              </div>
            </div>
          </section>
        </div>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل دروسك. حدّث الصفحة." en="Could not load your lessons. Refresh the page." />
          </p>
        ) : null}

        {resetState === "done" ? (
          <p className="feedback info" role="status">
            <RotateCcw size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="بدأت من جديد. كل الدروس جاهزة." en="You are starting fresh. Every lesson is ready." />
          </p>
        ) : null}

        {next && nextStats ? (
          <section className="continue-card" aria-labelledby="continue-title">
            <div className={`lesson-thumb subj-${next.subject}`} aria-hidden="true">
              <PlayCircle size={56} strokeWidth={1.25} />
            </div>
            <div className="body">
              <div className="stack-sm">
                <p className="chip primary" style={{ justifySelf: "start" }}>
                  <Dual
                    ar={nextStats.state === "new" ? `درس جديد · ${subjectMeta(next.subject).ar}` : `أكمل · ${subjectMeta(next.subject).ar}`}
                    en={nextStats.state === "new" ? `New lesson · ${subjectMeta(next.subject).en}` : `Continue · ${subjectMeta(next.subject).en}`}
                  />
                </p>
                <h2 id="continue-title">
                  <Dual ar={next.title_ar} en={next.title_en ?? next.title_ar} />
                </h2>
              </div>
              <ProgressBar value={nextStats.done} total={nextStats.total} />
              <p>
                <a className="btn large" href={`/student/lessons/${next.id}`}>
                  <Dual
                    ar={nextStats.state === "new" ? "ابدأ الدرس" : "أكمل الدرس"}
                    en={nextStats.state === "new" ? "Start the lesson" : "Continue the lesson"}
                  />
                  <ForwardIcon size={22} />
                </a>
              </p>
            </div>
          </section>
        ) : null}

        {lessons && lessons.length > 0 ? (
          <div className="subject-filter" role="group" aria-label={pick(lang, "المواد", "Subjects")}>
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              <BookOpen size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="كل المواد" en="All subjects" />
              <span className="count mono">{lessons.length}</span>
            </button>
            {presentSubjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                aria-pressed={filter === subject.id}
                onClick={() => setFilter(subject.id)}
              >
                <SubjectIcon subject={subject.id} size={18} />
                <Dual ar={subject.ar} en={subject.en} />
                <span className="count mono">{lessons.filter((lesson) => lesson.subject === subject.id).length}</span>
              </button>
            ))}
          </div>
        ) : null}

        {lessons === null && !error ? <LoadingBlock rows={2} height={120} /> : null}

        {lessons?.length === 0 ? (
          <div className="empty">
            <BookOpen size={40} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="لا يوجد درس معيّن لك بعد." en="No lesson has been assigned to you yet." />
            <Dual as="p" className="small" ar="اطلب من معلمك أن يعيّن درساً." en="Ask your teacher to assign one." />
          </div>
        ) : null}

        {shownSubjects.map((subject) => {
          const list = (lessons ?? []).filter((lesson) => lesson.subject === subject.id);
          const subjectDone = list.filter((lesson) => stats[lesson.id]?.state === "complete").length;
          return (
            <section key={subject.id} className="subject-section" aria-labelledby={`subj-${subject.id}`}>
              <header className="subject-head">
                <span className={`subject-icon subj-${subject.id}`} aria-hidden="true">
                  <SubjectIcon subject={subject.id} size={24} />
                </span>
                <h2 id={`subj-${subject.id}`}>
                  <Dual ar={subject.ar} en={subject.en} />
                </h2>
                <span className="chip">
                  <Dual ar={`${subjectDone} من ${list.length} مكتمل`} en={`${subjectDone} of ${list.length} done`} />
                </span>
              </header>

              <ul className="course-grid">
                {list.map((lesson) => {
                  const stat = stats[lesson.id];
                  const games = gameCount(lesson);
                  return (
                    <li key={lesson.id} className="course-card">
                      <div className={`course-banner subj-${lesson.subject}`} aria-hidden="true">
                        <SubjectIcon subject={lesson.subject} size={40} />
                        {stat?.state === "complete" ? (
                          <span className="course-done">
                            <Check size={18} strokeWidth={3} />
                          </span>
                        ) : null}
                      </div>
                      <div className="course-body">
                        <h3>
                          <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                        </h3>
                        {lesson.summary_ar ? (
                          <Dual as="p" className="muted small" ar={lesson.summary_ar} en={lesson.summary_en ?? lesson.summary_ar} />
                        ) : null}
                        <div className="chips">
                          <span className="chip">
                            <Gamepad2 size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                            <Dual ar={`${games} ألعاب`} en={`${games} games`} />
                          </span>
                          {lesson.minutes ? (
                            <span className="chip">
                              <Clock size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                              <Dual ar={`${lesson.minutes} دقيقة`} en={`${lesson.minutes} min`} />
                            </span>
                          ) : null}
                          {stat?.badge ? <ProgressBadge badge={stat.badge} /> : null}
                        </div>
                        {stat ? <ProgressBar value={stat.done} total={stat.total} /> : null}
                        <a className={stat && stat.state !== "new" ? "btn secondary" : "btn"} href={`/student/lessons/${lesson.id}`}>
                          <Dual
                            ar={stat?.state === "complete" ? "راجع الدرس" : stat?.state === "learning" ? "أكمل" : "ابدأ"}
                            en={stat?.state === "complete" ? "Review" : stat?.state === "learning" ? "Continue" : "Start"}
                          />
                          <ForwardIcon />
                        </a>
                      </div>
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
              <RotateCcw size={14} strokeWidth={2} className="icon" aria-hidden="true" />
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
              <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual ar="تعذّرت إعادة الضبط. حاول مرة أخرى." en="Could not reset. Try again." />
            </p>
          ) : null}
          <div className="btn-row">
            <button type="button" className="btn danger" onClick={onReset} disabled={resetState === "busy"}>
              <RotateCcw size={20} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual
                ar={resetState === "busy" ? "جارٍ المسح…" : "امسح تقدّمي"}
                en={resetState === "busy" ? "Erasing…" : "Erase my progress"}
              />
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
