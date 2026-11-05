# Development Process

## Project Direction

This experiment explores how audio can transform repeated dots into an abstract hallucination space.

The original group concept was based on Yayoi Kusama’s pumpkins, repeated dots and immersive installations. After tutor feedback, the project shifted away from treating the pumpkin as the main subject. “Hallucination” became the central design idea.

My responsibility in the group is the audio-responsive mechanic.

---

## Stage 1: Dotted Pumpkin

The first prototype used a recognisable orange pumpkin covered with black dots.

The music controlled the size of the dots. This demonstrated the basic audio mechanism, but the outcome remained too literal and visually limited to the pumpkin.

### Observation

- The pumpkin was easy to recognise.
- Different dot sizes created some depth.
- The visual response to the music was sometimes too subtle.
- The concept depended too heavily on a single recognisable object.

---

## Stage 2: Moving Beyond the Pumpkin

Following tutor feedback, I explored audio as a way to destabilise the visual space rather than only animate the surface of a pumpkin.

The pumpkin was replaced by concentric rings of coloured dots. These rings form a tunnel-like space that appears to breathe, rotate, distort and fracture in response to sound.

This connects more directly to the group’s hallucination concept.

---

## Stage 3: Audio Analysis

The audio mechanic uses `p5.Amplitude` and `p5.FFT` to analyse different properties of the music.

The following audio features are calculated:

- `loudness` — the overall volume of the music
- `bass` — energy in the low-frequency range
- `mid` — energy in the middle-frequency range
- `treble` — energy in the high-frequency range
- `beat` — a short event detected when bass energy rises above its recent average

The values are smoothed with `lerp()` to reduce flickering and sudden unstable movement.

---

## Audio and Visual Mapping

| Audio feature | Visual response |
|---|---|
| Loudness | Changes the overall dot size and breathing scale |
| Bass | Bends the rings and changes the central void |
| Mid frequencies | Twist and rotate the visual space |
| Treble | Changes brightness and opacity |
| Beat | Produces a short shake and fracture effect |

Using several properties of the sound produces a more complex response than using volume alone.

---

## Stage 4: Visual Testing

The first abstract version responded strongly to the music, but the dots became too large and overlapped. This made the tunnel structure difficult to see.

The second version reduced the dot size, distortion and beat movement. It created a clearer tunnel, but the response to the music became too weak.

The final version balances these two outcomes:

- the tunnel remains visible;
- the dots still react to the music;
- overlap is limited;
- the movement is noticeable without becoming uncontrolled;
- the centre creates the impression of depth.

---

## Music Testing

The original track had limited rhythmic contrast, so some changes were difficult to see.

The track was replaced with **Dark Electronic Pulse Background** by Databend. Its stronger rhythmic sections make the audio response easier to observe.

The quiet beginning also creates useful contrast: the visual space begins calmly and becomes increasingly unstable as the rhythm develops.

---

## Code Structure

### `audio-mechanic.js`

This file:

- loads and plays the music;
- creates the amplitude and FFT analysers;
- measures loudness, bass, mid and treble;
- detects changes in bass energy;
- smooths the audio values;
- returns the analysed data through `getAudioFeatures()`.

### `sketch.js`

This file:

- creates the canvas;
- retrieves the audio features;
- draws the background glow;
- draws the hallucination dot field;
- draws the central void;
- maps each audio feature to a visual property.

Keeping the audio analysis separate from the visual drawing makes the mechanic easier to integrate into the final group project.

---

## Interaction

The user clicks the canvas to play or pause the music.

When the music is playing, the visual space continuously responds to the analysed sound. The user does not directly control individual dots; instead, the soundtrack transforms the whole environment.

---

## Current Outcome

The prototype is no longer only a dotted pumpkin. It is an audio-responsive hallucination space made from repeated dots.

The repeated dots retain a connection to Kusama’s visual language, while the distorted tunnel is our own interpretation of immersion, instability and hallucination.

---

## Next Step

The next step is to integrate the audio mechanic with the group’s six hallucination scenes.

The shared project can call `getAudioFeatures()` and use:

- loudness for breathing and scale;
- bass for spatial distortion;
- treble for brightness and transparency;
- beat detection for short visual events.

The audio should support the existing scenes rather than replace the time-based and user-input mechanics.

---

## AI Acknowledgement

ChatGPT by OpenAI was used to assist with code restructuring, debugging and visual iteration.

AI-generated suggestions were reviewed, tested and modified by the student. Comments acknowledging this assistance are also included in the relevant source-code files.

---

## Music Credit

Databend. (2026). *Dark Electronic Pulse Background*. Pixabay. Available at:  
https://pixabay.com/music/electronic-dark-electronic-pulse-background-546935/

The track is used under the Pixabay Content License.