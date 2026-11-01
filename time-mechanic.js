// time-mechanic.js
// Mechanic: TIME-BASED
// Owner: Doris Zheng (unikey: jzhe3132)
//
// Time drives a psychedelic background made of 8 scenes inspired by Yayoi Kusama:
//   1 white dots on black        2 black dots on white
//   3 a swirling tree of colourful flowing lines, erupting from a dark trunk
//   4 Infinity Mirror Room dot tunnel        5 swaying dotted tentacles
//   6 moving flow-field strokes (swirling lines, Starry Night style)
//   7 rain landing on the ground and splashing into colourful puddles
//   8 red "cracked canvas" spider-web threads
// - Each scene breathes (zooms in and out) on a steady 6s cycle while it plays.
// - Soft coloured glow-dust floats over the top and pulses with the same breath.
// - TIME + PERLIN NOISE FUSION: noise() doesn't just decorate the visuals here -
//   it decides HOW LONG each scene's own timer runs for (see sceneDurations in
//   initTimeMechanic/sceneInfo), so the timed event that switches scenes is
//   itself shaped by Perlin noise, not a flat fixed interval. noise() also
//   drives every shape's drift/wobble; random() + randomSeed() give each
//   dot/drop/branch its own fixed size, position and phase.
//
// Public functions (called from sketch.js):
//   initTimeMechanic()   -> call once in setup()
//   drawTimeBackground() -> call first in draw()
//   drawTimeDots()       -> call after the background, before the foreground
//   skipScene()          -> optional, jumps to the next scene (press N or SPACE)
//   getSceneIndex()      -> which scene is playing (0-7), so other mechanics can react
//   getTimeBreath()      -> 0-1 breathing value right now, so other mechanics can react

const SCENE_LEN_BASE = 12;   // the average/base seconds per scene - noise() stretches or
                              // squashes each individual scene around this, see below
const SCENE_LEN_SPREAD = 8;  // how many seconds noise() can add on top of the base
const BREATH_LEN = 6;        // seconds for one zoom in + zoom out
const FADE_LEN = 2;          // seconds of cross-fade between scenes
const DOT_COUNT = 60;
const RAIN_COUNT = 90;
const SWIRL_STRAND_COUNT = 340;

let timeDots = [];
let flowJitter = [];       // fixed random offsets and colours for the flow-field strokes
let rainDrops = [];        // fixed random timing/position/colour for each puddle
let swirlStrands = [];     // fixed random angle/colour/curl-rate for each swirling line strand
let timeShift = 0;         // extra seconds added by skipScene()

// HOW TIME AND PERLIN NOISE ACTUALLY FUSE IN THIS MECHANIC:
// it isn't just "there's a timer AND there's noise somewhere" - noise() is what
// DECIDES the timer's own length. Every scene gets its own fixed-but-different
// playtime, sampled once from noise(sceneIndex) in initTimeMechanic() below, so
// the thing that triggers each scene change (a timer reaching its length) has a
// length that Perlin noise itself generated. sceneDurations/sceneStarts/cycleLen
// hold that schedule; sceneInfo() is the lookup every other time function uses.
let sceneDurations = [];   // each scene's own noise()-chosen length, in seconds
let sceneStarts = [];      // cumulative start time of each scene within one full cycle
let cycleLen = 0;          // total length of one pass through all 8 scenes

// Order of scenes. Function declarations are hoisted, so this is safe.
const scenes = [sceneDotsDark, sceneDotsLight, sceneSwirlTree, sceneDotTunnel,
                 sceneTentacles, sceneFlow, sceneRain, sceneWeb];

