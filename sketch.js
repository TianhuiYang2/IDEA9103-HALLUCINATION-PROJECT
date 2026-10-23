/*
AI ACKNOWLEDGEMENT:
ChatGPT (OpenAI, 2026) assisted with generating and
restructuring parts of this audio-responsive visual.
The student tested, reviewed and adapted the code.

The music controls the scale, distortion, rotation,
opacity and vibration of the dot field.
*/

function preload() {
  preloadAudio();
}

function setup() {
  createCanvas(700, 700);
  setupAudio();

  colorMode(RGB, 255, 255, 255, 255);
  noStroke();
}

function draw() {
  background(8, 4, 18);

  let audio = getAudioFeatures();

  drawBackgroundGlow(audio);
  drawHallucinationField(audio);
  drawCentreVoid(audio);
  drawInstruction(audio);
}

function drawBackgroundGlow(audio) {
  push();
  translate(width / 2, height / 2);
  noStroke();

  let glowSize =
    325 +
    audio.loudness * 200;

  fill(
    120 + audio.mid * 80,
    20,
    100 + audio.treble * 100,
    26 + audio.loudness * 32
  );

  circle(0, 0, glowSize);

  fill(
    255,
    90,
    15,
    16 + audio.bass * 26
  );

  circle(
    0,
    0,
    glowSize * 0.68
  );

  pop();
}

function drawHallucinationField(audio) {
  push();
  translate(width / 2, height / 2);

  let time =
    millis() * 0.001;

  // Mid frequencies rotate the tunnel.
  let sceneRotation =
    sin(time * 0.35) * 0.035 +
    audio.mid * 0.11;

  rotate(sceneRotation);

  // A beat briefly shakes the entire field.
  let beatShake =
    audio.beat * 7;

  translate(
    sin(time * 37) * beatShake,
    cos(time * 31) * beatShake
  );

  let numberOfRings = 16;
  let dotsPerRing = 36;

  for (
    let ringIndex = 0;
    ringIndex < numberOfRings;
    ringIndex++
  ) {
    let ringAmount =
      ringIndex /
      (numberOfRings - 1);

    let baseRadius =
      lerp(
        34,
        470,
        ringAmount
      );

    // Loudness makes the tunnel breathe.
    let breathingScale =
      0.97 +
      audio.loudness * 0.14;

    let ringRadius =
      baseRadius *
      breathingScale;

    for (
      let dotIndex = 0;
      dotIndex < dotsPerRing;
      dotIndex++
    ) {
      let dotAmount =
        dotIndex /
        dotsPerRing;

      let baseAngle =
        dotAmount * TWO_PI;

      // Bass bends each ring.
      let bassWave =
        sin(
          baseAngle * 4 +
          time * 1.4 -
          ringIndex * 0.7
        ) *
        (
          3 +
          audio.bass * 22
        );

      // Mid frequencies twist the tunnel.
      let twist =
        sin(
          ringIndex * 0.65 -
          time * 0.8
        ) *
        (
          0.025 +
          audio.mid * 0.15
        );

      // Beats briefly fracture the ring structure.
      let fracture =
        (
          noise(
            ringIndex * 0.24,
            dotIndex * 0.18,
            time * 0.35
          ) -
          0.5
        ) *
        audio.beat *
        28;

      let angle =
        baseAngle + twist;

      let distortedRadius =
        ringRadius + bassWave;

      let x =
        cos(angle) *
        distortedRadius +
        cos(angle * 5) *
        fracture;

      let y =
        sin(angle) *
        distortedRadius *
        0.76 +
        sin(angle * 4) *
        fracture;

      /*
        Inner dots are larger and outer dots
        become smaller, creating depth.
      */
      let perspective =
        map(
          ringAmount,
          0,
          1,
          1.2,
          0.58
        );

      let pulse =
        (
          sin(
            time * 2.2 -
            ringIndex * 0.55
          ) +
          1
        ) /
        2;

      /*
        This is the balanced dot-size setting:
        stronger than version two, but smaller
        than the first dense version.
      */
      let dotSize =
        (
          4 +
          pulse * 4.5 +
          audio.loudness * 8 +
          audio.bass * 5
        ) *
        perspective;

      dotSize = constrain(
        dotSize,
        2.5,
        19
      );

      // Treble controls brightness.
      let alpha =
        105 +
        audio.treble * 130;

      if (
        (ringIndex + dotIndex) % 3 === 0
      ) {
        fill(
          255,
          197,
          38,
          alpha
        );
      } else if (
        (ringIndex + dotIndex) % 3 === 1
      ) {
        fill(
          247,
          78,
          121,
          alpha
        );
      } else {
        fill(
          118,
          92,
          255,
          alpha
        );
      }

      circle(
        x,
        y,
        dotSize
      );
    }
  }

  pop();
}

function drawCentreVoid(audio) {
  push();
  translate(width / 2, height / 2);
  noStroke();

  // Bass controls the central void.
  let voidSize =
    78 +
    audio.bass * 34;

  fill(
    4,
    1,
    12,
    238
  );

  circle(
    0,
    0,
    voidSize
  );

  noFill();

  stroke(
    255,
    186,
    35,
    90 + audio.treble * 140
  );

  strokeWeight(
    1.5 +
    audio.loudness * 2.5
  );

  circle(
    0,
    0,
    voidSize +
    15 +
    audio.beat * 18
  );

  pop();
}

function drawInstruction(audio) {
  noStroke();
  textAlign(CENTER);
  textSize(15);

  fill(
    255,
    225
  );

  let message;

  if (audio.playing) {
    message =
      "Music playing — click to pause";
  } else {
    message =
      "Click the canvas to play the music";
  }

  text(
    message,
    width / 2,
    height - 22
  );
}

function mousePressed() {
  toggleAudio();
}