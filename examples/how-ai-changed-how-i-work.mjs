// Orange in this set is always the call a person makes.
import { rnd, line, spline, ellipse, box, roundBox, hatch, words, dashed, arrowHead, figure, MARK, O, D, H } from "../scripts/pen-kit.mjs";

function bulb(cx, cy, r, c = 0) {
  spline([[cx - r * 0.38, cy + r * 0.95], [cx - r * 0.55, cy + r * 0.45], [cx - r, cy - r * 0.1], [cx - r * 0.7, cy - r * 0.85], [cx, cy - r * 1.15],
    [cx + r * 0.7, cy - r * 0.85], [cx + r, cy - r * 0.1], [cx + r * 0.55, cy + r * 0.45], [cx + r * 0.38, cy + r * 0.95]], O(c));
  line(cx - r * 0.38, cy + r * 0.95, cx + r * 0.38, cy + r * 0.95, D(c));
  line(cx - r * 0.34, cy + r * 1.2, cx + r * 0.34, cy + r * 1.2, D(c));
  line(cx - r * 0.18, cy + r * 1.42, cx + r * 0.18, cy + r * 1.42, D(c));
  line(cx - r * 0.16, cy + r * 0.92, cx - r * 0.2, cy + r * 0.12, D(c));
  line(cx + r * 0.16, cy + r * 0.92, cx + r * 0.2, cy + r * 0.12, D(c));
  spline([[cx - r * 0.2, cy + r * 0.12], [cx - r * 0.1, cy - r * 0.08], [cx, cy + r * 0.12], [cx + r * 0.1, cy - r * 0.08], [cx + r * 0.2, cy + r * 0.12]], D(c));
}

// A pile of material, and the one pattern that matters
const patterns = () => {
  const d = D();
  line(120, 150, 372, 150, O()); line(372, 150, 430, 236, O()); line(430, 236, 50, 236, O()); line(50, 236, 120, 150, O());
  words(122, 172, 220, d); words(102, 194, 256, d); words(84, 216, 210, d);
  for (let y = 250, i = 0; y < 446; y += 15, i++) line(50 + rnd(-14, 14), y, 430 + rnd(-14, 14), y + rnd(-1, 1), i % 3 ? d : O());
  line(44, 452, 438, 452, O());

  line(462, 290, 530, 290, d); arrowHead(530, 290, 0, 16, d);

  const card = (x) => { roundBox(x, 110, x + 170, 350, 10, O()); words(x + 22, 142, 100, d); };
  // a trend
  card(560);
  line(584, 176, 584, 322, d); line(584, 322, 708, 322, d);
  spline([[592, 300], [622, 268], [648, 280], [676, 214], [702, 190]], O());
  // bars: the one that gets picked
  card(770);
  line(794, 322, 918, 322, d);
  [[800, 262], [832, 222], [864, 182], [896, 240]].forEach(([x, y], i) => {
    box(x, y, x + 22, 322, O());
    if (i === 2) hatch([[x + 3, y + 3], [x + 19, y + 3], [x + 19, 319], [x + 3, 319]], 52, 8);
  });
  // a scatter
  card(980);
  line(1004, 176, 1004, 322, d); line(1004, 322, 1128, 322, d);
  [[1022, 296], [1040, 262], [1052, 288], [1070, 226], [1086, 262], [1098, 200], [1112, 236], [1034, 214], [1104, 300]].forEach(([x, y]) => ellipse(x, y, 5, 5, d));

  // the call
  ellipse(855, 230, 122, 175, O(MARK), -1.4, 6.9);
};

// The gap between idea and working thing, and the flag someone still has to plant
const bridge = () => {
  const d = D();
  line(30, 300, 385, 300, O());
  spline([[385, 300], [398, 360], [384, 420], [412, 510]], O());
  hatch([[40, 314], [372, 314], [392, 505], [40, 505]], 52, 15);
  line(815, 300, 1170, 300, O());
  spline([[815, 300], [802, 360], [818, 420], [790, 510]], O());
  hatch([[828, 314], [1160, 314], [1160, 505], [808, 505]], 52, 15);

  bulb(170, 198, 72);
  [[-2.5, 96], [-2.0, 112], [-1.57, 120], [-1.14, 112], [-0.64, 96]].forEach(([a, r]) =>
    line(170 + Math.cos(a) * r, 186 + Math.sin(a) * r, 170 + Math.cos(a) * (r + 24), 186 + Math.sin(a) * (r + 24), d));

  // the bridge the tools build quickly
  line(385, 292, 815, 292, O()); line(385, 308, 815, 308, O());
  for (let x = 400; x < 810; x += 30) line(x, 292, x + 2, 308, d);
  [470, 600, 730].forEach((x) => { line(x - 8, 308, x - 10, 506, O()); line(x + 8, 308, x + 10, 506, O()); });
  [[478, 592], [608, 722]].forEach(([a, b]) => {
    line(a, 330, b, 430, d); line(b, 330, a, 430, d); line(a, 430, b, 430, d);
  });
  line(404, 510, 796, 510, d);

  roundBox(900, 130, 1130, 300, 10, O());
  line(900, 162, 1130, 162, D());
  [918, 936, 954].forEach((x) => ellipse(x, 146, 5, 5, d));
  box(924, 184, 1004, 276, d);
  words(1024, 200, 84, d); words(1024, 232, 84, d); words(1024, 262, 60, d);

  // whether it was worth building
  line(330, 300, 328, 110, O(MARK));
  spline([[328, 112], [410, 136], [328, 168]], O(MARK));
  hatch([[334, 124], [384, 139], [334, 156]], 60, 8, H(MARK));
};