function initTimeMechanic() {
  randomSeed(103);
  noiseSeed(103);
  timeDots = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    timeDots.push({
      x: random(),              // 0-1, so it still works after window resize
      y: random(),
      size: random(5, 22),
      phase: random(TWO_PI),
      speed: random(0.4, 1.2),
      hueSeed: random(360)
    });
  }
  flowJitter = [];
  for (let i = 0; i < 4000; i++) {
    flowJitter.push({ jx: random(-0.5, 0.5), jy: random(-0.5, 0.5), c: random() });
  }
  // each entry is a fixed spot on the "ground" that rain periodically lands on
  // and splashes into a puddle - position, timing and colour are all random()
  // so every spot has its own rhythm, but never changes once the page loads
  rainDrops = [];
  for (let i = 0; i < RAIN_COUNT; i++) {
    rainDrops.push({
      x: random(),
      y: random(),
      period: random(3.5, 7),     // seconds between drops landing on this spot
      phase: random(1000),
      hue: random(360),
      maxR: random(45, 120)
    });
  }

  // fixed starting angle/colour/curl-rate for every swirling strand - random()
  // gives each one a stable identity; noise() (used in the scene itself) only
  // jitters its path as it flows outward from the trunk
  swirlStrands = [];
  for (let i = 0; i < SWIRL_STRAND_COUNT; i++) {
    const r = random();
    // weighted like the reference: lots of green/gold "canopy" colour, a good
    // amount of blue, a smaller core of deep red/maroon and black near the trunk
    const colorIndex = r < 0.3 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4;
    swirlStrands.push({
      angle0: random(-PI * 0.97, -PI * 0.03),   // fans out from almost-left to almost-right, pointing up
      x0: random(-1, 1),                        // small spread of starting points along the trunk top
      colorIndex,
      curlRate: random(0.018, 0.05),
      lenSeed: random(),
      driftSeed: random(1000)
    });
  }

  // this is the actual time + Perlin noise fusion: noise() (not random()) picks
  // how long EACH scene gets to play, so the timer that drives scene-switching
  // is itself shaped by Perlin noise rather than being a flat, even 12s/12s/12s.
  // Using noise() here instead of random() matters: noise(i) for whole-number i
  // is smooth across neighbours, so consecutive scenes get gently-varying
  // playtimes rather than totally unrelated ones, which keeps the pacing feeling
  // intentional instead of jittery.
  sceneDurations = [];
  sceneStarts = [];
  cycleLen = 0;
  for (let i = 0; i < scenes.length; i++) {
    const n = noise(i * 13.7, 42.0);               // 0-1, smooth across scene index
    const dur = SCENE_LEN_BASE - SCENE_LEN_SPREAD / 2 + n * SCENE_LEN_SPREAD;
    sceneStarts.push(cycleLen);
    sceneDurations.push(dur);
    cycleLen += dur;
  }
}

// looks up which scene is playing at a given moment, how far into that scene's
// own (noise-chosen) duration we are, and how long that scene actually runs for
function sceneInfo(t) {
  const tc = ((t % cycleLen) + cycleLen) % cycleLen;
  let idx = 0;
  while (idx < scenes.length - 1 && tc >= sceneStarts[idx + 1]) idx++;
  return { idx, localT: tc - sceneStarts[idx], dur: sceneDurations[idx] };
}

function skipScene() {
  const t = timeNow();
  const info = sceneInfo(t);
  const nextIdx = (info.idx + 1) % scenes.length;
  const targetTc = sceneStarts[nextIdx];          // 0 when wrapping back to scene 0
  const tc = ((t % cycleLen) + cycleLen) % cycleLen;
  timeShift += ((targetTc - tc) + cycleLen) % cycleLen;
}

function timeNow() {
  return millis() / 1000 + timeShift;
}

function getSceneIndex() {
  return sceneInfo(timeNow()).idx;
}

function getTimeBreath() {
  return timeBreath(sceneInfo(timeNow()).localT);
}

// 0 -> 1 -> 0 over BREATH_LEN seconds. Smooth, starts at 0.
function timeBreath(localT) {
  return 0.5 - 0.5 * cos(TWO_PI * localT / BREATH_LEN);
}

// Small helper: build an rgba() string from an HSB colour, no matter what
// colorMode() happens to be active right now. Used by the glow-dust overlay
// and the rain scene so their colours can drift smoothly through the wheel.
function hsbToRgba(h, s, v, a) {
  push();
  colorMode(HSB, 360, 100, 100, 1);
  const c = color(h, s, v, a);
  pop();
  return `rgba(${red(c)},${green(c)},${blue(c)},${alpha(c) / 255})`;
}

// ---------- main background ----------
function drawTimeBackground() {
  const t = timeNow();
  const info = sceneInfo(t);

  drawSceneLayer(scenes[info.idx], t, info.localT, 1);

  // Last seconds of a scene: the next one fades in on top. info.dur is that
  // scene's own noise()-chosen length, so faster scenes fade sooner and
  // longer ones get more time at full strength, rather than every scene
  // using the same fixed cutoff.
  const fadeStart = info.dur - FADE_LEN;
  if (info.localT > fadeStart) {
    const a = constrain((info.localT - fadeStart) / FADE_LEN, 0, 1);
    const eased = a * a * (3 - 2 * a);
    const nextIdx = (info.idx + 1) % scenes.length;
    drawSceneLayer(scenes[nextIdx], t, info.localT - info.dur, eased);
  }
}

