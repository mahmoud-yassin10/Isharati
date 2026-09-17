# Hackathon completeness

Keep the Next.js app. Lovable (`lovable build/raqeeb-learn-arabic`) is a11y/theme reference only — swapping routers would drop Newton lab, auth, and the API client.

## Exists

- Arabic RTL + one-language English toggle
- Teacher / student demo accounts
- Student player: esl_term, explain, simulate, challenge, quiz, sign_check
- SignPanel → `/text-to-sign` + `/video`, word stays on screen if video fails
- Quiz steps with glossary sign stems
- Newton lab + `a ≈` challenge
- Teacher preview, publish, assign, progress table
- Three seeds: newton-2nd, heavy-light, i-am-student
- Fly Dockerfile + CORS env; `/health` reports poses and routes
- 44px targets, skip link, focus-visible, reduced-motion lab

## Fill now

- Port Lovable a11y hooks (text size, contrast, motion, focus, auto-sign) into Next.js — no visual restyle
- Finish i-am-student (explain). Add physics `weight-mass` and language `walk-stop`
- Wire quiz/challenge encouragement (`وصلت` / streak) consistently
- Health banner if ESL routes are down
- Replay + captions on signs; skip on sign-check
- Teacher progress shows step titles
- Deploy Fly API + Vercel web

## Done in this pass

- Next.js kept; Lovable a11y hooks ported (text size, contrast, still, focus, auto-sign)
- Courses: newton-2nd, heavy-light, weight-mass, i-am-student, walk-stop — assigned to demo student
- Encouragement: `وصلت` after quiz/challenge, streak `وصلت × N`
- Health banner if ESL video routes are down
- Fly API + Vercel web deployed

## Honest skip

- 3D avatar, live websocket sign, new physics engines, invented lexicon
- Sign-to-text on Fly (image skips Torch). Camera check works locally; on Fly students skip
- Pixel-perfect Lovable chrome
- Browser E2E in this agent harness (API + production JS verified instead)
