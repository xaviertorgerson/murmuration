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

## Starlings: the target, from Søren Solkær's Black Sun photographs

A veil a bird or two thick and many times wider; dark and pale are the same sheet edge-on and face-on;
folds and dark-rimmed bulbs; dark lines where birds bunch as alarm passes; at times a tight ball; a thin
streamer of birds catching up. The build reaches a slab about 1 : 2.5 : 5.5 that swings between sheet and
ball, crossed by a dark band when it is startled. It does not fold over itself.

Against film (`tools/silhouette-metrics.js`, four clips): proportions and wholeness match; the simulated
flock is darker (median 0.27 to 0.45 against 0.13 to 0.22), rounder in outline (area over hull 0.85 to
0.95 against 0.69 to 0.78) and changes shape half as fast (0.13 to 0.28 of the outline a second against
0.43 to 0.46). Restlessness at 0.75 or 1 raised the change rate only in the runs where the flock also
divided, so the default stayed. Arms, bays and faster change are the next thing to earn.

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

- Folds in the veil; arms and bays in its outline; a faster change of shape (see the film comparison).
- Something for starlings to fly around. The marsh under the reed beds is ground only.
- Safari, Firefox, real phones and trackpads.
