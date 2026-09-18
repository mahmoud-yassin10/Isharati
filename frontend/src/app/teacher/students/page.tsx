"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, TriangleAlert, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { LoadingBlock, ProgressBar } from "@/components/ui";
import { listStudents } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import { useUser } from "@/lib/useUser";
import type { TeacherStudent } from "@/lib/types";

function relativeTime(iso: string | null, lang: "ar" | "en"): string {
  if (!iso) return pick(lang, "لا نشاط بعد", "No activity yet");
  const then = new Date(iso).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (diffMinutes < 1) return pick(lang, "الآن", "Just now");
  if (diffMinutes < 60) return pick(lang, `منذ ${diffMinutes} دقيقة`, `${diffMinutes} min ago`);
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return pick(lang, `منذ ${diffHours} ساعة`, `${diffHours} h ago`);
  const diffDays = Math.round(diffHours / 24);
  return pick(lang, `منذ ${diffDays} يوم`, `${diffDays} d ago`);
}

export default function TeacherStudentsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const { user, ready } = useUser();
  const [students, setStudents] = useState<TeacherStudent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    listStudents()
      .then(setStudents)
      .catch(() => setError(true));
  }, [ready, user, router]);

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
              <Dual ar="الطلاب" en="Students" />
            </h1>
            <Dual
              as="p"
              className="muted"
              ar="كل طالب معيّن له أحد دروسك، مع تقدّمه وآخر نشاط."
              en="Every student assigned one of your lessons, with their progress and last activity."
            />
          </div>
          {students && students.length > 0 ? (
            <div className="chips">
              <span className="chip">
                <Users size={16} strokeWidth={2} className="icon" aria-hidden="true" />
                <Dual ar={`${students.length} طالب`} en={`${students.length} students`} />
              </span>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل الطلاب. حدّث الصفحة." en="Could not load the students. Refresh the page." />
          </p>
        ) : null}

        {students === null && !error ? <LoadingBlock rows={3} height={88} /> : null}

        {students?.length === 0 ? (
          <div className="empty">
            <Users size={40} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="لا يوجد طلاب بعد." en="No students yet." />
            <Dual as="p" className="small" ar="عيّن أحد دروسك لطالب من صفحة الدرس." en="Assign one of your lessons to a student from the lesson page." />
          </div>
        ) : null}

        {students && students.length > 0 ? (
          <ul className="lesson-list">
            {students.map((student) => (
              <li className="lesson-item rich" key={student.id}>
                <span className="avatar" aria-hidden="true">
                  {student.name.trim().charAt(0)}
                </span>
                <div className="meta">
                  <h3>{student.name}</h3>
                  <div className="chips">
                    <span className="chip">
                      <Dual ar={`${student.assigned_count} درس معيّن`} en={`${student.assigned_count} assigned`} />
                    </span>
                    <span className="chip ok">
                      <Dual ar={`${student.completed_count} مكتمل`} en={`${student.completed_count} completed`} />
                    </span>
                    <span className="chip">
                      <Clock size={14} strokeWidth={2} className="icon" aria-hidden="true" />
                      {relativeTime(student.last_activity, lang)}
                    </span>
                  </div>
                  <ProgressBar value={student.completed_count} total={student.assigned_count} compact />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </AppShell>
  );
}
