/*
AI ACKNOWLEDGEMENT:
Claude (Anthropic, 2026) assisted with generating and
restructuring this user-input code. The student tested,
reviewed and adapted the code for the final prototype.

USER INPUT MECHANIC
The viewer's mouse acts like a lens moving through the
hallucination space. There are three behaviours:

1. HOVER  - shapes near the mouse grow and are pushed aside.
            The space remembers where the mouse has been,
            so the mouse leaves a trail that slowly fades.
2. STAY   - if the mouse stays still, the lens slowly widens
            and the shapes inside swell and turn yellow until
            they swallow the space (Kusama's "self-obliteration").
3. CLICK  - a click sends a ripple outward from the mouse.
            While music plays, every beat also sends a ripple
            from the mouse, so the viewer "conducts" the music.

The music changes how strong the input is:
louder music = a stronger lens.

This file does NOT draw the scene. It works with ANY drawing:
any scene can ask getInputAt(x, y) how the mouse affects a
shape at that screen position, then use the answer.
*/

// ---------- Settings you can tweak ----------
const LENS_RADIUS = 130;      // size of the lens when the mouse is moving
const LENS_RADIUS_MAX = 300;  // size of the lens after staying still
const STILL_FRAMES = 180;     // frames of stillness to reach full effect (about 3 s)
const TRAIL_FADE = 0.96;      // how slowly the trail fades (closer to 1 = longer trail)
const TRAIL_CELL = 16;        // size of each square in the trail memory grid
const PUSH_DISTANCE = 16;     // how far shapes are pushed away from the mouse
const RIPPLE_SPEED = 7;       // how fast a ripple travels (pixels per frame)
const RIPPLE_LIFE = 80;       // how many frames a ripple lasts
const RIPPLE_WIDTH = 45;      // how thick the ripple band is
const OBLITERATE_COLOUR = [255, 197, 38]; // Kusama yellow

// ---------- Values that change while running ----------
/*
  The trail memory is a grid laid over the screen.
  Each square stores how recently the mouse touched it (0 to 1).
  Because it remembers PLACES, not particular dots, it works
  for every scene, even when the dots move or change.
*/
let trailGrid = [];
let trailCols = 0;
let trailRows = 0;

let stillTime = 0;          // how many frames the mouse has been still
let ripples = [];           // every active ripple: { x, y, age }
let inputLoudness = 0;      // latest loudness from the audio mechanic

// ------------------------------------------------------------
// Call once in setup(), AFTER createCanvas().
// ------------------------------------------------------------
function setupInput() {
  trailCols = ceil(width / TRAIL_CELL);
  trailRows = ceil(height / TRAIL_CELL);
  trailGrid = [];

  for (let i = 0; i < trailCols * trailRows; i++) {
    trailGrid.push(0);
  }
}

// ------------------------------------------------------------
// Call once at the start of every draw().
// audio = the object from getAudioFeatures()
// ------------------------------------------------------------
function updateInput(audio) {
  // If the window was resized, rebuild the trail grid
  if (trailCols !== ceil(width / TRAIL_CELL) ||
      trailRows !== ceil(height / TRAIL_CELL)) {
    setupInput();
  }

  inputLoudness = audio.loudness;

  // ---- Stillness ----
  let moved = dist(mouseX, mouseY, pmouseX, pmouseY);
  if (mouseIsInside() && moved < 1.5) {
    stillTime++;                           // still: count up
  } else {
    stillTime = max(0, stillTime - 8);     // moving: drop back quickly
  }

  // ---- Trail: fade everything, then stamp the lens ----
  let lensRadius = getLensRadius();

  for (let col = 0; col < trailCols; col++) {
    for (let row = 0; row < trailRows; row++) {
      let i = row * trailCols + col;

      // Fade the old trail a little
      trailGrid[i] *= TRAIL_FADE;

      // Stamp the lens: squares near the mouse light up
      if (mouseIsInside()) {
        let cx = col * TRAIL_CELL + TRAIL_CELL / 2;
        let cy = row * TRAIL_CELL + TRAIL_CELL / 2;
        let d = dist(cx, cy, mouseX, mouseY);

        if (d < lensRadius) {
          trailGrid[i] = max(trailGrid[i], 1 - d / lensRadius);
        }
      }
    }
  }

  // ---- Ripples: one on every beat, then age them ----
  if (audio.playing && audio.beat > 0.99 && mouseIsInside()) {
    addRipple(mouseX, mouseY);
  }

  for (let r of ripples) {
    r.age++;
  }
  ripples = ripples.filter(r => r.age < RIPPLE_LIFE);
}

