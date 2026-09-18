"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  Hand,
  HelpCircle,
  Lock,
  SlidersHorizontal,
  Target,
  TriangleAlert,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { NewtonLab } from "@/components/NewtonLab";
import { ProgressBadge } from "@/components/ProgressBadge";
import { QuizPanel } from "@/components/QuizPanel";
import { SignCheck } from "@/components/SignCheck";
import { SignPanels } from "@/components/SignPanel";
import { BackIcon, ForwardIcon, LoadingBlock, ProgressBar } from "@/components/ui";
import { badgeForLesson } from "@/lib/gamification";
import { getLesson, lessonProgress, saveProgress } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { useUser } from "@/lib/useUser";
import type { Badge } from "@/lib/gamification";
import type { Lesson, StepType } from "@/lib/types";

const STEP_META: Record<StepType, { ar: string; en: string; icon: React.ReactNode }> = {
  esl_term: { ar: "كلمة بالإشارة", en: "Word in sign", icon: <Hand size={16} strokeWidth={2} className="icon" /> },
  explain: { ar: "شرح", en: "Explanation", icon: <BookOpen size={16} strokeWidth={2} className="icon" /> },
  simulate: { ar: "تجربة", en: "Experiment", icon: <SlidersHorizontal size={16} strokeWidth={2} className="icon" /> },
  challenge: { ar: "تحدٍّ", en: "Challenge", icon: <Target size={16} strokeWidth={2} className="icon" /> },
  sign_check: { ar: "تحقّق بالإشارة", en: "Sign check", icon: <Hand size={16} strokeWidth={2} className="icon" /> },
  quiz: { ar: "سؤال", en: "Question", icon: <HelpCircle size={16} strokeWidth={2} className="icon" /> },
};