function drawSceneLayer(sceneFn, t, localT, alpha) {
  const b = timeBreath(localT);
  const R = sqrt(width * width + height * height) / 2; // centre to corner
  push();
  drawingContext.globalAlpha = alpha;
  translate(width / 2, height / 2);
  sceneFn(t, b, R);
  drawingContext.globalAlpha = 1;
  pop();
}

function fillBG(c) {
  noStroke();
  if (Array.isArray(c)) fill(c[0], c[1], c[2]);
  else fill(c);
  rect(-width / 2, -height / 2, width, height);
}

// ---------- scene 1: white dots on black, breathing ----------
function sceneDotsDark(t, b, R) {
  fillBG(0);
  noStroke();
  fill(255);   // plain white dots, no colour tint - pure black/white only, as requested
  const gap = max(width, height) / 22;
  let row = 0;
  for (let y = -height / 2 - gap; y < height / 2 + gap; y += gap * 0.87) {
    for (let x = -width / 2 - gap; x < width / 2 + gap; x += gap) {
      const px = x + (row % 2) * gap * 0.5;    // every second row is shifted (staggered grid)
      // noise gives each region its own slow rhythm, breathing makes all dots swell together
      const n = noise((px + width / 2) * 0.004, (y + height / 2) * 0.004, t * 0.2);
      const size = gap * constrain(0.1 + 0.9 * (0.3 + 0.7 * b) * n * 1.3, 0.05, 1);
      circle(px, y, size);
    }
    row++;
  }
}

// ---------- scene 2: black dots on white, ripple from the centre ----------
function sceneDotsLight(t, b, R) {
  fillBG(255);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();
  const hueBase = (t * 8 + 180) % 360;   // offset from scene 1 so the two feel related but distinct
  const gap = max(width, height) / 26;
  for (let y = -height / 2 - gap; y < height / 2 + gap; y += gap) {
    for (let x = -width / 2 - gap; x < width / 2 + gap; x += gap) {
      const dist = sqrt(x * x + y * y);
      // a wave travels outward from the centre; breathing scales how big the dots can get
      const ripple = 0.5 + 0.5 * sin(dist * 0.012 - t * 1.2);
      const size = gap * constrain(0.1 + 0.85 * (0.3 + 0.7 * b) * ripple, 0.05, 1);
      fill((hueBase + ripple * 90) % 360, 55, 25, 1);   // near-black but with a deep colour cast
      circle(x, y, size);
    }
  }
}

// ---------- scene 3: a swirling tree of colourful flowing lines ----------
// Replaces every earlier version of this scene. Modelled on a reference image of
// a tree whose whole canopy is drawn as hundreds of flowing, hand-drawn coloured
// strands (green, blue, deep red, gold, black) spiralling up and out of a solid
// dark trunk into one big wind-swept vortex. Each strand (see swirlStrands in
// initTimeMechanic) starts at a fixed random() angle/colour near the trunk's top;
// as it's drawn it curls via a steady swirl rate PLUS noise()-driven jitter, so
// the shape is a coherent vortex rather than scribbled chaos, but still feels
// hand-drawn and alive. The whole canopy slowly rotates and breathes with time.
function sceneSwirlTree(t, b, R) {
  fillBG([248, 246, 240]);   // pale background so the coloured strands pop, like the reference
  drawSwirlTrunk(t, b);
  drawSwirlStrands(t, b, R);
}

// a short, solid, slightly tapering dark trunk at the bottom-centre, that the
// whole swirl of coloured strands appears to erupt out of
function drawSwirlTrunk(t, b) {
  noStroke();
  fill(20, 18, 16, 245);
  const bottom = height / 2 + 60;
  const top = -height * 0.05;
  const steps = 14;
  beginShape();
  for (let k = 0; k <= steps; k++) {
    const s = k / steps;
    const y = lerp(bottom, top, s);
    const sway = (noise(5, s * 1.4, t * 0.03) - 0.5) * width * 0.015;
    const w = lerp(width * 0.05, width * 0.012, s);
    vertex(sway - w, y);
  }
  for (let k = steps; k >= 0; k--) {
    const s = k / steps;
    const y = lerp(bottom, top, s);
    const sway = (noise(5, s * 1.4, t * 0.03) - 0.5) * width * 0.015;
    const w = lerp(width * 0.05, width * 0.012, s);
    vertex(sway + w, y);
  }
  endShape(CLOSE);
}

