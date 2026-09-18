"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, TriangleAlert } from "lucide-react";
import { Dual } from "@/components/Dual";
import { createLesson } from "@/lib/api";
import { SUBJECTS, SubjectIcon } from "@/lib/subjects";
import type { Subject } from "@/lib/types";

/**
 * The one way a teacher starts a lesson: a title and a subject. Everything
 * else (steps, glossary, publishing) happens on the lesson's own page.
 */
export function CreateLessonButton({
  className = "btn large",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("physics");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  function open() {
    setTitle("");
    setSubject("physics");
    setError(false);
    dialogRef.current?.showModal();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(false);
    try {
      const lesson = await createLesson({ title_ar: title.trim(), subject });
      dialogRef.current?.close();
      router.push(`/teacher/lessons/${lesson.id}`);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={open}>
        <Plus size={20} strokeWidth={2} className="icon" aria-hidden="true" />
        {children}
      </button>

      <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby="create-lesson-title">
        <form className="stack-sm" onSubmit={onSubmit}>
          <h2 id="create-lesson-title">
            <Dual ar="إنشاء درس جديد" en="Create a new lesson" />
          </h2>

          <label className="field">
            <Dual as="span" className="field-label" ar="عنوان الدرس" en="Lesson title" />
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              dir="auto"
              required
              maxLength={120}
              autoFocus
              placeholder="مثال: قانون نيوتن الأول"
            />
          </label>

          <fieldset className="field">
            <Dual as="span" className="field-label" ar="المادة" en="Subject" />
            <div className="subject-filter" role="radiogroup" aria-label="المادة">
              {SUBJECTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={subject === item.id}
                  aria-pressed={subject === item.id}
                  onClick={() => setSubject(item.id)}
                >
                  <SubjectIcon subject={item.id} size={18} />
                  <Dual ar={item.ar} en={item.en} />
                </button>
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="feedback error" role="status">
              <TriangleAlert size={20} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual ar="تعذّر إنشاء الدرس. حاول مرة أخرى." en="Could not create the lesson. Try again." />
            </p>
          ) : null}

          <div className="btn-row">
            <button type="submit" className="btn" disabled={busy || !title.trim()}>
              <Dual ar={busy ? "جارٍ الإنشاء…" : "إنشاء الدرس"} en={busy ? "Creating…" : "Create lesson"} />
            </button>
            <button type="button" className="btn secondary" onClick={() => dialogRef.current?.close()}>
              <Dual ar="إلغاء" en="Cancel" />
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
