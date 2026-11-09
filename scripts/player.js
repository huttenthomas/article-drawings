/* Pen-drawing player: draws window[NAME] stroke by stroke on a <canvas>, like a pen.
   Usage: <canvas data-figure="FIGURE" data-duration="4000"></canvas>
          <script src="strokes.js"></script><script src="player.js"></script>
   Ink colours come from CSS --fig-ink / --fig-red on the canvas (fallback: the colours in the data),
   so a dark theme can invert them; dispatch a "themechange" event on window to redraw.
   Starts when scrolled into view. With prefers-reduced-motion it renders complete at once. */
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function drawFigure(canvas, F, DURATION = 4000) {
    canvas.style.aspectRatio = `${F.w} / ${F.h}`;
    const ctx = canvas.getContext("2d");
    const strokes = F.strokes.map((s) => {
      const pts = [];
      let x = 0, y = 0;
      for (let i = 3; i < s.length; i += 2) {
        x = i === 3 ? s[i] : x + s[i];
        y = i === 3 ? s[i + 1] : y + s[i + 1];
        pts.push([x, y]);
      }
      let len = 0;
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push((len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])));
      return { ci: s[0], w: s[1] / 10, a: s[2] / 100, pts, cum, len };
    });
    const total = strokes.reduce((t, s) => t + s.len, 0);
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");
    let scale = 1, dpr = 1, baked = 0, drawnLen = 0, start = null, done = false, raf = 0;
    let palette = F.colors;
    const readPalette = () => {
      const cs = getComputedStyle(canvas);
      palette = [cs.getPropertyValue("--fig-ink").trim() || F.colors[0], cs.getPropertyValue("--fig-red").trim() || F.colors[1]];
    };
    function setup() {
      readPalette();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth || 440;
      scale = cssW / F.w;
      for (const c of [canvas, layer]) {
        c.width = Math.round(cssW * dpr);
        c.height = Math.round(F.h * scale * dpr);
      }
      for (const c of [ctx, lctx]) {
        c.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
        c.lineCap = "round";
        c.lineJoin = "round";
      }
      baked = 0;
    }
    const widthOf = (s) => Math.max(0.65 / scale, s.w * 0.72); // a little thinner than traced: fine pen
    function trace(c, s, upto = s.len) {
      c.globalAlpha = s.a;
      c.strokeStyle = palette[s.ci];
      c.lineWidth = widthOf(s);
      c.beginPath();
      c.moveTo(s.pts[0][0], s.pts[0][1]);
      let tip = s.pts[0];
      for (let i = 1; i < s.pts.length; i++) {
        if (s.cum[i] <= upto) {
          c.lineTo(s.pts[i][0], s.pts[i][1]);
          tip = s.pts[i];
        } else {
          const seg = s.cum[i] - s.cum[i - 1];
          const t = seg ? (upto - s.cum[i - 1]) / seg : 0;
          tip = [s.pts[i - 1][0] + (s.pts[i][0] - s.pts[i - 1][0]) * t, s.pts[i - 1][1] + (s.pts[i][1] - s.pts[i - 1][1]) * t];
          c.lineTo(tip[0], tip[1]);
          break;
        }
      }
      c.stroke();
      return tip;
    }
    function render(target) {
      let acc = 0, i = 0;
      for (; i < strokes.length; i++) {
        if (acc + strokes[i].len > target) break;
        if (i >= baked) trace(lctx, strokes[i]);
        acc += strokes[i].len;
      }
      baked = Math.max(baked, i);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      if (i < strokes.length) {
        const tip = trace(ctx, strokes[i], target - acc);
        ctx.globalAlpha = 0.9; // the pen nib
        ctx.fillStyle = palette[strokes[i].ci];
        ctx.beginPath();
        ctx.arc(tip[0], tip[1], 2.2 / scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) * 0.25 + t * 0.75;
    function frame(now) {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      drawnLen = ease(t) * total;
      render(drawnLen);
      if (t < 1) raf = requestAnimationFrame(frame);
      else done = true;
    }
    function clearLayer() {
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.clearRect(0, 0, layer.width, layer.height);
      setup();
    }
    setup();
    if (reduced) {
      drawnLen = total; render(total); done = true;
    } else {
      const obs = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          setTimeout(() => (raf = requestAnimationFrame(frame)), 250);
        }
      }, { threshold: 0.15 });
      obs.observe(canvas);
      render(0);
    }
    const redraw = () => { clearLayer(); render(done ? total : drawnLen); };
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(redraw, 150); });
    addEventListener("themechange", redraw);
    return {
      replay() {
        cancelAnimationFrame(raf); clearLayer(); start = null; done = false; drawnLen = 0;
        if (reduced) { drawnLen = total; render(total); done = true; } else raf = requestAnimationFrame(frame);
      },
    };
  }

  window.drawFigure = drawFigure;
  document.querySelectorAll("canvas[data-figure]").forEach((c) => {
    const F = window[c.dataset.figure];
    if (F) c.player = drawFigure(c, F, +c.dataset.duration || 4000);
  });
})();