// hundreds of coloured strands spiralling up and out of the trunk, reaching all
// the way out past the screen edges so the whole canvas fills up, not just a
// patch near the trunk. A steady curl rate near the trunk makes each strand
// start as a coherent spiral arm, then loosens the further out it gets so the
// outer reaches actually travel out to the corners instead of spiralling back
// on themselves; noise() jitters the path so it still reads as hand-drawn. On
// top of that, how many strands are even visible yet GROWS over this scene's
// own duration (see sceneInfo/progress below) - new strands keep appearing the
// longer the scene plays, like it's continuously being drawn rather than
// popping in all at once, then it starts filling in again fresh next time this
// scene comes around.
function drawSwirlStrands(t, b, R) {
  const palette = [[95, 140, 45], [45, 110, 180], [150, 35, 40], [200, 145, 35], [22, 20, 18]];
  const originY = -height * 0.02;
  const globalSpin = t * 0.015;     // the whole vortex slowly rotates over time
  noFill();

  const info = sceneInfo(t);
  const progress = constrain(info.localT / info.dur, 0, 1);
  const strandsToShow = min(swirlStrands.length, 24 + floor(progress * (swirlStrands.length - 24)));

  for (let i = 0; i < strandsToShow; i++) {
    const sw = swirlStrands[i];
    let px = sw.x0 * width * 0.03;
    let py = originY;
    let ang = sw.angle0;   // fixed fan-out starting direction, roughly upward
    let r = 4;
    const segs = 46 + floor(sw.lenSeed * 46);
    const stepLen = min(width, height) * (0.014 + 0.012 * sw.lenSeed) * (0.85 + 0.3 * b);
    const maxR = R * 1.1;   // reaches past the canvas corners, so the vortex fills the whole screen
    const col = palette[sw.colorIndex];

    stroke(col[0], col[1], col[2], 170);
    strokeWeight(1 + 0.7 * b);
    beginShape();
    vertex(px, py);
    for (let k = 0; k < segs; k++) {
      // curl is strongest near the trunk (a tight spiral) and relaxes outward
      // into an almost-straight flow, which is what lets strands actually reach
      // the far edges of the canvas instead of spiralling back on themselves
      const tightness = 1 - constrain(r / maxR, 0, 1) * 0.92;
      const jitter = (noise(sw.driftSeed + k * 0.3, t * 0.06) - 0.5) * 0.22;
      ang += sw.curlRate * tightness + jitter + 0.0015 * sin(globalSpin + sw.driftSeed);
      px += cos(ang) * stepLen;
      py += sin(ang) * stepLen;
      r += stepLen;
      vertex(px, py);
    }
    endShape();
  }
}

// ---------- scene 4: dot tunnel, Infinity Mirror Room (white dots on black, spokes) ----------
function sceneDotTunnel(t, b, R) {
  fillBG(0);
  noStroke();
  fill(255);
  const spokes = 80;
  const steps = 36;
  const tt = t * 0.5;
  const flow = tt - floor(tt);
  for (let j = 0; j < steps; j++) {
    const u = (j + flow) / steps;                    // 0 = centre, 1 = edge
    const r = R * 1.1 * pow(u, 1.8) * (0.85 + 0.3 * b);
    const size = 1.5 + 9 * pow(u, 1.8) * (0.6 + 0.8 * b);
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * TWO_PI + 0.35 * sin(u * 5 - t * 0.7) * u + t * 0.05;
      circle(cos(a) * r, sin(a) * r, size);
    }
  }
}

// ---------- scene 5: swaying tentacles covered in dots ----------
// Inspired by Kusama's dotted room installations: bulging, twisting columns whose
// surfaces are covered in polka dots. Dots are laid out around each tube as if wrapped
// on a cylinder: they sit close together and get squeezed at the edges, which gives a
// 3D feeling with only flat ellipses.
const TENTACLE_COUNT = 7;

function tentacleDepth(i) {
  // fixed pseudo-random depth per tentacle (0.55 - 1.0); bigger = closer to the viewer
  return 0.55 + 0.45 * ((i * 0.618) % 1);
}

function tentacleCentre(i, s, t, baseX) {
  // s runs from 0 (bottom) to 1 (top). noise gives a smooth sway, sin adds a twist.
  const sway = (noise(i * 10, s * 1.5, t * 0.12) - 0.5) * width * 0.45;
  const twist = sin(s * 4 + t * 0.5 + i) * width * 0.03;
  return baseX + sway + twist;
}

