# IDEA9103 Hallucination Project

## Project Overview

This project explores hallucination as an interactive audiovisual environment. Repeated dots, flowing movement, spatial distortion and changing colours are combined to create an image that feels unstable and constantly transforming.

The project began with Yayoi Kusama's pumpkins, polka dots and Infinity Mirror Rooms. After tutor feedback, the group moved away from treating the pumpkin as the complete project and developed hallucination as the broader visual concept.

The final work combines three main interaction mechanisms:

- audio analysis;
- time-based animation;
- user input.

Each mechanism was first developed as an independent prototype before being integrated into one p5.js project.

---

## Inspiration

Yayoi Kusama's repeated dots and immersive installations are the main conceptual inspiration. Her use of repetition and accumulation demonstrates how simple visual elements can expand into an immersive environment.

The project does not directly reproduce one of Kusama's artworks. Instead, it uses repetition, movement, sound and interaction to create an original interpretation of hallucination.

The audio-responsive dot field was designed to make the visual space feel alive. As the music changes, the dots breathe, twist, brighten and briefly fracture.

---

## Team Mechanisms and Responsibilities

| Mechanism | Branch | Responsibility |
|---|---|---|
| Audio mechanic | `audio-mechanic` | Tianhui Yang developed the music analysis and audio-responsive visual prototype. |
| Time mechanic | `time-mechanic` | The time mechanic controls breathing, scene transitions and continuously changing hallucination backgrounds. |
| Input mechanic | `input-mechanic` | The input mechanic uses audience interaction to change the foreground visual elements. |

Each team member developed and tested their mechanism separately. The mechanisms are then combined through a shared `sketch.js` and `index.html`.

---

## Audio Mechanic

The audio mechanic uses the p5.sound library to analyse:

- overall loudness;
- bass frequencies;
- middle frequencies;
- treble frequencies;
- beat intensity.

The audio values are returned through the `getAudioFeatures()` function.

The visual mappings are:

| Audio feature | Visual response |
|---|---|
| Loudness | Controls breathing and overall dot size |
| Bass | Controls waves, expansion and spatial distortion |
| Mid frequencies | Controls rotation and twisting |
| Treble | Controls brightness and opacity |
| Beat | Creates short shaking and fracture effects |

The updated audio analysis uses adaptive peak values. This allows quieter and louder sections of the music to remain visually responsive.

Attack-release smoothing is also used. Stronger sounds appear quickly, while falling values fade more slowly. This prevents excessive flickering while keeping the response visible.

---

## Audio Code Structure

### `audio-mechanic.js`

Main functions:

- `preloadAudio()` loads the music file.
- `setupAudio()` creates the amplitude and FFT analysers.
- `toggleAudio()` plays or pauses the music.
- `getAudioFeatures()` returns loudness, bass, mid, treble and beat values.
- `smoothAudioValue()` creates smoother transitions.
- `normaliseAudioValue()` converts measurements into values between 0 and 1.
- `updateAdaptivePeak()` adapts the analysis to different music volumes.
- `getMusicPulse()` combines several audio measurements into one pulse value.

### `sketch.js`

The main sketch uses the audio data to control the scale, distortion, rotation, opacity and vibration of the dot field.

### `assets/music.mp3`

The music file used by the audio prototype.

---

## Interaction Guide

1. Open the project using Live Server.
2. Wait for the visual canvas to appear.
3. Click the canvas to play the music.
4. Watch how the dots respond to different parts of the music.
5. Click the canvas again to pause the music.

Browsers require a user interaction before audio can begin, so the music cannot start automatically.

---

## Running the Project

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Make sure the `assets/music.mp3` file is present.
4. Open `index.html` using Live Server.
5. Click the canvas to start the audio.

The project uses p5.js and p5.sound.

---

## Development Process

The audio prototype developed through several iterations:

1. A basic amplitude value changed all dot sizes.
2. The response was initially too weak and inconsistent.
3. FFT analysis separated the music into bass, mid and treble ranges.
4. Beat detection was added for short fracture effects.
5. Smoothing reduced visual shaking.
6. Adaptive peak analysis improved responses during quieter musical sections.
7. The pumpkin-based experiment developed into a more abstract hallucination space.

More information is available in [`PROCESS.md`](PROCESS.md).

---

## Music Credit

“Dark Electronic Pulse Background” by Databend, downloaded from Pixabay.

Source:  
https://pixabay.com/music/electronic-dark-electronic-pulse-background-546935/

Pixabay Content Licence:  
https://pixabay.com/service/license-summary/

---

## Technical References

p5.js. `p5.Amplitude`.  
https://p5js.org/reference/p5.sound/p5.Amplitude/

p5.js. `p5.FFT`.  
https://p5js.org/reference/p5.sound/p5.FFT/

p5.js. `loadSound()`.  
https://p5js.org/reference/p5/loadSound/

Hirshhorn Museum and Sculpture Garden. *Yayoi Kusama: Infinity Mirrors – The Exhibition*.  
https://hirshhorn.si.edu/kusama/the-exhibition/

---

## AI Acknowledgement

ChatGPT (OpenAI, 2026) assisted Tianhui Yang with:

- debugging the p5.js audio code;
- restructuring the audio-analysis functions;
- developing smoothing and beat-detection methods;
- improving code comments and documentation;
- supporting visual iteration.

The generated suggestions were reviewed, tested, modified and integrated by the student.

AI-assisted sections are also identified through comments in the relevant JavaScript files.

OpenAI ChatGPT:  
https://chatgpt.com/