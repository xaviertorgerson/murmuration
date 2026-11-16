# Working notes

What was learned while building this, kept here so the next session does not start cold. Newest findings
first within each section. The README says what the page does; this says why, and how to check it.

## How to measure

Nothing below was tuned by eye alone. `tools/flock-metrics.js` reads the simulation's own state.

- **On a real graphics chip.** A hidden or headless browser falls back to software rendering, about 2.5 s
  for one simulated second. Instead: push the build to a branch, open the live page in a normal browser,
  and from its console fetch the branch's `index.html` from `raw.githubusercontent.com` and
  `document.write` it over the page (set `window.__murmurHold = true` and `window.__murmurNoAuto = true`
  first), then `eval` the metrics file. `__murmur.advance(seconds)` steps the simulation without drawing,
  about four times faster than real time for 16,384 birds on an Apple M5.
- **A hidden tab throttles timers and frames to about one a second**, so never judge frame rate there, and
  never wait on `setTimeout` inside a measurement; use `runSync`.
- **Runs are chaotic.** The same seed gives a different run if anything upstream changes. Judge by several
  seeds and sizes, not one.
- **Measure what the page does by default.** For a long time every number here was taken with the wild
  hunters switched off, and the page was fine by those numbers while the flock a visitor saw was in pieces
  half the time. Switch something off only to isolate a cause, and say so next to the number.
- **Looking.** `__fm.strip(n, gap, cols)` draws a contact sheet over the page; a screenshot of that shows a
  minute of flight in one picture. The ground view is the photographer's view.
- **Against film.** `tools/silhouette-metrics.js` takes the silhouette statistics that were taken from
  film (`__sil.REF`) from the simulation: `__sil.run(40)` after a 15-second settle.

## Starlings: what went wrong and why

1. **Split over half the time.** Many sharp turns ran at once, each sweeping only the birds that were free,
   so parts of the flock ended on different headings. Fix: a turn is one event for the whole flock, at a
   rate slow enough for the wave (about 23 m/s) to cross first; one at a time.
2. **A turn that reached only part of the flock.** The relay is neighbour to neighbour, and the seven
   nearest neighbours never lie across a gap. Fix: a bird the wave misses follows a moment after the wave
   should have arrived (the page tracks where and when the current turn began).
3. **Two turns begun in the same instant.** The "one at a time" gate reads a sample a few frames old.
   Fix: of two turns begun together the bigger wins; an old turn yields to a new one.
4. **A turn circling the flock for ever.** A bird that finished a turn could be caught by the same turn
   coming round. Fix: a bird remembers its last turn for six seconds.
5. **The front folding back through the rear** at the edge of home. Turning back was a force by position.
   Fix: the birds in front start an ordinary turn.
6. **Bodies of birds passing through each other.** Nothing aligned them until they had mixed. Fix: each
   bird also steers with the mean velocity of the mass around it (the density field carries momentum).
7. **Packed to half a wingspan.** Pulls toward the flock kept squeezing because the blurred density field
   cannot see how packed a thin body is. Fix: pulls stop once the nearest neighbours are near enough.
8. **A per-bird preferred height split the flock into two decks.** Removed. Do not give birds a standing
   force that differs between individuals.
9. **A squeezed flock stood in layers instead of spreading into a sheet.** Repulsion along the line
   between two stacked birds only pushes them up and down. Fix: a bird steps aside from a bird above or
   below it.
10. **Two sheets flying side by side for ever.** The gentle pull to the common centre must never be
    switched off entirely.
