"use client";

import { useState } from "react";
import { Check, Flame, X, Zap } from "lucide-react";
import { Dual } from "@/components/Dual";
import { GameShell, starsFor, type GameProps, type GameResult } from "@/components/games/shared";
import { ForwardIcon } from "@/components/ui";
import type { TrueFalseGame as TrueFalseGameData } from "@/lib/types";

/** A streak round: one statement at a time, true or false. */
export function TrueFalseGame({ game, glossary, onComplete }: GameProps<TrueFalseGameData>) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [signId, setSignId] = useState<string | null>(null);

  const statement = game.statements[index];
  const correct = answer !== null && statement ? answer === statement.answer : null;

  function pickAnswer(value: boolean) {
    if (answer !== null || !statement) return;
    setAnswer(value);
    if (value === statement.answer) {
      const next = streak + 1;
      setStreak(next);
      setBest((b) => Math.max(b, next));
    } else {
      setStreak(0);
      setMistakes((m) => m + 1);
    }
  }

  function next() {
    const nextIndex = index + 1;
    setAnswer(null);
    if (nextIndex >= game.statements.length) {
      const done = { stars: starsFor(mistakes, game.statements.length), mistakes };
      setResult(done);
      onComplete(done);
      setIndex(nextIndex);
      return;
    }
    setIndex(nextIndex);
  }

  return (
    <GameShell
      kind={{ ar: "جولة صح أو خطأ", en: "True or false round", icon: <Zap size={16} strokeWidth={2} className="icon" /> }}
      prompt={{ ar: game.prompt_ar, en: game.prompt_en }}
      progress={{ done: Math.min(index + (answer !== null ? 1 : 0), game.statements.length), total: game.statements.length }}
      mistakes={mistakes}
      result={result}
      glossary={glossary}
      signId={signId}
      onCloseSign={() => setSignId(null)}
    >
      {streak >= 2 ? (
        <p className="streak" aria-live="polite">
          <Flame size={20} strokeWidth={2} className="icon" aria-hidden="true" />
          <Dual ar={`${streak} صحيحة متتالية`} en={`${streak} right in a row`} />
        </p>
      ) : null}

      {statement && !result ? (
        <>
          <div className={`tf-card${correct === true ? " ok" : correct === false ? " bad" : ""}`}>
            <p className="tf-statement">
              <Dual ar={statement.ar} en={statement.en} />
            </p>
          </div>

          {answer === null ? (
            <div className="tf-buttons">
              <button type="button" className="tf-btn yes" onClick={() => pickAnswer(true)}>
                <Check size={28} strokeWidth={3} aria-hidden="true" />
                <Dual ar="صح" en="True" />
              </button>
              <button type="button" className="tf-btn no" onClick={() => pickAnswer(false)}>
                <X size={28} strokeWidth={3} aria-hidden="true" />
                <Dual ar="خطأ" en="False" />
              </button>
            </div>
          ) : (
            <div className="stack-sm">
              <p className={`feedback ${correct ? "ok" : "error"}`} role="status">
                {correct ? (
                  <Check size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
                ) : (
                  <X size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
                )}
                <span>
                  <Dual
                    ar={`${correct ? "صحيح." : "لا."} الجملة ${statement.answer ? "صحيحة" : "خاطئة"}. ${statement.why_ar ?? ""}`}
                    en={`${correct ? "Right." : "No."} The statement is ${statement.answer ? "true" : "false"}. ${statement.why_en ?? ""}`}
                  />
                </span>
              </p>
              <p>
                <button type="button" className="btn" onClick={next}>
                  <Dual
                    ar={index + 1 === game.statements.length ? "أنهِ الجولة" : "الجملة التالية"}
                    en={index + 1 === game.statements.length ? "Finish the round" : "Next statement"}
                  />
                  <ForwardIcon />
                </button>
              </p>
            </div>
          )}
        </>
      ) : null}

      {result && best > 1 ? (
        <p className="small muted">
          <Dual ar={`أطول سلسلة: ${best}`} en={`Longest streak: ${best}`} />
        </p>
      ) : null}
    </GameShell>
  );
}
