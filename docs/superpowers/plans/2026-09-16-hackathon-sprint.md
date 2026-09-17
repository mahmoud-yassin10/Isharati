# EUI GenAI Hackathon Sprint — Imkan/Raqeeb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Adaptation note:** This is a 4-day hackathon sprint mixing UI/design, ML, and content work, not a pure backend library. Strict TDD-per-CSS-rule doesn't apply — each task instead carries a concrete **Done when** acceptance check (a command, a measured number, or an explicit visual/behavioral checklist) in place of a unit test where no meaningful unit test exists.

**Goal:** Turn the existing working prototype (Next.js frontend + FastAPI backend + custom HF-SMCA sign model) into a polished, gamified, demo-safe submission for EUI GenAI Education Hackathon 2026 — Accessibility & Inclusion track — by the September 20, 2026 deadline.

**Architecture:** No structural rewrite. The lesson state machine, Newton lab physics, and sign-model architecture are sound and stay as-is. Work is a design-system pass over existing components, an accuracy-and-reliability pass over the existing model/deploy, a gamification layer bolted onto existing progress events, and finishing the two incomplete lessons to the same bar as `newton-2nd`.

**Tech Stack:** Next.js 15 / React 19 (no Tailwind — plain CSS in `globals.css`), FastAPI + SQLAlchemy, PyTorch (`HF-SMCA Hybrid`, 502 classes), Fly.io (API) + Vercel (web).

**Spec:** This plan itself is the spec — derived from live codebase inspection (2026-09-16) and the critique/decisions in this conversation. No separate spec doc.

## Global Constraints

