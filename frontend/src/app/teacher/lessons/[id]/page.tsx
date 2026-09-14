"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { NewtonLab } from "@/components/NewtonLab";
import { assignLesson, getLesson, lessonProgress, publishLesson } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import type { Lesson, ProgressItem } from "@/lib/types";

export default function TeacherLessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useUser();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    getLesson(id).then(setLesson).catch(() => setNote("تعذر فتح الدرس."));
    lessonProgress(id).then(setProgress).catch(() => undefined);
  }, [ready, user, router, id]);

  const simStep = lesson?.steps.find((step) => step.simulation);

  async function onPublish() {
    setBusy(true);
    try {
      const next = await publishLesson(id);
      setLesson(next);
      setNote("نُشر الدرس.");
    } catch {
      setNote("تعذر النشر.");
    } finally {
      setBusy(false);
    }
  }

  async function onAssign() {
    setBusy(true);
    try {
      const result = await assignLesson(id);
      setNote(`عُيّن لطالب التجربة: ${result.student_name}`);
    } catch {
      setNote("تعذر التعيين.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <Dual as="p" ar="جارٍ التحميل…" en="Loading…" />
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="stack">
        <p className="hint">
          <a className="muted-link" href="/teacher">
            <Dual ar="الدروس" en="Lessons" />
          </a>
        </p>
        <h1>
          <Dual ar={lesson?.title_ar ?? "الدرس"} en={lesson?.title_en ?? "Lesson"} />
        </h1>
        <Dual
          as="p"
          className="hint"
          ar={lesson?.status === "published" ? "منشور" : "مسودة"}
          en={lesson?.status === "published" ? "Published" : "Draft"}
        />
        <div className="role-actions">
          <button type="button" className="btn" onClick={onPublish} disabled={busy}>
            <Dual ar="انشر الدرس" en="Publish lesson" />
          </button>
          <button type="button" className="btn ghost" onClick={onAssign} disabled={busy}>
            <Dual ar="عيّن لطالب التجربة" en="Assign to demo student" />
          </button>
        </div>
        {note ? (
          <Dual
            as="p"
            className="hint"
            ar={note}
            en={
              note === "نُشر الدرس."
                ? "Lesson published."
                : note === "تعذر النشر."
                  ? "Could not publish."
                  : note === "تعذر التعيين."
                    ? "Could not assign."
                    : note === "تعذر فتح الدرس."
                      ? "Could not open the lesson."
                      : note.startsWith("عُيّن لطالب التجربة:")
                        ? note.replace("عُيّن لطالب التجربة:", "Assigned to demo student:")
                        : note
            }
          />
        ) : null}

        {simStep?.simulation ? (
          <NewtonLab
            initialForce={simStep.simulation.params.F ?? 10}
            initialMass={simStep.simulation.params.m ?? 2}
            challenge={simStep.simulation.goal}
          />
        ) : null}

        <section>
          <h2>
            <Dual ar="الخطوات" en="Steps" />
          </h2>
          <ol>
            {lesson?.steps.map((step) => (
              <li key={step.id}>
                <Dual ar={step.title_ar} en={step.title_en ?? step.title_ar} />
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2>
            <Dual ar="تقدّم الطلاب" en="Student progress" />
          </h2>
          {progress.length === 0 ? (
            <Dual
              as="p"
              className="hint"
              ar="لا يوجد تقدّم بعد. عيّن الدرس وافتحه من حساب الطالب."
              en="No progress yet. Assign the lesson and open it from the student account."
            />
          ) : (
            <table className="progress-table">
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
                  <th>a</th>
                  <th>
                    <Dual ar="الإشارة" en="Sign" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {progress.map((item) => (
                  <tr key={`${item.student_id}-${item.step_id}`}>
                    <td>{item.student_name}</td>
                    <td>{item.step_id}</td>
                    <td>
                      <span className={`status-dot ${item.status === "done" ? "done" : ""}`} />
                      {item.status === "done" ? (
                        <Dual ar="مكتمل" en="Done" />
                      ) : (
                        item.status
                      )}
                    </td>
                    <td className="mono">{item.sim_snapshot?.a?.toFixed(2) ?? "—"}</td>
                    <td>{item.predicted_sign ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AppShell>
  );
}
