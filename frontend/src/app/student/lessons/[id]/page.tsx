"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { NewtonLab } from "@/components/NewtonLab";
import { SignCheck } from "@/components/SignCheck";
import { SignPanel } from "@/components/SignPanel";
import { getLesson, saveProgress } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import type { Lesson } from "@/lib/types";

export default function StudentPlayer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [index, setIndex] = useState(0);
  const [challengeMet, setChallengeMet] = useState(false);
  const [signTried, setSignTried] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      .catch(() => setError("تعذر فتح الدرس."));
  }, [ready, user, router, id]);

  const step = lesson?.steps[index];
  const glossary = lesson?.glossary ?? {};

  const locked = useMemo(() => {
    if (!step) return false;
    if (step.type === "challenge") return !challengeMet;
    return false;
  }, [step, challengeMet]);

  const persist = useCallback(
    async (payload: Parameters<typeof saveProgress>[0]) => {
      try {
        await saveProgress(payload);
      } catch {
        /* progress is best-effort if the session dropped */
      }
    },
    [],
  );

  const onChallengeMet = useCallback(
    (snapshot: { F: number; m: number; a: number }) => {
      setChallengeMet(true);
      if (lesson && step) {
        void persist({
          lesson_id: lesson.id,
          step_id: step.id,
          status: "done",
          sim_snapshot: snapshot,
        });
      }
    },
    [lesson, step, persist],
  );

  function go(next: number) {
    if (!lesson || !step) return;
    if (next > index) {
      void persist({
        lesson_id: lesson.id,
        step_id: step.id,
        status: "done",
      });
    }
    setIndex(next);
    setChallengeMet(false);
    setSignTried(false);
  }

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <Dual as="p" ar="جارٍ التحميل…" en="Loading…" />
      </AppShell>
    );
  }

  const termId = step?.glossary_ids?.[0];
  const term = termId ? glossary[termId] : undefined;

  return (
    <AppShell user={user}>
      {error ? <Dual as="p" className="error" ar="تعذر فتح الدرس." en="Could not open the lesson." /> : null}
      {!lesson || !step ? (
        <Dual as="p" ar="جارٍ التحميل…" en="Loading…" />
      ) : (
        <div className="player">
          <nav className="player-nav" aria-label="Lesson steps">
            <Dual as="p" className="hint" ar={lesson.title_ar} en={lesson.title_en ?? "Lesson"} />
            <p className="hint">
              {index + 1} / {lesson.steps.length}
            </p>
            <ol className="steps">
              {lesson.steps.map((item, itemIndex) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={itemIndex === index ? "step" : undefined}
                    onClick={() => go(itemIndex)}
                    disabled={itemIndex > index}
                  >
                    <Dual ar={item.title_ar} en={item.title_en ?? item.title_ar} />
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <section className="player-main">
            <h1>
              <Dual ar={step.title_ar} en={step.title_en ?? step.title_ar} />
            </h1>
            {step.body_ar ? <Dual as="p" ar={step.body_ar} en={step.body_en ?? ""} /> : null}

            {step.type === "esl_term" && term ? (
              <SignPanel termAr={term.term_ar} termEn={term.term_en} mode={term.esl_mode} />
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
                onResult={(predicted, matched) => {
                  setSignTried(true);
                  void persist({
                    lesson_id: lesson.id,
                    step_id: step.id,
                    status: matched ? "done" : "attempted",
                    predicted_sign: predicted,
                  });
                }}
              />
            ) : null}

            <div className="role-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => go(Math.max(0, index - 1))}
                disabled={index === 0}
              >
                <Dual ar="السابق" en="Back" />
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => go(Math.min(lesson.steps.length - 1, index + 1))}
                disabled={index === lesson.steps.length - 1 || locked}
              >
                {locked && step.type === "challenge" ? (
                  <Dual ar="اضبط a أولاً" en="Set a first" />
                ) : index === lesson.steps.length - 1 ? (
                  <Dual ar="نهاية الدرس" en="End" />
                ) : (
                  <Dual ar="التالي" en="Next" />
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
