#!/usr/bin/env node
// Renders every figure in a stroke file to one PNG and reports strokes outside their canvas.
// Usage: node preview.mjs <strokes.js> <out.png> [NAME_FILTER] [--dark]
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import vm from "node:vm";

const args = process.argv.slice(2);
const dark = args.includes("--dark");
const [src, out, filter = ""] = args.filter((a) => a !== "--dark");
if (!src || !out) { console.error("usage: preview.mjs <strokes.js> <out.png> [NAME_FILTER] [--dark]"); process.exit(1); }

const window = {};
vm.runInNewContext(await readFile(src, "utf8"), { window });
const names = Object.keys(window).filter((n) => n.includes(filter));

for (const n of names) {
  const F = window[n];
  let outside = 0;
  for (const s of F.strokes) {
    let x = s[3], y = s[4];
    for (let i = 5; i <= s.length; i += 2) {
      if (x < 0 || y < 0 || x > F.w || y > F.h) { outside++; break; }
      x += s[i]; y += s[i + 1];
    }
  }
  console.log(`${n}: ${F.w}x${F.h}, ${F.strokes.length} strokes${outside ? `, WARNING ${outside} leave the canvas` : ""}`);
}

const PAGE = dark ? "#111111" : "#efefef";
const INKS = dark ? ["#ece8e4", "#ff6a2b"] : ["#211d1e", "#ff4f12"];
const W = 760; // about the column width at which these are seen, doubled up for review
const html = `<!doctype html><body style="margin:0;background:${PAGE};display:grid;grid-template-columns:${W}px ${W}px;gap:14px;align-items:start"><script>
const figs=${JSON.stringify(names.map((n) => window[n]))}, pal=${JSON.stringify(INKS)};
for (const F of figs) { const k=${W}/F.w, c=document.createElement("canvas"); c.width=${W}; c.height=F.h*k; document.body.append(c);
const x=c.getContext("2d"); x.scale(k,k); x.lineCap=x.lineJoin="round";
for (const s of F.strokes) { x.globalAlpha=s[2]/100; x.strokeStyle=pal[s[0]]; x.lineWidth=Math.max(.65/k,s[1]/10*.72); x.beginPath(); let X=s[3],Y=s[4]; x.moveTo(X,Y); for (let i=5;i<s.length;i+=2){X+=s[i];Y+=s[i+1];x.lineTo(X,Y)} x.stroke(); } }
</script>`;
const dir = await mkdtemp(join(tmpdir(), "article-drawings-"));
const page = join(dir, "preview.html");
await writeFile(page, html);

const rows = Math.ceil(names.length / 2);
const tallest = Math.max(...names.map((n) => (window[n].h / window[n].w) * W));
const chrome = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${join(dir, "profile")}`,
  `--window-size=${W * 2 + 14},${Math.ceil(rows * (tallest + 14))}`, "--virtual-time-budget=1500", `--screenshot=${resolve(out)}`, `file://${page}`], { stdio: "ignore" });
console.log(`Preview → ${resolve(out)}`);
