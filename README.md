# IDEA9103 Hallucination Project

## Project Overview

This project explores hallucination as an interactive audiovisual environment. Repeated dots, flowing movement, spatial distortion and changing colours are combined to create a visual field that feels unstable and continuously changing.

The project began with Yayoi Kusama’s pumpkins, polka dots and Infinity Mirror Rooms. Following tutor feedback, the team moved beyond treating the pumpkin as the complete project and instead approached hallucination as a broader visual concept.

The final work combines three main interaction mechanics:

- audio analysis;
- time-based animation;
- user input.

Each mechanic was first developed as an independent prototype and was later integrated into one p5.js project.

---

## Inspiration

Yayoi Kusama’s repeated dots and immersive installations were the main conceptual inspiration. Her use of repetition and accumulation demonstrates how simple visual elements can expand into an immersive environment.

The project does not directly copy Kusama’s artworks. Instead, it uses repetition, movement, sound and interaction to create an original interpretation of hallucination.

The audio-responsive dot field was designed to make the visual space feel alive. As the music changes, the dots breathe, distort, brighten and briefly fracture.

---

## Team Mechanics and Responsibilities

| **Mechanic** | **Branch** | **Responsibility** |
|---|---|---|
| Audio mechanic | `audio-mechanic` | Tianhui developed the music analysis and audio-responsive visual prototype. |
| Time mechanic | `time-mechanic` | The time mechanic controls breathing, scene transitions and the continuously changing hallucination background. |
| Input mechanic | `input-mechanic` | The input mechanic uses audience interaction to alter foreground visual elements. |

Each team member separately developed and tested an individual mechanic. These mechanics were later combined through the shared `sketch.js` and `index.html`.

---

## Audio Mechanic

The audio mechanic uses the p5.sound library to analyse:

- overall loudness;
- bass frequencies;
- mid frequencies;
- treble frequencies;
- beat intensity.

The audio values are returned through `getAudioFeatures()`.

In the independent prototype, these values are mapped to the following visual responses:

| **Audio feature** | **Visual response** |
|---|---|
| Loudness | Controls breathing and overall dot size |
| Bass | Controls waves, expansion and spatial distortion |
| Mid | Controls rotation and twisting |
| Treble | Controls brightness and opacity |
| Beat | Produces short shaking and fracture effects |

The updated audio analysis uses adaptive peak values. This allows both quieter and louder sections of the music to remain visually responsive.

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
- `updateAdaptivePeak()` adjusts the analysis to different music volumes.
- `getMusicPulse()` combines several audio measurements into one pulse value.

### `sketch.js`

The independent sketch uses the audio data to control the scale, distortion, rotation, opacity and vibration of the dot field.

### `assets/music.mp3`

The music file used by the audio prototype.

---

## Integration into the Final Group Project

The `audio-mechanic` branch was used to develop and test the complete audio-responsive dot-field prototype independently.

For the final version on the `main` branch, `audio-mechanic.js` was added to the shared project. The shared `sketch.js` calls `getAudioFeatures()` and passes the resulting audio data to `drawPumpkin(audio)` in `pumpkin.js`.

In the final group version, `audio.loudness` and `audio.beat` contribute to the growth and pulse of the pumpkin dots. The bass, mid and treble visual mappings are demonstrated more fully in the independent audio prototype.

This means that the independent branch demonstrates the complete audio concept, while the `main` branch demonstrates how selected audio values work together with the time-based background, user input and central pumpkin.

---

## Interaction Guide

1. Open the project with Live Server.
2. Wait for the visual canvas to appear.
3. Click the canvas to play the music.
4. Observe how the dots respond to different parts of the music.
5. Click the canvas again to pause the music.

Browsers require user interaction before audio can begin, so the music does not start automatically.

---

## Running the Project

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Make sure `assets/music.mp3` is present.
4. Open `index.html` through Live Server.
5. Click the canvas to begin the audio.

The project uses p5.js and p5.sound.

---

## Development Process

The audio prototype was developed through several iterations:

1. A basic amplitude value changed the size of every dot.
2. The initial response was too weak and inconsistent.
3. FFT analysis separated the music into bass, mid and treble ranges.
4. Beat detection was added for short fracture effects.
5. Smoothing reduced visual shaking.
6. Adaptive peak analysis improved the response during quieter sections.
7. The pumpkin-based experiment gradually developed into a more abstract hallucination space.

More information is available in [`PROCESS.md`](https://github.com/TianhuiYang2/IDEA9103-HALLUCINATION-PROJECT/blob/audio-mechanic/PROCESS.md).

---

## Music

Databend. (2026). *Dark Electronic Pulse Background*. Downloaded from Pixabay.

Source:  
https://pixabay.com/music/electronic-dark-electronic-pulse-background-546935/

Pixabay Content License:  
https://pixabay.com/service/license-summary/

---

## Technical References

p5.js. `p5.Amplitude`.  
https://p5js.org/reference/p5.sound/p5.Amplitude/

p5.js. `p5.FFT`.  
https://p5js.org/reference/p5.sound/p5.FFT/

p5.js. `loadSound()`.  
https://p5js.org/reference/p5/loadSound/

Hirshhorn Museum and Sculpture Garden. *Yayoi Kusama: Infinity Mirrors — The Exhibition*.  
https://hirshhorn.si.edu/kusama/the-exhibition/

---

## AI Acknowledgement

ChatGPT (OpenAI, 2026) assisted Tianhui with:

- debugging the p5.js audio code;
- restructuring audio-analysis functions;
- developing smoothing and beat-detection methods;
- improving code comments and documentation;
- supporting visual iteration.

The generated suggestions were reviewed, tested, modified and integrated by the student.

AI-assisted sections are also identified through comments in the relevant JavaScript files.

OpenAI ChatGPT:  
https://chatgpt.com/