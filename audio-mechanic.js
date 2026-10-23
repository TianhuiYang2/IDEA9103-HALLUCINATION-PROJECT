/*
AI ACKNOWLEDGEMENT:
ChatGPT (OpenAI, 2026) assisted with generating and
restructuring the audio-analysis code. The student tested,
reviewed and adapted the code for the final prototype.

This file analyses the music's loudness, bass, mid,
treble and beat intensity.
*/

let song;
let amp;
let fft;

// Smoothed audio values from 0 to 1
let audioFeatures = {
  loudness: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  beat: 0,
  playing: false
};

let bassBaseline = 0;
let beatCooldown = 0;
let lastAudioFrame = -1;

function preloadAudio() {
  song = loadSound("assets/music.mp3");
}

function setupAudio() {
  // Read the overall loudness
  amp = new p5.Amplitude();
  amp.setInput(song);

  // Analyse different frequency ranges
  fft = new p5.FFT(0.75, 512);
  fft.setInput(song);
}

function toggleAudio() {
  userStartAudio();

  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}

function getAudioFeatures() {
  /*
    Prevent the FFT from being analysed more than once
    during the same animation frame.
  */
  if (lastAudioFrame === frameCount) {
    return audioFeatures;
  }

  lastAudioFrame = frameCount;

  if (!song || !song.isPlaying()) {
    audioFeatures.playing = false;

    audioFeatures.loudness = lerp(
      audioFeatures.loudness,
      0,
      0.08
    );

    audioFeatures.bass = lerp(
      audioFeatures.bass,
      0,
      0.08
    );

    audioFeatures.mid = lerp(
      audioFeatures.mid,
      0,
      0.08
    );

    audioFeatures.treble = lerp(
      audioFeatures.treble,
      0,
      0.08
    );

    audioFeatures.beat = lerp(
      audioFeatures.beat,
      0,
      0.18
    );

    return audioFeatures;
  }

  audioFeatures.playing = true;

  fft.analyze();

  // Raw values
  let rawLoudness = amp.getLevel();

  let rawBass =
    fft.getEnergy(20, 180) / 255;

  let rawMid =
    fft.getEnergy(180, 2000) / 255;

  let rawTreble =
    fft.getEnergy(2000, 8000) / 255;

  // Convert the raw values into a useful 0–1 range
  let loudnessTarget = map(
    rawLoudness,
    0.015,
    0.22,
    0,
    1,
    true
  );

  let bassTarget = map(
    rawBass,
    0.08,
    0.75,
    0,
    1,
    true
  );

  let midTarget = map(
    rawMid,
    0.06,
    0.65,
    0,
    1,
    true
  );

  let trebleTarget = map(
    rawTreble,
    0.03,
    0.5,
    0,
    1,
    true
  );

  /*
    Smooth the values enough to prevent flickering,
    while keeping the response visible.
  */
  audioFeatures.loudness = lerp(
    audioFeatures.loudness,
    loudnessTarget,
    0.2
  );

  audioFeatures.bass = lerp(
    audioFeatures.bass,
    bassTarget,
    0.24
  );

  audioFeatures.mid = lerp(
    audioFeatures.mid,
    midTarget,
    0.18
  );

  audioFeatures.treble = lerp(
    audioFeatures.treble,
    trebleTarget,
    0.28
  );

  /*
    Detect a beat when the bass rises clearly above
    its recent average.
  */
  bassBaseline = lerp(
    bassBaseline,
    bassTarget,
    0.035
  );

  let bassDifference =
    bassTarget - bassBaseline;

  if (
    bassDifference > 0.13 &&
    bassTarget > 0.35 &&
    beatCooldown <= 0
  ) {
    audioFeatures.beat = 1;
    beatCooldown = 8;
  } else {
    audioFeatures.beat *= 0.78;
  }

  if (beatCooldown > 0) {
    beatCooldown--;
  }

  return audioFeatures;
}

/*
  This function keeps the current sketch.js working.

  Unlike the old version, the pulse now comes entirely
  from the real music analysis.
*/
function getMusicPulse() {
  let data = getAudioFeatures();

  return constrain(
    data.loudness * 0.5 +
    data.bass * 0.3 +
    data.beat * 0.35,
    0,
    1
  );
}