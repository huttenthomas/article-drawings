---
name: article-drawings
description: Draw concept illustrations for an article or blog post as fine hand-drawn pen line art that draws itself live on a canvas, in the style of Thomas Hutten's portfolio (black ink with one signal-orange accent, hatching, no fills, no lettering). The drawings are invented from what the text argues, so no photo or source image is needed. Use this whenever someone wants images, illustrations, drawings, sketches or doodles for an article, post, essay or section of text, says "illustrate this post", "draw something for this article", "add images to my writing" or "the same drawn style as my site", even if they don't mention canvas or strokes. To trace an existing photo or pen drawing, use the pen-drawing skill instead.
---

# Article drawings

Reads a piece of writing and draws a small set of illustrations for it. Every stroke is placed by code, in the same `{w, h, scale, colors, strokes}` format the pen tracer produces, so the same canvas player draws them with a moving nib.

The drawings earn their place by carrying an idea from the text. A generic picture of a laptop next to an article about software is decoration, and it's worse than leaving the space empty.

## Workflow

### 1. Read the whole article and find what orange means

Choose one meaning for the accent colour, taken from the article's argument, and hold it across every drawing in the article. This is what makes a set feel authored. Examples that worked:

- "It doesn't matter which model you use": orange is the thing that is written down.
- "How AI changed how I work": orange is the call a person makes.
- "Why roadmaps are a lie": orange is what you can honestly commit to.
- "What front-end taught me": orange is the detail that makes it real.

Everything else is ink. Write the rule as a comment at the top of the figure file.

### 2. Pick the scenes

Aim for about one drawing per 300 words: two for a short post, four for a long one. Fewer good ones beat more weak ones.

Each drawing has to illustrate one specific sentence, so start from the sentence. Look first for the writer's own images (a rubber duck, a recipe and a cook, a gap between two things) because they are already vivid. Then look for a contrast or a mechanism that shapes can show: solid turning into dissolved, many paths to one target, things joined by threads. Avoid abstract-concept clichés such as gears, cogs, brains and puzzle pieces.

Captions reuse the article's own sentences wherever one fits. On a site with verbatim copy, that also avoids inventing new text. Don't repeat a caption word for word right below the same sentence unless it reads as a deliberate echo.

### 3. Draw

Use `scripts/pen-kit.mjs`. Each article gets one file that default-exports its figures:

```js
// Orange in this set is always the call a person makes.
import { line, spline, ellipse, roundBox, hatch, words, arrowHead, figure, MARK, O, D, H } from "../pen-kit.mjs";

const flag = () => {
  line(30, 300, 1170, 300, O());                // firm ink outline
  words(80, 120, 240, D());                     // a line of "handwriting"
  hatch([[80, 140], [200, 140], [200, 280], [80, 280]], 52, 12); // shading, light ink
  line(600, 300, 598, 100, O(MARK));            // accent
};

export default [figure("FIGURE_MYPOST_FLAG", 1200, 340, flag)];
```

Coordinates are in a 1200-wide space; pick the height to fit the scene with about 30 units of margin. Names must be unique across the site and valid JS, so prefix them per article.

| Helper | Draws |
|---|---|
| `O(c)`, `D(c)`, `H(c)` | Pen settings: firm outline, detail, light hatching. `c` is `MARK` for the accent. Spread to adjust: `{ ...D(), a: 60 }` fades, `amp: 5` makes a line shakier |
| `line(x0, y0, x1, y1, o)` | Slightly bowed, overshooting line |
| `spline(points, o, closed)` | Smooth curve through points |
| `ellipse(cx, cy, rx, ry, o, from, sweep)` | Circle, or an arc with `from` and `sweep` in radians (y points down) |
| `box`, `roundBox(x0, y0, x1, y1, r, o)` | Rectangles, each side or corner drawn by hand |
| `page(x0, y0, x1, y1, fold, c)` | Sheet of paper with a folded corner |
| `torso(x0, y0, x1, ground, r, o)` | Rounded shape standing on a line, open at the bottom |
| `hatch(polygon, angle, gap, o)` | Parallel shading clipped to a polygon; use about 52 degrees and a 10 to 14 gap |
| `words(x, y, len, o)` | Word-length dashes that read as text |
| `dashed(points, dash, gap, o)` | Broken line, for anything planned or not yet real |
| `arrowHead(x, y, degrees, size, o)` | Arrow tip pointing along `degrees` |
| `tilted(deg, cx, cy, fn)` | Runs `fn` rotated, for things that shouldn't sit square |

