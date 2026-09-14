# Design

## Mood

Ministry physics bench in late-afternoon window light: white paper, honey annotation ink, the only thing that moves is the mass.

## Color strategy

Restrained. Pure white surface. Honey (hue 58, from seed 60) is primary ink and primary buttons. A cooler force-vector blue (hue 232) is reserved for the moving mass and the live `a` readout.

```css
:root {
  --bg: oklch(1 0 0);
  --surface: oklch(0.972 0.004 60);
  --ink: oklch(0.22 0.03 58);
  --muted: oklch(0.42 0.025 58);
  --line: oklch(0.88 0.02 58);
  --primary: oklch(0.42 0.13 58);
  --primary-ink: oklch(0.99 0 0);
  --accent: oklch(0.48 0.14 232);
  --accent-ink: oklch(0.99 0 0);
  --danger: oklch(0.5 0.17 25);
  --ok: oklch(0.42 0.11 145);
}
```

## Typography

- UI and Arabic: IBM Plex Sans Arabic
- Formulas and numbers: IBM Plex Mono
- Scale (rem, product, not fluid): 12 / 14 / 16 / 18 / 22 / 28
- Body 16px, line-height 1.6, measure ≤ 65ch

## Layout

Lovable structure, Raqeeb tokens. 8px scale. Centered `--page: 1200px`, 24px gutters, 64px header.

Language: one at a time. Arabic default. Segmented عربي | EN in the top bar. English never stacks under Arabic.

Landing: equal 1fr / 1fr columns, vertically centered. Two equal-width role CTAs.
App: top bar with رقيب + language toggle + role + logout.
Student player: 280px step rail + content column on the same vertical rhythm.
Lab: F and m sliders side by side; formula / track / graph stacked with 24px gaps.

Radius: 6px buttons/inputs, 8px compact, 12px panels. Pill radius only on the language switch.
Shadow: none on panels; 1px `--line` border only. Buttons: fill, no drop shadow.

## Motion

150–220ms opacity/transform on buttons and step changes, ease-out.
Lab motion is physics, not UI animation. `prefers-reduced-motion: reduce` freezes the box and shows `a` as a number only.

## Icons

Lucide, 1.75 stroke, 20px. Never emoji.
