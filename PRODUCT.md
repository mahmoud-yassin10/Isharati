# Product

## Register

product

## Users

**Primary: Egyptian deaf and hard-of-hearing students, age 11 to 16.**
Egyptian Sign Language (ESL) is their first language. Written Arabic is a second language, so reading long Arabic sentences is slow and tiring for many of them. They use a mid-range Android phone at home or a shared school computer under fluorescent classroom light. They cannot rely on sound at all: no audio cue, no spoken instruction, no "listen to this".

**Secondary: their teachers.** Egyptian school teachers who often sign weakly or not at all. They sit at a desk or stand at a projector, need to preview a lesson, publish it, assign it, and see which student finished which step.

Physical scene: a 13-year-old in a Giza public school computer lab, afternoon glare on the screen, the teacher two desks away and unable to explain the idea in sign, the student leaning in to watch a signed word, then dragging a slider to see what it does.

## Product Purpose

Raqeeb (رقيب) teaches the Egyptian school curriculum in Egyptian Sign Language, with real interactive simulations. The first lesson is Newton's second law.

Success is a student who watches the sign for "force", moves the force slider, sees the box speed up, and answers correctly, without ever needing to read a paragraph or hear a sound.

## Brand Personality

Clear, visual, encouraging. Three words: **seen, steady, proud**.

- Seen: the sign is the voice of the product. It is never an add-on in a corner.
- Steady: every lesson screen has the same layout, so the student never re-learns where things are.
- Proud: progress is visible and celebrated visually, like a good teacher nodding.

Voice: short Arabic. One idea per sentence. Name the thing, name the action. "حرّك القوة." not "قم بتحريك شريط التمرير الخاص بالقوة لملاحظة التغيير."

## Anti-references

- Dark SaaS dashboards, neon KPIs, "hero metric" stat tiles
- Cream-and-terracotta "AI education" landing pages
- Childish kids-app styling: cartoon mascots, rainbow gradients, bouncing animations, emoji as icons
- Chalkboards, apple-on-desk stock photos, pyramids, camels, pharaoh icons
- Walls of Arabic text; instructions that only work if you can read fluently
- Anything that depends on sound: audio feedback, video without captions, "tap to listen"

## Design Principles

1. **Sign first, text second.** Every key term has a sign video (or a clear placeholder) placed above or beside its text, always in the same spot. Text supports the sign, not the other way around.
2. **Show, then name.** Prefer an icon, a picture, a moving box, or a graph to a sentence. Every icon is paired with a short visible label.
3. **One task per screen, one primary button.** The student always knows the single next thing to do.
4. **Predictable layout.** The lesson player never rearranges between steps. Progress, steps, and the Next button stay put.
5. **Feedback you can see.** Right and wrong are shown with color **and** icon **and** word (check + green + "صحيح"). Nothing is communicated by sound or by color alone.
6. **Arabic is home.** RTL by default. English is a full toggle, never mixed on one screen. Latin letters appear only in formulas (F, m, a) and units.
7. **The lab is the lesson.** Simulations are large, touch-friendly, and never hidden below decoration.

## Accessibility & Inclusion

Target WCAG 2.2 AA everywhere, AAA (7:1) for body text.

- Body text ≥ 7:1, secondary text ≥ 4.5:1, borders of inputs and controls ≥ 3:1.
- Base text 18px, line height 1.7 for Arabic. Line length ≤ 65ch.
- Touch targets ≥ 48px.
- Visible 3px focus ring on every interactive element. Full keyboard use, including sliders.
- No audio anywhere. Sign videos are muted, captioned by the on-screen word, and can be replayed and slowed.
- `prefers-reduced-motion` and the in-app "Still" switch freeze decorative motion; the lab keeps working (sliders and the live `a` value stay).
- Built-in controls, all saved per device: text size (small / normal / large), high contrast, still motion, focus mode (hides everything except the current step), auto-play signs, sign speed.
- The accessibility controls live one click away in the header on every page, and on a full settings page.
- Errors say what happened and what to do next, in one short sentence, with an icon.
