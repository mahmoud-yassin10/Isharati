"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Minus, Plus, RotateCcw, Target } from "lucide-react";
import { Dual } from "@/components/Dual";
import { useA11y } from "@/lib/a11y";
import { pick, useLang } from "@/lib/lang";
import { newtonAccel, withinGoal } from "@/lib/physics";

type Snapshot = { F: number; m: number; a: number };

type NewtonLabProps = {
  initialForce?: number;
  initialMass?: number;
  challenge?: { value: number; tolerance: number };
  /** Hides the graph. Used where the lab is a preview next to other content. */
  compact?: boolean;
  onSnapshot?: (snapshot: Snapshot) => void;
  onChallengeMet?: (snapshot: Snapshot) => void;
};

const MAX_F = 20;
const MIN_F = 1;
const MAX_M = 10;
const MIN_M = 0.5;
const MAX_A = 12;

/* graph plot area */
const GX0 = 44;
const GX1 = 288;
const GY0 = 172;
const GY1 = 22;
const gx = (f: number) => GX0 + (Math.min(f, MAX_F) / MAX_F) * (GX1 - GX0);
const gy = (a: number) => GY0 - (Math.min(a, MAX_A) / MAX_A) * (GY0 - GY1);

export function NewtonLab({
  initialForce = 10,
  initialMass = 2,
  challenge,
  compact = false,
  onSnapshot,
  onChallengeMet,
}: NewtonLabProps) {
  const { lang } = useLang();
  const { reduceMotion: preferStill } = useA11y();
  const [force, setForce] = useState(initialForce);
  const [mass, setMass] = useState(initialMass);
  const [reduced, setReduced] = useState(false);
  const [met, setMet] = useState(false);
  const uid = useId().replace(/:/g, "");
  const trackRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ x: 16, v: 0, F: initialForce, m: initialMass });
  const lastRef = useRef<number | null>(null);
  const metOnce = useRef(false);
  const onSnapshotRef = useRef(onSnapshot);
  const onChallengeMetRef = useRef(onChallengeMet);
  onSnapshotRef.current = onSnapshot;
  onChallengeMetRef.current = onChallengeMet;

  const accel = newtonAccel(force, mass);
  const goalValue = challenge?.value;
  const goalTolerance = challenge?.tolerance;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches || preferStill);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [preferStill]);

  useEffect(() => {
    stateRef.current.F = force;
    stateRef.current.m = mass;
    const snapshot: Snapshot = { F: force, m: mass, a: accel };
    onSnapshotRef.current?.(snapshot);
    if (goalValue != null && goalTolerance != null) {
      if (withinGoal(accel, goalValue, goalTolerance)) {
        if (!metOnce.current) {
          metOnce.current = true;
          setMet(true);
          onChallengeMetRef.current?.(snapshot);
        }
      } else {
        metOnce.current = false;
        setMet(false);
      }
    }
  }, [force, mass, accel, goalValue, goalTolerance]);

  useEffect(() => {
    if (reduced) return;

    let frame = 0;
    const tick = (now: number) => {
      const last = lastRef.current ?? now;
      const dt = Math.min((now - last) / 1000, 0.05);
      lastRef.current = now;
      const track = trackRef.current;
      const cart = cartRef.current;
      if (track && cart) {
        const max = Math.max(track.clientWidth - cart.offsetWidth - 8, 8);
        const a = newtonAccel(stateRef.current.F, stateRef.current.m);
        stateRef.current.v += a * dt;
        stateRef.current.x += stateRef.current.v * dt * 28;
        if (stateRef.current.x < 8) {
          stateRef.current.x = 8;
          stateRef.current.v = 0;
        }
        if (stateRef.current.x > max) {
          stateRef.current.x = max;
          stateRef.current.v = 0;
        }
        cart.style.transform = `translateX(${stateRef.current.x}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  function resetMotion() {
    stateRef.current.x = 16;
    stateRef.current.v = 0;
    lastRef.current = null;
    if (cartRef.current) cartRef.current.style.transform = "translateX(16px)";
  }

  const clampF = (value: number) => Math.min(MAX_F, Math.max(MIN_F, Math.round(value * 10) / 10));
  const clampM = (value: number) => Math.min(MAX_M, Math.max(MIN_M, Math.round(value * 10) / 10));

  const arrowWidth = 20 + (force / MAX_F) * 70;
  const boxWidth = 52 + (mass / MAX_M) * 40;
  const boxHeight = 40 + (mass / MAX_M) * 30;
  const accelWidth = 18 + (Math.min(accel, MAX_A) / MAX_A) * 54;

  const slider = (
    kind: "force" | "mass",
    value: number,
    setValue: (fn: (v: number) => number) => void,
    set: (v: number) => void,
  ) => {
    const isForce = kind === "force";
    const min = isForce ? MIN_F : MIN_M;
    const max = isForce ? MAX_F : MAX_M;
    const stepBy = isForce ? 1 : 0.5;
    const clamp = isForce ? clampF : clampM;
    const id = `lab-${kind}-${uid}`;
    return (
      <div className={`lab-control ${kind}`}>
        <label className="lab-control-label" htmlFor={id}>
          <span className="sym" lang="en">
            {isForce ? "F" : "m"}
          </span>
          <Dual ar={isForce ? "القوة" : "الكتلة"} en={isForce ? "Force" : "Mass"} />
          <output className="lab-control-value mono" htmlFor={id} lang="en">
            {value.toFixed(1)} {isForce ? "N" : "kg"}
          </output>
        </label>
        <div className="lab-control-row">
          <button
            type="button"
            className="step-btn"
            onClick={() => setValue((v) => clamp(v - stepBy))}
            aria-label={pick(lang, isForce ? "أنقص القوة" : "أنقص الكتلة", isForce ? "Decrease force" : "Decrease mass")}
          >
            <Minus size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={0.1}
            value={value}
            onChange={(event) => set(Number(event.target.value))}
            aria-valuetext={`${value.toFixed(1)} ${pick(lang, isForce ? "نيوتن" : "كيلوغرام", isForce ? "newtons" : "kilograms")}`}
            style={{ ["--fill" as string]: `${((value - min) / (max - min)) * 100}%` }}
          />
          <button
            type="button"
            className="step-btn"
            onClick={() => setValue((v) => clamp(v + stepBy))}
            aria-label={pick(lang, isForce ? "زد القوة" : "زد الكتلة", isForce ? "Increase force" : "Increase mass")}
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className={compact ? "lab compact" : "lab"} aria-label={pick(lang, "مختبر قانون نيوتن الثاني", "Newton's second law lab")}>
      <div className="lab-body">
      <div className="lab-main">
        <div className="equation" aria-live="polite">
          <p className="sr-only">
            {pick(
              lang,
              `التسارع ${accel.toFixed(2)} يساوي القوة ${force.toFixed(1)} مقسومة على الكتلة ${mass.toFixed(1)}`,
              `Acceleration ${accel.toFixed(2)} equals force ${force.toFixed(1)} divided by mass ${mass.toFixed(1)}`,
            )}
          </p>
          <div className="eq-row" aria-hidden="true">
            <span className="eq-term accel">
              <span className="eq-sym">a</span>
              <span className="eq-val mono">{accel.toFixed(2)}</span>
              <span className="eq-unit">m/s²</span>
              <Dual as="span" className="eq-name" ar="التسارع" en="acceleration" />
            </span>
            <span className="eq-op">=</span>
            <span className="eq-term force">
              <span className="eq-sym">F</span>
              <span className="eq-val mono">{force.toFixed(1)}</span>
              <span className="eq-unit">N</span>
              <Dual as="span" className="eq-name" ar="القوة" en="force" />
            </span>
            <span className="eq-op">÷</span>
            <span className="eq-term mass">
              <span className="eq-sym">m</span>
              <span className="eq-val mono">{mass.toFixed(1)}</span>
              <span className="eq-unit">kg</span>
              <Dual as="span" className="eq-name" ar="الكتلة" en="mass" />
            </span>
          </div>
          {challenge ? (
            <p className={met ? "lab-goal met" : "lab-goal"}>
              {met ? (
                <Check size={16} strokeWidth={2.5} className="icon" aria-hidden="true" />
              ) : (
                <Target size={16} strokeWidth={2} className="icon" aria-hidden="true" />
              )}
              <Dual
                ar={met ? `وصلت إلى الهدف: a ≈ ${challenge.value}` : `الهدف: اجعل a ≈ ${challenge.value}`}
                en={met ? `Goal reached: a ≈ ${challenge.value}` : `Goal: make a ≈ ${challenge.value}`}
              />
            </p>
          ) : null}
        </div>

        <div className="track" ref={trackRef}>
          {reduced ? (
            <span className="speed-tag">
              <Dual ar="الحركة متوقفة. الأرقام تعمل." en="Motion is off. The numbers still work." />
            </span>
          ) : null}
          <div ref={cartRef} className="cart" style={reduced ? { transform: "translateX(16px)" } : undefined}>
            <span className="push-arrow" style={{ width: `${arrowWidth}px` }} aria-hidden="true">
              <span className="arrow-tag">F</span>
            </span>
            <span className="mass-box" style={{ width: `${boxWidth}px`, height: `${boxHeight}px` }}>
              <span className="mono">m</span>
            </span>
            <span className="accel-arrow" style={{ width: `${accelWidth}px` }} aria-hidden="true">
              <span className="arrow-tag">a</span>
            </span>
          </div>
        </div>

        <div className="lab-controls">
          {slider("force", force, setForce, setForce)}
          {slider("mass", mass, setMass, setMass)}
        </div>
      </div>

      <div className="lab-side">
        {!compact ? (
          <figure className="graph">
            <Dual
              as="figcaption"
              ar="كلما زادت القوة زاد التسارع. الكتلة الأكبر تجعل الخط أقل ميلاً."
              en="More force, more acceleration. More mass makes the line flatter."
            />
            <svg
              viewBox="0 0 300 200"
              role="img"
              aria-label={pick(
                lang,
                `رسم القوة والتسارع. التسارع الحالي ${accel.toFixed(2)} متر لكل ثانية مربعة`,
                `Force against acceleration. Current a is ${accel.toFixed(2)} meters per second squared`,
              )}
            >
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <line key={f} className="grid-line" x1={GX0} y1={GY0 - f * (GY0 - GY1)} x2={GX1} y2={GY0 - f * (GY0 - GY1)} />
              ))}
              <line className="axis" x1={GX0} y1={GY0} x2={GX1} y2={GY0} />
              <line className="axis" x1={GX0} y1={GY0} x2={GX0} y2={GY1} />
              <text x={GX0 - 8} y={GY0 + 5} textAnchor="end">
                0
              </text>
              <text x={GX0 - 8} y={GY1 + 10} textAnchor="end">
                {MAX_A}
              </text>
              <text x={GX1} y={GY0 + 18} textAnchor="end">
                {MAX_F} N
              </text>
              <text className="axis-label force" x={GX1} y={GY0 - 8} textAnchor="end">
                F
              </text>
              <text className="axis-label accel" x={GX0 + 8} y={GY1 + 4} textAnchor="start">
                a
              </text>
              {goalValue != null ? (
                <>
                  <line className="goal-line" x1={GX0} y1={gy(goalValue)} x2={GX1} y2={gy(goalValue)} />
                  <text x={GX1 - 2} y={gy(goalValue) - 6} textAnchor="end" className="goal-text">
                    {pick(lang, "الهدف", "goal")} {goalValue}
                  </text>
                </>
              ) : null}
              <line className="trend" x1={GX0} y1={GY0} x2={gx(MAX_F)} y2={gy(newtonAccel(MAX_F, mass))} />
              <circle className="now" cx={gx(force)} cy={gy(accel)} r="6" />
            </svg>
          </figure>
        ) : null}
        <button type="button" className="link-btn" onClick={resetMotion}>
          <RotateCcw size={15} strokeWidth={2} aria-hidden="true" />
          <Dual ar="أعد الصندوق إلى البداية" en="Put the box back" />
        </button>
      </div>
      </div>
    </section>
  );
}