function tentacleHalfWidth(i, s, t, baseW, b) {
  // noise makes the tube bulge and thin out along its length; breathing widens it
  return baseW * (0.5 + 0.9 * noise(i * 7 + 100, s * 2.2, t * 0.1)) * (0.85 + 0.3 * b);
}

function sceneTentacles(t, b, R) {
  const yellow = [255, 205, 0];
  fillBG(yellow);

  const top = -height / 2 - 40;
  const bottom = height / 2 + 40;

  // floor and background: staggered black dots, bigger toward the bottom
  noStroke();
  fill(0);
  const floorGap = max(width, height) / 28;
  let floorRow = 0;
  for (let y = top; y < bottom; y += floorGap) {
    const rowScale = 0.6 + 0.8 * ((y - top) / (bottom - top));
    const dotSize = floorGap * (0.18 + 0.32 * b) * rowScale;
    for (let x = -width / 2; x < width / 2 + floorGap; x += floorGap) {
      circle(x + (floorRow % 2) * floorGap * 0.5, y, dotSize);
    }
    floorRow++;
  }

  // draw far tentacles first so near ones cover them
  const order = [...Array(TENTACLE_COUNT).keys()].sort((p, q) => tentacleDepth(p) - tentacleDepth(q));
  const SAMPLES = 40;
  const COLS = 9;

  for (const i of order) {
    const depth = tentacleDepth(i);
    const baseX = map(i, 0, TENTACLE_COUNT - 1, -width * 0.45, width * 0.45);
    const baseW = (width / TENTACLE_COUNT) * 0.55 * depth;

    // black body of the tentacle
    fill(0);
    beginShape();
    for (let k = 0; k <= SAMPLES; k++) {
      const s = k / SAMPLES;
      const y = lerp(bottom, top, s);
      vertex(tentacleCentre(i, s, t, baseX) - tentacleHalfWidth(i, s, t, baseW, b), y);
    }
    for (let k = SAMPLES; k >= 0; k--) {
      const s = k / SAMPLES;
      const y = lerp(bottom, top, s);
      vertex(tentacleCentre(i, s, t, baseX) + tentacleHalfWidth(i, s, t, baseW, b), y);
    }
    endShape(CLOSE);

    // yellow dots wrapped around the body, row by row from bottom to top
    fill(yellow[0], yellow[1], yellow[2]);
    let y = bottom;
    let row = 0;
    while (y > top && row < 300) {
      const s = (bottom - y) / (bottom - top);
      const xc = tentacleCentre(i, s, t, baseX);
      const w = tentacleHalfWidth(i, s, t, baseW, b);
      const d = max(w * 0.3 * (0.75 + 0.5 * b), 5);   // breathing changes the dot size
      for (let c = 0; c < COLS; c++) {
        // angle around the tube: 0 = facing us, +-90 degrees = the edge
        const theta = map((c + 0.25 + 0.5 * (row % 2)) / COLS, 0, 1, -HALF_PI * 0.95, HALF_PI * 0.95);
        const facing = cos(theta);
        ellipse(xc + sin(theta) * w, y, d * facing + 1, d * (0.5 + 0.5 * facing));
      }
      y -= d * 1.15;
      row++;
    }
  }
}

// ---------- scene 6: flow-field strokes, swirling lines that keep moving ----------
// The idea of moving brush strokes is inspired by Petros Vrellis' "Starry Night interactive
// animation" (2012). Every short stroke follows a Perlin noise flow field that changes over time.
// random() values stored in flowJitter give each stroke a fixed offset and colour.
function sceneFlow(t, b, R) {
  fillBG([8, 10, 38]);
  noFill();
  colorMode(HSB, 360, 100, 100, 1);   // pop() in drawSceneLayer restores the colour mode
  const gap = max(width, height) / 38;
  const step = gap * 0.35 * (0.8 + 0.5 * b);   // breathing makes the strokes longer and shorter
  strokeWeight(max(1.5, gap * 0.14));
  strokeCap(ROUND);
  let n = 0;
  for (let y = -height / 2 - gap; y < height / 2 + gap; y += gap) {
    for (let x = -width / 2 - gap; x < width / 2 + gap; x += gap) {
      const j = flowJitter[n % flowJitter.length];
      n++;
      let px = x + j.jx * gap;
      let py = y + j.jy * gap;
      const hue = (200 + j.c * 70 + t * 10) % 360;   // colours slowly drift through the spectrum
      stroke(hue, 70, 60 + 40 * j.c, 0.9);
      beginShape();
      for (let k = 0; k < 8; k++) {
        vertex(px, py);
        // a swirl around the centre grows with the breath, noise bends every stroke
        const swirl = (atan2(py, px) + HALF_PI) * 0.4 * b;
        const ang = noise((px + width / 2) * 0.0035, (py + height / 2) * 0.0035, t * 0.12) * TWO_PI * 2 + swirl;
        px += cos(ang) * step;
        py += sin(ang) * step;
      }
      endShape();
    }
  }
}

