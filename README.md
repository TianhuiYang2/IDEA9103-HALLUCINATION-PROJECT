# IDEA9103-HALLUCINATION-PROJECT — Dancing Pumpkin (Group SB)

Open `index.html` with a local server (e.g. VS Code Live Server). Opening the file directly will block the music and image from loading.
<img width="1910" height="1035" alt="3351793936157_ pic_hd" src="https://github.com/user-attachments/assets/c316bd0c-4c1c-4de2-bf83-d9aa014f124a" />
<img width="1910" height="1035" alt="3361793936159_ pic_hd" src="https://github.com/user-attachments/assets/12a55df0-1ca7-4038-b523-fa1992409abe" />



## Inspiration

Our project reinterprets Yayoi Kusama's visual language - repeated polka
dots, Infinity Net patterns, and her pumpkin sculptures - as an
interactive digital piece. The dotted pumpkin at the centre echoes her
"Dancing Pumpkin" and dot-covered sculpture series, while the shifting
background scenes (dot grids, a red cracked-web texture inspired by the
gallery wall behind her "Small Pumpkin Paintings", and swirling coloured
lines) draw on the way her installations use repetition and colour to
create an immersive, almost hallucinatory space. We wanted the piece to
feel like stepping inside one of her rooms: constantly moving, reacting
to sound and touch, never quite the same twice.

## Techniques

- **Time-based background, with Perlin noise as a supporting technique
(Doris)** - `millis()` drives an automatic cycle through 8 background
scenes, each with its own breathing (zoom in/out) animation and a
cross-fade into the next scene. `noise()` does more than decorate the
shapes in each scene - it also decides how long each scene plays for,
so the timer that switches scenes is itself shaped by Perlin noise
rather than a fixed interval. `random()` / `randomSeed()` give each
dot, drop and line strand a fixed identity.

This mechanic is built from Yayoi Kusama's dots and nets specifically.
She has spoken about hallucinations she experienced as a child, and
dots became her way of carrying two ideas at once - infinity, and a
form dissolving into something endless (what she calls
self-obliteration). Red pumpkins are rarer in her work than her
well-known yellow ones, and for her the red points to a more
hallucinatory, inward side of her experience; I wanted this background
to carry that same feeling into something that actually moves.

A quick scene-by-scene note:
- Scenes 1 & 2 - dots on black and on white, Kusama's most repeated
  element; scene 2 adds a ripple that spreads outward from the centre
  like a sound wave moving through the dots.
- Scene 3 - hundreds of coloured line strands burst outward from a trunk in a full 360-degree spread, like leaves catching in every direction, with more strands appearing the longer the scene plays.
- Scene 4 - an Infinity Mirror Room-style dot tunnel.
- Scene 5 - dotted tentacles that bulge and twist like octopus arms.
- Scene 6 - a moving flow field inspired by Van Gogh's brushwork and
  Petros Vrellis' "Starry Night Interactive Animation" (2012).
- Scene 7 - rain landing on the ground and splashing into puddles.
- Scene 8 - a red, cracked spider-web built from several overlapping thread layers at different angles and depths (one solid, dark red thread up front, paler ones fading behind it), plus loose stray threads that keep scattering across the web the longer the scene plays - inspired by one of Kusama’s dense red net/thread installations, it gives the feeling of something being caught and held inside the web.
- <img width="2096" height="1126" alt="3411793938437_ pic" src="https://github.com/user-attachments/assets/8c364bb3-64e1-4c0b-8a49-2971a61eace8" />
Scene 7 - rain landing and splashing into puddles, the clearest example of time + noise fusion
<img width="1886" height="960" alt="3391793938423_ pic" src="https://github.com/user-attachments/assets/9e0f305a-2bf4-4f84-a366-cb4310ff9da4" />
Scene 5 - dotted tentacles swaying on a yellow background
<img width="1958" height="1100" alt="3421793938448_ pic" src="https://github.com/user-attachments/assets/dc2e2563-8d82-4dda-ab84-e17a7f11facc" />
Scene 8 - the red web with layered, overlapping threads at different depths
- **Audio (Tianhui):** `p5.Amplitude` and `p5.FFT` analyse the loaded
  track's overall loudness and its bass/mid/treble frequency bands in
  real time, and a simple beat-detection check (comparing the current
  bass level against its rolling average) flags musical beats.
- **User input (Jenna):** mouse position drives a growing "lens" and a
  fading trail grid; staying still lets dots swell until they fill their
  shape, and every click (or detected beat) sends an outward ripple.
- All four mechanics come together on the central pumpkin: its dots are
  placed inside Jenna's lobe-detection system, sized/pushed by mouse
  input, grown by the music's loudness and beat, and the whole pumpkin
  gently breathes in time with Doris's background cycle.

## Files

| File | Owner | What it does |
|---|---|---|
| `sketch.js` | Group | Calls everyone's functions in layers |
| `time-mechanic.js` | Doris | 8 time-based background scenes + glow dust (unchanged) |
| `audio-mechanic.js` | Tianhui | Music analysis: loudness, bass, mid, treble, beat (unchanged) |
| `input-mechanic.js` | Jenna | Mouse: lens + trail, hold-still obliteration, click / beat ripples |
| `pumpkin.js` | Jenna | Reads `assets/pumpkin.png`, finds each lobe, fills it row by row with dots that stay inside the lobe; click changes the dot colours |

## Controls

- **Move** the mouse: dots near it grow and are pushed aside, leaving a fading trail
- **Hold still**: dots swell until they swallow their lobe
- **Click**: first click starts the music; every click sends a ripple (beats send ripples too) and a colour wave that switches the dots to the next colour scheme
- **SPACE**: play / pause music
- **N**: next background scene

## AI Acknowledgement

ChatGPT and Claude were used to help generate and restructure parts of
each team member's code (see the acknowledgement comment at the top of
each mechanic file for details on that file specifically). Every team
member tested, reviewed, and adjusted the AI-assisted code to fit the
final design, and can explain how their own file works.

## External References

- Music: Databend. (2026). *Dark Electronic Pulse Background*. Pixabay.
  Pixabay Content License.
- The red cracked-line web texture in the background (scene 8) is based
  on the gallery wall behind Yayoi Kusama's "Small Pumpkin Paintings"
  (Omer Tiroche Gallery, London), recoloured and rebuilt as a web of
  radial and ring threads.
- The flowing-stroke background scene (scene 6) is inspired by Petros
  Vrellis' "Starry Night Interactive Animation" (2012).

## Credits

Music: Databend. (2026). *Dark Electronic Pulse Background*. Pixabay. Pixabay Content License.
