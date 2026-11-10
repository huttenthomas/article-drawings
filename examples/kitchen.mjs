// Reference: a person drawn well enough to not look childish.
// From "It doesn't matter which AI model you use": orange is the thing that is written down (the recipe).
// Side view, head tilted with tilted(), forearm built from a tapering centreline, body cut by a counter.
import { line, spline, ellipse, hatch, words, page, figure, withTransform, tilted, MARK, O, D, H } from "../scripts/pen-kit.mjs";

// ── 4. The recipe is the skill, the cook is the agent ──
// The cook stands behind the counter in profile, head bent towards the card, stirring.
const kitchen = () => {
  const d = D(), h = H();
  const TOP = 504;

  // the counter: the surface everything stands on, with a little shadow under its edge
  line(30, TOP, 1170, TOP, O());
  line(30, TOP + 16, 1170, TOP + 17, d);
  hatch([[40, TOP + 21], [1160, TOP + 21], [1160, TOP + 38], [40, TOP + 38]], 52, 12, { ...H(), a: 50 });

  // the recipe card, propped up at the back of the counter
  const k = 0.74, a = (-3.5 * Math.PI) / 180, cx = 200, cy = 300;
  withTransform(([px, py]) => {
    const x = 70 + (px - 82) * k, y = TOP - 4 + (py - 628) * k;
    return [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
  }, () => {
    const m = D(MARK);
    page(82, 72, 448, 628, 52, MARK);
    line(126, 136, 330, 134, O(MARK));
    line(126, 148, 280, 147, m);
    const digits = [
      () => { line(132, 222, 140, 214, m); line(140, 214, 140, 246, m); },
      () => spline([[130, 288], [140, 278], [150, 288], [130, 314], [152, 314]], m),
      () => spline([[130, 350], [146, 348], [136, 364], [152, 372], [146, 384], [130, 382]], m),
      () => { line(146, 416, 130, 442, m); line(130, 442, 154, 442, m); line(148, 428, 148, 454, m); },
    ];
    [232, 300, 366, 436].forEach((y, i) => {
      digits[i]();
      words(176, y, [226, 196, 226, 166][i], m);
      if (i !== 3) words(176, y + 30, [150, 202, 118][i], m);
    });
    line(126, 524, 404, 524, m);
    ellipse(150, 572, 15, 15, m);
    line(142, 572, 148, 581, m); line(148, 581, 160, 562, m);
    words(186, 574, 190, m);
  });

  // the pot
  const pc = 572, rimY = 424, rx = 112, ry = 20;
  ellipse(pc, rimY, rx, ry, O());
  ellipse(pc, rimY + 2, rx - 9, ry - 6, d, Math.PI * 1.04, Math.PI * 0.92);
  spline([[pc - rx + 1, rimY + 2], [pc - rx + 5, rimY + 46], [pc - rx + 12, TOP - 6], [pc - 60, TOP], [pc, TOP + 1]], O());
  spline([[pc + rx - 1, rimY + 2], [pc + rx - 5, rimY + 46], [pc + rx - 12, TOP - 6], [pc + 60, TOP], [pc, TOP + 1]], O());
  spline([[pc - rx + 4, rimY + 26], [pc, rimY + 44], [pc + rx - 4, rimY + 26]], { ...h, a: 55 });
  spline([[pc - rx + 2, rimY + 12], [pc - rx - 26, rimY + 10], [pc - rx - 30, rimY + 28], [pc - rx + 4, rimY + 32]], d);
  spline([[pc + rx - 2, rimY + 12], [pc + rx + 24, rimY + 12], [pc + rx + 26, rimY + 28], [pc + rx - 4, rimY + 32]], d);
  hatch([[pc + 50, rimY + 40], [pc + rx - 8, rimY + 26], [pc + rx - 14, TOP - 8], [pc + 50, TOP - 4]], 56, 9);

  // steam, curling up between the card and the cook
  [[508, 398, 0], [562, 402, 1], [612, 398, 0]].forEach(([x, y, t]) =>
    spline([[x, y], [x - 12, y - 26], [x + 8, y - 54], [x - 6, y - 82], [x + 10 - t * 6, y - 104 + t * 12]], { ...h, a: 80 }));

  // the arm: forearm from elbow (E) to wrist (W), tapering, sleeve rolled up
  const E = [892, 474], W = [740, 396];
  const along = (t, off) => {
    const dx = W[0] - E[0], dy = W[1] - E[1], L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L;
    const half = 20 - 9 * t + (off < 0 ? 4 * Math.sin(Math.min(1, t * 1.6) * Math.PI) : 0);
    return [E[0] + dx * t + nx * off * half, E[1] + dy * t + ny * off * half];
  };
  const edge = (t0, t1, side, o) => spline([0, 0.25, 0.5, 0.75, 1].map((u) => along(t0 + (t1 - t0) * u, side)), o);
  edge(0.06, 0.40, -1, O()); edge(0.02, 0.40, 1, O());          // sleeve
  edge(0.52, 1.0, -1, O()); edge(0.52, 1.0, 1, O());           // bare forearm
  [0.40, 0.52].forEach((t) => spline([along(t, -1.1), along(t + 0.015, 0), along(t, 1.1)], O()));
  spline([along(0.46, -1.05), along(0.475, 0), along(0.46, 1.05)], d);
  spline([along(0.14, 0.9), along(0.2, 0.2)], { ...h, a: 70 });
  spline([along(0.28, 1), along(0.33, 0.35)], { ...h, a: 70 });
  hatch([along(0.56, 0.2), along(0.96, 0.2), along(0.96, 1), along(0.56, 1)], 30, 7);
  spline([along(0.02, 1), [E[0] + 18, E[1] + 12], [E[0] + 24, E[1] - 6]], O());  // elbow

  // the hand, closed round a wooden spoon
  spline([[740, 384], [724, 377], [706, 377], [697, 386], [696, 398], [702, 408], [718, 412], [743, 408]], O());
  spline([[704, 381], [699, 392], [703, 404]], d);                         // knuckle line
  [[699, 390, 710, 391], [700, 399, 711, 401]].forEach(([x0, y0, x1, y1]) => spline([[x0, y0], [(x0 + x1) / 2, y0 + 2], [x1, y1]], d));
  spline([[738, 386], [728, 381], [716, 382], [708, 386]], d);              // thumb over the handle
  hatch([[712, 404], [738, 400], [740, 408], [716, 411]], 30, 5, { ...H(), a: 60 });
  const sp = (t, side) => [712 - 0.64 * t + side * 3.2, 392 + 0.77 * t + side * 2.6];
  [-1, 1].forEach((side) => {
    line(...sp(-48, side), ...sp(-17, side), d);
    line(...sp(19, side), ...sp(side < 0 ? 64 : 62, side), d);
  });
  ellipse(...sp(-50, 0), 4.5, 4.5, d, 3.4, 3.4);

  // the body, behind the counter
  spline([[800, 356], [838, 363], [878, 350]], O());             // collar
  spline([[801, 377], [840, 384], [882, 369]], O());
  line(800, 356, 801, 377, O());
  spline([[801, 377], [784, 386], [774, 400]], O());             // chest, cut by the arm
  spline([[770, 438], [764, 466], [766, 490], [768, TOP]], O());
  spline([[880, 358], [912, 368], [936, 392], [946, 432], [938, 466], [918, 486]], O()); // shoulder, upper arm
  spline([[882, 404], [874, 430], [870, 454]], d);                 // armpit
  spline([[934, 482], [946, 494], [950, TOP]], O());                // back
  spline([[796, 386], [812, 420]], d);                              // double-breasted flap
  spline([[786, 444], [792, 476], [794, TOP - 2]], d);
  ellipse(808, 480, 4.5, 4.5, d); ellipse(840, 482, 4.5, 4.5, d);
  hatch([[918, 392], [940, 414], [942, 452], [926, 474], [910, 450]], 52, 9);
  hatch([[868, 496], [930, 486], [946, 500], [866, 500]], 52, 9);

  // the head, bent towards the card
  tilted(-9, 832, 344, () => {
    // toque: a band and a pleated puff
    line(770, 136, 884, 140, O()); line(772, 170, 886, 173, O());
    line(770, 136, 772, 170, O()); line(884, 140, 886, 173, O());
    spline([[774, 138], [758, 112], [764, 80], [790, 58], [830, 46], [870, 52], [900, 74], [906, 108], [884, 140]], O());
    spline([[800, 136], [794, 100], [806, 66]], d);
    spline([[838, 138], [842, 94], [834, 54]], d);
    spline([[868, 138], [878, 102], [872, 64]], d);
    hatch([[878, 70], [904, 92], [904, 120], [884, 138], [874, 104]], 52, 9);
    hatch([[858, 144], [884, 144], [884, 168], [858, 168]], 52, 8);

    // profile: brow, nose, lips, chin
    spline([[774, 172], [768, 190], [764, 205], [769, 216], [763, 234], [755, 250], [756, 257], [764, 261],
      [767, 266], [764, 275], [768, 282], [766, 290], [771, 298], [768, 312], [776, 326], [794, 333]], O());
    spline([[792, 334], [822, 326], [840, 306], [846, 288]], O());   // jaw
    spline([[886, 173], [904, 196], [911, 228], [902, 258], [884, 280], [870, 296], [866, 322], [872, 352]], O()); // back of skull, nape
    spline([[848, 284], [834, 318], [816, 350]], { ...H(), a: 75 }); // neck muscle
    spline([[797, 336], [801, 350], [803, 360]], O());               // throat

    // ear
    spline([[836, 236], [848, 231], [857, 243], [855, 262], [846, 276], [836, 273]], O());
    spline([[843, 244], [849, 250], [846, 262]], d);

    // eye looking down at the card, brow, nostril, mouth
    spline([[772, 225], [781, 221], [790, 224]], d);
    spline([[775, 230], [783, 232], [789, 229]], { ...h, a: 85 });
    ellipse(777, 228, 2.4, 2.6, d);
    spline([[766, 210], [780, 205], [797, 208]], d);
    spline([[760, 256], [765, 253], [770, 257]], d);
    line(768, 282, 777, 281, d);
    spline([[773, 262], [777, 274], [776, 282]], { ...h, a: 70 });

    // hair under the toque
    [[838, 176, 840, 218], [856, 176, 862, 206], [870, 178, 880, 214], [882, 180, 892, 222], [880, 222, 886, 252], [868, 240, 872, 270]].forEach(([x0, y0, x1, y1]) =>
      spline([[x0, y0], [(x0 + x1) / 2 + 2, (y0 + y1) / 2], [x1, y1]], { ...h, a: 85 }));

    // shading: cheek and under the jaw
    hatch([[812, 270], [832, 280], [834, 300], [818, 312]], 52, 10, { ...H(), a: 45 });
    hatch([[800, 340], [836, 326], [864, 300], [868, 350], [806, 358]], 52, 8);
  });
};

export default [figure("FIGURE_EXAMPLE_KITCHEN", 1200, 580, kitchen)];
