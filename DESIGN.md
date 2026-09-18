# Design

## Mood

Ink and saffron. A clean school workbook on a bright desk: deep indigo ink for everything you read and press, a saffron highlighter for everything that is signed, and three fixed science colors that only live inside simulations.

Theme is **light only** (classroom glare, projectors, shared school PCs), plus a high-contrast mode.

## Color strategy

Restrained chrome, committed meaning. Pure white page, one cool neutral layer for rails and bands. Color is reserved for meaning:

| Role | Used for | Never used for |
|---|---|---|
| Ink / primary (indigo) | text, primary buttons, progress fill, current selection | decoration |
| Saffron (sign) | anything about sign language: sign cards, sign toggles, the current step marker | text on white (too light) |
| Science: force, mass, acceleration | the lab: arrows, box, sliders, graph, formula | page chrome |
| OK / danger | feedback, always with icon + word | decoration |

```css
:root {
  color-scheme: light;
  --bg: oklch(1 0 0);
  --surface-2: oklch(0.975 0.006 275);   /* rails, bands */
  --surface-3: oklch(0.95 0.01 275);     /* hover */
  --line: oklch(0.9 0.012 275);          /* dividers */
  --line-strong: oklch(0.6 0.02 275);    /* input + control borders, 3.9:1 */
  --ink: oklch(0.24 0.035 275);          /* body, 16.5:1 */
  --ink-2: oklch(0.43 0.03 275);         /* secondary text, 8.1:1 */
  --primary: oklch(0.38 0.1 280);        /* 10.3:1 */
  --primary-hover: oklch(0.31 0.1 280);
  --primary-soft: oklch(0.95 0.025 280);
  --sign: oklch(0.83 0.15 82);           /* fill only, ink text on it 9.7:1 */
  --sign-soft: oklch(0.965 0.045 90);
  --sign-ink: oklch(0.42 0.09 70);       /* 7.7:1 on sign-soft */
  --ok: oklch(0.48 0.11 152);
  --ok-soft: oklch(0.95 0.04 152);
  --danger: oklch(0.52 0.18 27);
  --danger-soft: oklch(0.96 0.03 27);

  /* Science colors: fixed across themes */
  --force: oklch(0.55 0.19 262);
  --mass: oklch(0.52 0.12 158);
  --accel: oklch(0.62 0.16 50);
  --accel-ink: oklch(0.53 0.15 45);      /* acceleration as text */
}
```

High contrast mode: pure black ink, pure white surfaces, 2px black borders on every control and panel, underlined links.

## Typography

- One family: **Readex Pro** (Arabic + Latin, built for reading ease). Weights 400 / 500 / 600 / 700.
- Numbers and formulas: **IBM Plex Mono**, tabular figures.
- Root size: 18px (text-size small 16px, large 21px). Everything in rem.
- Scale: 0.8 / 0.9 / 1 / 1.25 / 1.5625 / 2 / 2.5 rem.
- Body line-height 1.7, headings 1.3. Prose ≤ 62ch.
- No letter-spacing on Arabic. No uppercase.

## Layout

- Page max width 1200px, 24px gutters (16px on phones). 8px spacing scale.
- Header 72px: brand, role nav, sign-service status, accessibility menu, language switch, account.
- Student lesson player: lesson bar (title + progress) on top, 300px steps rail + content column, action bar pinned to the bottom of the viewport. On phones the rail becomes a compact progress row.
- Sign card sits at the top of every step that has terms, always in the same position.

Radius: 8px controls, 14px panels, pill for chips and switches.
Borders over shadows. Panels have a 1px `--line` border and no shadow. Only floating menus get a small shadow (≤ 8px blur, no border+shadow pairing on cards).

## Components

- **Button**: 48px min height. Primary (indigo fill), secondary (white, `--line-strong` border), quiet (text only). Icon + label. Hover darkens, focus shows the 3px ring, disabled at 45% opacity, busy shows a label change ("جارٍ الدخول…").
- **Chip**: pill, icon + short word. Used for step type, lesson status, badges.
- **Progress bar**: 8px track in `--surface-3`, indigo fill, always paired with "2 من 6".
- **Feedback banner**: soft tinted background + icon + short sentence. No side stripes.
- **Switch row** (accessibility): whole row is the target, label + one-line description + switch showing "تشغيل / إيقاف".

## Motion

150–220ms ease-out on color, opacity, and transform for state changes only. Correct answers get a one-time 300ms scale pulse on the check icon. The lab box is physics, not UI motion. Reduced motion or "Still": no transitions, no pulse, box frozen, numbers still live.

## Icons

Lucide, 1.75 stroke, 20–24px, always beside a visible word. RTL flips directional arrows. Never emoji.