export default function StudentPlayer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [index, setIndex] = useState(0);
  const [challengeMet, setChallengeMet] = useState(false);
  const [quizSolved, setQuizSolved] = useState(false);
  const [nudge, setNudge] = useState<{ ar: string; en: string } | null>(null);
  const [error, setError] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "student") {
      router.replace("/login?role=student");
      return;
    }
    getLesson(id)
      .then((data) => {
        setLesson(data);
        setIndex(0);
      })
      .catch(() => setError(true));
  }, [ready, user, router, id]);

  const step = lesson?.steps[index];
  const glossary = lesson?.glossary ?? {};

  const locked = useMemo(() => {
    if (!step) return false;
    if (step.type === "challenge") return !challengeMet;
    if (step.type === "quiz") return !quizSolved;
    return false;
  }, [step, challengeMet, quizSolved]);

  const persist = useCallback(
    async (payload: Parameters<typeof saveProgress>[0]) => {
      try {
        await saveProgress(payload);
        if (lesson) {
          const progress = await lessonProgress(lesson.id);
          const badge = badgeForLesson(lesson, progress);
          if (badge && (!earnedBadge || badge.tier !== earnedBadge.tier)) {
            setEarnedBadge(badge);
          }
        }
      } catch {
        /* progress is best-effort if the session dropped */
      }
    },
    [lesson, earnedBadge],
  );

  const onChallengeMet = useCallback(
    (snapshot: { F: number; m: number; a: number }) => {
      setChallengeMet(true);
      setNudge({ ar: "وصلت إلى الهدف.", en: "You reached the goal." });
      if (lesson && step) {
        void persist({ lesson_id: lesson.id, step_id: step.id, status: "done", sim_snapshot: snapshot });
      }
    },
    [lesson, step, persist],
  );

  function go(next: number) {
    if (!lesson || !step) return;
    if (next > index) {
      void persist({ lesson_id: lesson.id, step_id: step.id, status: "done" });
    }
    setIndex(next);
    setChallengeMet(false);
    setQuizSolved(false);
    if (next <= index) setNudge(null);
    window.scrollTo({ top: 0, behavior: "auto" });
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

  if (error) {
    return (
      <AppShell user={user}>
        <div className="wrap page stack">
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر فتح الدرس." en="Could not open the lesson." />
          </p>
          <p>
            <a className="btn secondary" href="/student">
              <BackIcon />
              <Dual ar="إلى دروسي" en="Back to my lessons" />
            </a>
          </p>
        </div>
      </AppShell>
    );
  }

  if (!lesson || !step) {
    return (
      <AppShell user={user}>
        <div className="wrap page">
          <LoadingBlock rows={3} />
        </div>
      </AppShell>
    );
  }

  const terms = (step.glossary_ids ?? [])
    .map((gid) => glossary[gid])
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const meta = STEP_META[step.type];
  const isLast = index === lesson.steps.length - 1;
  const showSigns =
    step.type === "esl_term" || step.type === "explain" || step.type === "simulate" || step.type === "challenge";

  return (
    <AppShell user={user} bare>
      <div className="lesson-bar">
        <div className="wrap lesson-bar-inner">
          <a className="back-link" href="/student">
            <BackIcon />
            <Dual ar="دروسي" en="My lessons" />
          </a>
          <h1>
            <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
          </h1>
          <div className="progress">
            <div className="progress-label">
              <Dual
                ar={`الخطوة ${index + 1} من ${lesson.steps.length}`}
                en={`Step ${index + 1} of ${lesson.steps.length}`}
              />
              {earnedBadge ? <ProgressBadge badge={earnedBadge} /> : null}
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={lesson.steps.length}
              aria-valuenow={index + 1}
            >
              <div
                className="progress-fill"
                style={{ width: `${((index + 1) / lesson.steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wrap player">
        <nav className="steps-rail" aria-label={pick(lang, "خطوات الدرس", "Lesson steps")}>
          <Dual as="p" className="small muted" ar="خطوات الدرس" en="Lesson steps" />
          <ol className="steps">
            {lesson.steps.map((item, itemIndex) => {
              const done = itemIndex < index;
              const current = itemIndex === index;
              return (
                <li key={item.id} className={done ? "done" : undefined}>
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    onClick={() => go(itemIndex)}
                    disabled={itemIndex > index}
                  >
                    <span className="dot" aria-hidden="true">
                      {done ? (
                        <Check size={18} strokeWidth={3} />
                      ) : itemIndex > index ? (
                        <Lock size={14} strokeWidth={2} />
                      ) : (
                        itemIndex + 1
                      )}
                    </span>
                    <span>
                      <Dual ar={item.title_ar} en={item.title_en ?? item.title_ar} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="step-body" aria-live="polite">
          <div className="step-head">
            <span className="chip sign" style={{ justifySelf: "start" }}>
              {meta.icon}
              <Dual ar={meta.ar} en={meta.en} />
            </span>
            <h2>
              <Dual ar={step.title_ar} en={step.title_en ?? step.title_ar} />
            </h2>
            {step.body_ar ? (
              <Dual as="p" className="muted" ar={step.body_ar} en={step.body_en ?? step.body_ar} />
            ) : null}
          </div>

          {nudge ? (
            <p className="feedback ok" role="status">
              <Check size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
              <Dual ar={nudge.ar} en={nudge.en} />
            </p>
          ) : null}

          {showSigns ? <SignPanels entries={terms} /> : null}

          {step.type === "quiz" && step.quiz ? (
            <QuizPanel
              key={step.id}
              quiz={step.quiz}
              stems={terms}
              onSolved={() => {
                setQuizSolved(true);
                setNudge({ ar: "إجابة صحيحة.", en: "Correct answer." });
                void persist({ lesson_id: lesson.id, step_id: step.id, status: "done" });
              }}
            />
          ) : null}

          {step.type === "simulate" && step.simulation ? (
            <NewtonLab
              initialForce={step.simulation.params.F ?? 10}
              initialMass={step.simulation.params.m ?? 2}
            />
          ) : null}

          {step.type === "challenge" && step.simulation ? (
            <NewtonLab
              initialForce={step.simulation.params.F ?? 10}
              initialMass={step.simulation.params.m ?? 2}
              challenge={step.simulation.goal}
              onChallengeMet={onChallengeMet}
            />
          ) : null}

          {step.type === "sign_check" && step.sign_target ? (
            <SignCheck
              target={step.sign_target}
              onResult={(predicted, ok) => {
                if (ok) setNudge({ ar: "أحسنت. الإشارة صحيحة.", en: "Well done. The sign is right." });
                void persist({
                  lesson_id: lesson.id,
                  step_id: step.id,
                  status: ok ? "done" : "attempted",
                  predicted_sign: predicted,
                });
              }}
            />
          ) : null}
        </section>
      </div>

      <div className="action-bar">
        <div className="wrap action-bar-inner">
          <button type="button" className="btn secondary" onClick={() => go(Math.max(0, index - 1))} disabled={index === 0}>
            <BackIcon />
            <Dual ar="السابق" en="Back" />
          </button>

          {locked ? (
            <p className="hint">
              <Lock size={18} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual
                ar={step.type === "challenge" ? "اضبط التسارع على الهدف لتكمل." : "أجب عن السؤال لتكمل."}
                en={step.type === "challenge" ? "Hit the target acceleration to continue." : "Answer the question to continue."}
              />
            </p>
          ) : (
            <p className="hint">
              <Dual ar={`${index + 1} / ${lesson.steps.length}`} en={`${index + 1} / ${lesson.steps.length}`} />
            </p>
          )}

          <button
            type="button"
            className="btn next"
            disabled={locked}
            onClick={() => {
              if (isLast) {
                void persist({ lesson_id: lesson.id, step_id: step.id, status: "done" });
                router.push("/student");
                return;
              }
              go(index + 1);
            }}
          >
            <Dual
              ar={isLast ? "أنهِ الدرس" : "التالي"}
              en={isLast ? "Finish the lesson" : "Next"}
            />
            {isLast ? <Check size={22} strokeWidth={2.5} className="icon" aria-hidden="true" /> : <ForwardIcon size={22} />}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
