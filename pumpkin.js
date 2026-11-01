/*
AI ACKNOWLEDGEMENT:
Claude (Anthropic, 2026) assisted with generating and
restructuring this pumpkin code. The student drew the
pumpkin image, tested, reviewed and adapted the code.
*/

//Settings you can tweak
const PUMPKIN_SCREEN_SIZE = 0.62;  // pumpkin size, as a share of the shorter screen side
const EDGE_MARGIN = 3;             // pixels kept clear between a dot and its lobe edge
const EDGE_CHECKS = 24;            // points checked around each dot's edge
const MIN_LOBE_AREA = 300;         // ignore tiny colour patches (anti-aliasing)
const MIN_SHRINK = 0.6;            // near a lobe's edge, a dot may shrink to 60% to fit

// Dot size and spacing (in pixels of the original 800 x 800 image)
const LIGHT_LOBE = { r: 15, gap: 16 };  // pale front lobes: bigger dots
const DARK_LOBE  = { r: 7,  gap: 11 };  // dark side lobes: smaller dots

const COLOUR_WAVE_SPEED = 9;       // how fast the colour wave spreads (screen pixels per frame)
const COLOUR_FADE = 0.15;          // how smoothly a dot changes colour (0-1)


const COLOUR_SCHEMES = [
  { name: "cream",  onLight: [255, 255, 255], onDark: [255, 240, 205] },
  { name: "ember",  onLight: [214, 90, 30],   onDark: [255, 226, 140] },
  { name: "stem",   onLight: [160, 52, 44],   onDark: [255, 245, 225] },
  { name: "gold",   onLight: [241, 136, 8],   onDark: [252, 214, 96] },
  { name: "blush",  onLight: [236, 118, 92],  onDark: [255, 236, 200] }
];

//Values filled in while running
let pumpkinImg;            // the drawing
let lobeMap = [];          // for every pixel: which lobe it belongs to (0 = none)
let lobes = [];            // info about each lobe: colour, brightness, pixel list
let pumpkinDots = [];      // every dot on the pumpkin
let colourWaves = [];      // active colour waves: { x, y, age, scheme }
let currentScheme = 0;     // which colour scheme the last click chose


// Call in preload()
function preloadPumpkin() {
  pumpkinImg = loadImage("assets/pumpkin.png");
}


// Call once in setup(). Finds the lobes, then places the dots.
function setupPumpkin() {
  findLobes();

  for (let i = 0; i < lobes.length; i++) {
    placeDotsInLobe(i);
  }
}


//FIND THE LOBES
function findLobes() {
  pumpkinImg.loadPixels();
  let w = pumpkinImg.width;
  let h = pumpkinImg.height;

  lobeMap = new Array(w * h).fill(0);   // 0 = not part of any lobe yet
  lobes = [];
  let nextId = 1;

  for (let start = 0; start < w * h; start++) {
    // Skip pixels that are already in a lobe, or are not lobe colour
    if (lobeMap[start] !== 0 || !isLobePixel(start)) {
      continue;
    }


    let pixelsInLobe = [];
    let toVisit = [start];
    lobeMap[start] = nextId;
    let sumR = 0, sumG = 0, sumB = 0;
    let minX = w, maxX = 0, minY = h, maxY = 0;

    while (toVisit.length > 0) {
      let p = toVisit.pop();
      pixelsInLobe.push(p);
      sumR += pumpkinImg.pixels[p * 4];
      sumG += pumpkinImg.pixels[p * 4 + 1];
      sumB += pumpkinImg.pixels[p * 4 + 2];

      let px = p % w;
      let py = floor(p / w);

      // Remember the lobe's bounding box (used to scan it row by row)
      minX = min(minX, px); maxX = max(maxX, px);
      minY = min(minY, py); maxY = max(maxY, py);

      // Check the 4 neighbours: left, right, up, down
      let neighbours = [];
      if (px > 0) neighbours.push(p - 1);
      if (px < w - 1) neighbours.push(p + 1);
      if (py > 0) neighbours.push(p - w);
      if (py < h - 1) neighbours.push(p + w);

      for (let n of neighbours) {
        if (lobeMap[n] === 0 && isLobePixel(n) && sameColour(p, n)) {
          lobeMap[n] = nextId;
          toVisit.push(n);
        }
      }
    }

    if (pixelsInLobe.length < MIN_LOBE_AREA) {
      // Too small to be a real lobe: mark as -1 (ignored)
      for (let p of pixelsInLobe) lobeMap[p] = -1;
      continue;
    }

    let count = pixelsInLobe.length;
    let r = sumR / count, g = sumG / count, b = sumB / count;

    lobes.push({
      id: nextId,
      pixels: pixelsInLobe,
      colour: [r, g, b],
      // How light the lobe looks (0 to 255)
      brightness: 0.299 * r + 0.587 * g + 0.114 * b,
      minX: minX, maxX: maxX, minY: minY, maxY: maxY
    });
    nextId++;
  }
}

