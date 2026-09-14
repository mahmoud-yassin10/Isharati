"use client";

import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { NewtonLab } from "@/components/NewtonLab";

export default function HomePage() {
  return (
    <AppShell user={null}>
      <div className="landing">
        <section className="landing-copy">
          <h1>
            <Dual ar="رقيب" en="Raqeeb" />
          </h1>
          <Dual
            as="p"
            ar="غيّر القوة. غيّر الكتلة. انظر لماذا يتغيّر التسارع. الإشارة تظهر تلقائياً مع كل كلمة."
            en="Change force. Change mass. See why acceleration changes. The sign plays by itself with each word."
          />
          <div className="role-actions">
            <a className="btn" href="/login?role=teacher">
              <Dual ar="ادخل كمعلم" en="Enter as teacher" />
            </a>
            <a className="btn ghost" href="/login?role=student">
              <Dual ar="ادخل كطالب" en="Enter as student" />
            </a>
          </div>
        </section>
        <NewtonLab />
      </div>
    </AppShell>
  );
}
