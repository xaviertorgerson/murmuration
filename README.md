# Murmuration

A starling murmuration, and a school of fish, simulated on the graphics card in one HTML file.

**Live: <https://xlt.pw/murmuration/>**

![Thousands of starlings folding into a dark ribbon over a dusk sky](media/screenshot.jpg)

Tens of thousands of birds, each steering by its seven nearest neighbours. Nothing about the shape is
scripted: the sheets, ribbons and waves come out of the rules. Falcons and hawks visit and hunt, and you
can be one. It is a zero-player game: change a setting and watch the flock respond.

## Run it

Open `index.html` in a browser. There is no build step, no dependency and no network request (the two
typefaces are embedded). It needs WebGL2 with float render targets, which current desktop browsers have.

## Controls

**Drag looks, tap acts, hold grabs**, the same with a mouse, a trackpad, a pen or a finger.

| Gesture | What it does |
|---|---|
| **Drag** | Look around. Let go while moving and the view carries on a little. |
| **Wheel or pinch** | Zoom. On a trackpad a two-finger swipe looks around and a pinch zooms. |
| **Tap or click** | The tool's one action at that spot. |
| **Press and hold** | Take hold of the hunter or the lure; it follows the pointer until you let go. With a mouse the right button, or Shift, takes hold at once. |
| **Right-click** | Inspect the bird or hunter under the pointer, whatever the tool. |
| **Three-finger tap** | The next view. |
| **Keys** | `1`–`9`, `0` scenes · arrows look around · `+` `-` zoom · `V` view · `R` reseed · `N` new sky · `H` hide panel · `Space` pause · `F` full screen · `S` screensaver |

| Tool | Tap | Hold |
|---|---|---|
| **Hunter** | A falcon (or a shark) dives at that spot. | It chases where you point. |
| **Startle** | A panic wave from that spot. | |
| **Lure** | | The flock is drawn toward where you point. |
| **Add hunter** | Releases a wild hawk, falcon, shark or tuna. | |
| **Inspect** | Shows one animal's traits and rides along with it. | |

Nothing follows a pointer that is not pressed.

**Three views.** *Orbit* circles the flock at a distance fitted to its size and to the shape of your
screen. *From the ground* stands at one spot by the roost and follows the flock with a lens that widens
and narrows to keep it filling most of the frame, as a photographer would. *Ride along* flies behind
one bird. Left alone, the camera is never quite still: it circles slowly, rises and sinks a little, and
breathes in and out. Zooming out stops where a bird would fall under about a pixel and a third on your
screen, so a small or coarse screen stays closer. The flock's home is wider across your view than along
it, so it sweeps from side to side in front of you.

## Scenes, seeds and links

**Tune** (top right) holds everything else, in the order you reach for it: the **scene** (starlings or
fish, a built-in scene or your own pairing of place and behaviour, *New flock* and *New sky*), **the
flock** (Tightness, Restlessness, Shape, its size and how many wild hunters may come), and **watching**
(the view, the drifting camera, the hour and whether the sun moves). Everything finer is folded away
below, and each control explains itself behind its (i).

- **A scene is three choices:** the species (starlings or fish), the place and the behaviour. Starlings
  have reed beds, a still lake, open sea, mountains and desert, and fly an evening roost, a wide veil, a
  tight ball, restless, into the wind, or on edge with falcons about. Fish have open ocean, a lagoon, a
  kelp forest and a coral reef, and travel as a school, mill in a ring or pack into a bait ball. Each
  built-in scene pairs a place with a different behaviour, so the scenes differ in how the flock flies
  and not only in what is behind it; any place can be paired with any behaviour of the same species.
  Changing the place or the behaviour does not restart anything: the same animals carry on and respond.
- **Shape** runs from a ball to a thin slab. **Field notes**, off until you turn it on, is a quiet line
  under the title that names what is happening as it happens: a turn sweeping the flock, a falcon
  arriving, the flock balling up.
