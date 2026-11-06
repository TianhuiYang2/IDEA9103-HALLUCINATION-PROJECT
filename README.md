# IDEA9103-HALLUCINATION-PROJECT
Doris Zheng — Time-based background (with Perlin noise)

My part of the background is built from Yayoi Kusama's dots and nets, and from the ideas behind her pumpkin works specifically. Kusama has spoken about hallucinations she experienced as a child, and dots became her way of carrying two ideas at once - infinity, and a form dissolving into something endless (what she calls self-obliteration). The pumpkin itself comes from her own upbringing in a family that ran a plant-growing business, where pumpkins were part of everyday life; she described them as round, sturdy and a little humorous, and they became a steady symbol of her inner world. Red pumpkins are rarer in her work than her well-known yellow ones, and for her the red points to a more hallucinatory, inward side of her experience. I wanted my background to carry that same feeling into something that actually moves, so the 8 scenes breathe and shift on their own over time rather than sitting still.

Technically, `millis()` drives an automatic cycle through the 8 scenes, and each scene breathes (zooms in and out) on its own timer. The part I'm most proud of is how Perlin noise is used: `noise()` doesn't only make shapes drift and wobble, it also decides how long each individual scene plays for, so the timer that switches scenes is itself shaped by Perlin noise rather than a fixed interval - this is where time-based and Perlin noise genuinely combine, rather than sitting side by side.

A quick scene-by-scene note:

* Scenes 1 & 2 - dots on black and on white, Kusama's most repeated element; scene 2 adds a ripple that spreads outward from the centre like a sound wave moving through the dots.
* Scene 3 - hundreds of coloured line strands burst outward from a trunk in a full 360-degree spread, like leaves catching in every direction, with more strands appearing the longer the scene plays.
* Scene 4 - an Infinity Mirror Room-style dot tunnel.
* Scene 5 - dotted tentacles that bulge and twist like octopus arms.
* Scene 6 - a moving flow field inspired by Van Gogh's brushwork and Petros Vrellis' "Starry Night Interactive Animation" (2012).
* Scene 7 - rain landing on the ground and splashing into puddles.
* Scene 8 - a red, cracked spider-web built from several overlapping thread layers at different angles and depths (one solid, dark red thread up front, paler ones fading behind it), plus loose stray threads that keep scattering across the web the longer the scene plays - inspired by one of Kusama's dense red net/thread installations, it gives the feeling of something being caught and held inside the web.