- Arabic is the language; English is a toggle, never mixed on one screen (existing `useLang`/`Dual` pattern — keep using it, don't invent a new i18n approach).
- WCAG AA minimum: body contrast ≥4.5:1, touch targets ≥44px, no color-only signal, `prefers-reduced-motion` must keep the lab usable (already implemented — don't regress it).
- Every visual change ships through the existing `globals.css` token system (extend it, don't fork a second styling approach mid-sprint).
- Every feature demoed to judges must work on the **deployed** URLs (Vercel + Fly), not just `localhost`. Nothing gets marked done from a local-only test.
- Deadline is real: September 20, 2026. Day 4 (Sept 19-20) is submission + buffer, not build time. Do not schedule risky work later than Day 3.

---

## Team split (4 parallel workstreams, 3-5 people)

Assign one person (or pair) per workstream so they run in parallel, not sequentially:

- **A — Design system & gamification** (frontend, biggest visual lift)
- **B — Model accuracy & sign-check reliability** (ML/backend)
- **C — Content completion & pitch narrative** (content + non-technical teammate)
- **D — Integration, deploy, QA, demo rehearsal** (glue role, active mainly Day 2-3)

---

## Workstream A: Design system & gamification

### Task A1: Design tokens pass on `globals.css`

**Files:**
- Modify: `frontend/src/app/globals.css`

**Problem:** 779 lines of ad hoc CSS with no visible token system — this is why the product "looks terrible." Fix at the root: a small set of tokens everything else draws from.

- [ ] Define/consolidate CSS custom properties at the top of `:root` (or the existing theme block): a 5-step neutral scale, one accent color, one "success" color (for `وصلت`/streak states — currently scattered), a type scale (3-4 sizes max), a spacing scale (4/8/12/16/24/32/48px), one border-radius value, one shadow value. Match the brand personality already defined in `PRODUCT.md`: "precise, quiet, school-lab" — no neon, no gradients, no chalkboard textures.
- [ ] Audit existing selectors (`.btn`, `.panel`, `.lab`, `.player`, `.topbar`, `.role-pill`, etc.) and replace hardcoded colors/spacing/font-sizes with the new tokens. Do this in place — don't rename classes, since components reference them directly.
- [ ] Add a `prefers-color-scheme: dark` block reusing the same tokens (respects the a11y "contrast" toggle already in `AppShell`).

**Done when:** Every color/spacing/font-size value in `globals.css` traces to a `var(--token)`; no raw hex/px literals left in selectors except inside the token block itself. Visual smoke test: student player, teacher dashboard, login all render with consistent spacing/type at both text sizes (`A` / `A+`).

### Task A2: Newton lab visual polish

**Files:**
- Modify: `frontend/src/components/NewtonLab.tsx`, `frontend/src/app/globals.css` (`.lab`, `.track-wrap`, `.rail`, `.mass-box`, `.force-arrow`, `.graph` rules)

The simulation logic (`a = F/m`, SVG graph, challenge goal) is correct and stays untouched — this is styling only.

- [ ] Give `.mass-box` a real physical read: subtle shadow/depth, rounded corners from the new token, a visible drop-shadow that scales slightly with mass (bigger `m` → visually heavier box). Do this with a CSS custom property set from `style` (already have `mass` in scope), not new JS physics.
- [ ] Style `.force-arrow` as a clean vector arrowhead (CSS clip-path or a small inline SVG triangle), not a plain bar — force should read as a *direction*, not a progress bar.
- [ ] Polish the SVG graph (`.graph` / `<svg viewBox="0 0 200 160">`): add axis tick labels at 0/max, a filled dot with a subtle pulse on value change (respecting `reduceMotion`).
- [ ] Verify at 400px width (phone) the lab doesn't overflow — `track-wrap`, sliders, and graph must stack cleanly.

**Done when:** Newton lab looks like a lab instrument, not a wireframe, at both desktop and 400px width, in both light/dark and both `A`/`A+` text sizes, with `reduceMotion` on and off.

### Task A3: Gamification layer

**Files:**
- Create: `frontend/src/components/ProgressBadge.tsx`
- Create: `frontend/src/lib/gamification.ts`
- Modify: `frontend/src/app/student/lessons/[id]/page.tsx` (wire badge/mastery events)
- Modify: `backend/db.py` (extend progress model if a mastery/badge field is needed — check current schema first)
- Modify: `frontend/src/app/student/page.tsx` (show earned badges on the lesson list)

Current gamification is a plain streak counter (`وصلت × N`). Add a layer that's visible in a 3-minute demo without adding new backend complexity beyond what's necessary.

- [ ] `gamification.ts`: pure functions — `computeMastery(stepsDone: number, total: number): number` (0-100), `badgeForLesson(mastery: number, challengeMet: boolean, quizSolved: boolean): Badge | null` where `Badge = { id: string; label_ar: string; label_en: string; tier: "bronze"|"silver"|"gold" }`. Gold = challenge + quiz both solved on first try, silver = both solved, bronze = lesson completed.
- [ ] `ProgressBadge.tsx`: renders a badge chip (icon + Arabic/English label via existing `Dual` component) with tier-based color from the new tokens. No color-only signal — tier name is always in the label text too.
- [ ] In the student player, on lesson completion (`go()` hitting the last step), compute the badge and show it in the `nudge` banner area alongside the existing `وصلت` message, plus persist it via `saveProgress` (reuse existing `sim_snapshot`-style payload — add a `badge` field, don't invent a new endpoint if the existing one can carry it as JSON).
- [ ] Student home page (`student/page.tsx`): show badge chips next to each assigned lesson the student has completed.

**Done when:** Completing `newton-2nd` end-to-end in the browser shows a badge in the nudge banner, and the badge persists and reappears on the student home page after a refresh.

### Task A4: Teacher dashboard visual pass

**Files:**
- Modify: `frontend/src/app/teacher/page.tsx`, `frontend/src/app/teacher/lessons/[id]/page.tsx`

- [ ] Apply the same token pass — this page currently reads as a raw table. Add step-title-level progress (already flagged as a gap in `docs/hackathon-gaps.md` line 25: "Teacher progress shows step titles") — surface `step.title_ar` next to each student's row instead of just a status.
- [ ] Show badge tier per student per lesson (reuses `ProgressBadge` from A3).

**Done when:** Teacher can open a lesson's progress view and see, per student, which step they're on by name and which badge tier they've earned — no raw IDs or booleans exposed.

---

## Workstream B: Model accuracy & sign-check reliability

### Task B1: Build a real accuracy number on lesson vocabulary

**Files:**
- Create: `backend/scripts/eval_lesson_vocab.py`
- Read: `backend/data/lessons/*.json` (glossary + `sign_target` fields — this is your true demo vocabulary, not all 502 classes)

- [ ] Extract the full set of distinct sign words actually used across the 5 lessons (`glossary[].term_ar`, `sign_target` fields, e.g. `يدفع`, `قوة`, `كتلة`, `تسارع`, plus whatever `heavy-light`/`i-am-student`/`walk-stop`/`weight-mass` use).
- [ ] Collect at least 5 clips per word from team members (different signers, different lighting) — this is the fastest path to a trustworthy number given no access to the original training set (`E:\GRAD_PROCESSED\...` per `training_config.json`, not in this repo).
- [ ] Run each clip through the existing `predict_sign` pipeline (`backend/services/sign_predictor.py`) and record top-1 accuracy, and top-1 accuracy restricted to *just the lesson vocabulary subset* (i.e., treat it as a 10-20-way problem, since that's what the demo actually tests) — report both numbers.
- [ ] Save results to `backend/data/_pose_report.txt` (file already exists as a placeholder per repo listing) as a short table: word, clips tested, accuracy.

**Done when:** `python scripts/eval_lesson_vocab.py` runs against the collected clips and prints/saves per-word and overall accuracy on the lesson vocabulary. You have a number you can say out loud to a judge.

### Task B2: Confidence-gated UX instead of flat right/wrong

**Files:**
- Modify: `backend/services/sign_predictor.py` (`selection_score`, already computes `top1_prob`/`margin` — expose a confidence tier)
- Modify: `frontend/src/components/SignCheck.tsx`

Right now `SignCheck` treats every prediction as binary matched/not-matched. A false "wrong" on a genuinely correct sign is the worst live-demo failure mode.

- [ ] Backend: add a `confidence_tier` field to the sign-to-text response (`high` if `top1_prob` ≥ a measured threshold from B1's data, `low` otherwise) — pick the threshold from real data, not a guess.
- [ ] Frontend: when `confidence_tier === "low"`, show "لم نتأكد، حاول مرة أخرى" (not sure, try again) instead of a hard "wrong," and don't count it against the student — let them retry without penalty. Only show "حاول مرة أخرى" as a firm miss when confidence is high AND it doesn't match.

**Done when:** Recording a genuinely correct sign with poor lighting/framing shows a neutral retry message, not a false "wrong," verified with at least 3 intentionally-imperfect recordings during manual test.

### Task B3: Get sign-to-text live on the deployed API

**UPDATE (2026-09-16, mid-sprint):** The original assumption in this task ("add torch + mediapipe") was wrong. Traced the actual pipeline (`backend/services/video_processor.py`): keypoint extraction uses **MMPose** (`MMPoseInferencer(pose2d="wholebody", ...)`), not MediaPipe — mediapipe in `requirements.txt` is unused dead weight from the training pipeline, not the live inference path. MMPose pulls its wholebody checkpoint from the OpenMMLab model zoo **over the network on first call** (no checkpoint bundled in this repo), and its install chain (`mmpose` + `mmcv` + `mmengine`, version-matched to torch) is notoriously fragile — `mmcv` often needs `mim install` and correct torch/CUDA pinning. Doing this blind on a `python:3.12-slim` Fly container risks eating the whole remaining timeline on infra debugging, not app work, and CPU-only RTMPose inference per frame may also be slow enough to risk demo timeouts.

**Revised recommendation:** don't gamble the sprint on this. Two safer paths, pick one:
1. **(Recommended)** Whoever on the team has the original training/GPU environment exports keypoint extraction as a *separate, already-working local service* (it already runs locally per `docs/hackathon-gaps.md`: "Camera check works locally"). Point the deployed Fly API at that machine via a small authenticated proxy endpoint for the sign-check step only, OR just run the whole demo's camera step against `localhost` on the presenting laptop instead of the Vercel-deployed frontend's Fly backend — same team member's already-working setup, zero new infra risk, and Vercel frontend can point `NEXT_PUBLIC_API_URL` at `http://localhost:8000` for the live demo session only.
2. If it must be live on the public URL: budget a full extra day, install `mmpose`/`mmcv` on a throwaway Fly machine first (not the demo one), confirm the model-zoo checkpoint download succeeds from Fly's network and gets cached to the `/data` volume so it survives restarts, and time actual CPU inference latency before committing.

Either way: keep `SignCheck.tsx`'s existing "Skip this step" as the rehearsed on-stage fallback (Task D2) regardless of which path is chosen.

**RESOLVED (2026-09-16):** Built and verified it end-to-end against a disposable throwaway Fly app (`raqeeb-mmpose-test`, destroyed after verification, zero lingering cost). `backend/Dockerfile.full` + `backend/requirements-fly-full.txt` + `backend/Dockerfile.full.dockerignore` now build and run the full mmpose/mmcv/torch stack successfully. Fixes needed along the way, all applied in the committed files:
- `torch==2.1.2+cpu` doesn't exist anymore → bumped to `2.2.2+cpu`, matched mmcv's wheel index to `torch2.2`.
- `chumpy` (mmpose's transitive dep, unused by us) has a pre-2017 `setup.py` that breaks under pip's build isolation → installed with `--no-build-isolation` against a pinned `setuptools==69.5.1` (newer setuptools dropped `pkg_resources` by default, which both `chumpy` and `mmcv` import directly).
- `mmcv==2.1.0` has no prebuilt wheel for this platform/Python combo → compiles from source (~22 min one-time, cached in the Docker layer afterward).
- `cloudinary`, `openai`, `SpeechRecognition`, `pydub` were missing (unrelated to mmpose, but `main.py` bundles all three speech/sign routes in one try/except, so any one missing import silently disabled all of them).
- Root `.dockerignore` excludes `backend/models` and `**/*.pt` (correct for the lean deploy) — added a Dockerfile-specific `Dockerfile.full.dockerignore` (BuildKit feature) so the full build includes the model checkpoint without affecting the lean build.
- Confirmed live inference works: POSTed `backend/temp/force.mp4` to the deployed `/sign-to-text` endpoint and got a real prediction back (model returned "عمود فقري" — a plausible-but-likely-wrong read on the wrong word, which is exactly what Task B1's accuracy eval is for, not a deployment problem).

Fly cost: `raqeeb-api`'s `fly.toml` was switched to `auto_stop_machines = "suspend"` + `min_machines_running = 0` (deployed, already live) — machine suspends ~2 min after the last request and wakes in ~1s, so idle time between now and the demo costs effectively nothing regardless of machine size.

**DECIDED (2026-09-17): not needed.** The demo only needs text-to-sign (already live on `raqeeb-api`: `routes.text_to_sign: true`), not the camera/sign-to-text feature. Not promoting `Dockerfile.full` to production — no reason to add the complexity/memory/image-size cost for a feature that isn't part of the demo plan. Left in place (`backend/Dockerfile.full`, `backend/requirements-fly-full.txt`, `backend/Dockerfile.full.dockerignore`) as a proven, ready-to-use path if the camera feature becomes relevant later. `sign_check` lesson steps keep working as-is — they already show the graceful "not ready, skip this step" fallback (existing `SignCheck.tsx` behavior), which is exactly correct now that the route stays off in production.


**Files:**
- Modify: `backend/requirements-fly.txt` (or create `backend/requirements-fly-full.txt`)
- Modify: `fly.toml` (machine size)
- Modify: `backend/Dockerfile` if base image needs `libgomp1`/torch runtime deps

`requirements-fly.txt` deliberately excludes torch/mediapipe ("those blow the Fly image") — that's why the camera feature isn't live. With 4 days and a real deadline, paying for a bigger Fly machine for the demo window is cheaper than losing the flagship interactive feature.

- [ ] Add `torch` (CPU wheel, e.g. `torch==2.x+cpu` via the PyTorch CPU index URL) and `mediapipe` to a full requirements file; confirm image builds and stays under Fly's machine memory (start with `performance-1x` / at least 2GB RAM — check current `fly.toml` `[[vm]]` block and bump it for the demo period only).
- [ ] Point the Dockerfile at the full requirements file, rebuild, deploy, and hit `/health` to confirm `routes.sign_to_text: true` in production, not just `text_to_sign`/`video`.
- [ ] If image size or cold-start becomes a blocker, fall back explicitly: keep `SignCheck.tsx`'s existing "Skip this step" escape hatch (already implemented) and rehearse the demo assuming camera works, with skip as the *only* fallback — no silent failure states.

**Done when:** `curl https://<fly-app>.fly.dev/health` shows `sign_to_text: true` in production, and a live camera recording through the deployed Vercel frontend returns a prediction end-to-end (not just locally).

---

## Workstream C: Content completion & pitch narrative

### Task C1: Finish `i-am-student` lesson to `newton-2nd` quality bar

**Files:**
- Modify: `backend/data/lessons/i-am-student.json`

Per `docs/hackathon-gaps.md`: "Finish i-am-student (explain)." Use `newton-2nd.json` (already read in full above) as the structural template: `esl_term` steps per glossary word → `quiz` steps interleaved → `explain` step tying it together → `sign_check` at the end. Don't invent new step types — the player only handles `esl_term | explain | simulate | challenge | quiz | sign_check`.

- [ ] Fill in the missing `explain` step body (Arabic + English) that ties the lesson's glossary terms together in one sentence, matching the terse instructional voice in `PRODUCT.md` ("short instructional Arabic. Name the control. Name the result.").
- [ ] Confirm every `glossary_ids` reference in every step resolves to an entry in the lesson's `glossary` object (this is silently trusted by the frontend — a typo here means signs just don't render).

**Done when:** Lesson loads end-to-end in the student player with no missing sign panels, and the `explain` step reads as complete, not a stub.

### Task C2: Second full lesson to demo depth (`weight-mass` or `heavy-light` — pick one)

**Files:**
- Modify: whichever of `backend/data/lessons/weight-mass.json` / `heavy-light.json` is currently thinnest

- [ ] Same treatment as C1 — this gives you **two** lessons a judge can click through start-to-finish with zero rough edges (Newton's 2nd law + one more), which reads as a real curriculum rather than one polished demo path.

**Done when:** Second lesson is assignable, playable end-to-end, and produces a badge (Task A3) on completion.

### Task C3: Pitch deck

**Files:**
- Create outside the repo (Google Slides / Figma) — not a plan-tracked file, but list required slides here so nothing is missed:

- [ ] Problem: Egyptian deaf/HoH students and the specific gap (curriculum exists, ESL-native interactive science instruction doesn't).
- [ ] Solution in one sentence + the "the lab is the interface" principle from `PRODUCT.md`.
- [ ] Live demo slide (or embedded recording as backup if live demo risks network issues on stage).
- [ ] The real accuracy number from Task B1 — state it plainly, don't dodge it.
- [ ] Architecture slide: custom HF-SMCA sign model (502 classes, gated static/motion/cross fusion) — this is real technical depth, name it.
- [ ] Accessibility & Inclusion track fit: name the specific rubric language from the hackathon page ("GenAI solutions for students with disabilities or in low-connectivity environments") and address low-connectivity explicitly (does the app degrade gracefully offline/slow network? if not, say what's next).
- [ ] Roadmap slide: name the "Honest skip" items from `docs/hackathon-gaps.md` as deliberate scope decisions, not oversights (3D avatar, live websocket sign, etc.) — judges respect explicit scoping over hidden gaps.

**Done when:** Deck exists, every slide above is filled (no placeholder slides), and it's been read aloud once by someone who didn't build the product.

---

## Workstream D: Integration, deploy, QA, demo rehearsal

### Task D1: Full-path smoke test on production URLs

**Files:** none (manual QA against deployed Vercel + Fly URLs)

- [ ] Teacher: log in, preview a lesson, publish, assign to demo student, view progress table with step titles (A4) and badges (A3).
- [ ] Student: log in, play `newton-2nd` start to finish including the challenge and sign-check (with B3's live camera), see badge awarded (A3), return to lesson list and see it marked complete with badge shown.
- [ ] Repeat for the second finished lesson (C2).
- [ ] Toggle every a11y control (`A+`, contrast, still, focus, sign) and confirm nothing breaks or becomes unreadable.
- [ ] Toggle Arabic/English and confirm no mixed-language screens.
- [ ] Test at 400px width on an actual phone, not just devtools resize.

**Done when:** Every item above passes on the deployed URLs, written down as a checklist with pass/fail, not just "looked fine."

### Task D2: Failure-mode rehearsal

**Files:** none

- [ ] Deliberately kill the camera permission mid-demo once, and confirm `SignCheck`'s skip path (already implemented) recovers cleanly on stage.
- [ ] Deliberately throttle network (Chrome devtools "Slow 3G") once and watch what a low-connectivity Egyptian student actually experiences — this directly matters for the Accessibility & Inclusion track's "low-connectivity environments" language. Note any hard failures for the pitch's roadmap slide (C3) if not fixable in time.
- [ ] Time the full demo script (teacher assign → student play → badge → camera check) and cut anything over ~3 minutes.

**Done when:** The team has run the demo twice without a live crash, and has a named, rehearsed recovery move for the one most likely failure (camera).

---

## Sequencing across the 4 days

- **Day 1 (today, Sept 16):** A1 + A2 start immediately (no dependencies). B1 starts immediately (clip collection can run in parallel with everything). C1/C2 start immediately (pure content, no code dependency). D waits.
- **Day 2 (Sept 17):** A3 + A4 (depend on A1 tokens existing). B2 (depends on B1's real threshold). B3 (independent, but highest technical risk — start early, not late). C3 drafts using B1's real number once available.
- **Day 3 (Sept 18):** D1 + D2 against a build that has all of A/B/C merged. Fix whatever D1 finds. Finalize C3 with D2's findings folded into the roadmap slide.
- **Day 4 (Sept 19) / Sept 20 deadline:** Buffer only. Submit early on the 20th, not at the deadline — form platforms fail under last-minute load.

---

## Self-review notes

- Every gap from the earlier critique (UI polish, gamification, accuracy proof, camera-on-Fly, content depth, pitch honesty about scope) maps to a task above.
- No task references a function/field not defined elsewhere in this plan or already present in the read codebase (`predict_sign`, `saveProgress`, `Dual`, `useA11y`, `newtonAccel`/`withinGoal`, lesson JSON schema).
- `gamification.ts` and `ProgressBadge.tsx` are new — their interface (`computeMastery`, `badgeForLesson`, `Badge` type) is defined once in A3 and reused (not redefined) in A4.
