/*
AI ACKNOWLEDGEMENT:
ChatGPT (OpenAI, 2026) assisted with generating and
restructuring the audio-analysis code. The student tested,
reviewed and adapted the code for the final prototype.

This file analyses the music's loudness, bass, mid,
treble and beat intensity.

The updated version uses adaptive peak values and
attack-release smoothing so that the visual response
remains visible across quieter and louder sections.
*/

let song;
let amp;
let fft;

// Smoothed audio values returned to sketch.js
let audioFeatures = {
  loudness: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  beat: 0,
  playing: false
};

// Recent average used for beat detection
let bassBaseline = 0;

// Prevent repeated beat detection
let beatCooldown = 0;

// Prevent FFT analysis from running twice in one frame
let lastAudioFrame = -1;

/*
Adaptive peak values remember the recent strength
of each part of the music.

They slowly decrease when the music becomes quieter.
This allows quieter musical sections to remain visible.
*/
let adaptivePeaks = {
  loudness: 0.08,
  bass: 0.45,
  mid: 0.4,
  treble: 0.32
};

function preloadAudio() {
  song = loadSound("assets/music.mp3");
}

function setupAudio() {
  // Analyse the overall loudness of the selected song
  amp = new p5.Amplitude();
  amp.setInput(song);

  /*
  Analyse the frequency spectrum.

  The first value controls FFT smoothing.
  The second value controls spectrum resolution.
  */
  fft = new p5.FFT(0.75, 512);
  fft.setInput(song);

  // Keep playback at a comfortable volume
  song.setVolume(0.85);
}

function toggleAudio() {
  // Browsers require user interaction before sound starts
  userStartAudio();

  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}

/*
Smooth an audio value using different speeds.

A rising value uses a faster attack.
A falling value uses a slower release.

This makes the animation responsive without
creating excessive flickering.
*/
function smoothAudioValue(
  currentValue,
  targetValue,
  attackSpeed,
  releaseSpeed
) {
  let smoothingSpeed;

  if (targetValue > currentValue) {
    smoothingSpeed = attackSpeed;
  } else {
    smoothingSpeed = releaseSpeed;
  }

  return lerp(
    currentValue,
    targetValue,
    smoothingSpeed
  );
}

/*
Convert a raw audio measurement into a value
between 0 and 1 using its current adaptive peak.
*/
function normaliseAudioValue(
  rawValue,
  minimumValue,
  peakValue
) {
  let safePeak = Math.max(
    peakValue,
    minimumValue + 0.01
  );

  return constrain(
    map(
      rawValue,
      minimumValue,
      safePeak,
      0,
      1
    ),
    0,
    1
  );
}

/*
Update a peak quickly when stronger sound appears.

When the sound becomes quieter, the remembered peak
falls slowly so that the analysis can adapt over time.
*/
function updateAdaptivePeak(
  currentPeak,
  rawValue,
  minimumPeak
) {
  let decayingPeak =
    currentPeak * 0.997;

  return Math.max(
    rawValue,
    decayingPeak,
    minimumPeak
  );
}

/*
Gradually return all audio values to zero
when the music is paused.
*/
function fadeAudioToSilence() {
  audioFeatures.loudness =
    smoothAudioValue(
      audioFeatures.loudness,
      0,
      0.18,
      0.08
    );

  audioFeatures.bass =
    smoothAudioValue(
      audioFeatures.bass,
      0,
      0.18,
      0.08
    );

  audioFeatures.mid =
    smoothAudioValue(
      audioFeatures.mid,
      0,
      0.18,
      0.08
    );

  audioFeatures.treble =
    smoothAudioValue(
      audioFeatures.treble,
      0,
      0.18,
      0.08
    );

  audioFeatures.beat =
    lerp(
      audioFeatures.beat,
      0,
      0.2
    );
}

function getAudioFeatures() {
  /*
  Do not analyse the same music more than once
  during a single animation frame.
  */
  if (lastAudioFrame === frameCount) {
    return audioFeatures;
  }

  lastAudioFrame = frameCount;

  if (!song || !song.isPlaying()) {
    audioFeatures.playing = false;
    fadeAudioToSilence();

    return audioFeatures;
  }

  audioFeatures.playing = true;

  // Generate the frequency spectrum for this frame
  fft.analyze();

  // Read the raw loudness
  let rawLoudness =
    amp.getLevel();

  // Read three frequency ranges
  let rawBass =
    fft.getEnergy(20, 180) / 255;

  let rawMid =
    fft.getEnergy(180, 2000) / 255;

  let rawTreble =
    fft.getEnergy(2000, 8000) / 255;

  /*
  Update the remembered peak values.

  These values allow the analysis to respond to
  both quieter and louder sections of the track.
  */
  adaptivePeaks.loudness =
    updateAdaptivePeak(
      adaptivePeaks.loudness,
      rawLoudness,
      0.06
    );

  adaptivePeaks.bass =
    updateAdaptivePeak(
      adaptivePeaks.bass,
      rawBass,
      0.3
    );

  adaptivePeaks.mid =
    updateAdaptivePeak(
      adaptivePeaks.mid,
      rawMid,
      0.28
    );

  adaptivePeaks.treble =
    updateAdaptivePeak(
      adaptivePeaks.treble,
      rawTreble,
      0.22
    );

  // Convert raw measurements into 0–1 values
  let loudnessTarget =
    normaliseAudioValue(
      rawLoudness,
      0.008,
      adaptivePeaks.loudness
    );

  let bassTarget =
    normaliseAudioValue(
      rawBass,
      0.05,
      adaptivePeaks.bass
    );

  let midTarget =
    normaliseAudioValue(
      rawMid,
      0.04,
      adaptivePeaks.mid
    );

  let trebleTarget =
    normaliseAudioValue(
      rawTreble,
      0.025,
      adaptivePeaks.treble
    );

  /*
  Apply attack-release smoothing.

  Rising sounds respond quickly, while falling
  sounds fade more gradually.
  */
  audioFeatures.loudness =
    smoothAudioValue(
      audioFeatures.loudness,
      loudnessTarget,
      0.32,
      0.1
    );

  audioFeatures.bass =
    smoothAudioValue(
      audioFeatures.bass,
      bassTarget,
      0.38,
      0.11
    );

  audioFeatures.mid =
    smoothAudioValue(
      audioFeatures.mid,
      midTarget,
      0.28,
      0.09
    );

  audioFeatures.treble =
    smoothAudioValue(
      audioFeatures.treble,
      trebleTarget,
      0.4,
      0.12
    );

  /*
  Calculate a recent average of the bass.

  A beat is detected when the current bass rises
  clearly above this recent average.
  */
  bassBaseline =
    lerp(
      bassBaseline,
      bassTarget,
      0.045
    );

  let bassDifference =
    bassTarget - bassBaseline;

  let beatThreshold =
    Math.max(
      0.1,
      bassBaseline * 0.3
    );

  if (
    bassDifference > beatThreshold &&
    bassTarget > 0.28 &&
    beatCooldown <= 0
  ) {
    audioFeatures.beat = 1;
    beatCooldown = 7;
  } else {
    audioFeatures.beat *= 0.76;
  }

  if (beatCooldown > 0) {
    beatCooldown--;
  }

  return audioFeatures;
}

/*
Return one combined pulse value for parts of
the project that only require a single audio value.

The pulse combines overall loudness, bass energy
and detected beats.
*/
function getMusicPulse() {
  let data =
    getAudioFeatures();

  return constrain(
    data.loudness * 0.45 +
    data.bass * 0.35 +
    data.beat * 0.35,
    0,
    1
  );
}