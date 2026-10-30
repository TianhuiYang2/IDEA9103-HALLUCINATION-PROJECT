// Standalone demo so you can preview the background by itself.
// In the real team project, delete this file and instead call
// initTimeMechanic() / drawTimeBackground() / drawTimeDots() from
// your shared sketch.js, in between what everyone else draws.

function setup() {
  createCanvas(windowWidth, windowHeight);
  initTimeMechanic();
}

function draw() {
  drawTimeBackground();   // the 6 switching Kusama-inspired scenes
  drawTimeDots();         // floating black dots with soft halos on top

  // --- where your teammate's pumpkin (and anyone else's mechanic) goes ---
  // e.g. pumpkin.display();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Press N (or SPACE) to jump to the next scene early - handy for testing/grading demo
function keyPressed() {
  if (key === ' ' || key === 'n' || key === 'N') {
    skipScene();
  }
}
