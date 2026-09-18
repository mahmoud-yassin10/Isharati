"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  Hand,
  HelpCircle,
  Link2,
  ListOrdered,
  Lock,
  MousePointerClick,
  Shapes,
  SlidersHorizontal,
  Star,
  Table2,
  Target,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { GameStep, stepNeedsResult } from "@/components/games/GameStep";
import type { GameResult } from "@/components/games/shared";
import { NewtonLab } from "@/components/NewtonLab";
import { ProgressBadge } from "@/components/ProgressBadge";
import { QuizPanel } from "@/components/QuizPanel";
import { SignCheck } from "@/components/SignCheck";
import { SignPanels } from "@/components/SignPanel";
import { BackIcon, ForwardIcon, LoadingBlock } from "@/components/ui";
import { badgeForLesson, scoreFor } from "@/lib/gamification";
import { getLesson, lessonProgress, saveProgress } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { subjectMeta } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Badge } from "@/lib/gamification";
import type { Lesson, ProgressItem, StepType } from "@/lib/types";

const icon = (Icon: typeof Hand) => <Icon size={16} strokeWidth={2} className="icon" />;

const STEP_META: Record<StepType, { ar: string; en: string; icon: React.ReactNode }> = {
  esl_term: { ar: "كلمة بالإشارة", en: "Word in sign", icon: icon(Hand) },
  explain: { ar: "شرح", en: "Explanation", icon: icon(BookOpen) },
  simulate: { ar: "تجربة", en: "Experiment", icon: icon(SlidersHorizontal) },
  challenge: { ar: "تحدٍّ", en: "Challenge", icon: icon(Target) },
  sign_check: { ar: "تحقّق بالإشارة", en: "Sign check", icon: icon(Hand) },
  quiz: { ar: "سؤال", en: "Question", icon: icon(HelpCircle) },
  match: { ar: "لعبة", en: "Game", icon: icon(Link2) },
  sort: { ar: "لعبة", en: "Game", icon: icon(Shapes) },
  order: { ar: "لعبة", en: "Game", icon: icon(ListOrdered) },
  diagram: { ar: "رسم تفاعلي", en: "Interactive diagram", icon: icon(MousePointerClick) },
  table: { ar: "جدول", en: "Table", icon: icon(Table2) },
  truefalse: { ar: "لعبة", en: "Game", icon: icon(Zap) },
};

const RAIL_ICON: Partial<Record<StepType, typeof Hand>> = {
  match: Link2,
  sort: Shapes,
  order: ListOrdered,
  diagram: MousePointerClick,
  table: Table2,
  truefalse: Zap,
  simulate: SlidersHorizontal,
  challenge: Target,
};