// ---------- scene 7: rain landing on the ground, splashing into colourful puddles ----------
// The whole scene IS the ground (seen from above), not falling streaks. Every spot
// in rainDrops has its own fixed period/phase (random(), set once in initTimeMechanic),
// so it quietly waits, then a single slow drop falls into it, then it splashes into a
// rippling, fading puddle of colour, then goes quiet again until its next turn - a
// clear timed cycle, which is exactly the "time-based" trigger this mechanic is built
// on. noise() only wobbles the puddle's edge so it looks like real water, not a perfect
// circle.
const RAIN_FALL_LEN = 0.9;     // seconds the drop is visibly falling
const RAIN_SPLASH_LEN = 2.4;   // seconds the puddle ripples and fades

function sceneRain(t, b, R) {
  fillBG([8, 16, 20]);              // dark wet "ground", like rained-on pavement
  colorMode(HSB, 360, 100, 100, 1);

  for (const dr of rainDrops) {
    const gx = (dr.x - 0.5) * width;
    const gy = (dr.y - 0.5) * height;
    const hue = (dr.hue + t * 6) % 360;
    const cycle = (t + dr.phase) % dr.period;

    if (cycle < RAIN_FALL_LEN) {
      // the drop itself, slowly falling down onto its spot
      const u = cycle / RAIN_FALL_LEN;
      const dropY = gy - (1 - u) * 90 * (0.7 + 0.6 * b);
      noStroke();
      stroke(hue, 55, 100, 0.85);
      strokeWeight(2 + 1.5 * b);
      line(gx, dropY - 16, gx, dropY);
      noStroke();
      fill(hue, 50, 100, 0.8);
      circle(gx, dropY, 5 + 2 * b);
    } else {
      const age = cycle - RAIN_FALL_LEN;
      if (age < RAIN_SPLASH_LEN) {
        const u = age / RAIN_SPLASH_LEN;          // 0 = just landed, 1 = fully faded
        const maxR = dr.maxR * (0.8 + 0.4 * b);

        // expanding ripple ring, wobbled by noise so the puddle edge looks organic
        const ringR = maxR * sqrt(u);
        noFill();
        stroke(hue, 55, 100, (1 - u) * 0.65);
        strokeWeight(1.2 + 1.5 * (1 - u));
        beginShape();
        for (let k = 0; k <= 26; k++) {
          const ang = (k / 26) * TWO_PI;
          const wob = (noise(dr.phase * 0.07 + cos(ang), dr.phase * 0.07 + sin(ang), t * 0.4) - 0.5) * ringR * 0.18;
          const rr = ringR + wob;
          vertex(gx + cos(ang) * rr, gy + sin(ang) * rr);
        }
        endShape(CLOSE);

        // the puddle itself: fills in quickly, then slowly shrinks and fades away
        const puddleR = maxR * 0.5 * constrain(u * 3.5, 0, 1) * (1 - 0.35 * u);
        noStroke();
        fill(hue, 60, 95, (1 - u) * 0.5);
        circle(gx, gy, puddleR * 2);
        // tiny highlight so the puddle reads as wet and reflective
        fill(hue, 15, 100, (1 - u) * 0.55);
        circle(gx - puddleR * 0.22, gy - puddleR * 0.22, puddleR * 0.5);
      }
    }
  }
}

