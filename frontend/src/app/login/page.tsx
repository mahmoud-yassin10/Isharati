"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BrandLockup } from "@/components/Brand";
import { Dual } from "@/components/Dual";
import { login } from "@/lib/api";
import { BRAND } from "@/lib/brand";
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
      <div className="wrap auth">
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-brand">
            <BrandLockup height={88} />
          </div>
          <h1>
            <Dual ar="تسجيل الدخول" en="Log in" />
          </h1>

          <fieldset className="role-switch">
            <Dual as="span" className="field-label" ar="أدخل بصفتي" en="I am a" />
            <div className="segmented wide">
              <label>
                <input type="radio" name="role" value="student" checked={role === "student"} onChange={() => pickRole("student")} />
                <Dual ar="طالب" en="Student" />
              </label>
              <label>
                <input type="radio" name="role" value="teacher" checked={role === "teacher"} onChange={() => pickRole("teacher")} />
                <Dual ar="معلم" en="Teacher" />
              </label>
            </div>
          </fieldset>

          <label className="field">
            <Dual as="span" className="field-label" ar="البريد الإلكتروني" en="Email" />
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
            <Dual as="span" className="field-label" ar="كلمة المرور" en="Password" />
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
              <TriangleAlert size={20} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual ar="البريد أو كلمة المرور غير صحيحة." en="The email or password is wrong." />
            </p>
          ) : null}

          <button className="btn block" type="submit" disabled={busy}>
            <Dual ar={busy ? "جارٍ الدخول…" : "دخول"} en={busy ? "Signing in…" : "Log in"} />
          </button>

          <Dual
            as="p"
            className="auth-note"
            ar={`للتجربة: الحساب مكتوب بالأعلى، وكلمة المرور raqeeb-demo. ${BRAND.ar} لا يستخدم الصوت في أي شاشة.`}
            en={`To try it: the demo account is filled in, and the password is raqeeb-demo. ${BRAND.en} uses no sound on any screen.`}
          />
        </form>
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
