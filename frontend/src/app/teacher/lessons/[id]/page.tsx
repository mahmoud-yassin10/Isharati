"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  Eye,
  FileEdit,
  Gamepad2,
  Hand,
  HelpCircle,
  Send,
  SlidersHorizontal,
  Target,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { GameStep } from "@/components/games/GameStep";
import { NewtonLab } from "@/components/NewtonLab";
import { QuizPanel } from "@/components/QuizPanel";
import { SignPanels } from "@/components/SignPanel";
import { ProgressBadge } from "@/components/ProgressBadge";
import { BackIcon, LoadingBlock, ProgressBar } from "@/components/ui";
import { lessonStats } from "@/lib/gamification";
import { assignLesson, getLesson, lessonProgress, publishLesson } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import type { Lesson, ProgressItem, StepType } from "@/lib/types";

const GAME_ICON = <Gamepad2 size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />;

const STEP_ICON: Partial<Record<StepType, React.ReactNode>> = {
  esl_term: <Hand size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  explain: <BookOpen size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  simulate: <SlidersHorizontal size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  challenge: <Target size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  sign_check: <Hand size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  quiz: <HelpCircle size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
};

type Note = { kind: "ok" | "error"; ar: string; en: string };

export default function TeacherLessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    getLesson(id)
      .then(setLesson)
      .catch(() => setNote({ kind: "error", ar: "تعذّر فتح الدرس.", en: "Could not open the lesson." }));
    lessonProgress(id)
      .then(setProgress)
      .catch(() => undefined);
  }, [ready, user, router, id]);

  const simStep = lesson?.steps.find((step) => step.simulation);
  const previewStep = lesson?.steps.find((step) => step.id === previewId);

  async function onPublish() {
    setBusy(true);
    try {
      setLesson(await publishLesson(id));
      setNote({ kind: "ok", ar: "نُشر الدرس.", en: "The lesson is published." });
    } catch {
      setNote({ kind: "error", ar: "تعذّر النشر.", en: "Could not publish." });
    } finally {
      setBusy(false);
    }
  }

  async function onAssign() {
    setBusy(true);
    try {
      const result = await assignLesson(id);
      setNote({
        kind: "ok",
        ar: `عُيّن الدرس للطالب: ${result.student_name}`,
        en: `Assigned to student: ${result.student_name}`,
      });
    } catch {
      setNote({ kind: "error", ar: "تعذّر التعيين.", en: "Could not assign." });
    } finally {
      setBusy(false);
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

  const studentIds = Array.from(new Set(progress.map((item) => item.student_id)));

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <p>
          <a className="back-link" href="/teacher">
            <BackIcon />
            <Dual ar="كل الدروس" en="All lessons" />
          </a>
        </p>

        <div className="page-head">
          <div className="titles">
            <h1>
              <Dual ar={lesson?.title_ar ?? "الدرس"} en={lesson?.title_en ?? "Lesson"} />
            </h1>
            <div className="chips" style={{ display: "flex", gap: "0.5rem" }}>
              {lesson?.status === "published" ? (
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
              {lesson ? (
                <span className="chip">
                  <Dual ar={`${lesson.steps.length} خطوات`} en={`${lesson.steps.length} steps`} />
                </span>
              ) : null}
              <span className="chip">
                <Users size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                <Dual ar={`${studentIds.length} طالب`} en={`${studentIds.length} students`} />
              </span>
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={onPublish} disabled={busy}>
              <Send size={20} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
              <Dual ar="انشر الدرس" en="Publish lesson" />
            </button>
            <button type="button" className="btn secondary" onClick={onAssign} disabled={busy}>
              <UserPlus size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="عيّن لطالب التجربة" en="Assign to demo student" />
            </button>
          </div>
        </div>

        {note ? (
          <p className={`feedback ${note.kind}`} role="status" style={{ marginBottom: "1.5rem" }}>
            {note.kind === "ok" ? (
              <Check size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
            ) : (
              <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            )}
            <Dual ar={note.ar} en={note.en} />
          </p>
        ) : null}

        {!lesson ? <LoadingBlock rows={2} height={160} /> : null}

        {lesson ? (
          <div className="teacher-layout">
            <div className="stack">
              {simStep?.simulation ? (
                <section className="stack-sm">
                  <h2>
                    <Dual ar="معاينة المختبر" en="Lab preview" />
                  </h2>
                  <Dual
                    as="p"
                    className="muted"
                    ar="هذا ما يراه الطالب في خطوة التجربة."
                    en="This is what the student sees on the experiment step."
                  />
                  <NewtonLab
                    initialForce={simStep.simulation.params.F ?? 10}
                    initialMass={simStep.simulation.params.m ?? 2}
                    challenge={simStep.simulation.goal}
                  />
                </section>
              ) : null}

              <section className="stack-sm">
                <h2>
                  <Dual ar="خطوات الدرس" en="Lesson steps" />
                </h2>
                <div className="panel" style={{ paddingBlock: 0 }}>
                  <ol className="step-outline">
                    {lesson.steps.map((step, stepIndex) => (
                      <li key={step.id}>
                        <button
                          type="button"
                          className="outline-btn"
                          aria-pressed={previewId === step.id}
                          onClick={() => setPreviewId(previewId === step.id ? null : step.id)}
                        >
                          <span className="n" aria-hidden="true">
                            {stepIndex + 1}
                          </span>
                          {STEP_ICON[step.type] ?? GAME_ICON}
                          <Dual ar={step.title_ar} en={step.title_en ?? step.title_ar} />
                          <Eye size={18} strokeWidth={1.75} className="icon outline-eye" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              {previewStep ? (
                <section className="stack-sm" aria-live="polite">
                  <h2>
                    <Dual ar={`معاينة: ${previewStep.title_ar}`} en={`Preview: ${previewStep.title_en ?? previewStep.title_ar}`} />
                  </h2>
                  {previewStep.body_ar ? (
                    <Dual as="p" className="muted" ar={previewStep.body_ar} en={previewStep.body_en ?? previewStep.body_ar} />
                  ) : null}
                  <GameStep key={`${previewStep.id}-game`} step={previewStep} glossary={lesson.glossary} onComplete={() => undefined} />
                  {previewStep.type === "quiz" && previewStep.quiz ? (
                    <QuizPanel key={`${previewStep.id}-quiz`} quiz={previewStep.quiz} onSolved={() => undefined} />
                  ) : null}
                  {(previewStep.type === "esl_term" || previewStep.type === "explain") ? (
                    <SignPanels
                      entries={(previewStep.glossary_ids ?? []).map((gid) => lesson.glossary[gid]).filter(Boolean)}
                    />
                  ) : null}
                  {(previewStep.type === "simulate" || previewStep.type === "challenge") && previewStep.simulation ? (
                    <Dual as="p" className="small muted" ar="المختبر معروض في الأعلى." en="The lab is shown above." />
                  ) : null}
                </section>
              ) : null}
            </div>

            <section className="stack-sm">
              <h2>
                <Dual ar="تقدّم الطلاب" en="Student progress" />
              </h2>

              {studentIds.length === 0 ? (
                <div className="empty">
                  <Users size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
                  <Dual as="p" ar="لا يوجد تقدّم بعد." en="No progress yet." />
                  <Dual
                    as="p"
                    className="small"
                    ar="عيّن الدرس، ثم افتحه من حساب الطالب."
                    en="Assign the lesson, then open it from the student account."
                  />
                </div>
              ) : (
                <>
                  <div className="panel">
                    {studentIds.map((studentId) => {
                      const rows = progress.filter((item) => item.student_id === studentId);
                      const stat = lessonStats(lesson, rows);
                      return (
                        <div className="student-row" key={studentId}>
                          <span className="who">
                            <span className="avatar" aria-hidden="true">
                              {(rows[0]?.student_name ?? "?").trim().charAt(0)}
                            </span>
                            {rows[0]?.student_name}
                          </span>
                          {stat.badge ? <ProgressBadge badge={stat.badge} /> : null}
                          <span style={{ flex: "1 1 160px", maxWidth: 200 }}>
                            <ProgressBar value={stat.done} total={stat.total} />
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>
                            <Dual ar="الطالب" en="Student" />
                          </th>
                          <th>
                            <Dual ar="الخطوة" en="Step" />
                          </th>
                          <th>
                            <Dual ar="الحالة" en="Status" />
                          </th>
                          <th>
                            <Dual ar="النتيجة" en="Result" />
                          </th>
                          <th>
                            <Dual ar="الإشارة" en="Sign" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {progress.map((item) => {
                          const step = lesson.steps.find((candidate) => candidate.id === item.step_id);
                          return (
                            <tr key={`${item.student_id}-${item.step_id}`}>
                              <td>{item.student_name}</td>
                              <td>
                                <Dual
                                  ar={step?.title_ar ?? item.step_id}
                                  en={step?.title_en ?? step?.title_ar ?? item.step_id}
                                />
                              </td>
                              <td>
                                {item.status === "done" ? (
                                  <span className="chip ok">
                                    <Check size={14} strokeWidth={2.5} className="icon" aria-hidden="true" />
                                    <Dual ar="مكتمل" en="Done" />
                                  </span>
                                ) : (
                                  <span className="chip">
                                    <Dual ar="محاولة" en="Attempted" />
                                  </span>
                                )}
                              </td>
                              <td className="mono">
                                {item.sim_snapshot?.a != null
                                  ? `a = ${item.sim_snapshot.a.toFixed(2)}`
                                  : item.sim_snapshot?.stars
                                    ? `${"★".repeat(item.sim_snapshot.stars)}${"☆".repeat(3 - item.sim_snapshot.stars)}`
                                    : "—"}
                              </td>
                              <td>{item.predicted_sign ?? "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
