# Raqeeb / Imkan — Pitch Deck Copy Draft

Use one language per rendered slide. This draft uses English for judges; keep product screenshots and the live product Arabic-first.

## Slide 1 — Raqeeb / Imkan

**An Egyptian Sign Language physics tutor where the lab is the interface.**

For deaf and hard-of-hearing students, physics should be something they can *see, change, and explain* — not a paragraph translated after the fact.

## Slide 2 — The problem

Egyptian deaf and hard-of-hearing learners have curriculum content and sign-language resources, but not an ESL-native, interactive way to learn a scientific relationship.

When a lesson explains Newton’s second law only in text or video, the student can watch the idea without being able to test it. Teachers also lack a simple view of who has actually completed the learning activity.

**The gap:** accessible science learning that combines Egyptian Sign Language, a manipulable model, and visible teacher progress.

## Slide 3 — The solution

**Raqeeb turns an Egyptian curriculum lesson into a short, Arabic-first ESL learning path with a real physics simulation and a sign-back check.**

The design principle is simple: **the lab is the interface.** Students change force and mass, see acceleration respond, complete a goal, and then demonstrate understanding. Teachers preview, publish, assign, and see progress by lesson step.

## Slide 4 — Live demo: one learning loop

1. Teacher previews **Newton’s Second Law**, publishes it, and assigns it to a student.
2. Student learns the ESL terms for force, mass, and acceleration.
3. Student changes **F** and **m** in the lab and reaches the acceleration challenge.
4. Student solves the check-in, earns a visible mastery badge, and returns to a completed lesson card.
5. Teacher sees the completed step and earned badge in the progress view.

**Backup:** a short screen recording of this exact flow, ready before the live demo. If camera sign recognition is unavailable, use the explicit “Skip this step” fallback and continue the learning flow.

## Slide 5 — Accessibility is product behavior, not a setting buried in a menu

Raqeeb is Arabic-first and supports an English toggle without mixing the two languages on one screen. It includes larger text, high contrast, reduced motion, focus mode, and automatic sign playback.

The learning interaction is designed to stay usable with reduced motion: sliders and the live acceleration value still work. It follows WCAG AA fundamentals: readable contrast, 44 px touch targets, visible focus, captions, and no color-only meaning.

## Slide 6 — Sign-model evaluation

**PLACEHOLDER — replace before presentation with Task B1’s measured result. Do not invent this metric.**

- Lesson-vocabulary top-1 accuracy: **[__%]** across **[__]** clips / **[__]** ESL terms.
- Full 502-class top-1 accuracy: **[__%]** across the same test clips.
- Test coverage: at least five clips per term, with different signers and lighting conditions.

Our claim will be limited to this measured lesson vocabulary evaluation. Low-confidence predictions get a neutral retry message rather than falsely marking a correct sign as wrong.

## Slide 7 — Technical depth

Raqeeb pairs a Next.js learning experience with a FastAPI backend for lessons, assignments, progress, sign-video generation, and optional sign recognition.

Its ESL recognition model is a custom **HF-SMCA Hybrid** model with **502 classes**. It uses gated fusion across static, motion, and cross features — a fit for signs where hand shape, movement, and their relationship all matter.

The product records meaningful learning events, not just clicks: completed lesson steps, lab challenge state, quiz completion, and earned badge tier.

## Slide 8 — Why this fits Accessibility & Inclusion

The hackathon calls for “GenAI solutions for students with disabilities or in low-connectivity environments.” Raqeeb addresses disability access directly through ESL-first instruction and interaction designed for deaf and hard-of-hearing students.

**Low-connectivity, honestly:** the current deployed app still needs network access for authentication, lessons, sign video, and camera inference. Our next implementation step is cached lesson bundles with locally stored text, simulation state, and previously fetched sign media, so a learner can continue the core lab offline and sync progress later.

## Slide 9 — Deliberate scope, next

We chose a reliable, teachable loop over a long list of fragile features:

- **Now:** ESL lesson steps, an interactive Newton lab, teacher assignment/progress, a visible badge, and a safe camera-check fallback.
- **Next:** measured sign-vocabulary calibration, offline lesson caching and sync, more complete curriculum lessons, and 3D/avatar-based signing where it improves comprehension.
- **Not claimed today:** live websocket signing, universal continuous sign-language translation, or offline camera inference.

This is not a generic AI tutor. It is a focused tool for a student to see a scientific rule, manipulate it, and show what they learned.

## Slide 10 — Close

**Raqeeb makes a physics relationship visible, interactive, and answerable in Egyptian Sign Language.**

We are starting with one robust learning loop — then extending that loop across the curriculum, without asking deaf and hard-of-hearing learners to adapt to a lesson that was not made for them.