//A lobe pixel is solid (not transparent) and not the white outline
function isLobePixel(p) {
  let r = pumpkinImg.pixels[p * 4];
  let g = pumpkinImg.pixels[p * 4 + 1];
  let b = pumpkinImg.pixels[p * 4 + 2];
  let a = pumpkinImg.pixels[p * 4 + 3];
  let isWhite = r > 235 && g > 235 && b > 235;
  return a > 200 && !isWhite;
}

//Are two pixels nearly the same colour?
function sameColour(p, q) {
  let dr = pumpkinImg.pixels[p * 4] - pumpkinImg.pixels[q * 4];
  let dg = pumpkinImg.pixels[p * 4 + 1] - pumpkinImg.pixels[q * 4 + 1];
  let db = pumpkinImg.pixels[p * 4 + 2] - pumpkinImg.pixels[q * 4 + 2];
  return abs(dr) + abs(dg) + abs(db) < 40;
}

//Which lobe is at image position (x, y)? 0 or -1 = none
function lobeAt(x, y) {
  x = round(x);
  y = round(y);
  if (x < 0 || y < 0 || x >= pumpkinImg.width || y >= pumpkinImg.height) {
    return 0;
  }
  return lobeMap[y * pumpkinImg.width + x];
}


//PLACE THE DOTS (row by row, top to bottom)
function placeDotsInLobe(lobeIndex) {
  let lobe = lobes[lobeIndex];

  //Keep the original light/dark dot sizes and colour behaviour.
  let light = constrain(map(lobe.brightness, 150, 222, 0, 1), 0, 1);
  let baseR = lerp(DARK_LOBE.r, LIGHT_LOBE.r, light);
  let gap = lerp(DARK_LOBE.gap, LIGHT_LOBE.gap, light);
  let isDarkLobe = lobe.brightness < 175;
  let lobeWidth = lobe.maxX - lobe.minX;

  //Narrow areas (e.g. the stem) still get smaller dots.
  if (lobeWidth < (baseR * 2 + gap) * 2.5) {
    baseR *= 0.6;
  }

  // Spacious rows; no half-step checkerboard offset.
  // Each row follows the lobe's changing width, creating curved vertical trails.
  let rowStep = baseR * 2 + gap * 1.15;
  let columnStep = baseR * 2 + gap * 1.1;
  let minDistance = 7; // extra space between neighbouring circles
  let placedHere = [];

  for (let y = lobe.minY + rowStep * 0.5;
       y <= lobe.maxY - rowStep * 0.45;
       y += rowStep) {
    let spans = findSpans(lobe, round(y));

    for (let span of spans) {
      let widthHere = span.end - span.start + 1;
      if (widthHere < baseR * 1.6 + EDGE_MARGIN * 2) continue;

      // The spacing stays open even at the broadest part of a lobe.
      let columns = max(1, floor(widthHere / columnStep));

      for (let col = 0; col < columns; col++) {
        let t = (col + 0.5) / columns;
        let x = span.start + t * widthHere;

        // Large dots on the rounded front, progressively smaller near grooves.
        let curvature = pow(sin(PI * t), 1.35);
        let r = baseR * (0.35 + 0.65 * curvature);

        // Add a tiny deterministic variation, without making the layout random.
        r *= 0.96 + 0.04 * sin(y * 0.09 + col * 1.7);

        // Keep dots clearly separated, including diagonally between rows.
        let crowded = placedHere.some(d =>
          dist(x, y, d.x, d.y) < r + d.r + minDistance
        );
        if (crowded) continue;

        let before = pumpkinDots.length;
        addDotIfItFits(x, y, r, lobe.id, isDarkLobe);
        if (pumpkinDots.length > before) {
          let dot = pumpkinDots[pumpkinDots.length - 1];
          placedHere.push({ x: dot.x, y: dot.y, r: dot.r });
        }
      }
    }
  }
}

// Find the stretches of a row that belong to this lobe
function findSpans(lobe, y) {
  let spans = [];
  let inside = false;
  let start = 0;

  for (let x = lobe.minX; x <= lobe.maxX + 1; x++) {
    let here = lobeAt(x, y) === lobe.id;
    if (here && !inside) {
      start = x;          // a stretch begins
      inside = true;
    } else if (!here && inside) {
      spans.push({ start: start, end: x - 1 });   // a stretch ends
      inside = false;
    }
  }
  return spans;
}