// ------------------------------------------------------------
// THE MAIN QUESTION any scene can ask:
// "How does the mouse affect a shape at screen position (x, y)?"
//
// Returns:
//   grow       - multiply the shape's size by this (1 = no change)
//   pushX/Y    - add these to the shape's position
//   obliterate - 0 to 1, how much to blend towards yellow
//
// NOTE: x and y must be SCREEN positions. If a scene draws
// after translate(width / 2, height / 2), pass in
// (x + width / 2, y + height / 2).
// ------------------------------------------------------------
function getInputAt(x, y) {
  let result = { grow: 1, pushX: 0, pushY: 0, obliterate: 0 };

  let stillAmount = getStillAmount();
  let lensRadius = getLensRadius();
  let d = dist(x, y, mouseX, mouseY);

  // How close to the mouse: 1 right under it, 0 at the lens edge
  let closeness = 0;
  if (mouseIsInside() && d < lensRadius) {
    closeness = 1 - d / lensRadius;
  }

  // ---- 1. HOVER: trail memory + lens ----
  let memory = readTrail(x, y);
  let lensStrength = 1.2 + inputLoudness * 1.3;   // louder = stronger
  result.grow += memory * lensStrength;

  // Push shapes away from the mouse
  if (d > 0.01) {
    result.pushX = ((x - mouseX) / d) * closeness * PUSH_DISTANCE;
    result.pushY = ((y - mouseY) / d) * closeness * PUSH_DISTANCE;
  }

  // ---- 2. STAY: obliteration ----
  result.obliterate = closeness * stillAmount;
  result.grow += result.obliterate * 2;

  // ---- 3. CLICK / BEAT: ripples ----
  for (let r of ripples) {
    let rippleRadius = r.age * RIPPLE_SPEED;
    let fade = 1 - r.age / RIPPLE_LIFE;           // weaker as it travels
    let distFromCentre = dist(x, y, r.x, r.y);
    let gap = abs(distFromCentre - rippleRadius); // distance from the ripple band

    if (gap < RIPPLE_WIDTH) {
      let wave = (1 - gap / RIPPLE_WIDTH) * fade;
      result.grow += wave * 1.4;

      if (distFromCentre > 0.01) {
        result.pushX += ((x - r.x) / distFromCentre) * wave * 10;
        result.pushY += ((y - r.y) / distFromCentre) * wave * 10;
      }
    }
  }

  return result;
}

// ------------------------------------------------------------
// Helper: blend any colour towards Kusama yellow.
// colour = [r, g, b]  ->  returns a new [r, g, b]
// ------------------------------------------------------------
function obliterateColour(colour, amount) {
  return [
    lerp(colour[0], OBLITERATE_COLOUR[0], amount),
    lerp(colour[1], OBLITERATE_COLOUR[1], amount),
    lerp(colour[2], OBLITERATE_COLOUR[2], amount)
  ];
}

// ------------------------------------------------------------
// Add a ripple at a screen position (used by click and beat).
// ------------------------------------------------------------
function addRipple(x, y) {
  ripples.push({ x: x, y: y, age: 0 });
}

// ------------------------------------------------------------
// Call from mousePressed() in the main sketch.
// The first click starts the music; every click sends a ripple.
// ------------------------------------------------------------
function inputMousePressed() {
  if (!mouseIsInside()) {
    return;
  }

  if (typeof song !== "undefined" && !song.isPlaying()) {
    toggleAudio();
  }

  addRipple(mouseX, mouseY);
}

// ------------------------------------------------------------
// Draw a faint lens outline and ripple rings on top of
// everything, so the viewer can see what the mouse is doing.
// Call at the END of draw().
// ------------------------------------------------------------
function drawInputOverlay() {
  push();
  noFill();

  if (mouseIsInside()) {
    let stillAmount = getStillAmount();

    // Lens outline
    stroke(255, 255, 255, 40);
    strokeWeight(1);
    circle(mouseX, mouseY, getLensRadius() * 2);

    // Yellow arc that fills up while the mouse stays still
    if (stillAmount > 0.02) {
      stroke(OBLITERATE_COLOUR[0], OBLITERATE_COLOUR[1], OBLITERATE_COLOUR[2], 200);
      strokeWeight(2);
      arc(mouseX, mouseY, 34, 34, -HALF_PI, -HALF_PI + TWO_PI * stillAmount);
    }
  }

  // Ripple rings
  for (let r of ripples) {
    let fade = 1 - r.age / RIPPLE_LIFE;
    stroke(255, 255, 255, 70 * fade);
    strokeWeight(1.5);
    circle(r.x, r.y, r.age * RIPPLE_SPEED * 2);
  }

  pop();
}

// ---------- Small helpers ----------

// 0 while moving, rises to 1 after staying still
function getStillAmount() {
  return constrain(stillTime / STILL_FRAMES, 0, 1);
}

// The lens widens while the mouse stays still
function getLensRadius() {
  return lerp(LENS_RADIUS, LENS_RADIUS_MAX, getStillAmount());
}

// Read the trail memory at a screen position
function readTrail(x, y) {
  let col = floor(x / TRAIL_CELL);
  let row = floor(y / TRAIL_CELL);

  if (col < 0 || col >= trailCols || row < 0 || row >= trailRows) {
    return 0;   // off screen
  }
  return trailGrid[row * trailCols + col];
}

// Is the mouse over the canvas?
function mouseIsInside() {
  return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}
