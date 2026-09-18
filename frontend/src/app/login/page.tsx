"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, GraduationCap, Hand, Info, TriangleAlert, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { ForwardIcon } from "@/components/ui";
import { login } from "@/lib/api";
import type { Role } from "@/lib/types";

const DEMOS: Record<Role, { email: string; password: string }> = {
  teacher: { email: "teacher@raqeeb.local", password: "raqeeb-demo" },
  student: { email: "student@raqeeb.local", password: "raqeeb-demo" },
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const hint = params.get("role");
  const initialRole: Role = hint === "teacher" ? "teacher" : "student";
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState(DEMOS[initialRole].email);
  const [password, setPassword] = useState(DEMOS[initialRole].password);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  function pickRole(next: Role) {
    setRole(next);
    setEmail(DEMOS[next].email);
    setPassword(DEMOS[next].password);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const user = await login(email, password);
      router.push(user.role === "teacher" ? "/teacher" : "/student");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={null} bare>
      <div className="auth">
        <aside className="auth-aside">
          <h2>
            <Dual ar="رقيب يشرح بالإشارة أولاً" en="Raqeeb explains in sign first" />
          </h2>
          <Dual
            as="p"
            className="muted prose"
            ar="ادخل بحسابك المدرسي لتكمل دروسك، أو استخدم حساب التجربة الجاهز بالأسفل."
            en="Log in with your school account to continue your lessons, or use the ready demo account below."
          />
          <div className="sign-preview">
            <Hand size={64} strokeWidth={1.25} aria-hidden="true" />
            <Dual as="p" ar="كل مصطلح له فيديو إشارة" en="Every term has a sign video" />
          </div>
        </aside>

        <div className="auth-main">
          <form className="auth-form" onSubmit={onSubmit}>
            <div className="stack-sm">
              <h1>
                <Dual ar="تسجيل الدخول" en="Log in" />
              </h1>
              <Dual as="p" className="muted" ar="اختر نوع الحساب أولاً." en="Choose the account type first." />
            </div>

            <fieldset className="role-picker">
              <legend className="sr-only">
                <Dual ar="نوع الحساب" en="Account type" />
              </legend>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={() => pickRole("student")}
                />
                <Check size={20} strokeWidth={2.5} className="check" aria-hidden="true" />
                <GraduationCap size={28} strokeWidth={1.75} aria-hidden="true" />
                <Dual ar="طالب" en="Student" />
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={role === "teacher"}
                  onChange={() => pickRole("teacher")}
                />
                <Check size={20} strokeWidth={2.5} className="check" aria-hidden="true" />
                <Users size={28} strokeWidth={1.75} aria-hidden="true" />
                <Dual ar="معلم" en="Teacher" />
              </label>
            </fieldset>

            <label className="field">
              <Dual ar="البريد الإلكتروني" en="Email" />
              <input
                type="email"
                autoComplete="username"
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <Dual ar="كلمة المرور" en="Password" />
              <input
                type="password"
                autoComplete="current-password"
                dir="ltr"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error ? (
              <p className="feedback error" role="status">
                <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
                <Dual ar="البريد أو كلمة المرور غير صحيحة." en="The email or password is wrong." />
              </p>
            ) : null}

            <button className="btn large block" type="submit" disabled={busy}>
              <Dual ar={busy ? "جارٍ الدخول…" : "دخول"} en={busy ? "Signing in…" : "Log in"} />
              {!busy ? <ForwardIcon size={22} /> : null}
            </button>

            <p className="demo-note">
              <Info size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual
                ar="حساب التجربة مكتوب بالأعلى تلقائياً. كلمة المرور: raqeeb-demo"
                en="The demo account is filled in for you. Password: raqeeb-demo"
              />
            </p>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="wrap page">
          <Dual as="p" ar="جارٍ التحميل…" en="Loading…" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