function addDotIfItFits(x, y, r, lobeId, isDarkLobe) {
  let size = r;
  while (size >= r * MIN_SHRINK) {
    if (fitsInLobe(x, y, size, lobeId)) {
      pumpkinDots.push({
        x: x,
        y: y,
        r: size,
        lobe: lobeId,
        onDark: isDarkLobe,
        room: findRoom(x, y, size, lobeId),            // biggest safe radius here
        scheme: 0,                                      // which colour scheme it shows
        colour: schemeColour(0, isDarkLobe).slice()     // the colour it is drawn with now
      });
      return;
    }
    size -= 0.5;
  }
}


function fitsInLobe(x, y, r, lobeId) {
  if (lobeAt(x, y) !== lobeId) {
    return false;
  }

  let checkR = r + EDGE_MARGIN;
  for (let k = 0; k < EDGE_CHECKS; k++) {
    let angle = (k / EDGE_CHECKS) * TWO_PI;
    if (lobeAt(x + cos(angle) * checkR, y + sin(angle) * checkR) !== lobeId) {
      return false;
    }
    if (lobeAt(x + cos(angle) * checkR * 0.5, y + sin(angle) * checkR * 0.5) !== lobeId) {
      return false;
    }
  }
  return true;
}

// How big can this dot safely get without leaving its lobe?
function findRoom(x, y, r, lobeId) {
  let room = r;
  while (room < r * 3 && fitsInLobe(x, y, room + 1, lobeId)) {
    room++;
  }
  return room;
}


//COLOUR

// The colour a dot should have in a given scheme
function schemeColour(schemeIndex, onDark) {
  let scheme = COLOUR_SCHEMES[schemeIndex];
  return onDark ? scheme.onDark : scheme.onLight;
}


// Call from mousePressed(): send a colour wave from the mouse.
function pumpkinMousePressed() {
  if (!mouseIsInside()) {
    return;
  }
  currentScheme = (currentScheme + 1) % COLOUR_SCHEMES.length;
  colourWaves.push({ x: mouseX, y: mouseY, age: 0, scheme: currentScheme });
}


//DRAW (with the mouse, music, time and colour)
function drawPumpkin(audio) {
  // Fit the pumpkin in the middle of the screen
  let size = min(width, height) * PUMPKIN_SCREEN_SIZE;

  // Time: the pumpkin breathes gently with the background scenes
  size *= 1 + 0.025 * getTimeBreath();

  let s = size / pumpkinImg.width;             // image pixels-screen pixels
  let left = width / 2 - size / 2;
  let top = height / 2 - size / 2;

  // Grow the colour waves; remove ones that have covered the whole screen
  for (let wave of colourWaves) {
    wave.age++;
  }
  colourWaves = colourWaves.filter(w => w.age * COLOUR_WAVE_SPEED < width + height);

  push();
  colorMode(RGB, 255);
  noStroke();

  // The drawing itself
  image(pumpkinImg, left, top, size, size);

  for (let d of pumpkinDots) {
    let screenX = left + d.x * s;
    let screenY = top + d.y * s;

    //Colour: has a colour wave reached this dot yet?
    for (let wave of colourWaves) {
      let waveRadius = wave.age * COLOUR_WAVE_SPEED;
      if (dist(screenX, screenY, wave.x, wave.y) < waveRadius) {
        d.scheme = wave.scheme;    // later waves overwrite earlier ones
      }
    }
    // Smoothly blend from the old colour to the new one
    let target = schemeColour(d.scheme, d.onDark);
    for (let c = 0; c < 3; c++) {
      d.colour[c] = lerp(d.colour[c], target[c], COLOUR_FADE);
    }

    //User input: how does the mouse affect this spot?
    let input = getInputAt(screenX, screenY);

    //Music: louder / beats make dots swell. Smaller dots react more
    let sizeReact = map(d.r, 4, 15, 1.4, 0.7);
    let audioGrow = 1 + (audio.loudness * 0.3 + audio.beat * 0.25) * sizeReact;

    // Wanted radius, but never bigger than the room inside the lobe
    let radius = min(d.r * input.grow * audioGrow, d.room);

    // Push (converted to image pixels), limited so the dot stays inside
    let pushX = input.pushX / s;
    let pushY = input.pushY / s;
    let pushLength = sqrt(pushX * pushX + pushY * pushY);
    let maxPush = d.room - radius;
    if (pushLength > maxPush && pushLength > 0) {
      pushX = (pushX / pushLength) * maxPush;
      pushY = (pushY / pushLength) * maxPush;
    }

    fill(d.colour[0], d.colour[1], d.colour[2]);
    circle(screenX + pushX * s, screenY + pushY * s, radius * 2 * s);
  }

  pop();
}
