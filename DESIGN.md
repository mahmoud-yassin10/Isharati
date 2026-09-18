# Design

## Principle

**Less design, better design.** Hierarchy comes from type, spacing, and thin rules. Not every element gets a card, a border, an icon, or a hover effect. Before adding a container, ask whether the thing behaves like an object. If it doesn't, it sits on the page.

Things that **are** contained: the physics lab, lesson units, game modules, sign videos, the quick-settings menu, dialogs.
Things that **are not**: section intros, lists of benefits, the lesson method, role descriptions, settings groups.

## The one strong visual

The home page has one moment of identity: the real signing video of a word, joined by a dotted gesture path to the word itself and its physics symbol (قوة → force → **F**). Keep it small, square, and uncropped. Don't replace it with an avatar, illustration, or hand icon. Any other "movement" motif must stay rare (one per page at most).

## Color

Seven fixed themes (Nile default, Ocean, Forest, Sunset, Lavender, Midnight, Egyptian Heritage) plus High Contrast as a reading mode. The hex palettes in `globals.css` are final; don't reinterpret them.

Science colors are a separate system and never follow the theme:

| Token | Meaning |
|---|---|
| `--physics-force` (blue) | force F: arrow, slider, symbol |
| `--physics-mass` (teal) | mass m: the box, slider, graph line |
| `--physics-acceleration` (orange) | acceleration a: arrow, current point, goal |
| `--physics-velocity` (green) | velocity, when shown |

When a physics color is used **as text**, use `--physics-force-text` / `--physics-mass-text` (same hue, lifted only on Midnight so it stays readable). Fills never change.

## Typography

- **Instrument Sans** for Latin, **IBM Plex Sans Arabic** for Arabic, in one stack so each script falls to its own face. **IBM Plex Mono** for numbers, units, and formulas.
- Root size 17px (small 15px, large 20px). Everything else in rem.
- Arabic body line-height 1.8, headings 1.4, no letter-spacing. English body 1.55, headings 1.15 with −0.015em (hero −0.03em).
- Weights: 400 body, 500 nav and labels, 600 headings and buttons, 700 hero and key words only.
- Prose ≤ 60ch. No uppercase. No eyebrow kickers above sections.

## Space

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px (`--s-1` … `--s-9`). Sections are separated by a 1px rule and `--section-y` padding, not by colored bands. A heading sits close to its content (8–16px); groups sit far apart (48–64px).

## Shape

- Radius: 6px buttons and inputs, 8px frames, 10px modules. Pills only for the switch track.
- Borders over shadows. Only the floating settings menu has a shadow.
- Lesson units get a 3px top edge in their subject's science hue; that is their only color.

## Components

- **Button**: primary (filled), secondary (outline), and a **text link** for tertiary actions. 46px tall, 6px radius, weight 600. One primary action per view.
- **Navigation**: plain text links with a 2px underline for the current page. Logo = home. Guests see "The lab"; students "My lessons"; teachers "Lessons". Then ⚙ Settings, `عربي / EN`, and log in or out.
- **Settings**: one column, groups divided by a rule: Appearance (theme, high contrast), Text, Sign language, Motion, Learning (focus mode), Language. Rows, not cards.
- **Tags** (`.chip`): 4px radius, small, used for state only (published, done, stars, mistakes).
- **Feedback**: tinted background + icon + short sentence. Never color alone.

## The lab

The equation `a = F ÷ m` is the lab's header and legend: each symbol in its science color, with its live value, unit, and name underneath. Under it: the floor, the box (mass), the blue force arrow, and the orange acceleration arrow. Then the two controls (−, slider, +), then the graph beside them when there's room. No tiles, no legend list, no formula pill.

Force is bidirectional (−20 to 20 N), so the box can be pushed either way. The arrow that's doing the pushing stays flush against the box on whichever side it's pushing from, and its head flips to point into the box; the acceleration arrow always extends further in that same direction. The force slider fills outward from zero rather than from its left edge, so the fill itself shows magnitude and direction together. Mass stays positive — only force reverses.

## Focus mode

In a lesson, the step rail, navigation, and footer step back; the sign, explanation, experiment, and back/next stay, centered, in the chosen theme.

## Motion

140–240ms ease-out on color and small transforms for state changes. The lab box is physics, not UI motion. Reduced motion freezes the box and all transitions; the numbers keep working and sign videos get player controls instead of autoplay.

## Icons

Only where they carry information: state (✓, ✗, lock), direction (arrows, flipped in RTL), and the settings gear. No icon above headings, beside nav links, or on settings rows. Never emoji.
