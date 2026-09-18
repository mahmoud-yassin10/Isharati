"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  Copy,
  Eye,
  FileEdit,
  Gamepad2,
  Hand,
  HelpCircle,
  Pencil,
  Plus,
  Save,
  Send,
  SlidersHorizontal,
  Target,
  Trash2,
  TriangleAlert,
  Undo2,
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
import {
  assignLesson,
  deleteLesson,
  duplicateLesson,
  getLesson,
  lessonProgress,
  publishLesson,
  unpublishLesson,
  updateLesson,
} from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { SUBJECTS, SubjectIcon } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson, LessonStep, ProgressItem, StepType, Subject } from "@/lib/types";

const GAME_ICON = <Gamepad2 size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />;

const STEP_ICON: Partial<Record<StepType, React.ReactNode>> = {
  esl_term: <Hand size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  explain: <BookOpen size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  simulate: <SlidersHorizontal size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  challenge: <Target size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  sign_check: <Hand size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
  quiz: <HelpCircle size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />,
};

/** The step types the lightweight authoring form can build from scratch.
 * Match/sort/order/diagram/table steps are still fully supported for
 * playback and preview - they just aren't authored here yet. */
const AUTHORABLE_TYPES: { type: StepType; ar: string; en: string }[] = [
  { type: "explain", ar: "شرح", en: "Explanation" },
  { type: "esl_term", ar: "مفردة بالإشارة", en: "Sign vocabulary" },
  { type: "quiz", ar: "اختبار قصير", en: "Quiz" },
  { type: "sign_check", ar: "تحقق بالإشارة", en: "Sign check" },
  { type: "simulate", ar: "المختبر", en: "Lab" },
  { type: "challenge", ar: "تحدٍّ", en: "Challenge" },
];

type Note = { kind: "ok" | "error"; ar: string; en: string };

function newStepId() {
  return `step-${Date.now().toString(36)}`;
}

function buildStep(type: StepType, titleAr: string, draft: Record<string, string>): LessonStep {
  const base: LessonStep = { id: newStepId(), type, title_ar: titleAr || "خطوة جديدة" };
  if (type === "explain" || type === "esl_term") {
    base.body_ar = draft.body_ar || undefined;
  }
  if (type === "sign_check") {
    base.sign_target = draft.sign_target || titleAr;
  }
  if (type === "quiz") {
    const options = [1, 2, 3, 4]
      .map((n) => draft[`option_${n}`]?.trim())
      .filter((value): value is string => Boolean(value))
      .map((label, index) => ({ id: `o${index + 1}`, label_ar: label, label_en: label }));
    const correctIndex = Number(draft.correct_index || "0");
    base.quiz = {
      prompt_ar: draft.prompt_ar || titleAr,
      prompt_en: draft.prompt_ar || titleAr,
      correct_id: options[correctIndex]?.id ?? options[0]?.id ?? "o1",
      options: options.length > 0 ? options : [{ id: "o1", label_ar: "صح", label_en: "True" }],
    };
  }
  if (type === "simulate" || type === "challenge") {
    base.simulation = {
      kind: "newton_2nd",
      params: { F: Number(draft.force || "10"), m: Number(draft.mass || "2") },
      goal:
        type === "challenge"
          ? { key: "a", value: Number(draft.goal_value || "5"), tolerance: Number(draft.goal_tolerance || "0.5") }
          : undefined,
    };
  }
  return base;
}