- **A seed** is a different evening. It draws the individuals, the hour and the sky, where the sun
  stands, the flock's size and the hunters' visits, and it moves the flight itself: Tightness and Restlessness land
  anywhere within a quarter of their scale either side of where the behaviour sets them, and alignment,
  roaming, pace, fear and escape strength are drawn around the scene's values. *Seed variety* sets how
  far a seed may go; at zero only the weather changes. Fish are moved less.
- **Let the sun move** is on. Over a few minutes the sun sets and comes back up; under water it sways,
  so the columns of light lean and sweep. A new flock is always met facing the light: the sunset and
  its clouds behind the birds, or the shafts coming down through the water.
- **A lever you move stays where you put it** through a reseed, and is marked with a dot. *Reset them*
  hands those levers back to the scene and the seed.
- **Left alone**, the page moves on by itself after two minutes: a new seed and any pairing of place and
  behaviour, starlings or fish. A scene you adjusted or saved is given six minutes, and Back returns to it.
- **Save** keeps the scene, the seed and your levers in this browser under a name.
- **Copy link** puts all of it in the address, for example
  `?scene=still-lake&seed=34&set=tight:0.3`. A link cannot push a lever past its slider.

## As a screensaver or wallpaper

*Start screensaver* in the panel (or `S`) hides every control and fills the screen. Move the mouse, click
or tap for an Exit button; `Esc` also leaves. It holds the scene you were on, or cycles through random
ones if you choose *Cycle scenes*. *Copy its link* gives an address that opens straight into it.

- <https://xlt.pw/murmuration/?screensaver> names no scene, so it cycles: a new random scene every few
  minutes, on Eco power (30 frames a second, about 8,000 birds).
- `?screensaver&scene=blue-hour&seed=34` holds that scene and that seed. Add `&cycle=1` to start there
  and then cycle.
- `&power=balanced` or `&power=high` for more birds and a higher frame rate.

Apps that show a web page as a screensaver or wallpaper can point at one of those addresses, or at a
downloaded copy of `index.html`:

- **macOS:** [WebViewScreenSaver](https://github.com/liquidx/webviewscreensaver)
- **Windows:** [Lively Wallpaper](https://github.com/rocksdanister/lively) (wallpaper or screensaver)
- **Steam:** Wallpaper Engine, as a web wallpaper

None of these three has been tried yet. If one fails, please open an issue.

## How it works

- **State lives on the GPU.** Position, velocity and a few traits per bird sit in floating-point
  textures; every rule is a fragment shader that reads one frame's textures and writes the next.
- **Nearest neighbours, not everyone in range.** Each bird tracks its seven or so nearest neighbours,
  found through a hash grid, however far apart the flock is spread. Real starlings do the same
  (Ballerini et al. 2008).
- **The rules.** Keep your space, match your neighbours' heading and pace, close up when you fall behind,
  ease off out in front, and drift back toward the bulk of the flock and the roost. Birds differ a little
  in size, pace, boldness and sociability, and their mood drifts.
- **A veil, not a ball.** A big flock is a sheet far wider than it is thick; dark and pale are the same
  sheet seen edge-on and face-on. Three rules make it one here. Each bird closes up on the middle of the
  flock along the normal to the sheet. A bird above or below counts as nearer than it is, and the bird
  steps aside from it rather than up or down, which is what lets a squeezed flock flow out sideways
  instead of standing in layers. And the sheet lies in the plane of the birds' wings, so it rolls over
  when the flock turns. The pull comes and goes, so the flock is now a sheet and now gathered into a
  ball. Measured small flocks average about 1 : 2.8 : 5.6 thick, wide and long (Ballerini et al. 2008b).
- **Turns travel, and the whole flock makes each one.** One turn runs at a time. It begins at one bird,
  out at the edge, or out in front when the flock is leaving home, and every other bird begins it at the
  moment a wave from that point, travelling at 27 m/s, reaches it. Field measurements put that speed at
  20 to 40 m/s (Attanasi et al. 2014). Every bird turns through the same angle at the same rate, and big
  flocks wheel more slowly than small ones. Because the moment of turning changes smoothly from one side
  of the flock to the other, a turn shears the flock: the far side flies on for a moment longer. That is
  where its changing shapes come from, the stretch into a streamer, the twist, the fold, and it does not
  tear. Most turns are small; about one in four is a right angle or more. The page keeps the time (it
  names the turn, where it begins and when) and the birds do the flying.
- **Coming back.** The page also tells the birds where the main body of the flock is, how it lies and
  where it is going. A bird, or a body of birds, that has come away flies back: fast from far off, at a
  closing speed that falls as the gap closes, so it arrives alongside and already flying the flock's way
  instead of shooting through. The flock leans toward a large lost part and slows for it.
- **Steering with the mass.** Besides its neighbours, each bird steers with the average motion of the
  birds around it, read from a coarse field of density and velocity. Where two bodies of birds meet they
  turn to fly together instead of passing through each other.
  A travelling school of fish does the same, more gently; milling rings and bait balls keep their own rules.
- **Alarm travels as a dark band.** A startle begins in one place: where you tap, among the birds nearest
  a falcon, or by itself a few times a minute. Each bird passes it to its neighbours about 70 ms later, so
  it crosses the flock at about 15 m/s as a single band, reaches nearly every bird and dies at the far
  edge. A bird that has passed it on ignores it until it has had time to leave the flock, so it cannot
  come round again. Filmed flocks under attack do this at 13.4 m/s on average (Procaccini et al. 2011).
  As the band passes, a bird rolls, dips and closes up. In real flocks the dark band seen from the ground
  is that roll, the whole wing turned to the watcher for a moment (Hemelrijk et al. 2015). A bird a pixel
  or two across cannot show a roll, so far birds are drawn darker for that moment instead.
- **Hunters.** A peregrine circles above, stoops through the edge of the flock at 46 m/s, pulls out
  below and climbs back. Hawks give chase. For fish there are sharks and tuna. Over starlings a wild
  hunter is an event: the first comes after a minute or so, stays about half a minute, waits for the
  flock to close up before each pass, and then leaves the flock to itself for a minute or two.
- **Moving air and water.** The wind, or under water the current, carries every animal with it, stronger
  higher up, with gusts and eddies, so the flock has to work back against it to stay over home. It is a
  flow field, not a fluid solver: there are no thermals or pressure systems, and light is not bent by it.
- **Things in the way.** In the kelp forest and on the reef, stalks and coral heads are placed by hashing
  a grid. The same function tells the backdrop where to draw them and the fish where not to swim, and they
  write depth so a fish behind one is hidden. The floor there is long low dunes, from one function shared
  the same way. The starling places have nothing to fly around: nothing in them reaches the height a
  flock displays at. Under the reed beds the ground is a marsh placed in the world, pools and winding
  channels that hold the sky, which slides past below when you ride along; the desert has its sand.
- **Drawing.** Each animal is a jointed mesh moved by what it is doing: wingbeats quicken with effort,
  wings draw in on a glide down, the tail fans in a turn, a fish's spine curves into its turn. There are
  two bodies for each: a simple one for the thousands far away and a detailed one (feathered wingtips,
  fins) for those within about a dozen pixels' length. The gloss is thin-film colour: a film a few
  hundred nanometres thick reflects different wavelengths at different angles, so starlings swing from
  purple to green and fish silver takes on colour toward the edges. No textures; it is all shaders.

## How it was tuned

Everything here was measured on an Apple M5 with the page's own defaults, wild hunter included, unless it
says otherwise. [`tools/flock-metrics.js`](tools/flock-metrics.js) reads the simulation's own state: the
share of birds in the largest connected body, the flock's three axes and how the thin one stands to
gravity, nearest-neighbour distance, and how fast the heading changes.

**Holding together.** For a long time the flock was measured with the hunters switched off, and by those
numbers it was whole 97% of the time. With the defaults it was not: in the one run that was logged, the
flock was in two or more bodies at some point in 12 of 21 ten-second stretches. There were two causes. A
turn was passed from neighbour to neighbour, and birds it reached by a roundabout way started a few tenths
of a second after the birds beside them and ended the turn metres away, as a second body, which the next
turn then reached or did not. And a wild hunter was present two thirds of the time, attacking a flock that
had not closed up from the last pass. Now a turn is one timed wave, a bird that has come away is flown
back to the nearest part of the flock without overshooting, and a hunter is an event (see *How it works*).

| Starlings, page defaults | Before | Timed turns only | Now |
|---|---|---|---|
| Runs | 1 (12,288 birds, 3.5 minutes) | 3 (12,032 to 19,968 birds, 3 minutes) | 12, across the seven built-in scenes (9,984 to 49,152 birds, 2 to 3 minutes) |
| Time with under 90% of the birds in one body | in 12 of 21 ten-second stretches | 21%, 20% and 10% of samples | none in nine runs; 2%, 3% and 7% in three, each a moment that closed within ten seconds |

In the first eight of those runs the seeds had put Tightness between 0.20 and 0.68 and Restlessness
between 0.33 and 0.80. With a peregrine released on the flock at once, one to three dives landed in half a minute, and in
one run of three the flock parted (62% in the larger body at the worst).

**Against the first release.** The page as first published was flown the same way, under its own
defaults: its starlings were in two or more bodies 85%, 70% and 80% of the time (three two-minute runs,
up to five bodies at once), and its fish were whole. Its sky, water and light were compared scene by
scene with this one. The sky, water and post-processing shaders are the same code with additions (the
marsh, the dunes, the kelp and coral, colour in the gloss). Three later changes had cost the picture and
were undone: up close the birds' reflection of the sky and sun had been turned down, which took the warm
light off the swarm; a seed chose where you stood, which put the sunset out of frame; and the underwater
sun swung so widely that the columns of light came and went. The underwater sun now stands low and
ahead, where the columns fall into the picture, which the first release's did not reliably do either.

**Shape.** Three default runs, hunter included, against field measurements of small flocks:

| | Now | Measured flocks |
|---|---|---|
| Thick : wide : long | about 1 : 2.4 : 4.4, swinging between a thin sheet and a ball | 1 : 2.8 : 5.6 (Ballerini et al. 2008b) |
| Thin axis to vertical | about 30° | near vertical |
| Nearest neighbour | 0.5 to 0.6 m | 0.7 to 1.5 m |
| Speed of a turn across the flock | 27 m/s, set | 20 to 40 m/s (Attanasi et al. 2014) |
| Flight speed | 10.6 m/s | 7 to 12 m/s |
| A startle | one band at about 15 m/s that reaches 98% of the birds and ends | a band at 13.4 m/s (Procaccini et al. 2011) |

**Against film.** Four clips of real murmurations were reduced to silhouette statistics, using the
frames that show a whole flock clear of the frame's edge, and [`tools/silhouette-metrics.js`](tools/silhouette-metrics.js)
takes the same statistics from the simulation as seen from the ground (five default runs, 17,152 to
21,248 birds):

| | Simulation | Film |
|---|---|---|
| Length over width of the silhouette | 1.8 to 2.7 | 1.7 to 5.4 |
| Separate bodies | 1 | 1.1 to 1.7 |
| Darkness, median inside the silhouette (0 sky, 1 solid) | 0.25 to 0.33 | 0.13 to 0.22 |
| Darkest twentieth over the median | 1.5 to 1.8 | 1.7 to 2.4 |
| Area over the area of its convex hull | 0.90 to 0.95 | 0.69 to 0.78 |
| Share of the outline that differs a second later | 0.16 to 0.24 | 0.43 to 0.46 |

So the simulated flock has the proportions of the filmed ones, but it is darker, its outline is rounder,
with fewer arms and bays, and by this measure it changes shape about half as fast. A turn now stretches
and twists the flock, which a contact sheet shows plainly, but the forces that hold the flock together
round it off again within seconds. Turning faster (1.6 and 2.2 times) and letting a turn cross the flock
more slowly (20 m/s) were both tried, two runs each: neither raised the rate of change and both cost a
little wholeness, so neither was kept. This is the largest gap left between the page and film.

**Sliders and seeds.** A slider ends where the flock still held together when both ends of every flight
lever were flown for a minute, for starlings and for fish (92 runs). That sweep was made before turns
were rewritten and with the hunters off, and has not been repeated; four starling sliders were shortened
by it (Personal space, Pull at the edges, Wind, Escape strength) and none for fish.

**Fish.** With the defaults, hunters included, over the five built-in scenes: neighbours 0.6 to 0.7 m
apart in a travelling school (about a body length) and 0.5 m in a bait ball; a travelling school was in
more than one body 0 to 15% of the time, dividing and rejoining as schools do; the ring never divided.
A bait ball is cut in two by its two hunters and can stay parted for a minute: 10%, 58% and 62% of the
time in three runs of a hundred seconds, against 8%, 40% and 56% for the first release, so that is as it
was. The fish's own rules have not been changed by any of the work on starlings' turns; a seed now moves
a school's Tightness and Restlessness a little (0.35 to 0.65).

[`docs/NOTES.md`](docs/NOTES.md) records what went wrong at each step and why, and how to repeat the
measurements.

## Known limits

- Against film the flock is darker, rounder in outline and slower to change shape (the table above). It
  stretches and twists through a turn but does not keep an arm or a fold for long.
- Turns are conducted. The page decides when a turn begins, where, which way and how far, and tells the
  birds where the main body of the flock is. Real flocks manage all of that by eye, bird to bird.
- The slider limits were measured before turns were rewritten and have not been measured again.
- Birds still fly closer together than measured flocks. With tens of thousands of birds instead of
  hundreds of thousands, real spacing reads as pale dots rather than a dark sheet.
- The starling places have nothing to fly around, and the hills and trees on their horizons are painted.
  Only the kelp forest and the reef have an uneven floor.
- Runs differ even with the same seed, so the measurements above are noisy.
- So far it has only been run in Chromium browsers, and measured on one graphics chip. Safari, Firefox,
  real phones and real trackpads are untested.

## Performance

*Power use* in the panel has three levels: Eco (30 frames a second, about 8,000 birds), Balanced (60,
about 16,000) and High (as fast as the screen refreshes, about 32,000 at full resolution). Each seed
varies the count, as real flocks vary. If the frame rate stays low, the page flies fewer birds and then
lowers its resolution on its own. *Performance*, at the bottom of the panel, shows the frame rate, the
slowest recent frame, the graphics chip in use and what was lowered.

What a frame costs on an Apple M5 at 1.5 million pixels, simulation and drawing together:

| Birds | Simulation | Whole frame | Frames a second it allows |
|---|---|---|---|
| 16,384 | 1.8 ms | 7.8 ms | about 125 |
| 32,768 | 3.1 ms | 12 ms | about 80 |
| 65,536 | 7.0 ms | 19 ms | about 50 |

About 4.5 ms of every frame is the sky, bloom and other full-screen work, whatever the flock's size.
Riding along inside the flock, where the detailed bodies are drawn, costs about 3 ms more at 16,384.
Detail follows distance in two steps: a simple body (34 triangles, wings still below a few pixels) and a
detailed one from about a dozen pixels' length. A third step, single points for the farthest birds, was
considered and left out: drawing the simple bodies is under a third of the frame.

## References

- Ballerini, M. et al. (2008). Interaction ruling animal collective behavior depends on topological
  rather than metric distance: evidence from a field study. *PNAS* 105(4), 1232–1237.
- Ballerini, M. et al. (2008b). Empirical investigation of starling flocks: a benchmark study in
  collective animal behaviour. *Animal Behaviour* 76(1), 201–215.
- Attanasi, A. et al. (2014). Information transfer and behavioural inertia in starling flocks.
  *Nature Physics* 10, 691–696.
- Procaccini, A. et al. (2011). Propagating waves in starling, *Sturnus vulgaris*, flocks under
  predation. *Animal Behaviour* 82(4), 759–765.
- Hemelrijk, C. K., van Zuidam, L. & Hildenbrandt, H. (2015). What underlies waves of agitation in
  starling flocks. *Behavioral Ecology and Sociobiology* 69(5), 755–764.

## Credits and licence

Made by [Xavier Torgerson](https://xlt.pw).

The code is under the [MIT licence](LICENSE). The embedded typefaces, Fraunces and Instrument Sans, are
under the SIL Open Font License 1.1 (see [`LICENSES/`](LICENSES)).