export default function StudentPlayer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [challengeMet, setChallengeMet] = useState(false);
  const [quizSolved, setQuizSolved] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [nudge, setNudge] = useState<{ ar: string; en: string } | null>(null);
  const [error, setError] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "student") {
      router.replace("/login?role=student");
      return;
    }
    Promise.all([getLesson(id), lessonProgress(id).catch(() => [] as ProgressItem[])])
      .then(([data, items]) => {
        setLesson(data);
        setProgress(items);
        const done = new Set(items.filter((item) => item.status === "done").map((item) => item.step_id));
        setDoneIds(done);
        // Resume at the first step not finished yet.
        const resume = data.steps.findIndex((step) => !done.has(step.id));
        const start = resume === -1 ? 0 : resume;
        setIndex(start);
        setReached(resume === -1 ? data.steps.length - 1 : start);
      })
      .catch(() => setError(true));
  }, [ready, user, router, id]);

  const step = lesson?.steps[index];
  const glossary = lesson?.glossary ?? {};
  const alreadyDone = step ? doneIds.has(step.id) : false;

  const locked = useMemo(() => {
    if (!step || alreadyDone) return false;
    if (step.type === "challenge") return !challengeMet;
    if (step.type === "quiz") return !quizSolved;
    if (stepNeedsResult(step)) return !gameResult;
    return false;
  }, [step, alreadyDone, challengeMet, quizSolved, gameResult]);

  const persist = useCallback(
    async (payload: Parameters<typeof saveProgress>[0]) => {
      if (payload.status === "done") setDoneIds((prev) => new Set(prev).add(payload.step_id));
      try {
        await saveProgress(payload);
        if (lesson) {
          const items = await lessonProgress(lesson.id);
          setProgress(items);
          const badge = badgeForLesson(lesson, items);
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
    // Game steps save their own result; everything else is done on leaving it forward.
    if (next > index && !doneIds.has(step.id)) {
      void persist({ lesson_id: lesson.id, step_id: step.id, status: "done" });
    }
    setIndex(next);
    setReached((value) => Math.max(value, next));
    setChallengeMet(false);
    setQuizSolved(false);
    setGameResult(null);
    setNudge(null);
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
  const score = scoreFor(progress);
  const subject = subjectMeta(lesson.subject);

  return (
    <AppShell user={user} bare>
      <div className="lesson-bar">
        <div className="wrap lesson-bar-inner">
          <a className="back-link" href="/student">
            <BackIcon />
            <Dual ar="دروسي" en="My lessons" />
          </a>
          <h1>
            <span className="muted small lesson-bar-subject">
              <Dual ar={subject.ar} en={subject.en} />
            </span>
            <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
          </h1>
          <div className="progress">
            <div className="progress-label">
              <Dual
                ar={`الخطوة ${index + 1} من ${lesson.steps.length}`}
                en={`Step ${index + 1} of ${lesson.steps.length}`}
              />
              <span className="lesson-score">
                <Star size={16} strokeWidth={2} className="icon star on" aria-hidden="true" />
                <Dual ar={`${score.points} نقطة`} en={`${score.points} pts`} />
                {earnedBadge ? <ProgressBadge badge={earnedBadge} /> : null}
              </span>
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
              const done = doneIds.has(item.id) && itemIndex !== index;
              const current = itemIndex === index;
              const RailIcon = RAIL_ICON[item.type];
              return (
                <li key={item.id} className={done ? "done" : undefined}>
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    onClick={() => go(itemIndex)}
                    disabled={itemIndex > reached}
                  >
                    <span className="dot" aria-hidden="true">
                      {done ? (
                        <Check size={18} strokeWidth={3} />
                      ) : itemIndex > reached ? (
                        <Lock size={14} strokeWidth={2} />
                      ) : (
                        itemIndex + 1
                      )}
                    </span>
                    <span className="step-name">
                      <Dual ar={item.title_ar} en={item.title_en ?? item.title_ar} />
                      {RailIcon ? <RailIcon size={16} strokeWidth={1.75} className="icon rail-kind" aria-hidden="true" /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="step-body">
          <div className="step-head">
            <span className="step-kind">
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

          <GameStep
            key={`${step.id}-game`}
            step={step}
            glossary={glossary}
            onComplete={(result) => {
              setGameResult(result);
              // Replaying a game never lowers the best score already saved.
              const best = progress.find((item) => item.step_id === step.id)?.sim_snapshot;
              if (best?.stars != null && best.stars >= result.stars) {
                setDoneIds((prev) => new Set(prev).add(step.id));
                return;
              }
              void persist({
                lesson_id: lesson.id,
                step_id: step.id,
                status: "done",
                sim_snapshot: { stars: result.stars, mistakes: result.mistakes },
              });
            }}
          />

          {step.type === "quiz" && step.quiz ? (
            <QuizPanel
              key={`${step.id}-quiz`}
              quiz={step.quiz}
              stems={terms}
              onSolved={() => {
                setQuizSolved(true);
                void persist({ lesson_id: lesson.id, step_id: step.id, status: "done" });
              }}
            />
          ) : null}

          {step.type === "simulate" && step.simulation ? (
            <NewtonLab
              key={`${step.id}-lab`}
              initialForce={step.simulation.params.F ?? 10}
              initialMass={step.simulation.params.m ?? 2}
            />
          ) : null}

          {step.type === "challenge" && step.simulation ? (
            <NewtonLab
              key={`${step.id}-challenge`}
              initialForce={step.simulation.params.F ?? 10}
              initialMass={step.simulation.params.m ?? 2}
              challenge={step.simulation.goal}
              onChallengeMet={onChallengeMet}
            />
          ) : null}

          {step.type === "sign_check" && step.sign_target ? (
            <SignCheck
              key={`${step.id}-sign`}
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
                ar={
                  step.type === "challenge"
                    ? "اضبط التسارع على الهدف لتكمل."
                    : step.type === "quiz"
                      ? "أجب عن السؤال لتكمل."
                      : "أنهِ اللعبة لتكمل."
                }
                en={
                  step.type === "challenge"
                    ? "Hit the target acceleration to continue."
                    : step.type === "quiz"
                      ? "Answer the question to continue."
                      : "Finish the game to continue."
                }
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
                if (!doneIds.has(step.id)) {
                  void persist({ lesson_id: lesson.id, step_id: step.id, status: "done" });
                }
                router.push("/student");
                return;
              }
              go(index + 1);
            }}
          >
            <Dual ar={isLast ? "أنهِ الدرس" : "التالي"} en={isLast ? "Finish the lesson" : "Next"} />
            {isLast ? <Check size={22} strokeWidth={2.5} className="icon" aria-hidden="true" /> : <ForwardIcon size={22} />}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
