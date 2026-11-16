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

**Tune** (top right) holds everything else.

- **A scene is three choices:** the species (starlings or fish), the place and the behaviour. Starlings
  have reed beds, a still lake, open sea, mountains and desert; fish have open ocean, a lagoon, a kelp
  forest and a coral reef. The built-in scenes are pairings of a place and a behaviour; any place can be
  paired with any behaviour of the same species. Changing
  the place or the behaviour does not restart anything: the same animals carry on and respond.
- **Shape** runs from a ball to a thin slab. **Field notes** is a quiet line under the title that names
  what is happening as it happens: a turn sweeping the flock, a falcon arriving, the flock balling up.
- **A seed** draws the individuals, the sky, the flock's size and the hunters' visits. For starlings it
  also moves the flight itself a little: tightness, restlessness, alignment, roaming, pace, fear and how
  fast a turn travels are each drawn from a bell curve around the scene's own value and clipped to a set
  range. *Seed variety* sets how far a seed may go; at zero only the weather changes. Fish keep the
  scene's values unless you turn it up.
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
- **Turns travel, and the whole flock makes each one.** A turn is started by a bird at the edge, or by
  the birds out in front when the flock is leaving home, and copied by each neighbour 30 to 100 ms later,
  so it crosses the flock as a wave at 23 to 30 m/s. Field measurements put that speed at 20 to 40 m/s
  (Attanasi et al. 2014). Every bird makes the same turn at the same rate, and the rate is slow enough
  that the wave has crossed the flock before the first birds have turned far: big flocks wheel slowly,
  small ones dart. One turn runs at a time; of two begun together the bigger carries the flock; a bird the
  wave misses across a gap follows a moment later, as if it had seen the flock wheel.
- **Steering with the mass.** Besides its neighbours, each bird steers with the average motion of the
  birds around it, read from a coarse field of density and velocity. Where two bodies of birds meet they
  turn to fly together instead of passing through each other. A bird that has fallen out sprints back.
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
  below and climbs back. Hawks give chase. For fish there are sharks and tuna.
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

Flight speed is 10.6 m/s, inside the 7 to 12 m/s reported for real flocks (Attanasi et al. 2014).

The flock's structure is measured from the simulation's own state by [`tools/flock-metrics.js`](tools/flock-metrics.js):
the share of birds in the largest connected body, the flock's three axes and how the thin one stands to
gravity, nearest-neighbour distance, and how fast the heading changes. On an Apple M5, one-minute runs
with 16,384 and 32,768 birds:

| | Before the turn rules were rewritten (2 runs) | Now (5 runs) | Measured flocks |
|---|---|---|---|
| Time with under 90% of the birds in one body | 55 and 75% | 2% on average; none in three of the five | not reported |
| Thick : wide : long | about 1 : 1.6 : 3.5 | about 1 : 2.5 : 5.5, swinging between a thin sheet and a ball | 1 : 2.8 : 5.6 |
| Thin axis to vertical | about 55° | about 35° | near vertical |
| Nearest neighbour | not measured | 0.5 m | 0.7 to 1.5 m |
| Speed of a turn across the flock | 22 to 24 m/s | 23 to 30 m/s | 20 to 40 m/s |

With two falcons released on it at once the flock was in more than one body about a quarter of the time
(17 to 38% over four runs), which is what falcons are for. A startle used to reach four birds in ten at
once and then smoulder in patches; it is now one band at about 15 m/s that reaches 98% of the birds and
ends. Seeds vary the flight levers within limits (*Seed variety*); the corners of that range were each
flown for a minute and stayed whole. Tightness at its maximum with Restlessness at zero used to split a
third of the time; the calm end of Restlessness was made less extreme and it now splits about as rarely as
the default (3% over four runs).

Then both ends of every flight lever were flown for a minute, for starlings and for fish (92 runs). For
starlings 42 of 46 ends kept one flock. The four that did not (Personal space at its lowest, and Pull at
the edges, Wind and Escape strength at their highest) had their sliders shortened and were flown again: whole in every run but
one, which was in more than one body 11% of the time with the wind at its new maximum. So a slider now
ends where the flock still holds together, and the range depends on the species. For fish no end packed,
froze or scattered the school, so nothing was shortened. After the alarm was made a travelling band, the
levers that feed it were flown again at their highest (Escape strength, Panic spread, Startles per minute,
Restlessness): whole in every run, and in more than one body 5% of the time with the first three together.

Fish were measured the same way. Neighbours are about one body length apart in a travelling school and
three quarters of one in a bait ball, schools do not pass through each other, and a travelling school
divides and rejoins now and then (one run in five). Their rules were left alone apart from two that act
only at the margins, because the schools already form the shapes real ones do.

**Against film.** Four clips of real murmurations were reduced to silhouette statistics, using the
frames that show a whole flock clear of the frame's edge, and [`tools/silhouette-metrics.js`](tools/silhouette-metrics.js)
takes the same statistics from the simulation as seen from the ground (five runs, 16,384 to 65,536 birds):

| | Simulation | Film |
|---|---|---|
| Length over width of the silhouette | 2.0 to 3.5 | 1.7 to 5.4 |
| Separate bodies | 1 | 1.1 to 1.7 |
| Darkness, median inside the silhouette (0 sky, 1 solid) | 0.27 to 0.45 | 0.13 to 0.22 |
| Darkest twentieth over the median | 1.5 to 1.8 | 1.7 to 2.4 |
| Area over the area of its convex hull | 0.85 to 0.95 | 0.69 to 0.78 |
| Share of the outline that differs a second later | 0.13 to 0.28 | 0.43 to 0.46 |

So the simulated flock has the proportions of the filmed ones and holds together as they do, but it is
darker, its outline is rounder, with fewer arms and bays, and it changes shape about half as fast. Turning
Restlessness up closes some of that gap and costs wholeness, so the default was left where it is.

[`docs/NOTES.md`](docs/NOTES.md) records what went wrong at each step and why, and how to repeat the
measurements.

## Known limits

- The veil does not fold over itself as the largest real flocks do. It is a sheet that rolls, thickens
  into a ball and thins again, with a dark band crossing it when it is startled.
- Against film the flock is darker, rounder in outline and slower to change shape (the table above).
- One turn at a time is kept with knowledge no single bird has: the page counts how many birds are
  turning. Real flocks manage it by eye.
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
