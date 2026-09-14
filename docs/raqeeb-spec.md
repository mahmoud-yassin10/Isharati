# Raqeeb product spec

Raqeeb converts Egypt’s existing school curriculum into an accessible Egyptian Sign Language lesson with **real interactive simulations**. Teachers author and review. Students learn by watching ESL, manipulating the simulation, and signing back.

This is not a new curriculum. Same academic knowledge, different delivery.

## Locked decisions

| Decision | Value |
|---|---|
| Product name | **Raqeeb** |
| Audiences | Teacher-facing **and** student-facing |
| Visuals | Real simulations the student can drag, slide, and run — not GIFs or static diagrams |
| First subject | Physics, first lesson **Newton’s 2nd law (`F = ma`)** |
| UI language | Arabic, RTL |
| ESL engine | Keep the existing FastAPI backend (Isharati inference). Do not load `.pt` in the browser |
| Sign check v1 | Short recorded clip / upload, not a live WebSocket stream |
| Avatar v1 | Existing skeleton pose video, not a 3D character |
| Physics terms not in the 502-class lexicon | On-screen Arabic + fingerspell via the existing letter signs + teacher-approved glossary clip later |
| Data v1 | SQLite on the API. Postgres only when we host |

Override any of these in chat. Until then, the plan uses this table.

## Problem

Egyptian deaf / hard-of-hearing students largely study the **same** subjects as mainstream students (Arabic, math, English, science, social studies; technical secondary uses the same technical curricula). The barrier is accessibility: teachers who may not know ESL well, manual simplification, missing visual and sign materials.

Concepts like `F = ma` are **relationships**, not three dictionary words. Literal sign translation is not teaching.

Egypt already has curriculum, a Unified Educational Sign Dictionary, and an Electronic School that distributes **human-recorded** sign videos. Raqeeb is the automation layer: teacher uploads or picks a unit → GenAI plans the lesson → student interacts.

## Personas

**Teacher.** Uploads or selects a unit, reviews the generated lesson (sequence, glossary, simulation), edits, publishes, assigns to a class, sees who finished and where they got stuck.

**Student.** Opens an assigned lesson. Watches ESL for each term. Plays the simulation (change mass, change force, watch acceleration and motion). Completes a challenge in the sim. Signs a target word when we have it. Sees progress.

## Product surfaces

```text
/                    landing
/login               email + password
/teacher             lesson list, upload, review, assign
/teacher/lessons/:id editor + live sim preview
/student             assigned lessons
/student/lessons/:id player: ESL + simulation + challenge + sign check
```

Translate (free-form text/speech/sign) stays as a utility under the student app, not the core loop.

## Architecture

```text
Teacher PDF / authored unit          Student
        │                               │
        ▼                               ▼
   Next.js (Raqeeb web) ─────────► FastAPI
        │                     │         │
        │                     │         ├── lesson / auth / progress  (new)
        │                     │         ├── /text-to-sign, /video     (exist)
        │                     │         └── /sign-to-text             (exist)
        │                     │
        └── Simulation runtime (browser)
              Matter.js + React, official physics formulas in code
```

- **Curriculum intelligence** (LLM) lives in the API so prompts and keys stay server-side.
- **Simulations run in the browser.** The API never “plays” physics. It only stores `kind` + `params` + `goal`.
- **ESL** is a service the player calls, not the lesson itself.

## Lesson JSON (canonical)

Every lesson, whether authored by hand or generated from a PDF, is this document. The player only knows this shape.

```ts
export type Role = "teacher" | "student";

export type StepType = "esl_term" | "explain" | "simulate" | "challenge" | "sign_check";

export type SimulationKind = "newton_2nd"; // v1. later: constant_velocity, incline, collision_1d

export type GlossaryEntry = {
  term_ar: string;
  term_en: string;
  esl_mode: "lexicon" | "fingerspell" | "none";
  lexicon_token?: string; // must exist in pose.enc / label map if lexicon
};

export type LessonStep = {
  id: string;
  type: StepType;
  title_ar: string;
  body_ar?: string;
  glossary_ids?: string[];
  simulation?: {
    kind: SimulationKind;
    params: Record<string, number>;
    goal?: { key: string; value: number; tolerance: number };
  };
  sign_target?: string;
};

export type Lesson = {
  id: string;
  slug: string;
  title_ar: string;
  subject: "physics";
  status: "draft" | "published";
  glossary: Record<string, GlossaryEntry>;
  steps: LessonStep[];
};
```

v1 seed: one published lesson `newton-2nd` with steps:

1. `esl_term` قوة / force — fingerspell + Arabic
2. `esl_term` كتلة / mass
3. `esl_term` تسارع / acceleration
4. `explain` the relationship in Arabic (force up → acceleration up; mass up → acceleration down)
5. `simulate` newton_2nd, free play
6. `challenge` “set F and m so a ≈ 2 m/s²”
7. `sign_check` only if we have a lexicon word in that step; otherwise skip or check a known word like `يفهم`

## Newton 2nd simulation contract

Must be a real interactive lab, not a video.

- World: one box on a frictionless line
- Controls: sliders **F** (N) and **m** (kg)
- Derived: **a = F / m**, shown live
- Motion: box accelerates according to `a`; reset button
- Graph: live plot of F vs a (line through origin, slope 1/m)
- Challenge mode: lock the target `a`, student must hit it within tolerance by changing F and/or m
- Physics is computed in our code (`a = F / m`). Matter.js (or a tiny integrator) only draws motion. Do not “let the engine invent” Newton’s law.

Later templates plug into the same `SimulationKind` union. Do not generate arbitrary simulation code from the LLM in v1.

## Teacher pipeline

1. **v1 (authored):** we ship the Newton lesson. Teacher can preview, publish, assign.
2. **v2 (upload):** teacher uploads a PDF or pastes a unit. LLM extracts concepts + relationships. A **planner** maps each concept to an existing `SimulationKind` or to `explain` if no sim exists. Teacher reviews every step. Nothing goes to students until `published`.
3. **v3:** more sim templates (chemistry, geometry). Still no LLM-written physics engines.

The LLM may write Arabic explanations and pick glossary terms. It may **not** invent new simulation kinds at runtime.

## Auth and data

- `users(id, email, password_hash, role, name)`
- `classes(id, teacher_id, name)`
- `enrollments(class_id, student_id)`
- `lessons(id, teacher_id, json, status)`
- `assignments(lesson_id, class_id)`
- `progress(student_id, lesson_id, step_id, status, sim_snapshot, predicted_sign)`

v1 can skip real classes: one teacher account, one student account, one assignment, seeded in SQLite.

## Out of scope until later

- Vocational tracks (carpentry, clothing, …)
- Live streaming sign recognition
- 3D avatar
- Scraping the Unified Dictionary without an official license/API
- Replacing MOE textbooks
- Multi-subject auto-generation before Physics templates work
- Google/Microsoft login (email is enough for the first working product)

## Success for “full working product”

A teacher can log in, open (and later generate) a Physics lesson, preview the live sim, assign it. A student can log in, complete the lesson by interacting with the simulation, and get ESL for terms plus a sign check where the lexicon allows. A stranger watching the demo understands `F = ma` from the **simulation**, not from a paragraph of Arabic.
