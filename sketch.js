/*
DANCING PUMPKIN - Group SB
The main sketch only calls each person's functions, in layers:

  1. Time       (Doris)   time-mechanic.js   -> background scenes + glow dust
  2. Pumpkin    (Jenna)   pumpkin.js         -> dotted pumpkin in the middle
  3. User input (Jenna)   input-mechanic.js  -> lens, trail, obliteration, ripples
  4. Audio      (Tianhui) audio-mechanic.js  -> music analysis used by the layers

Controls:
  Click  - first click starts the music; every click sends a ripple
           and changes the dots to the next colour scheme
  SPACE  - play / pause the music
  N      - jump to the next background scene
*/

function preload() {
  preloadAudio();     // Tianhui
  preloadPumpkin();   // Jenna
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  initTimeMechanic(); // Doris
  setupAudio();       // Tianhui
  setupPumpkin();     // Jenna: find the lobes, place the dots
  setupInput();       // Jenna
}

function draw() {
  let audio = getAudioFeatures();   // read the music once per frame
  updateInput(audio);               // mouse stillness, trail, beat ripples

  drawTimeBackground();             // layer 1: the 8 switching scenes
  drawTimeDots();                   //          glow dust on top

  drawPumpkin(audio);               // layer 2: pumpkin, reacting to mouse + music

  drawInputOverlay();               // layer 3: lens outline + ripple rings
  drawInstruction(audio);
}

function drawInstruction(audio) {
  push();
  noStroke();
  textAlign(CENTER);
  textSize(15);

  // Dark band behind the text so it reads on light scenes too
  fill(0, 120);
  rectMode(CENTER);
  rect(width / 2, height - 27, 420, 28, 14);

  fill(255, 235);
  let message = audio.playing
    ? "Move · hold still · click  |  SPACE pause  |  N next scene"
    : "Click to play the music";
  text(message, width / 2, height - 22);
  pop();
}

function mousePressed() {
  inputMousePressed();     // starts the music the first time, sends a ripple
  pumpkinMousePressed();   // sends a colour wave: dots change to the next colour scheme
}

function keyPressed() {
  if (key === " ") {
    toggleAudio();                       // SPACE: play / pause
  } else if (key === "n" || key === "N") {
    skipScene();                         // N: next background scene
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
