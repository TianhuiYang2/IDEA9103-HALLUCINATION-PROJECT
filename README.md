<img width="1910" height="1035" alt="3361793936159_ pic_hd" src="https://github.com/user-attachments/assets/3438bad7-a15d-4fd3-82d8-7fdd19008667" /># IDEA9103-HALLUCINATION-PROJECT
<img width="2164" height="1074" alt="3431793938466_ pic" src="https://github.com/user-attachments/assets/2b9d16be-d9a1-4d14-92b8-a83c2438656a" />
<img width="2164" height="1074" alt="3431793938466_ pic" src="https://github.com/user-attachments/assets/9145ce97-e4f1-41b2-a97b-433acfa6127d" />
<img width="2128" height="1038" alt="3371793938423_ pic" src="https://github.com/user-attachments/assets/2c73e50d-faca-44f2-9e0c-014857d91e1f" />
<img width="1660" height="886" alt="3381793938423_ pic" src="https://github.com/user-attachments/assets/07d94885-da91-479d-82ac-66883bb59437" />
<img width="1928" height="1086" alt="3401793938430_ pic" src="https://github.com/user-attachments/assets/943975e8-8e50-4758-adb0-71a03f78fde0" />
<img width="2096" height="1126" alt="3411793938437_ pic" src="https://github.com/user-attachments/assets/32f87b04-54de-4a77-aa90-17db462474f6" />
<img width="1958" height="1100" alt="3421793938448_ pic" src="https://github.com/user-attachments/assets/69df6b58-4ad8-403d-b839-97cd6eba0b84" />




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