// ---------- scene 8: red "cracked canvas" spider-web threads ----------
// Based on the real gold cracked-line wall texture behind Kusama's "Small Pumpkin
// Paintings" (Omer Tiroche Gallery, London) - here recoloured red and woven into
// radial + ring threads so it reads as a web of lines tugging toward the centre,
// where your teammate's pumpkin sits on top in a later draw() call. Now bigger and
// denser (more spokes/rings, reaching further out, plus short branch "cracks" split
// off the main threads), and a small glowing dot wanders through the grid like it's
// solving a maze - it only ever travels along a ring or along a spoke, never cuts
// across diagonally, so it reads as walking the web rather than floating over it.
function sceneWeb(t, b, R) {
  fillBG([16, 12, 10]);   // dark aged-canvas brown, like old pumpkin-painting ground
  noFill();
  const spokes = 34;
  const rings = 13;
  const extent = R * 1.3;   // reaches past the corners now, so the web feels bigger/fuller

  // radial threads reaching from the centre out past the edge, hand-cracked wobble
  for (let i = 0; i < spokes; i++) {
    const baseAngle = (i / spokes) * TWO_PI;
    strokeWeight(1 + 1.5 * b);
    stroke(205, 30, 28, 100 + 90 * b);
    beginShape();
    for (let s = 0; s <= 24; s++) {
      const u = s / 24;
      const r = extent * u;
      const jitter = (noise(i * 3.7, u * 4, t * 0.08) - 0.5) * extent * 0.045 * (0.4 + u);
      const ang = baseAngle + jitter / max(r, 1);
      vertex(cos(ang) * r, sin(ang) * r);
    }
    endShape();

    // a couple of short branch cracks splitting off this spoke, adding density -
    // where each branch starts/points is a fixed value derived from i and the
    // branch index, only its tiny wobble moves with t
    for (let br = 0; br < 2; br++) {
      const seed = i * 7.3 + br * 2.1;
      const u0 = 0.35 + 0.5 * ((seed * 1.37) % 1);
      const r0 = extent * u0;
      const jitter0 = (noise(i * 3.7, u0 * 4, t * 0.08) - 0.5) * extent * 0.045 * (0.4 + u0);
      const ang0 = baseAngle + jitter0 / max(r0, 1);
      const bx0 = cos(ang0) * r0, by0 = sin(ang0) * r0;
      const branchAng = ang0 + (((seed * 0.61) % 1) - 0.5) * 1.4;
      const branchLen = extent * (0.08 + 0.14 * ((seed * 0.83) % 1));

      strokeWeight(0.8 + 1 * b);
      stroke(195, 28, 26, 70 + 60 * b);
      beginShape();
      for (let s2 = 0; s2 <= 6; s2++) {
        const v = s2 / 6;
        const rr = branchLen * v;
        const wob = (noise(seed + v * 3, t * 0.1) - 0.5) * branchLen * 0.3;
        vertex(bx0 + cos(branchAng) * rr + cos(branchAng + HALF_PI) * wob,
               by0 + sin(branchAng) * rr + sin(branchAng + HALF_PI) * wob);
      }
      endShape();
    }
  }

  // concentric rings weave the radial threads together, like a woven web
  for (let j = 1; j <= rings; j++) {
    const ringR = extent * (j / rings);
    stroke(200, 35, 30, 85 + 65 * b);
    strokeWeight(0.9 + 1.1 * b);
    beginShape();
    for (let i = 0; i <= spokes; i++) {
      const ang = (i / spokes) * TWO_PI;
      const wob = (noise(i * 2.1, j * 1.3, t * 0.1) - 0.5) * extent * 0.035;
      const r = ringR + wob;
      vertex(cos(ang) * r, sin(ang) * r);
    }
    endShape(CLOSE);
  }

  // small red polka-dot nodes where threads cross, echoing the dotted gallery wall
  noStroke();
  fill(215, 55, 55, 210);
  for (let j = 1; j <= rings; j += 2) {
    const ringR = extent * (j / rings);
    for (let i = 0; i < spokes; i += 2) {
      const ang = (i / spokes) * TWO_PI + t * 0.03;
      const d = 2.5 + 5 * b;
      circle(cos(ang) * ringR, sin(ang) * ringR, d);
    }
  }

  drawSpinningThread(t, b, extent);
  drawMazeWalker(t, b, extent, spokes, rings);
}

