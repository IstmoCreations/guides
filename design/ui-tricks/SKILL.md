---
name: ui-tricks
description: Tested CSS techniques for modern "expensive-looking" UI - frosted/Apple/Android glass panes, a cover-art glow, card shine on hover, real neon text, ambient sparkle backgrounds, nudging lists, an anchored split button, photos cut to any shape, snap-scrolling feeds, shipping AVIF/WebP instead of PNG, and responsive layout without media queries (auto-fit grid, clamp() type, aspect-ratio, flex-wrap, container queries for a panel that breaks when narrow, min() readable widths). Use when building or restyling any web UI that should feel premium, when a panel or layout breaks at some width, when asked for glass, glow, shine, neon, sparkles, Material/Android/Apple-style effects, or when a page "looks flat" or "looks like a template". Every entry was run in Chrome 152 and Firefox 159 before it went in.
---

# UI tricks

Short, dependency-free CSS techniques, collected from UI reels (1-11: Ania Kubow, `@aniakubow`; 12-17:
a responsive-layout reel, 2026-11-06) and **each verified in a real browser** - Chrome 152 and
Firefox 159. A runnable bench with all of them is `examples.html` next to this file; open it in a
browser to see every trick on one page.

Shared by Istmo Creations (https://istmocreations.github.io/guides/ui/ - every trick live, with its code). Free to use.

**Rule for adding a trick:** run it in Chrome AND Firefox and measure that it did something (a
computed value, a position, a screenshot) before it goes in this file. Reel code is often blurry on
screen; never copy numbers you could not read - test them.

## 1. Glass pane (Apple / Android 17 blur)

```css
.glass {
  background: rgb(255 255 255 / .16);          /* see-through tint: .12-.55 depending on how busy the backdrop is */
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  backdrop-filter: blur(24px) saturate(1.4);   /* blurs what is BEHIND the pane; text on it stays sharp */
  border: 1px solid rgb(255 255 255 / .35);    /* thin bright edge catches the light */
  border-radius: 28px;
}
```
- `filter: blur()` blurs the element itself (your text too). `backdrop-filter` blurs what is behind it.
- `saturate(1.4)` stops the blur from going grey - colours behind "pop through".
- Keep the `-webkit-` line for older iOS Safari.
- Over a very busy picture, raise the tint alpha until body text passes contrast; the blur alone is not enough.
- Cost: every glass pane re-blurs on scroll. Dozens on one screen can stutter on a weak phone - test there.

## 2. Ambient sparkles (Gemini-style) - one element, zero extra DOM

```css
.sparkle {
  background-color: #0b0b14;
  background-image:
    radial-gradient(circle, #fff 1px, transparent 1.5px),
    radial-gradient(circle, #ffd6a5 1px, transparent 1.5px),
    radial-gradient(circle, #a0c4ff 1.5px, transparent 2px);
  background-size: 60px 60px, 90px 90px, 140px 140px;   /* three grids, three sizes */
  background-position: 0 0, 30px 40px, 70px 20px;
  animation: drift 12s linear infinite;
}
/* move each layer by a whole number of ITS OWN tiles, so the loop is seamless */
@keyframes drift { to { background-position: 60px 60px, -60px 130px, 210px -120px; } }
@media (prefers-reduced-motion: reduce) { .sparkle { animation: none; } }
```
Three layers moving at different speeds read as parallax depth. Any loop offset that is not a whole
multiple of that layer's tile size makes a visible jump at the loop point.

## 3. Nudging list (Android notifications) - siblings react, no JavaScript

```css
.n { transition: translate .4s cubic-bezier(.34, 1.56, .64, 1); }   /* overshoot = springy */
.n:active { translate: 40px 0; }
.n:has(+ .n:active),          /* the one ABOVE the pressed card */
.n:active + .n { translate: 10px 0; }   /* the one BELOW */
```
Measured: pressed card +40px, both neighbours +10px, the rest unmoved, in both browsers.
`:has(+ x)` is the "previous sibling" selector CSS never used to have.

## 4. Split button with an anchored menu (Material 3) - no positioning JavaScript

```html
<div class="split"><button>Publish</button><button class="chev" popovertarget="m" aria-label="More">▾</button></div>
<div id="m" popover class="menu">…</div>
```
```css
.split { anchor-name: --split; }
.menu  { inset: auto; position-anchor: --split; top: anchor(bottom); left: anchor(left); margin: 4px 0 0; }
.split:has(+ :popover-open) .chev { rotate: 180deg; }
```
Measured: menu top = button bottom + 4px, lefts equal, chevron rotates, in both browsers. `popover`
gives top-layer, light-dismiss and Escape for free. `inset: auto` is required - the popover UA style
centres it otherwise.

**Lit from above** (Ania Kubow's reel): a light top edge, a darker bottom edge, a contact shadow and a glow in the
button's own colour; pressed, the light goes.
```css
.split { --c: #ff6a00;
  background: linear-gradient(color-mix(in oklab, var(--c), white 16%), var(--c));
  box-shadow: inset 0 1px 0 #ffffff59, inset 0 -2px 0 #00000033, 0 1px 2px #00000073,
              0 8px 24px -6px color-mix(in srgb, var(--c) 60%, transparent);
  transition: translate 90ms ease-out, box-shadow 90ms ease-out; }
.split:has(button:active) { translate: 0 1px; box-shadow: inset 0 2px 4px #00000073; }
```
To unfold the menu instead of popping it: `transition: scale .3s, display .3s allow-discrete, overlay .3s
allow-discrete; scale: 1 0;` on `.menu`, `scale: 1` on `.menu:popover-open`, and the same `scale: 1 0` inside
`@starting-style`. Live demo: https://istmocreations.github.io/guides/ui/#t4

## 5. Cut a photo to any shape (Material's 35 shapes) - SVG mask

```css
.cookie { mask: url("data:image/svg+xml,<svg …>…</svg>") center / contain no-repeat;
          -webkit-mask: same; }
```
`clip-path: polygon()` only does straight edges; a mask takes any SVG, so curves are free. A scalloped
"cookie" = one circle r38 at the centre plus eight circles r12 every 45° on radius 38 (viewBox 0 0 100).
The full URL-encoded shape is in `examples.html`. The image is still a plain `<img>`.

## 6. Cover glow (music-player style) - the glow is the picture itself

```css
.card  { isolation: isolate; }                        /* REQUIRED - see below */
.cover { position: relative; background: url(cover.jpg) center / cover; }
.cover::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
                 background: inherit;                  /* literally the same image */
                 filter: blur(28px) saturate(1.8); scale: 1.15; }
```
No colour extraction - change the image, the glow follows. **Gotcha found in testing:** the `.cover`
must NOT create its own stacking context (no z-index/opacity/transform on it), or the `-1` pseudo
paints on top of the cover's own background. Put `isolation: isolate` on the parent instead, so the
glow stays behind the cover but above the page. On a dark backdrop it glows; on a mid-tone backdrop of a
similar hue it disappears - check against the real background.

## 7. Snap feed (Shorts / Reels scroll)

```css
.feed      { overflow-y: auto; scroll-snap-type: y mandatory; }
.feed > *  { scroll-snap-align: start; scroll-snap-stop: always; }  /* last line: a hard flick still stops at the next one */
```
Measured: a scroll to 350px settles at 240 (the next item) in both browsers. Use `x` for a horizontal
row. Drop `scroll-snap-stop` for galleries where flicking past several is wanted.

## 8. Card shine on hover - a reflected window sliding past

```css
.shine { position: relative; overflow: hidden; }
.shine::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 40%, rgb(255 255 255 / .45) 50%, transparent 60%);
  translate: -100% 0; transition: translate .7s ease; }
.shine:hover::after { translate: 100% 0; }
```
Narrow stripe + fast = gloss; wide + slow = satin. Desktop only (no hover on touch); pair with
`@media (hover: hover)` if the resting state should differ.

## 9. Real neon text - white tube, coloured light

```css
.neon { color: #fff;
  text-shadow: 0 0 2px #fff, 0 0 12px #ff2d95, 0 0 28px #ff2d95, 0 0 60px #ff2d95;  /* ~doubling falloff */
  animation: flicker 5s infinite; }
@keyframes flicker { 0%, 92%, 94%, 100% { opacity: 1; } 93% { opacity: .55; } }
```
Pink letters + glow looks like a sticker; a real tube burns near-white and the colour is the light
spilling off it. Respect `prefers-reduced-motion` for the flicker.

## 10. Never a PNG for a cut-out photo

JPEG cannot do transparency; PNG can but is lossless and huge. **WebP and AVIF do both.** Measured on
a cut-out photo: PNG 40,587 B, WebP 5,006 B, AVIF 4,819 B - the PNG was 8× larger. WebP also
replaces animated GIFs.

## 11. Ship AVIF and WebP, let the browser pick

```html
<picture>
  <source srcset="x.avif" type="image/avif">
  <source srcset="x.webp" type="image/webp">
  <img src="x.png" alt="…">
</picture>
```
The browser takes the first type it understands and downloads only that one. Both Chrome and Firefox
chose the AVIF. AVIF is usually smaller but slower to encode; with `sharp`: `.avif({ quality: 55 })`.

## Responsive layout without media queries (12-17)

From a "CSS responsive layout tricks" reel (Instagram `Dey_WIOTo9C`; creator not shown on screen).
Each was measured in `examples.html` (sections 12-17, each in a box you can drag wider or narrower)
in **Chrome 152 and Firefox 159 on 2026-11-06, which gave the same numbers**.

### 12. Auto-fit grid - as many columns as fit

```css
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
```
Measured: 840px wide gives 4 columns, 468px gives 2, 300px gives 1. Every card is at least 180px,
and the spare width is shared out (`1fr`). `auto-fit` stretches the cards when there are few of
them; `auto-fill` keeps empty slots so they stay their minimum size. If the minimum is bigger than
a phone screen it overflows: use `minmax(min(180px, 100%), 1fr)` (standard fix, NOT measured here).

### 13. Fluid type - clamp()

```css
h1 { font-size: clamp(2rem, 6vw, 5rem); text-wrap: balance; }
```
Measured: a 320px window gives 32px (the floor), 1000px gives 60px, 1600px gives 80px (the ceiling).
⚠ `vw` follows the **window**, not the box: inside a narrow panel on a wide screen the text stays
big. For panel-relative type, put it inside a container (16) and use `cqi` in place of `vw` (NOT measured here - test before relying on it).
`text-wrap: balance` evens out the line lengths of a heading (supported in both browsers).

### 14. Aspect ratio - height follows width

```css
.video { aspect-ratio: 16 / 9; width: 100%; object-fit: cover; }
```
Measured: 640px wide is 360px tall, 300px wide is 168.8px tall. It replaces the old
`padding-top: 56.25%` hack. `object-fit: cover` crops the picture to fill the box; it matters on
`<img>`/`<video>` and does nothing on a div.

### 15. Flex wrap + gap - chips that reflow

```css
.tags { display: flex; flex-wrap: wrap; gap: 14px; }
```
Measured: nine chips fit on 1 row at 840px and take 3 rows at 300px. `gap` spaces rows and columns
alike, so no margin hacks or negative margins are needed.

### 16. Container queries - a component reads ITS OWN width

```css
.wrap { container-type: inline-size; }
@container (min-width: 560px) { .card { flex-direction: row; } }
```
Measured with the window held at 1400px: the box at 468px and 559px gives `column`, and at 560px and
666px gives `row`. **This fixes the panel that breaks when it is narrow inside a wide window**: media
queries cannot see that, container queries can. The query styles the container's children, never the
container itself.
⚠ **Measured trap: the container must get its width from outside.** `inline-size` containment stops
it sizing to its content. Inside a shrink-to-fit parent (inline-block, float, absolute, a grid
`auto` track, a flex item with no basis) it collapses: **0px, against 253px for the same element
without it, in both browsers.** Give it `width: 100%`, a `1fr` track, or `flex: 1`.

### 17. Smart width - readable, margined, centred

```css
.container { width: min(100% - 2rem, 65ch); margin-inline: auto; }
```
Measured: in a 385px box it is 353px wide with a 16px gap each side; in a 1178px box it stops at
65ch (560.6px in Chrome, 561.2px in Firefox) and centres. Two lines replace a `max-width`,
padding and a media query. `65ch` is a comfortable line of text; `ch` depends on the font, so a
narrow display face gives a narrower column.

## Support (measured 2026-10-31)

| | Chrome 152 | Firefox 159 |
|---|---|---|
| `backdrop-filter`, `mask`, `:has()`, individual `translate`/`rotate`/`scale` | yes | yes |
| `popover`, `anchor-name` / `anchor()` | yes | yes |
| `scroll-snap-stop` | yes | yes |
| AVIF in `<picture>` | yes | yes |
| `container-type` / `@container`, `text-wrap: balance`, `aspect-ratio`, `clamp()`/`min()` (measured 2026-11-06) | yes | yes |

Re-measure before relying on this for an older browser; `examples.html` + a `CSS.supports()` call is
the quick check.
