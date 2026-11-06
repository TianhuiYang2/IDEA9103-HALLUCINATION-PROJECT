# IDEA9103-HALLUCINATION-PROJECT — Dancing Pumpkin (Group SB)

Open `index.html` with a local server (e.g. VS Code Live Server). Opening the file directly will block the music and image from loading.
![Uploading 3361793936159_.pic_hd.jpg…]()


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
- Scene 3 - hundreds of coloured line strands spiral outward from a
  trunk like leaves, with more appearing the longer the scene plays.
- Scene 4 - an Infinity Mirror Room-style dot tunnel.
- Scene 5 - dotted tentacles that bulge and twist like octopus arms.
- Scene 6 - a moving flow field inspired by Van Gogh's brushwork and
  Petros Vrellis' "Starry Night Interactive Animation" (2012).
- Scene 7 - rain landing on the ground and splashing into puddles.
- Scene 8 - a red, cracked spider-web, inspired by one of Kusama's
  dense red net/thread installations - it gives the feeling of
  something being caught and held inside the web.
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