export default function TeacherLessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [editingHead, setEditingHead] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [subjectDraft, setSubjectDraft] = useState<Subject>("physics");

  const [addingStep, setAddingStep] = useState(false);
  const [stepType, setStepType] = useState<StepType>("explain");
  const [stepTitle, setStepTitle] = useState("");
  const [stepDraft, setStepDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    getLesson(id)
      .then((data) => {
        setLesson(data);
        setTitleDraft(data.title_ar);
        setSubjectDraft(data.subject);
      })
      .catch(() => setNote({ kind: "error", ar: "تعذّر فتح الدرس.", en: "Could not open the lesson." }));
    lessonProgress(id)
      .then(setProgress)
      .catch(() => undefined);
  }, [ready, user, router, id]);

  const simStep = lesson?.steps.find((step) => step.simulation);
  const previewStep = lesson?.steps.find((step) => step.id === previewId);
  const studentIds = useMemo(() => Array.from(new Set(progress.map((item) => item.student_id))), [progress]);

  async function persist(patch: Partial<Lesson>, ok?: Note) {
    setBusy(true);
    try {
      const updated = await updateLesson(id, patch);
      setLesson(updated);
      if (ok) setNote(ok);
      return updated;
    } catch {
      setNote({ kind: "error", ar: "تعذّر الحفظ.", en: "Could not save." });
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onSaveHead() {
    if (!titleDraft.trim()) return;
    const updated = await persist(
      { title_ar: titleDraft.trim(), subject: subjectDraft },
      { kind: "ok", ar: "حُفظ عنوان الدرس ومادته.", en: "The lesson title and subject were saved." },
    );
    if (updated) setEditingHead(false);
  }

  async function onAddStep() {
    if (!lesson) return;
    const step = buildStep(stepType, stepTitle.trim(), stepDraft);
    const steps = [...lesson.steps, step];
    const updated = await persist({ steps }, { kind: "ok", ar: "أُضيفت الخطوة.", en: "The step was added." });
    if (updated) {
      setAddingStep(false);
      setStepTitle("");
      setStepDraft({});
      setStepType("explain");
    }
  }

  async function onRemoveStep(stepId: string) {
    if (!lesson) return;
    if (!window.confirm(pick(lang, "احذف هذه الخطوة؟", "Delete this step?"))) return;
    const steps = lesson.steps.filter((step) => step.id !== stepId);
    await persist({ steps }, { kind: "ok", ar: "حُذفت الخطوة.", en: "The step was deleted." });
    if (previewId === stepId) setPreviewId(null);
  }

  async function onMoveStep(stepId: string, direction: -1 | 1) {
    if (!lesson) return;
    const index = lesson.steps.findIndex((step) => step.id === stepId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= lesson.steps.length) return;
    const steps = [...lesson.steps];
    [steps[index], steps[target]] = [steps[target], steps[index]];
    await persist({ steps });
  }

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

  async function onUnpublish() {
    setBusy(true);
    try {
      setLesson(await unpublishLesson(id));
      setNote({ kind: "ok", ar: "أُعيد الدرس إلى مسودة.", en: "The lesson is back to a draft." });
    } catch {
      setNote({ kind: "error", ar: "تعذّر إلغاء النشر.", en: "Could not unpublish." });
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

  async function onDuplicate() {
    setBusy(true);
    try {
      const copy = await duplicateLesson(id);
      router.push(`/teacher/lessons/${copy.id}`);
    } catch {
      setNote({ kind: "error", ar: "تعذّر تكرار الدرس.", en: "Could not duplicate the lesson." });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!lesson) return;
    if (lesson.status === "published") {
      setNote({ kind: "error", ar: "أوقف نشر الدرس أولاً قبل حذفه.", en: "Unpublish the lesson before deleting it." });
      return;
    }
    if (!window.confirm(pick(lang, "احذف هذا الدرس؟ لا يمكن التراجع.", "Delete this lesson? This cannot be undone."))) return;
    setBusy(true);
    try {
      await deleteLesson(id);
      router.push("/teacher/lessons");
    } catch {
      setNote({ kind: "error", ar: "تعذّر حذف الدرس.", en: "Could not delete the lesson." });
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

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <p>
          <a className="back-link" href="/teacher/lessons">
            <BackIcon />
            <Dual ar="كل الدروس" en="All lessons" />
          </a>
        </p>

        <div className="page-head">
          <div className="titles">
            {editingHead ? (
              <div className="stack-sm">
                <label className="field">
                  <Dual as="span" className="field-label" ar="عنوان الدرس" en="Lesson title" />
                  <input value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} dir="auto" maxLength={120} />
                </label>
                <fieldset className="field">
                  <Dual as="span" className="field-label" ar="المادة" en="Subject" />
                  <div className="subject-filter" role="radiogroup">
                    {SUBJECTS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={subjectDraft === item.id}
                        onClick={() => setSubjectDraft(item.id)}
                      >
                        <SubjectIcon subject={item.id} size={16} />
                        <Dual ar={item.ar} en={item.en} />
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="btn-row">
                  <button type="button" className="btn small" onClick={onSaveHead} disabled={busy}>
                    <Save size={16} strokeWidth={1.75} className="icon" aria-hidden="true" />
                    <Dual ar="حفظ" en="Save" />
                  </button>
                  <button type="button" className="btn secondary small" onClick={() => setEditingHead(false)}>
                    <Dual ar="إلغاء" en="Cancel" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1>
                  <Dual ar={lesson?.title_ar ?? "الدرس"} en={lesson?.title_en ?? "Lesson"} />
                </h1>
                <div className="chips">
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
                      <SubjectIcon subject={lesson.subject} size={14} />
                      <Dual ar={SUBJECTS.find((s) => s.id === lesson.subject)?.ar ?? ""} en={SUBJECTS.find((s) => s.id === lesson.subject)?.en ?? ""} />
                    </span>
                  ) : null}
                  {lesson ? (
                    <span className="chip">
                      <Dual ar={`${lesson.steps.length} خطوات`} en={`${lesson.steps.length} steps`} />
                    </span>
                  ) : null}
                  <span className="chip">
                    <Users size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                    <Dual ar={`${studentIds.length} طالب`} en={`${studentIds.length} students`} />
                  </span>
                  {lesson ? (
                    <button type="button" className="link-btn" onClick={() => setEditingHead(true)}>
                      <Pencil size={14} strokeWidth={1.75} className="icon" aria-hidden="true" />
                      <Dual ar="تعديل العنوان والمادة" en="Edit title & subject" />
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
          <div className="btn-row">
            {lesson?.status === "published" ? (
              <button type="button" className="btn secondary" onClick={onUnpublish} disabled={busy}>
                <Undo2 size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="إلغاء النشر" en="Unpublish" />
              </button>
            ) : (
              <button type="button" className="btn" onClick={onPublish} disabled={busy}>
                <Send size={20} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                <Dual ar="انشر الدرس" en="Publish lesson" />
              </button>
            )}
            <button type="button" className="btn secondary" onClick={onAssign} disabled={busy}>
              <UserPlus size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="عيّن لطالب التجربة" en="Assign to demo student" />
            </button>
            <button type="button" className="btn ghost" onClick={onDuplicate} disabled={busy}>
              <Copy size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="تكرار" en="Duplicate" />
            </button>
            <button type="button" className="btn ghost" onClick={onDelete} disabled={busy}>
              <Trash2 size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="أرشفة / حذف" en="Archive / delete" />
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
                <div className="page-head" style={{ marginBottom: 0, paddingBottom: "var(--s-3)" }}>
                  <h2>
                    <Dual ar="خطوات الدرس" en="Lesson steps" />
                  </h2>
                  <button type="button" className="btn secondary small" onClick={() => setAddingStep((value) => !value)}>
                    <Plus size={16} strokeWidth={1.75} className="icon" aria-hidden="true" />
                    <Dual ar="أضف خطوة" en="Add step" />
                  </button>
                </div>

                {lesson.steps.length === 0 ? (
                  <div className="empty">
                    <BookOpen size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
                    <Dual as="p" ar="لا توجد خطوات بعد. أضف أول خطوة." en="No steps yet. Add the first one." />
                  </div>
                ) : (
                  <div className="panel" style={{ paddingBlock: 0 }}>
                    <ol className="step-outline">
                      {lesson.steps.map((step, stepIndex) => (
                        <li key={step.id}>
                          <div className="outline-row">
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
                            <div className="outline-actions">
                              <button
                                type="button"
                                className="icon-btn"
                                disabled={stepIndex === 0 || busy}
                                onClick={() => onMoveStep(step.id, -1)}
                                aria-label={pick(lang, "حرّك للأعلى", "Move up")}
                                title={pick(lang, "حرّك للأعلى", "Move up")}
                              >
                                <ArrowUp size={16} strokeWidth={1.75} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="icon-btn"
                                disabled={stepIndex === lesson.steps.length - 1 || busy}
                                onClick={() => onMoveStep(step.id, 1)}
                                aria-label={pick(lang, "حرّك للأسفل", "Move down")}
                                title={pick(lang, "حرّك للأسفل", "Move down")}
                              >
                                <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="icon-btn"
                                disabled={busy}
                                onClick={() => onRemoveStep(step.id)}
                                aria-label={pick(lang, "احذف الخطوة", "Delete step")}
                                title={pick(lang, "احذف الخطوة", "Delete step")}
                              >
                                <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>

              {addingStep ? (
                <section className="panel stack-sm" aria-labelledby="add-step-title">
                  <h2 id="add-step-title">
                    <Dual ar="خطوة جديدة" en="New step" />
                  </h2>

                  <fieldset className="field">
                    <Dual as="span" className="field-label" ar="نوع الخطوة" en="Step type" />
                    <div className="subject-filter" role="radiogroup">
                      {AUTHORABLE_TYPES.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          aria-pressed={stepType === item.type}
                          onClick={() => setStepType(item.type)}
                        >
                          {STEP_ICON[item.type] ?? GAME_ICON}
                          <Dual ar={item.ar} en={item.en} />
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="field">
                    <Dual as="span" className="field-label" ar="عنوان الخطوة" en="Step title" />
                    <input value={stepTitle} onChange={(event) => setStepTitle(event.target.value)} dir="auto" maxLength={80} />
                  </label>

                  {(stepType === "explain" || stepType === "esl_term") && (
                    <label className="field">
                      <Dual as="span" className="field-label" ar="النص" en="Body text" />
                      <input
                        value={stepDraft.body_ar ?? ""}
                        onChange={(event) => setStepDraft((draft) => ({ ...draft, body_ar: event.target.value }))}
                        dir="auto"
                      />
                    </label>
                  )}

                  {stepType === "sign_check" && (
                    <label className="field">
                      <Dual as="span" className="field-label" ar="الكلمة المستهدفة بالإشارة" en="Target sign word" />
                      <input
                        value={stepDraft.sign_target ?? ""}
                        onChange={(event) => setStepDraft((draft) => ({ ...draft, sign_target: event.target.value }))}
                        dir="auto"
                      />
                    </label>
                  )}

                  {stepType === "quiz" && (
                    <div className="stack-sm">
                      <label className="field">
                        <Dual as="span" className="field-label" ar="السؤال" en="Question" />
                        <input
                          value={stepDraft.prompt_ar ?? ""}
                          onChange={(event) => setStepDraft((draft) => ({ ...draft, prompt_ar: event.target.value }))}
                          dir="auto"
                        />
                      </label>
                      {[1, 2, 3, 4].map((n) => (
                        <label className="field" key={n}>
                          <Dual as="span" className="field-label" ar={`خيار ${n}`} en={`Option ${n}`} />
                          <input
                            value={stepDraft[`option_${n}`] ?? ""}
                            onChange={(event) => setStepDraft((draft) => ({ ...draft, [`option_${n}`]: event.target.value }))}
                            dir="auto"
                          />
                        </label>
                      ))}
                      <label className="field">
                        <Dual as="span" className="field-label" ar="رقم الإجابة الصحيحة (0 يعني الخيار الأول)" en="Correct option index (0 = first)" />
                        <input
                          value={stepDraft.correct_index ?? "0"}
                          onChange={(event) => setStepDraft((draft) => ({ ...draft, correct_index: event.target.value }))}
                          inputMode="numeric"
                        />
                      </label>
                    </div>
                  )}

                  {(stepType === "simulate" || stepType === "challenge") && (
                    <div className="stack-sm">
                      <label className="field">
                        <Dual as="span" className="field-label" ar="القوة الابتدائية F" en="Initial force F" />
                        <input
                          value={stepDraft.force ?? "10"}
                          onChange={(event) => setStepDraft((draft) => ({ ...draft, force: event.target.value }))}
                          inputMode="decimal"
                        />
                      </label>
                      <label className="field">
                        <Dual as="span" className="field-label" ar="الكتلة الابتدائية m" en="Initial mass m" />
                        <input
                          value={stepDraft.mass ?? "2"}
                          onChange={(event) => setStepDraft((draft) => ({ ...draft, mass: event.target.value }))}
                          inputMode="decimal"
                        />
                      </label>
                      {stepType === "challenge" ? (
                        <>
                          <label className="field">
                            <Dual as="span" className="field-label" ar="هدف التسارع a" en="Target acceleration a" />
                            <input
                              value={stepDraft.goal_value ?? "5"}
                              onChange={(event) => setStepDraft((draft) => ({ ...draft, goal_value: event.target.value }))}
                              inputMode="decimal"
                            />
                          </label>
                          <label className="field">
                            <Dual as="span" className="field-label" ar="هامش القبول" en="Tolerance" />
                            <input
                              value={stepDraft.goal_tolerance ?? "0.5"}
                              onChange={(event) => setStepDraft((draft) => ({ ...draft, goal_tolerance: event.target.value }))}
                              inputMode="decimal"
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                  )}

                  <div className="btn-row">
                    <button type="button" className="btn" onClick={onAddStep} disabled={busy || !stepTitle.trim()}>
                      <Save size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                      <Dual ar="أضف الخطوة" en="Add the step" />
                    </button>
                    <button type="button" className="btn secondary" onClick={() => setAddingStep(false)}>
                      <Dual ar="إلغاء" en="Cancel" />
                    </button>
                  </div>
                </section>
              ) : null}

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
