# IDEA9103-HALLUCINATION-PROJECT — Dancing Pumpkin (Group SB)

Open `index.html` with a local server (e.g. VS Code Live Server). Opening the file directly will block the music and image from loading.

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

## Credits

Music: Databend. (2026). *Dark Electronic Pulse Background*. Pixabay. Pixabay Content License.
