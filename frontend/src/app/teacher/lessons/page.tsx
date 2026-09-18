"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Archive,
  BookOpen,
  Check,
  Copy,
  Eye,
  FileEdit,
  Search,
  Send,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CreateLessonButton } from "@/components/CreateLessonButton";
import { Dual } from "@/components/Dual";
import { GAME_TYPES } from "@/components/games/GameStep";
import { OverflowMenu, OverflowMenuItem } from "@/components/OverflowMenu";
import { ForwardIcon, LoadingBlock } from "@/components/ui";
import {
  deleteLesson,
  duplicateLesson,
  listLessons,
  publishLesson,
  unpublishLesson,
} from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { loadLessonCompletion, type LessonCompletion } from "@/lib/reports";
import { SUBJECTS, SubjectIcon } from "@/lib/subjects";
import { useUser } from "@/lib/useUser";
import type { Lesson, Subject } from "@/lib/types";

type StatusFilter = "all" | "published" | "draft";

function gameCount(lesson: Lesson) {
  return lesson.steps.filter((step) => GAME_TYPES.includes(step.type) || step.type === "challenge").length;
}

function TeacherLessonsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [completion, setCompletion] = useState<Record<string, LessonCompletion>>({});
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<Subject | "all">((params.get("subject") as Subject) || "all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "error"; ar: string; en: string } | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    listLessons()
      .then(async (loaded) => {
        setLessons(loaded);
        setCompletion(await loadLessonCompletion(loaded));
      })
      .catch(() => setError(true));
  }, [ready, user, router, reload]);

  const presentSubjects = useMemo(
    () => SUBJECTS.filter((subject) => lessons?.some((lesson) => lesson.subject === subject.id)),
    [lessons],
  );

  const filtered = useMemo(() => {
    if (!lessons) return [];
    const query = search.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (subjectFilter !== "all" && lesson.subject !== subjectFilter) return false;
      if (statusFilter !== "all" && lesson.status !== statusFilter) return false;
      if (!query) return true;
      return (
        lesson.title_ar.toLowerCase().includes(query) ||
        (lesson.title_en ?? "").toLowerCase().includes(query) ||
        lesson.id.toLowerCase().includes(query)
      );
    });
  }, [lessons, search, subjectFilter, statusFilter]);

  async function onTogglePublish(lesson: Lesson) {
    setBusyId(lesson.id);
    setNote(null);
    try {
      const updated = lesson.status === "published" ? await unpublishLesson(lesson.id) : await publishLesson(lesson.id);
      setLessons((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? current);
    } catch {
      setNote({ kind: "error", ar: "تعذّر تغيير حالة النشر.", en: "Could not change the publish status." });
    } finally {
      setBusyId(null);
    }
  }

  async function onDuplicate(lesson: Lesson) {
    setBusyId(lesson.id);
    setNote(null);
    try {
      await duplicateLesson(lesson.id);
      setReload((value) => value + 1);
      setNote({ kind: "ok", ar: "تم تكرار الدرس كمسودة.", en: "The lesson was duplicated as a draft." });
    } catch {
      setNote({ kind: "error", ar: "تعذّر تكرار الدرس.", en: "Could not duplicate the lesson." });
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(lesson: Lesson) {
    if (lesson.status === "published") {
      setNote({ kind: "error", ar: "أوقف نشر الدرس أولاً قبل حذفه.", en: "Unpublish the lesson before deleting it." });
      return;
    }
    if (!window.confirm(pick(lang, `حذف "${lesson.title_ar}"؟ لا يمكن التراجع.`, `Delete "${lesson.title_en ?? lesson.title_ar}"? This cannot be undone.`))) {
      return;
    }
    setBusyId(lesson.id);
    setNote(null);
    try {
      await deleteLesson(lesson.id);
      setLessons((current) => current?.filter((item) => item.id !== lesson.id) ?? current);
    } catch {
      setNote({ kind: "error", ar: "تعذّر حذف الدرس.", en: "Could not delete the lesson." });
    } finally {
      setBusyId(null);
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
        <div className="page-head">
          <div className="titles">
            <h1>
              <Dual ar="الدروس" en="Lessons" />
            </h1>
            <Dual
              as="p"
              className="muted"
              ar="ابحث، رتّب حسب المادة أو الحالة، ثم عدّل أي درس أو انشره."
              en="Search, filter by subject or status, then edit or publish any lesson."
            />
          </div>
          <CreateLessonButton className="btn">
            <Dual ar="إنشاء درس" en="Create lesson" />
          </CreateLessonButton>
        </div>

        <label className="field search-field">
          <span className="sr-only">
            <Dual ar="ابحث عن درس" en="Search lessons" />
          </span>
          <Search size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={pick(lang, "ابحث بالعنوان…", "Search by title…")}
            dir="auto"
          />
        </label>

        {lessons && lessons.length > 0 ? (
          <div className="filter-row">
            <div className="subject-filter" role="group" aria-label={pick(lang, "المواد", "Subjects")}>
              <button type="button" aria-pressed={subjectFilter === "all"} onClick={() => setSubjectFilter("all")}>
                <BookOpen size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="كل المواد" en="All subjects" />
                <span className="count mono">{lessons.length}</span>
              </button>
              {presentSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  aria-pressed={subjectFilter === subject.id}
                  onClick={() => setSubjectFilter(subject.id)}
                >
                  <SubjectIcon subject={subject.id} size={18} />
                  <Dual ar={subject.ar} en={subject.en} />
                  <span className="count mono">{lessons.filter((lesson) => lesson.subject === subject.id).length}</span>
                </button>
              ))}
            </div>

            <div className="subject-filter" role="group" aria-label={pick(lang, "الحالة", "Status")}>
              <button type="button" aria-pressed={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                <Dual ar="الكل" en="All" />
              </button>
              <button type="button" aria-pressed={statusFilter === "published"} onClick={() => setStatusFilter("published")}>
                <Check size={16} strokeWidth={2.5} className="icon" aria-hidden="true" />
                <Dual ar="منشور" en="Published" />
              </button>
              <button type="button" aria-pressed={statusFilter === "draft"} onClick={() => setStatusFilter("draft")}>
                <FileEdit size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                <Dual ar="مسودة" en="Draft" />
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل الدروس. حدّث الصفحة." en="Could not load the lessons. Refresh the page." />
          </p>
        ) : null}

        {note ? (
          <p className={`feedback ${note.kind}`} role="status">
            {note.kind === "ok" ? (
              <Check size={20} strokeWidth={2.5} className="icon" aria-hidden="true" />
            ) : (
              <TriangleAlert size={20} strokeWidth={2} className="icon" aria-hidden="true" />
            )}
            <Dual ar={note.ar} en={note.en} />
          </p>
        ) : null}

        {lessons === null && !error ? <LoadingBlock rows={3} height={96} /> : null}

        {lessons?.length === 0 ? (
          <div className="empty">
            <BookOpen size={40} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="لا توجد دروس بعد." en="No lessons yet." />
          </div>
        ) : null}

        {lessons && lessons.length > 0 && filtered.length === 0 ? (
          <div className="empty">
            <Search size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="لا نتائج مطابقة." en="No matching lessons." />
          </div>
        ) : null}

        {filtered.length > 0 ? (
          <ul className="lesson-list">
            {filtered.map((lesson) => {
              const stat = completion[lesson.id];
              const games = gameCount(lesson);
              const isBusy = busyId === lesson.id;
              return (
                <li className="lesson-item rich" key={lesson.id}>
                  <span className={`subject-icon subj-${lesson.subject}`} aria-hidden="true">
                    <SubjectIcon subject={lesson.subject} size={22} />
                  </span>
                  <div className="meta">
                    <h3>
                      <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                    </h3>
                    <div className="chips">
                      {lesson.status === "published" ? (
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
                      <span className="chip">
                        <Dual ar={`${lesson.steps.length} خطوات`} en={`${lesson.steps.length} steps`} />
                      </span>
                      <span className="chip">
                        <Dual ar={`${games} ألعاب`} en={`${games} games`} />
                      </span>
                      {stat && stat.studentCount > 0 ? (
                        <span className="chip">
                          <Dual
                            ar={`${stat.completedCount} من ${stat.studentCount} أكمل`}
                            en={`${stat.completedCount} of ${stat.studentCount} completed`}
                          />
                        </span>
                      ) : null}
                    </div>
                    {stat && stat.studentCount > 0 ? (
                      <div className="progress compact">
                        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stat.avgMastery}>
                          <div className="progress-fill" style={{ width: `${stat.avgMastery}%` }} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="lesson-actions">
                    <a className="btn secondary" href={`/teacher/lessons/${lesson.id}`}>
                      <Dual ar="تعديل الدرس" en="Edit lesson" />
                      <ForwardIcon />
                    </a>
                    <OverflowMenu label={pick(lang, "المزيد من الإجراءات", "More actions")}>
                      <OverflowMenuItem onClick={() => router.push(`/teacher/lessons/${lesson.id}`)}>
                        <Eye size={16} strokeWidth={1.75} className="icon" aria-hidden="true" />
                        <Dual ar="معاينة" en="Preview" />
                      </OverflowMenuItem>
                      <OverflowMenuItem onClick={() => onTogglePublish(lesson)} disabled={isBusy}>
                        {lesson.status === "published" ? (
                          <>
                            <Undo2 size={16} strokeWidth={1.75} className="icon" aria-hidden="true" />
                            <Dual ar="إلغاء النشر" en="Unpublish" />
                          </>
                        ) : (
                          <>
                            <Send size={16} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                            <Dual ar="نشر" en="Publish" />
                          </>
                        )}
                      </OverflowMenuItem>
                      <OverflowMenuItem onClick={() => onDuplicate(lesson)} disabled={isBusy}>
                        <Copy size={16} strokeWidth={1.75} className="icon" aria-hidden="true" />
                        <Dual ar="تكرار" en="Duplicate" />
                      </OverflowMenuItem>
                      <OverflowMenuItem onClick={() => onDelete(lesson)} disabled={isBusy} danger>
                        <Archive size={16} strokeWidth={1.75} className="icon" aria-hidden="true" />
                        <Dual ar="أرشفة / حذف" en="Archive / delete" />
                      </OverflowMenuItem>
                    </OverflowMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </AppShell>
  );
}

export default function TeacherLessonsPage() {
  return (
    <Suspense
      fallback={
        <AppShell user={null}>
          <div className="wrap page">
            <LoadingBlock rows={2} />
          </div>
        </AppShell>
      }
    >
      <TeacherLessonsInner />
    </Suspense>
  );
}
