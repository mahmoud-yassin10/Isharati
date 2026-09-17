"use client";

import { useRef, useState } from "react";
import { Dual } from "@/components/Dual";
import { SignPanels } from "@/components/SignPanel";
import type { GlossaryEntry, Quiz } from "@/lib/types";

export function QuizPanel({
  quiz,
  stems = [],
  onSolved,
}: {
  quiz: Quiz;
  stems?: GlossaryEntry[];
  onSolved: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const solved = useRef(false);
  const correct = picked === quiz.correct_id;
  const wrong = picked != null && picked !== quiz.correct_id;

  return (
    <div className="panel quiz-panel">
      <Dual as="p" ar={quiz.prompt_ar} en={quiz.prompt_en} />
      <SignPanels entries={stems} />
      <div className="quiz-options">
        {quiz.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`btn ghost ${picked === option.id && correct ? "ok-btn" : ""}`}
            disabled={correct}
            onClick={() => {
              setPicked(option.id);
              if (option.id === quiz.correct_id && !solved.current) {
                solved.current = true;
                onSolved();
              }
            }}
          >
            <Dual ar={option.label_ar} en={option.label_en} />
          </button>
        ))}
      </div>
      {correct ? (
        <p className="nudge" role="status">
          <Dual ar="وصلت." en="You reached it." />
        </p>
      ) : null}
      {wrong ? (
        <p className="hint" role="status">
          <Dual ar="حاول مرة أخرى." en="Try again." />
        </p>
      ) : null}
    </div>
  );
}
