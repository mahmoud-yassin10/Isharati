"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { login } from "@/lib/api";

const DEMOS = {
  teacher: { email: "teacher@raqeeb.local", password: "raqeeb-demo" },
  student: { email: "student@raqeeb.local", password: "raqeeb-demo" },
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const roleHint = params.get("role");
  const preset = roleHint === "teacher" || roleHint === "student" ? DEMOS[roleHint] : null;
  const [email, setEmail] = useState(preset?.email ?? "");
  const [password, setPassword] = useState(preset?.password ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const heading = useMemo(() => {
    if (roleHint === "teacher") return { ar: "دخول المعلم", en: "Teacher login" };
    if (roleHint === "student") return { ar: "دخول الطالب", en: "Student login" };
    return { ar: "دخول", en: "Log in" };
  }, [roleHint]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      router.push(user.role === "teacher" ? "/teacher" : "/student");
    } catch {
      setError("البريد أو كلمة المرور غير صحيحة.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={null}>
      <div className="login-page">
        <div className="stack">
        <h1>
          <Dual ar={heading.ar} en={heading.en} />
        </h1>
        <Dual
          as="p"
          className="hint"
          ar="للتجربة استخدم الأزرار بالأسفل. كلمة المرور: raqeeb-demo"
          en="For the demo, use the buttons below. Password: raqeeb-demo"
        />
        <div className="demo-fill">
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setEmail(DEMOS.teacher.email);
              setPassword(DEMOS.teacher.password);
            }}
          >
            <Dual ar="املأ حساب المعلم" en="Fill teacher account" />
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setEmail(DEMOS.student.email);
              setPassword(DEMOS.student.password);
            }}
          >
            <Dual ar="املأ حساب الطالب" en="Fill student account" />
          </button>
        </div>
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <Dual ar="البريد" en="Email" />
            <input
              type="email"
              autoComplete="username"
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? (
            <Dual as="p" className="error" ar={error} en="Email or password is wrong." />
          ) : null}
          <button className="btn" type="submit" disabled={busy}>
            <Dual ar={busy ? "جارٍ الدخول…" : "دخول"} en={busy ? "Signing in…" : "Log in"} />
          </button>
        </form>
        </div>
      </div>
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Dual ar="جارٍ التحميل…" en="Loading…" as="p" />}>
      <LoginForm />
    </Suspense>
  );
}
