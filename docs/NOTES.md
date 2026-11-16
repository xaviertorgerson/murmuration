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
- **Looking.** `__fm.strip(n, gap, cols)` draws a contact sheet over the page; a screenshot of that shows a
  minute of flight in one picture. The ground view is the photographer's view.

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

## Starlings: the target, from Søren Solkær's Black Sun photographs

A veil a bird or two thick and many times wider; dark and pale are the same sheet edge-on and face-on;
folds and dark-rimmed bulbs; dark lines where birds bunch as alarm passes; at times a tight ball; a thin
streamer of birds catching up. The build reaches a slab about 1 : 3 : 6 that swings between sheet and
ball. It does not yet fold over itself or show clear lines of condensation.

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
- A seed draws the flight levers from a clipped bell curve (`VARY`). The corners were flown and are safe.
- **The sweep.** Both ends of every flight lever were flown for a simulated minute per species (92 runs).
  Starlings: 42 of 46 ends stayed one flock; the four that did not (Spacing at its minimum, Edge pull,
  Wind and Alarm wave at their maximum) were pulled in, in `LIMIT`, and flown again. Fish: no end packed,
  froze or scattered the school; it divides and rejoins at any setting, as it does at the defaults, so
  nothing was pulled in. One run per end is noisy: an end that splits under a quarter of the time is not
  evidence of anything.
- A slider's range is `LIMIT` for the current species; links and saved scenes are clamped to it.

## Cost (Apple M5, 1.5 million pixels)

Simulation 1.8 / 3.1 / 7.0 ms a step at 16k / 32k / 65k birds; whole frame 7.8 / 12 / 19 ms. Full-screen
work is about 4.5 ms whatever the flock. Measure with `frameStep` in a loop ended by `dump()`, which
flushes the queue; do not use the frame counter in a hidden tab.

## Controls and camera

Drag looks, tap acts, hold grabs: the convention of 3D viewers and maps, so the camera is the easiest
gesture on every device and taking hold of the hunter is one deliberate press. From the ground the lens
follows the flock's size. Zoom-out stops where a bird would fall under about a pixel and a third.

## Open

- Folds in the veil; the lines of condensation are faint.
- Terrain for the starling places. Nothing in them reaches display height, so it would be scenery only.
- Safari, Firefox, real phones and trackpads.
