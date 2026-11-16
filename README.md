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

| Tool or input | What it does |
|---|---|
| **Hunter** | Hold and drag: a falcon (or a shark) chases where you point for as long as you hold. Click or tap to make it dive. |
| **Startle** | Click or tap near the flock to send a panic wave from that spot. |
| **Lure** | Hold and drag: the flock is drawn toward where you point. |
| **Add hunter** | Click or tap to release a wild hawk, falcon, shark or tuna. |
| **Inspect** | Click or tap one bird, or a hunter, to see its traits and ride along with it. A right-click does the same with any tool. |
| **Mouse** | The left button uses the tool. Drag with the right button, or with Shift held, to look around. The wheel zooms. |
| **Trackpad** | Click and drag uses the tool. A two-finger swipe looks around; a pinch zooms. |
| **Touch** | One finger uses the tool. Two fingers look around; a pinch zooms. |
| **Keys** | `1`–`9`, `0` scenes · arrows look around · `+` `-` zoom · `V` view · `R` reseed · `N` new sky · `H` hide panel · `Space` pause · `F` full screen · `S` screensaver |

The same gesture does the same thing with a mouse, a pen or a finger, and nothing follows a pointer that
is not pressed.

## Scenes, seeds and links

**Tune** (top right) holds everything else.

- **A scene is three choices:** the species (starlings or fish), the place and the behaviour. The built-in
  scenes are pairings of those; any place can be paired with any behaviour of the same species. Changing
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
- **A slab, not a ball.** Measured flocks are slabs, on average about 1 : 2.8 : 5.6 thick, wide and long,
  thinnest roughly along gravity (Ballerini et al. 2008b). Each bird closes up on the middle of the flock
  along its own "up", the way it feels up in a banked turn, so the slab is level in straight flight, tilts
  through turns and is free to bend. The pull stops once a bird's neighbours are as near as they should
  be, and it comes and goes, so the flock is now a sheet and now gathered into a ball.
- **Turns travel, and the whole flock makes each one.** A turn is started by a bird at the edge, or by
  the birds out in front when the flock is leaving home, and copied by each neighbour 45 to 140 ms later,
  so it crosses the flock as a wave at 22 to 24 m/s. Field measurements put that speed at 20 to 40 m/s
  (Attanasi et al. 2014). Every bird makes the same turn at the same rate, and the rate is slow enough
  that the wave has crossed the flock before the first birds have turned far: big flocks wheel slowly,
  small ones dart. One turn runs at a time; of two begun together the bigger carries the flock; a bird the
  wave misses across a gap follows a moment later, as if it had seen the flock wheel.
- **Steering with the mass.** Besides its neighbours, each bird steers with the average motion of the
  birds around it, read from a coarse field of density and velocity. Where two bodies of birds meet they
  turn to fly together instead of passing through each other. A bird that has fallen out sprints back.
- **Alarm travels too.** A startled bird startles its neighbours, so a pulse runs away from an attacking
  falcon as a ripple across the slab, the model's version of the waves filmed in real flocks under attack
  (Procaccini et al. 2011).
- **Hunters.** A peregrine circles above, stoops through the edge of the flock at 46 m/s, pulls out
  below and climbs back. Hawks give chase. For fish there are sharks and tuna.
- **Drawing.** Each animal is a jointed mesh moved by what it is doing: wingbeats quicken with effort,
  wings draw in on a glide down, the tail fans in a turn, a fish's spine curves into its turn. There are
  two bodies for each: a simple one for the thousands far away and a detailed one (feathered wingtips,
  fins) for those within about a dozen pixels' length. The gloss is thin-film colour: a film a few
  hundred nanometres thick reflects different wavelengths at different angles, so starlings swing from
  purple to green and fish silver takes on colour toward the edges. No textures; it is all shaders.

## How it was tuned

Six clips of real murmurations were reduced to silhouette statistics: how elongated the flock is, how
dark, how solid, how many separate bodies, and how fast the outline changes. Flight speed is 10.6 m/s,
inside the 7 to 12 m/s reported for real flocks (Attanasi et al. 2014).

The flock's structure is measured from the simulation's own state by [`tools/flock-metrics.js`](tools/flock-metrics.js):
the share of birds in the largest connected body, the flock's three axes and how the thin one stands to
gravity, nearest-neighbour distance, and how fast the heading changes. On an Apple M5, ten one-minute
runs of the present rules (4,096 to 32,768 birds, three scenes) against two of the rules before the turns
were rewritten (16,384 birds):

| | Before | Now | Measured flocks |
|---|---|---|---|
| Time with under 90% of the birds in one body | 55 and 75% | 3% on average; none in seven of the ten runs | not reported |
| Thick : wide : long | about 1 : 1.6 : 3.5 | about 1 : 1.8 : 4, swinging between a thin sheet and a ball | 1 : 2.8 : 5.6 |
| Thin axis to vertical | about 55° | about 40° | near vertical |
| Nearest neighbour | not measured | 0.58 m | 0.7 to 1.5 m |

Seeds vary the flight levers within limits (*Seed variety*). The corners of that range, and the ends of
the Tightness and Restlessness sliders, were each flown for a minute: the flock stayed in one body at
least 93% of the time in all but one (Tightness at its maximum with Restlessness at zero, 63%).

## Known limits

- One turn at a time is kept with knowledge no single bird has: the page counts how many birds are
  turning. Real flocks manage it by eye.
- Birds still fly closer together than measured flocks. With tens of thousands of birds instead of
  hundreds of thousands, real spacing reads as pale dots rather than a dark sheet.
- The comparison with the six clips was made before the turn rules were rewritten and has not been
  repeated since.
- Runs differ even with the same seed, so the measurements above are noisy.
- So far it has only been run in Chromium browsers, and measured on one graphics chip. Safari, Firefox
  and phones are untested.

## Performance

*Power use* in the panel has three levels: Eco (30 frames a second, about 8,000 birds), Balanced (60,
about 16,000) and High (uncapped, about 32,000 at full resolution). Each seed varies the count, as real
flocks vary. If the frame rate stays low, the
page flies fewer birds and then lowers its resolution on its own. *Performance*, at the bottom of the
panel, shows the frame rate, the slowest recent frame, the graphics chip in use and what was lowered.

## References

- Ballerini, M. et al. (2008). Interaction ruling animal collective behavior depends on topological
  rather than metric distance: evidence from a field study. *PNAS* 105(4), 1232–1237.
- Ballerini, M. et al. (2008b). Empirical investigation of starling flocks: a benchmark study in
  collective animal behaviour. *Animal Behaviour* 76(1), 201–215.
- Attanasi, A. et al. (2014). Information transfer and behavioural inertia in starling flocks.
  *Nature Physics* 10, 691–696.
- Procaccini, A. et al. (2011). Propagating waves in starling, *Sturnus vulgaris*, flocks under
  predation. *Animal Behaviour* 82(4), 759–765.

## Credits and licence

Made by [Xavier Torgerson](https://xlt.pw).

The code is under the [MIT licence](LICENSE). The embedded typefaces, Fraunces and Instrument Sans, are
under the SIL Open Font License 1.1 (see [`LICENSES/`](LICENSES)).