// a single bright red thread that spins itself out from the centre like a spider
// actually laying silk - it is recomputed fresh each frame from k=0 up to however
// far into THIS scene's own noise()-chosen duration we are (see sceneInfo), so it
// visibly grows longer and the web looks more thickly woven the longer this scene
// plays, then starts spinning a brand new path next time this scene comes around.
// The path itself is a true random walk (a fresh random-ish direction every step
// via noise(), no steady turning bias) rather than a smooth spiral, so it reads
// as erratic spider silk instead of circling; it's gently pulled back once it
// wanders near the web's outer edge so it stays inside the net.
function drawSpinningThread(t, b, extent) {
  const info = sceneInfo(t);
  const progress = constrain(info.localT / info.dur, 0, 1);
  const totalSamples = 420;
  const samplesToShow = floor(progress * totalSamples);
  if (samplesToShow < 2) return;

  noFill();
  stroke(235, 60, 55, 220);      // a brighter, lighter red than the grid - reads as the "live" thread
  strokeWeight(1 + 1 * b);

  beginShape();
  let px = 0, py = 0;
  vertex(px, py);
  for (let k = 1; k <= samplesToShow; k++) {
    const ang = noise(k * 0.14, 500) * TWO_PI * 3;     // freshly-random heading each step - no spiral bias
    const stepLen = extent * (0.012 + 0.01 * noise(k * 0.09, 900));
    let nx = px + cos(ang) * stepLen;
    let ny = py + sin(ang) * stepLen;
    const dist = sqrt(nx * nx + ny * ny);
    if (dist > extent * 0.95) {               // nudge back in if it wanders past the web's edge
      nx *= 0.9;
      ny *= 0.9;
    }
    vertex(nx, ny);
    px = nx; py = ny;
  }
  endShape();
}

// a glowing dot that travels only along the web's own lines - first sideways along
// a ring, then outward/inward along a spoke, like turning corners in a maze. Which
// ring/spoke it heads to next is picked by noise() read at each time-based "step"
// (classic timed-event trigger), so the path wanders smoothly and never repeats.
function drawMazeWalker(t, b, extent, spokes, rings) {
  const stepDur = 1.1;                 // seconds per move - a clear, time-driven step
  const stepIndex = floor(t / stepDur);
  const localU = (t % stepDur) / stepDur;

  const nodeAt = (idx) => ({
    ring: map(noise(idx * 0.21, 100), 0, 1, 1, rings),
    spoke: map(noise(idx * 0.21, 300), 0, 1, 0, spokes)
  });
  const from = nodeAt(stepIndex);
  const to = nodeAt(stepIndex + 1);

  let ring, spoke;
  if (localU < 0.5) {
    // first leg: slide sideways along the current ring
    ring = from.ring;
    spoke = lerp(from.spoke, to.spoke, localU * 2);
  } else {
    // second leg: turn and slide outward/inward along the new spoke
    spoke = to.spoke;
    ring = lerp(from.ring, to.ring, (localU - 0.5) * 2);
  }

  const ang = (spoke / spokes) * TWO_PI;
  const r = extent * (ring / rings);
  const x = cos(ang) * r, y = sin(ang) * r;

  noStroke();
  for (let g = 3; g >= 1; g--) {
    fill(30, 160, 255, 40 / g);     // cool glow, stands out against the deep red web
    circle(x, y, (9 + 9 * b) * g * 0.9);
  }
  fill(220, 240, 255, 255);
  circle(x, y, 6 + 3 * b);
}

// ---------- overlay: soft coloured glow-dust, drifting and pulsing ----------
// Replaces the old pure-black halo dots (which read as mould). Same drifting/pulsing
// logic, but each speck is a soft glowing colour that slowly cycles hue, blended with
// 'lighter' so it adds light instead of smudging dark patches onto the scene.
function drawTimeDots() {
  const t = timeNow();
  const b = getTimeBreath();                // same breath value as whichever scene is playing
  const ctx = drawingContext;
  noStroke();

  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';

  for (const d of timeDots) {
    // noise: smooth drifting. random (stored in d): fixed start position and phase.
    const dx = (noise(d.x * 3, d.y * 3, t * 0.15) - 0.5) * 0.08;
    const dy = (noise(d.y * 3, d.x * 3, t * 0.15 + 50) - 0.5) * 0.08;
    const x = (d.x + dx) * width;
    const y = (d.y + dy) * height;

    const personal = 0.85 + 0.25 * sin(t * d.speed + d.phase);
    const s = d.size * (0.5 + 0.9 * b) * personal;
    const outer = s * 2.6;
    const hue = (d.hueSeed + t * 14) % 360;

    const g = ctx.createRadialGradient(x, y, 0, x, y, outer);
    g.addColorStop(0, hsbToRgba(hue, 35, 100, 0.55));
    g.addColorStop(0.4, hsbToRgba(hue, 60, 100, 0.3));
    g.addColorStop(1, hsbToRgba(hue, 70, 100, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, outer, 0, TWO_PI);
    ctx.fill();
  }

  ctx.globalCompositeOperation = prevComposite;
}
