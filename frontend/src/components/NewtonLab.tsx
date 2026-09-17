"use client";

import { useEffect, useRef, useState } from "react";
import { Dual } from "@/components/Dual";
import { useA11y } from "@/lib/a11y";
import { pick, useLang } from "@/lib/lang";
import { newtonAccel, withinGoal } from "@/lib/physics";

type Snapshot = { F: number; m: number; a: number };

type NewtonLabProps = {
  initialForce?: number;
  initialMass?: number;
  challenge?: { value: number; tolerance: number };
  onSnapshot?: (snapshot: Snapshot) => void;
  onChallengeMet?: (snapshot: Snapshot) => void;
};

export function NewtonLab({
  initialForce = 10,
  initialMass = 2,
  challenge,
  onSnapshot,
  onChallengeMet,
}: NewtonLabProps) {
  const { lang } = useLang();
  const { reduceMotion: preferStill } = useA11y();
  const [force, setForce] = useState(initialForce);
  const [mass, setMass] = useState(initialMass);
  const [reduced, setReduced] = useState(false);
  const [met, setMet] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ x: 40, v: 0, F: initialForce, m: initialMass });
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
      const box = boxRef.current;
      if (track && box) {
        const max = Math.max(track.clientWidth - box.offsetWidth - 8, 8);
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
        box.style.transform = `translateX(${stateRef.current.x}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  function resetMotion() {
    stateRef.current.x = 40;
    stateRef.current.v = 0;
    lastRef.current = null;
    if (boxRef.current) boxRef.current.style.transform = "translateX(40px)";
  }

  const maxF = 20;
  const maxA = 12;
  const lineX2 = 180;
  const lineY2 = 140 - (newtonAccel(maxF, mass) / maxA) * 120;
  const dotX = 20 + (force / maxF) * 160;
  const dotY = 140 - (Math.min(accel, maxA) / maxA) * 120;
  const arrowWidth = 24 + (force / maxF) * 72;

  return (
    <section className="lab" aria-label={pick(lang, "مختبر نيوتن", "Newton lab")}>
      <div className="lab-formula" aria-live="polite">
        <span className="mono">
          a = F / m = {force.toFixed(1)} / {mass.toFixed(1)} ={" "}
          <em>{accel.toFixed(2)}</em> m/s²
        </span>
        {challenge ? (
          <span className={met ? "goal ok" : "goal"}>
            {pick(lang, "الهدف", "Goal")}: a ≈ {challenge.value}
            {met ? pick(lang, " · وصلت", " · done") : ""}
          </span>
        ) : null}
      </div>

      <div className="track-wrap" ref={trackRef}>
        <div className="rail" aria-hidden="true" />
        <div
          className="force-arrow"
          style={{ width: `${arrowWidth}px` }}
          title={pick(lang, "قوة", "Force")}
        >
          <span>
            {pick(lang, "قوة", "Force")} {force.toFixed(1)} N
          </span>
        </div>
        <div
          ref={boxRef}
          className="mass-box"
          style={{
            ...(reduced ? { transform: "translateX(40%)" } : undefined),
            ["--mass-lift" as string]: `${6 + (mass / 10) * 14}px`,
            ["--mass-blur" as string]: `${10 + (mass / 10) * 16}px`,
            ["--mass-opacity" as string]: `${0.14 + (mass / 10) * 0.22}`,
          }}
        >
          {pick(lang, "كتلة", "Mass")}
          <strong className="mono">{mass.toFixed(1)} kg</strong>
        </div>
      </div>

      <div className="lab-controls">
        <label className="slider-field">
          <span>
            <span>
              {pick(lang, "قوة", "Force")} <span className="mono">F</span>
            </span>
            <b className="mono">{force.toFixed(1)} N</b>
          </span>
          <input
            type="range"
            min={1}
            max={20}
            step={0.1}
            value={force}
            onChange={(event) => setForce(Number(event.target.value))}
            aria-valuetext={`${force.toFixed(1)} ${pick(lang, "نيوتن", "newtons")}`}
            style={{ ["--slider-fill" as string]: `${((force - 1) / (20 - 1)) * 100}%` }}
          />
        </label>
        <label className="slider-field">
          <span>
            <span>
              {pick(lang, "كتلة", "Mass")} <span className="mono">m</span>
            </span>
            <b className="mono">{mass.toFixed(1)} kg</b>
          </span>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.1}
            value={mass}
            onChange={(event) => setMass(Number(event.target.value))}
            aria-valuetext={`${mass.toFixed(1)} ${pick(lang, "كيلوغرام", "kilograms")}`}
            style={{ ["--slider-fill" as string]: `${((mass - 0.5) / (10 - 0.5)) * 100}%` }}
          />
        </label>
        <button type="button" className="btn ghost" onClick={resetMotion}>
          <Dual ar="أعد الصندوق" en="Reset" />
        </button>
      </div>

      <figure className="graph">
        <Dual
          as="figcaption"
          ar="F مقابل a. الميل = 1/m"
          en="F versus a. Slope = 1/m"
        />
        <svg viewBox="0 0 200 160" role="img" aria-label={pick(lang, `رسم القوة والتسارع. التسارع الحالي ${accel.toFixed(2)}`, `Force vs acceleration. Current a ${accel.toFixed(2)}`)}>
          <line x1="20" y1="140" x2="190" y2="140" className="axis" />
          <line x1="20" y1="140" x2="20" y2="12" className="axis" />
          <text x="14" y="152" className="axis-tick">
            0
          </text>
          <text x="163" y="152" className="axis-tick">
            {maxF}
          </text>
          <text x="186" y="154" className="axis-label">
            F
          </text>
          <text x="6" y="16" className="axis-label">
            a
          </text>
          <line x1="20" y1="140" x2={lineX2} y2={Math.max(lineY2, 12)} className="trend" />
          <circle cx={dotX} cy={dotY} r="5" className="now">
            {!reduced ? (
              <animate attributeName="r" values="5;6.5;5" dur="1.6s" repeatCount="indefinite" />
            ) : null}
          </circle>
        </svg>
      </figure>
    </section>
  );
}