// A smart rubber duck, and the one idea worth keeping
const duck = () => {
  const d = D();
  ellipse(520, 240, 92, 88, O(), 2.4, 4.73);
  spline([[206, 318], [262, 372], [352, 382], [444, 306]], O());
  spline([[206, 318], [262, 440], [372, 500], [516, 498], [626, 436], [640, 356], [592, 306]], O());
  ellipse(548, 222, 11, 13, d);
  ellipse(551, 224, 4, 5, O());
  spline([[606, 226], [660, 232], [682, 246], [650, 262], [604, 262]], O());
  line(610, 246, 672, 247, d);
  spline([[340, 402], [420, 392], [500, 420], [440, 462], [370, 452], [340, 402]], d);
  hatch([[300, 446], [420, 478], [530, 476], [520, 490], [400, 492]], 52, 10);

  const water = [];
  for (let x = 110, i = 0; x <= 760; x += 54, i++) water.push([x, 508 + (i % 2 ? 6 : -6)]);
  spline(water, O());
  spline([[220, 530], [262, 524], [304, 530], [346, 524]], d);
  spline([[500, 530], [542, 524], [584, 530]], d);

  dashed([[650, 172], [700, 150], [744, 142]], 13, 11, d);

  [[810, 130, 1], [950, 104, 0], [1102, 150, 1], [830, 330, 0], [1116, 368, 1]].forEach(([x, y, cut]) => {
    bulb(x, y, 44);
    if (cut) line(x - 58, y + 52, x + 58, y - 56, d);
  });

  // most of them get thrown away; this one stays
  bulb(974, 300, 62, MARK);
  for (let a = -2.8; a <= -0.3; a += 0.5) line(974 + Math.cos(a) * 84, 290 + Math.sin(a) * 84, 974 + Math.cos(a) * 108, 290 + Math.sin(a) * 108, D(MARK));
};

// Weighing things that can't be compared, and committing
const scale = () => {
  const d = D();
  line(500, 540, 700, 540, O()); line(480, 568, 720, 568, O()); line(480, 568, 500, 540, O()); line(720, 568, 700, 540, O());
  line(588, 540, 592, 170, O()); line(612, 540, 608, 170, O());
  hatch([[594, 190], [606, 190], [606, 530], [594, 530]], 52, 8);

  // left pan: the analysis
  line(296, 211, 190, 430, d); line(296, 211, 402, 430, d);
  line(190, 430, 402, 430, O());
  spline([[190, 430], [240, 470], [352, 470], [402, 430]], O());
  line(250, 352, 366, 352, d); line(366, 352, 366, 420, d);
  box(238, 362, 354, 428, O());
  words(252, 382, 90, d); words(252, 406, 90, d);

  // right pan: the people it lands on
  line(904, 121, 798, 340, d); line(904, 121, 1010, 340, d);
  line(798, 340, 1010, 340, O());
  spline([[798, 340], [848, 380], [960, 380], [1010, 340]], O());
  [846, 904, 962].forEach((x) => {
    ellipse(x, 272, 19, 19, O());
    spline([[x - 30, 338], [x - 26, 304], [x, 296], [x + 26, 304], [x + 30, 338]], O());
  });

  // the commitment
  line(290, 205, 910, 115, O(MARK)); line(290, 218, 910, 128, O(MARK));
  ellipse(600, 166, 20, 20, O(MARK));
  ellipse(600, 166, 7, 7, D(MARK));
};

export default [
  figure("FIGURE_WORK_PATTERNS", 1200, 470, patterns),
  figure("FIGURE_WORK_BRIDGE", 1200, 530, bridge),
  figure("FIGURE_WORK_DUCK", 1200, 545, duck),
  figure("FIGURE_WORK_SCALE", 1200, 590, scale),
];