Things that keep it looking drawn:

- **Strokes are transparent to each other.** There are no fills, so anything behind an object shows through it. Plan the layout so objects don't overlap, or stop the back line where the front object begins.
- **Don't letter words.** Pen-stroke text looks childish and can't be translated. Use `words()`, and single glyphs when they carry meaning: `#`, `?`, `!`, digits, a check mark, an X.
- **Keep detail coarse enough for a phone.** A 1200-wide drawing appears about 350 pixels wide there. Spacing below about 8 units clots.
- **Use a little hatching on one side of main objects.** It's what separates these from a wireframe. Too much makes them muddy, and most small objects need none.

### 4. Check it by eye, and fix it

Render with the preview script. It also warns about strokes that leave the canvas.

```bash
node ~/.claude/skills/article-drawings/scripts/preview.mjs <strokes.js> <out.png> [NAME_FILTER] [--dark]
```

Read the PNG and look for these, which are the mistakes that actually come up:

- Objects passing through the ground line or through each other.
- Arrows or connectors running into a neighbouring object, or crossing text. Make text end where a connector leaves.
- Parts that read as something else, such as a filament that looks like a second bulb.
- Orange used for anything outside the article's rule.
- Whether a stranger would get the idea from the drawing and caption alone.

Expect one correction round. Then look at it once more in the real page.

### 5. Put it on the site

**On Thomas Hutten's portfolio** (the `personal-site-2027` project) everything is already wired up:

1. Add `tools/article-figures/<slug>.mjs` (the kit is at `tools/pen-kit.mjs`).
2. Run `node tools/draw-article-figures.mjs`.
3. Place each drawing in `content/blog/<slug>.mdx`, right after the sentence it illustrates. `alt` describes what is drawn, and `duration` in milliseconds is optional (default 3000):
   ```mdx
   <Drawing name="FIGURE_MYPOST_FLAG" alt="A flag planted on a line." caption="The article's own sentence." />
   ```
   Use ``caption={`…`}`` when the caption contains double quotes.
4. Run `npm run blog`.
5. Follow the project's `CLAUDE.md`, especially §4.1 on restraint. Leave the post's text untouched.

**On any other site**, set up a folder for the drawings, with the kit one level above the figure files so the import in step 3 resolves:

```
drawings/pen-kit.mjs              copied from scripts/
drawings/figures/<slug>.mjs       one per article
```

Build them into one stroke file, and copy `scripts/player.js` to the site:

```bash
node ~/.claude/skills/article-drawings/scripts/build.mjs drawings/figures public/drawings.js
```

```html
<canvas data-figure="FIGURE_MYPOST_FLAG" data-duration="3000" role="img" aria-label="…" style="display:block;width:100%"></canvas>
<script src="/drawings.js"></script>
<script src="/player.js"></script>
```

The player needs its scripts after the canvases, because it looks them up once when it loads. For content rendered later by JavaScript, call `drawFigure(canvas, window.NAME, 3000)` yourself.

Inks come from CSS `--fig-ink` and `--fig-red` on the canvas. Set `--fig-red` to the site's accent colour, and for a dark theme set a light `--fig-ink` and dispatch a `themechange` event on `window` to redraw.

**Verifying the animation:** headless Chrome doesn't run `requestAnimationFrame`, so an animated page freezes at its first dot and looks broken when it isn't. Screenshot with `--force-prefers-reduced-motion` to see the finished drawings. To exercise the animation, test a copy of the page with `requestAnimationFrame` replaced by a `setTimeout` and use `--virtual-time-budget`.

## Style in one paragraph

Fine single-weight pen on a plain page. Ink plus one accent, round caps, no fills, no gradients, no shadows, no lettering. Lines wobble slightly and overshoot at corners, as if drawn quickly by someone who draws well. Calm and a bit dry, with a small visual joke where the text allows it.
