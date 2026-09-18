"use client";

import { useRef, useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { SignPanels } from "@/components/SignPanel";
import type { GlossaryEntry, Quiz } from "@/lib/types";

const LETTERS_AR = ["أ", "ب", "ج", "د", "هـ"];
const LETTERS_EN = ["A", "B", "C", "D", "E"];

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
  const wrong = picked != null && !correct;

  return (
    <div className="panel quiz">
      <p className="quiz-prompt">
        <HelpCircle size={22} strokeWidth={1.75} className="icon" aria-hidden="true" style={{ display: "inline", verticalAlign: "-4px", marginInlineEnd: "8px" }} />
        <Dual ar={quiz.prompt_ar} en={quiz.prompt_en} />
      </p>

      <SignPanels entries={stems} />

      <ul className="quiz-options">
        {quiz.options.map((option, index) => {
          const isPicked = picked === option.id;
          const state = isPicked && correct ? "correct" : isPicked && wrong ? "wrong" : correct ? "faded" : "";
          return (
            <li key={option.id}>
              <button
                type="button"
                className={`quiz-option ${state}`}
                disabled={correct}
                aria-pressed={isPicked}
                onClick={() => {
                  setPicked(option.id);
                  if (option.id === quiz.correct_id && !solved.current) {
                    solved.current = true;
                    onSolved();
                  }
                }}
              >
                <span className="letter" aria-hidden="true">
                  <Dual ar={LETTERS_AR[index] ?? `${index + 1}`} en={LETTERS_EN[index] ?? `${index + 1}`} />
                </span>
                <span>
                  <Dual ar={option.label_ar} en={option.label_en} />
                </span>
                <span aria-hidden="true">
                  {isPicked && correct ? <Check size={24} strokeWidth={2.5} /> : null}
                  {isPicked && wrong ? <X size={24} strokeWidth={2.5} /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {correct ? (
        <p className="feedback ok" role="status">
          <Check size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual ar="صحيح. أحسنت." en="Correct. Well done." />
        </p>
      ) : null}
      {wrong ? (
        <p className="feedback error" role="status">
          <X size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual ar="غير صحيح. اختر إجابة أخرى." en="Not correct. Choose another answer." />
        </p>
      ) : null}
    </div>
  );
}
