Paste this into a fresh Codex or Claude Code session, opened in this same repo folder (C:\Mahmoud\Coding\genai hackathon\isharati):

---

We're sprinting toward the EUI GenAI Education Hackathon 2026 deadline (Sept 20, 2026 — 4 days out). Read `docs/superpowers/plans/2026-09-16-hackathon-sprint.md` first for full context: what the product is (Raqeeb/Imkan, an Egyptian Sign Language physics tutor for deaf/HoH students), what's already shipped (check the checkboxes — most of workstream A, B1/B2, C1/C2 are done), and what's left.

Another session is actively working on Task B3 (getting the camera sign-check feature live on Fly, via `backend/Dockerfile.full`, `backend/requirements-fly-full.txt`, and `fly-test.toml`). **Do not touch those three files** — that work is in progress elsewhere and touching them will cause conflicts.

Your job: pick up Task D1 and start on C3, both currently safe and unclaimed:

1. **Task D1 (smoke test)**: The lean backend is already deployed and live at https://raqeeb-api.fly.dev (confirm with `curl https://raqeeb-api.fly.dev/health` — should show `sign_to_text: false` for now, that's expected). Find the deployed Vercel frontend URL (check `frontend/vercel.json` or ask the user if you can't find it) and run through the full checklist in the plan doc's Task D1: teacher login → preview → publish → assign, student login → play `newton-2nd` end to end including the challenge and badge award (Task A3's gamification), toggle every a11y control in `AppShell.tsx` (text size, contrast, still, focus, sign), toggle Arabic/English, and check it doesn't break at 400px width. Write down pass/fail for each item, not just "looked fine." Report bugs found back to the user directly — don't try to fix deep issues without checking in first, since another session is mid-deploy-work and you want to avoid stepping on file conflicts.

2. **Task C3 (pitch deck)**: Start drafting the actual slide content (not the deck file itself, just the copy for each slide) per the outline in the plan doc's Task C3 section. You won't have the real sign-model accuracy number yet (that's Task B1, pending clip collection) — leave that slide as a clearly marked placeholder rather than inventing a number.

Read the plan doc's "Global Constraints" section before touching any UI — Arabic-first, WCAG AA, existing token system in `frontend/src/app/globals.css`, don't fork a second styling approach.