11. **A startle that never became a wave.** Four faults at once. A bird took a quarter of a second to
    pass the alarm on, so the front crept at 5 m/s and broke up. A tap startled every bird within 20 m in
    the same instant, a blob and not a band. A startle that began by itself added less than the threshold
    in one frame, so it never fired at 60 frames a second. And a bird was ready to fire again after 1.6 s,
    sooner than the wave could leave a big flock, so broken fronts came round again and a few percent of
    the birds stayed alarmed for ever. Fix: 0.1 s to pass it on (about 15 m/s); only the birds at the spot
    are startled outright; a startle that begins by itself fires outright; a bird ignores the alarm for
    as long as the wave needs to cross the flock (`uRefract`, from the flock's spread). Check with the
    share of birds whose pulse is above 0.2, every 0.2 s after `__murmur.startleFlock()`: it should rise,
    travel outward and reach zero, and nearly every bird should have fired once.
12. **The alarm band read pale from below and not at all from the side.** The roll that makes the band in
    real flocks turns the wing toward some watchers and edge-on to others, and a bird two pixels across
    shows neither. Fix: far birds are drawn darker and a little larger while the pulse passes; near birds
    show the roll itself. The bunching that was added earlier to darken the band is still there but is no
    longer what makes it visible; it tore the sheet when it was strong, so do not raise it.

13. **A turn passed from neighbour to neighbour tears the flock.** Birds the turn reached by a roundabout
    path, or by the fallback, began it a few tenths of a second after the birds beside them. Two birds that
    make the same turn a time t apart end it v·t·2·sin(angle/2) apart: 0.3 s and a right angle is 4.5 m, wider
    than the gap the relay can cross. So one big turn left two bodies side by side, and the next turn reached
    one and not the other. Fix: the page conducts (`conductTurns`). One turn at a time, with an origin and a
    start; a bird begins when a wave at 27 m/s from the origin reaches it. The start time is smooth across
    the flock, so a turn shears the flock (which is where its shapes now come from) and cannot tear it. The
    rate is fixed for the whole turn, so every bird turns through the same angle. The relay, the priority
    rule, the fallback and the six-second memory (2 to 4 above) are gone.
14. **A 100° turn every eight seconds.** Of the turns begun together the bigger won, so nearly every turn
    that survived was a big one. The conductor draws the size: mostly small, one in four a right angle.
15. **Coming back overshot.** A returning group sprinted at 1.4 times cruise until it was inside the flock
    and went out the other side. And "outside" was a distance from the centre, which cannot tell the far
    end of a long flock from a second body. Fix: the page marks the main body with up to 32 sampled birds
    spread through it (farthest-point sampling); a bird further from every mark than the marks cover is
    outside, and flies to the nearest mark at a closing speed of half the remaining gap per second, its
    own speed included, while the flock slows for a large lost part.
16. **A hunter nearly all the time.** A wild hunter stayed 35 to 80 s and the next came 25 to 65 s after
    the last had arrived, so one was present two thirds of the time, attacking every 6 to 18 s whether or
    not the flock had closed up. Over starlings now: first visit after 40 to 80 s, a visit of 22 to 40 s,
    the next 70 to 150 s after it leaves, and no pass while under 85% of the birds are in one body.
17. **A behaviour key used twice** (`ball`, for birds and for fish): the later silently replaced the
    earlier and a scene flew with the other species' levers. Keys in `BEHAVES` are unique across species.

## Starlings: the target, from Søren Solkær's Black Sun photographs

A veil a bird or two thick and many times wider; dark and pale are the same sheet edge-on and face-on;
folds and dark-rimmed bulbs; dark lines where birds bunch as alarm passes; at times a tight ball; a thin
streamer of birds catching up. The build reaches a slab about 1 : 2.5 : 5.5 that swings between sheet and
ball, crossed by a dark band when it is startled. Since turns became timed waves a turn stretches and
twists it (a streamer, an S, a fold seen edge-on), but it rounds off again within seconds.

Against film (`tools/silhouette-metrics.js`, four clips): proportions and wholeness match; the simulated
flock is darker (median 0.27 to 0.45 against 0.13 to 0.22), rounder in outline (area over hull 0.85 to
0.95 against 0.69 to 0.78) and changes shape half as fast (0.13 to 0.28 of the outline a second against
0.43 to 0.46). Restlessness at 0.75 or 1 raised the change rate only in the runs where the flock also
divided, so the default stayed. With timed turns the numbers are the same (0.16 to 0.24, area over hull
0.90 to 0.95). Tried and not kept, two runs each through `__murmur.turn`: `gain` 1.6 and 2.2 (faster
turns) and `c` 20 (a slower wave): no gain in change, a little more division. What rounds the flock off is
everything that pulls toward its middle; arms and bays need those pulls to tolerate a shape, not a faster
turn. That is the next thing to earn.

## Audit against the first release (a6d395d)

Both builds loaded on the same GPU and flown under their own defaults; scenes rendered side by side.

| Since the first release | What the comparison showed | Verdict |
|---|---|---|
| The flock as a veil, timed turns, steering with the mass, coming back, the alarm band, hunters as events | First release: under 90% in one body 85%, 70%, 80% of the time, up to five bodies. Now: none in eight runs | stays |
| Fish rules | Travelling school whole in both. A bait ball is cut in two by its hunters as often now (10 to 62% of the time) as then (8 to 56%) | stays; the parted bait ball is the next fish fault to look at |
| Sky, water and post-processing shaders | Same code plus the marsh, dunes, kelp and coral | stays |
| Thin-film colour in the gloss of birds and fish | Adds colour, takes no light away | stays |
| Up close, the birds' sky reflection, sun glint and wing glow turned down ("a near bird is a black bird") | Took the warm light off the swarm, the thing the first release did best | gone: back to the first release's values, near and far |
| A seed chooses where you stand (yaw and pitch) | Sunset and horizon out of frame in half the scenes | gone: a new flock is met facing the light; the sun starts inside the picture |
| A wider spread of hours and clouds per seed | Daylight skies and clear skies with no sunset in them | narrowed |
| The underwater sun swinging 55° either way | Columns of light came and went | gone |
| The underwater sun itself (65° up in the first release) | The shafts fan from the sun's place on screen, and at 65° that is far above the frame: 16% strength in a level view | moved: about 47° up (inside what refraction allows) and ahead, swaying a little |
| The marsh under the reed beds | Good from above; from the ride view its pools outshone the flock | stays, a third dimmer |
| Far birds darkening as the alarm passes | Reads as the dark band | stays |
| Detailed meshes up close, wind and current, obstacles, field notes (off), controls, camera fit, scenes, seeds, links, screensaver | No loss found | stays |
| The menu | Fifteen controls in one list with every explanation open | regrouped: scene, the flock, watching; the rest folded; explanations behind (i) |

Rule from this: before changing how something looks, render the first release beside it.

## Fish

The audit that was run on starlings was run on fish (8,192 and 16,384 fish, a minute each). Neighbours are
about one body length apart in a travelling school (0.7 to 0.8 m) and three quarters of one in a bait ball;
nothing passes through anything else; rings and balls never divide; a travelling school divides and
rejoins in about one run in five.

A first attempt gave travelling schools the starlings' "steer with the mass" and "gather" rules at full
strength. It stopped the dividing and also made every school a tight, perfectly aligned blob: polarisation
went from about 0.75 to 0.99 and the school's length halved, which is the loose order its whale-like
shapes come from. Those rules now act only at the margins: where the water around a fish is going a quite
different way, and on a fish well outside the school. Statistics and shapes are back where they were.

Every bird-only rule is behind `uSpecies == 0`. After any change to the shader, compare fish statistics
before and after; exact positions will differ (the shader is recompiled), statistics should not.

## Levers

- Tightness and Restlessness are dials that carry other levers with them (`applyMacros`). Tightness at its
  maximum with Restlessness at zero split a third of the time. Cause: with few turns of its own a calm
  flock flies straight to the edge of home and every turn is a big one. Fixes: the calm end is less
  extreme, a turn toward home is at most about a right angle, and the turn wave is quicker.
- How far a turn stretches the flock is `speed x crossing time x angle / 2`. It does not depend on the
  turn's rate. Shorten the crossing time or the angle, not the rate.
- A seed places Tightness and Restlessness anywhere within a quarter of the scale either side of where
  the behaviour sets them (`dial` in `BEHAVES`), and draws the other flight levers around the scene's values
  (`VARY`, per species). The eight default runs after the timed turns covered Tightness 0.20 to 0.68 and
  Restlessness 0.33 to 0.80 and stayed whole. A seed also chooses where you stand, the hour and the count.
- **The sweep.** Both ends of every flight lever were flown for a simulated minute per species (92 runs).
  Starlings: 42 of 46 ends stayed one flock; the four that did not (Personal space at its minimum, Pull
  at the edges, Wind and Escape strength at their maximum) were pulled in, in `LIMIT`, and flown again. Fish: no end packed,
  froze or scattered the school; it divides and rejoins at any setting, as it does at the defaults, so
  nothing was pulled in. One run per end is noisy: an end that splits under a quarter of the time is not
  evidence of anything.
- A slider's range is `LIMIT` for the current species; links and saved scenes are clamped to it.
- After the alarm became a travelling band the levers that feed it were flown again at their maximum:
  Escape strength, Panic spread and Startles per minute each whole; the three together split 5% of the
  time; Restlessness whole in three 70-second runs, and in two three-minute runs divided for 7 seconds in all.

## Cost (Apple M5, 1.5 million pixels)

Simulation 1.8 / 3.1 / 7.0 ms a step at 16k / 32k / 65k birds; whole frame 7.8 / 12 / 19 ms. Full-screen
work is about 4.5 ms whatever the flock. Measure with `frameStep` in a loop ended by `dump()`, which
flushes the queue; do not use the frame counter in a hidden tab.

## Controls and camera

Drag looks, tap acts, hold grabs: the convention of 3D viewers and maps, so the camera is the easiest
gesture on every device and taking hold of the hunter is one deliberate press. From the ground the lens
follows the flock's size. Zoom-out stops where a bird would fall under about a pixel and a third.

## Open

- Arms and bays in the flock's outline, and a shape that lasts: see the film comparison.
- The lever sweep (`LIMIT`) and the fish audit predate the timed turns and the hunters' new timetable.
  Fish were re-flown at the defaults; the starling sweep was not repeated.
- Something for starlings to fly around. The marsh under the reed beds is ground only.
- Safari, Firefox, real phones and trackpads.
