# Aggregate representation — design spike

Status: **implemented, then paused.** The chain ships at `K = 8` and removes the quadratic
output growth (below), but its measurements are now stale: the carrier-locality P0 in
`docs/carrier-locality.md` says the aggregate is published where a variant cannot carry it,
so `*:animations` and `before:animations` do not animate at all. **`K` is not chosen and no
further linked work happens until that is fixed** — moving the aggregate into the carrier's
body changes its placement and its per-element resolution, which is exactly what the K curve
measured.

Follows the forensics in `migration.md`: the bridge is correct but structurally quadratic,
and the cost is forced by legitimate usage (`@apply`, prefixed carriers, variant-prefixed
utilities), so it cannot be fixed by ordering.

The question this answers:

> Can Jumi express the same winner semantics without republishing the whole globally
> ordered list whenever one registration changes?

Two candidate models were named. One is impossible; the other passes its correctness
kill-switch.

## Model 2 — explicit precedence metadata: falsified

There is no CSS channel other than **list position** for precedence between
concurrent animations, so a slot cannot carry metadata that outranks its position.
Measured (`scripts/spike-precedence.html`, run in a browser):

```text
two animations on one property, `replace`:
  order [a, b] → width 300px     b wins, because it is listed last
  order [b, a] → width 100px     a wins, because it is listed last
`animation-composition: add`:
  order [a, b] → width 400px     100 + 300 — composition changes the operation,
                                 not the ranking
```

Two consequences, and the second one binds Model 1:

- precedence cannot be decoupled from position, so any representation has to produce
  the intended relative order, whatever else it does;
- **a logical slot must appear exactly once.** Under `add`, a duplicate sums twice
  (400px, not 300px), so vacating an old position is mandatory rather than tidy.

## Model 1 — stable slot identities + linked predecessor relationships: viable

The append-only chain died because today's order is a grouped/sorted projection, and a
chain whose links each reference their predecessor can only append. The correction is
that links do **not** need ordered names: **the graph establishes order**.

```css
--jumi-<id>-part: var(--jumi-<predecessorId>-part), <entry>
```

Inserting `x` between `a` and `b` is two declarations, and nothing about `x` needs to
sort between them:

```css
--jumi-x-animation-name: var(--jumi-a-animation-name), <entry x>;
--jumi-b-animation-name: var(--jumi-x-animation-name), <entry b>;
```

So identities only have to be *stable*, which removes an entire class of future
problem — allocating gaps, exhausting them, rebalancing. Call it a **linked
aggregate**, not a sparse-position one.

The four operations, each O(1) in nodes touched:

```text
insert         emit node, relink successor
remove         relink successor around the removed node
move           relink old successor, rewrite the node's predecessor,
               relink the new successor
move to tail   relink old successor, rewrite against the old tail,
               update the aggregate pointer
```

**One node per logical slot, carrying all ten payloads.** That is what makes the
parallel chains impossible to misalign by construction: a mutation moves one node and
every longhand moves with it. The aggregate keeps whatever ordered structure it
already has — `values` (grouped by attribute, perValue order inside), `composed`
(sorted), `phrases`, `effects` (sorted) — and the model, not the host, decides where a
node belongs. The chain and its pointer are both published **on the carrier**, and the
cached `.animations` rule still never needs revisiting because the consumer is constant.

That placement is not a detail. The chain's entries reference the slot variables the
`animate-*` utilities declare on the element, and a `var()` chain inside a custom
property resolves where it is *declared* — so a chain published anywhere else inherits the
guaranteed-invalid value and resolves `none`. The first version of this design published
the chain on `:root` with a pointer on the carrier; it measured fast and animated
nothing. See the P0 note in `docs/migration.md`.

### Spike 1 — order equivalence: PASSING

`scripts/spike-linked-order.test.mjs`, run against the real model. Four registration
histories are fed to today's aggregation and to the linked one, and after **every**
mutation all ten lists must be *identical*, not merely equal in slot count:

```text
a value, a phrase, an effect
a re-registered value, which moves within its group
a second attribute, a third, and a labelled phrase
effects arriving in reverse alphabetical order
```

```text
✓ scripts/spike-linked-order.test.mjs (4 tests)
```

Each step also asserts the invariant the precedence test made necessary:

- exactly once — no slot appears twice or vanishes in any chain;
- parallel — every chain has the same length, in the same slot order;
- local — reaching the new order takes at most 2 node operations.

What this proves and what it does not: it shows the representation can express today's
order exactly while mutating locally. It does not yet prove the *model* emits those
operations — that is the implementation, and the gate for it is the snapshot corpus.

### Spike 2 — substitution depth: Chromium verified, other engines not

A chain of `n` links substitutes recursively, so depth is proportional to the number of
slots. Measured on a 512-link chain: **512 entries resolved, all unique, first to
last** (`n1 … n512`) in the engine available here (Blink/Chromium).

Depth 512 is beyond anything measured in a real corpus (the effects catalogue needs
228). But only Chromium engines are installed in this environment, so **Firefox and
WebKit are unverified**, and this design depends on deeply nested substitution. Two
things make that risk tractable rather than fatal:

- `K`, the entries per link, trades depth for re-emission: a link holding 8 entries
  makes a 228-slot chain ~29 links deep at the cost of re-emitting a little more per
  change. If an engine caps substitution, `K` is the dial;
- it is a 30-second manual check in each browser at worst, since the test page is a
  static file.

### Spike 3 — cost: measured, and it changes the story

Size of the examples build that started this workstream — 60 slots, 63 publications:

```text
today (63 publications)   raw 1503KB   gzip 54KB   brotli 15KB
linked proxy (1 list)     raw  110KB   gzip 12KB   brotli 10KB
```

| | raw | gzip | brotli |
| --- | --- | --- | --- |
| win | **13.7×** | **4.5×** | **1.5×** |

The quadratic blowup is not what the raw number suggests. Repetition compresses
unusually well — gzip's 32 KB window catches most of it and brotli's large window
almost all of it — so the *delivery* win is 4.5× over gzip and only 1.5× over brotli.
The raw win is still the real one, and it is a build-time, memory and dev-server win
rather than a network one. That does not excuse O(n²) — the output should not contain
data the model knows is redundant — but it is the honest sizing of the prize.

### Spike 3 — the K curve: `K = 8` survives

`scripts/spike-style-cost.mjs` builds each representation at runtime and measures the
same matrix for each. `K` is the number of entries each link appends: serial depth is what
costs, so fewer links is the lever, paid for with a larger rewrite unit per mutation.

**Every arm must be functional**, and that is the correction this harness makes: the first
version published the data on `:root` for two of three arms, so those pages resolved
`animation-name: none` — the fastest-looking arm was the broken one. The script now
reports `resolved` per cell and fails if a candidate arm does not resolve one name per
slot, so a page that does not animate can never again be read as a fast one. The grammar
is defined once in Node and injected into the page, so the runtime measurement and the
size measurement cannot drift apart.

Four arms: **inline** (the carrier rule carries every list — pre-bridge), **carrier** (the
list published on the carrier, the consumer reading it — what ships), **linked** (links on
the carrier, `K` entries each), and **root-invalid** (the `:root` placement, kept as a
control).

Chrome 153, median of 5. Runtime as a ratio to today's `forced-one` — one carrier
invalidated, which is the design's own mutation model:

```text
                              carrier      K=1     K=4     K=8    K=16    K=32
  1 carrier     228 slots     1.40 ms     4.14×   1.57×   1.36×   1.14×   1.07×
200 carriers    228 slots     1.60 ms     3.37×   1.50×   1.19×   1.06×   1.12×
200 carriers     60 slots     0.40 ms     2.25×   1.25×   1.25×   1.00×   1.00×
200 descendants 228 slots     1.50 ms     3.67×   1.60×   1.33×   1.13×   1.13×
```

Size at 228 slots — one publication, and the bytes one mutation appends:

```text
                           raw      gzip    brotli    append
carrier (ships, K=1)   187.1 KB   6.9 KB   3.1 KB  185.9 KB
linked K=1             367.0 KB  20.2 KB   7.9 KB    2.7 KB
linked K=4             231.3 KB  12.1 KB   5.4 KB    7.5 KB
linked K=8             209.5 KB   9.7 KB   5.0 KB   14.0 KB
linked K=16            198.6 KB   8.5 KB   4.4 KB   26.9 KB
linked K=32            193.1 KB   7.8 KB   4.2 KB   52.8 KB
```

Total output, because the corpora publish 27 times (canonical) and 59–63 (examples):

```text
                              N=27       N=63   vs carrier
carrier (ships, K=1)      5021.0 KB  11714.2 KB       1.00×
linked K=1                 437.8 KB    535.9 KB       0.05×
linked K=8                 572.6 KB   1075.3 KB       0.09×
linked K=32               1565.4 KB   3465.3 KB       0.30×
```

Reading it:

- **Initial resolution is flat.** Every arm resolves 228 carriers in ~6 ms, so it is not a
  differentiator. The bridge is **cost-neutral, not a runtime fix**: `carrier` matches
  `inline` at every cell. The earlier reading — "290 ms → 3.8 ms" — compared against the
  `:root` arm, which was the *broken* placement.
- **`K` is the whole lever.** At 228 slots, `K=1` walks 228 links and costs 3.4×;
  `K=8` walks 29 and costs 1.19×. A chain is a *serial* dependency, where a flat list is
  228 independent lookups.
- **A single publication does not shrink.** Linked at `K=8` emits 209.5 KB against the
  flat 187.1 KB, because a chain spends a `var()` reference per link on top of the
  entries. Judged one publication at a time, linked never wins — the win is the **append
  unit**, 14.0 KB per mutation against 185.9 KB. Total output at `N=63` is where that
  shows: 11.7 MB → 1.08 MB.
- **The control is the fastest thing on the page** (0.2 / 11.9 ms) because it resolves 0
  of 228 names. Fast is not the same as working.

**Decision: `K = 8`.** Against the bar (≤1.5× today's per-carrier restyle, output
collapsed):

```text
  K=1   restyle 3.37×   output 0.046×  —
  K=4   restyle 1.50×   output 0.060×  PASS   on the bar, no margin
  K=8   restyle 1.19×   output 0.092×  PASS   ← chosen
  K=16  restyle 1.06×   output 0.159×  PASS
  K=32  restyle 1.12×   output 0.296×  PASS
```

`K=4` passes at exactly the threshold, and run-to-run variance here is around 10% (`K=4`
measured 1.53× then 1.50×; `K=32` 1.07× then 1.12×), so a value with no margin is not a
decision. `K=8` holds 1.19–1.36× across shapes and takes total output down 11×. `K=16`
buys ~0.1× of runtime for 1.7× the output, and doubles the append unit the exercise is
about.

**Implemented, and measured against the real corpora.** The model publishes the chain from
`publishAggregate`, keeping each link's identity across passes so only what moved is
re-said. The flat lists survive as the oracle `animations` returns, and a test compares
the two after every mutation of a twenty-step sequence that crosses two link boundaries.
With `K = 8`:

```text
                           before       after    change
 examples   raw         1,539,289     444,030      −71%
 examples   gzip           54 KB       22.5 KB      −58%
 examples   data bytes  1,477,910     381,355      −74%
 canonical  raw           281,959     164,848      −42%
 variant    raw           176,937     115,998      −34%
 docs effects (228 slots) 260,802     205,143      −21%
```

The publication count is unchanged — 63 for the examples corpus, before and after —
because the trigger is unchanged, and that is the point: each publication got *smaller*
instead of rarer. Links touched per publication on the examples corpus: **one, two or
three, never more than four**, against a chain of about twenty links. That bound is a
constant, which is what makes the total linear: the work per publication no longer
depends on the slot count.

**Where the measured win is smaller than the curve suggested.** The curve's model charged
one link per mutation. In reality a link is re-said in full every time it grows, so
filling a link of `K` entries costs `1 + 2 + … + K` entry-emissions rather than `K` — a
constant 36 at `K = 8`, but a constant that shows up. Links also fragment below `K` when
slots are inserted into the middle of one, which spends references while carrying no extra
entries. Neither is asymptotic; both are why these corpora shrink by 3.5× rather than the
11× the ideal append unit implied. Merging adjacent short links would recover some of it
and was deliberately not attempted: the quadratic term is gone, which was the goal.

**The real emission fails the runtime bar at `K = 8`.** `scripts/spike-real-cost.mjs` measures
the representation that actually ships: both arms come from one real compile through the
plugin, and the flat arm is built by resolving the chain and re-declaring the same entries
flat, so only the representation differs. Chrome 153, median of 5, `forced-one` — a single
carrier invalidated — against `carrier-flat-current`:

```text
                        K=8      K=16     K=32
 200 carriers · 60      1.42×    1.25×    1.17×
 200 carriers · 228     1.82×    1.50×    1.25×

 examples corpus raw    444 KB   577 KB   1131 KB    (flat: 1,539 KB)
```

The chain is **not** fragmented: 228 slots produce 29 links, exactly `ceil(228 / 8)`, averaging
7.86 entries per link. The cost is the serial dependency itself — 290 declarations with a
dependency depth of 29, against the flat form's 2,280 independent lookups. Initial resolution is
comparable (8.6 vs 8.9 ms); the regression is on invalidation, where a 228-slot carrier went from
5.5 ms to 10.0 ms.

Raising `K` shortens the chain and buys the runtime back, but it enlarges the unit every
*publication* rewrites — and on the multi-publication examples corpus that hands the output win
back: `K = 32` costs 1,131 KB where `K = 8` costs 444 KB. So this is a trade, not a fix: `K = 8`
optimises output and misses the runtime bar by 21%; `K = 16` sits exactly on the bar with no
margin; `K = 32` is comfortable on runtime and gives up most of the output win. Recorded for the
decision rather than resolved here.

**A separate, pre-existing bug: `*:animations` never animates its descendants.** The adapter
published the data on `.animations`, so for a `*:animations` carrier the aggregate landed on the
parent while the slots were on the children — and the children resolved `none`. Measured in *both*
representations, so it is not a chain result. It is the same class of mistake as the `:root`
placement: the data has to sit where the slot variables are.

**Closed by the carrier marker.** The data is no longer published at any selector: the carrier
declares `--jumi-carrier` in its body, so Tailwind's own re-parenting and `@apply` copies carry it,
and `finalize` writes the aggregate into every marked rule after the build. Both of these bugs —
`:root` and `*:animations` — are the same bug, and neither can recur, because there is no longer a
selector to get wrong. See `docs/carrier-locality.md`.

### Acceptance criteria

**Superseded, kept as the record of what the linked representation had to hold.** It was
falsified on cost, not on correctness: order equivalence held, and the last bar — per-carrier
restyle within 1.5× — measured **1.82×** on the real emission, structurally rather than by
tuning, because a carrier restyles when any link it reads is re-declared and a rebuilt run
re-declares every link in it.

The shipped representation is flat lists, completed into the carriers after the build, which
holds every criterion below at a lower cost:

```text
preserve current winner semantics for repeated perValue          — held, 125 unit tests
preserve composed/effect grouping behaviour                     — held
`@apply`                                                        — supported (see below)
preserve carrier variants                                       — held, behaviour:check 8/8
incremental:check                                               — 6/6
publication count no longer proportional to registrations       — not held, and no longer
after the first read                                              needed: what it cost was
                                                                 the build, not the file
total aggregate output roughly O(n), not O(n²)                  — held: one list per carrier
no logical slot occurs more than once in any of the ten chains  — held
K = 8: per-carrier restyle within 1.5× of today                 — 1.82×, rejected
```

`@apply` is **supported**: the carrier marks itself, so the copy `@apply` inlines is a carrier,
and the aggregate is written into it after the build. `CONTRIBUTING.md` principle 6 was reversed
accordingly, and `behaviour:check` requires the context rather than pinning its failure.

If order equivalence cannot be held, this stops being an implementation problem and
becomes a product decision: keep today's precedence contract and its cost, or redefine
precedence in a new major version. The linked aggregate did not require it.

## The real output, measured

`pnpm examples:build` (the whole examples corpus: 60 slots, one carrier per context) — the
number that decides whether any of the linked work is still owed.

|  | before the finalizer | now |
| --- | --- | --- |
| emitted by Tailwind | 1,130,863 bytes (the file itself) | 1,540,894 bytes |
| …of which staging | — | 1,455,274 bytes, **94%** |
| publications | 63 | 59 |
| **shipped** | **1,130,863 bytes** | **271,812 bytes** |
| aggregate in the shipped file | 96% | 186,192 bytes (69%), 4 copies × 60 entries × 10 lists |
| keyframes | 60 | 60 |

Read it as two claims.

**Shipping is settled: 4.2× smaller, and the quadratic term is gone from the file.** What a
browser downloads is one list per carrier. Republishing cannot reach the output however many
times the model publishes, because the only aggregate in the file is the one the finalizer
wrote — `behaviour:check` and `css:check` both assert that no publication survives.

**Build cost is not settled, and it is now purely build cost.** The emission is *larger* than
it was (1.13 MB → 1.54 MB) and 94% of it is staging that gets deleted: the flat lists re-say
all sixty entries on every publication, where the chain would have re-said a link. So the
quadratic publishing work still exists in CPU and memory during a build — and it is the only
thing left that the linked representation would have improved, because the *shipped* bytes were
never where the chain won: a carrier has to declare whatever it reads, so per-carrier cost is
the same lists either way, and the chain's runtime cost (1.82× per-carrier restyle) is paid by
every user forever.

That is the trade to decide on, and it is now stated in the right units:

```text
linked      build emission ~linear,   shipped bytes same,  per-carrier restyle 1.82×
flat        build emission 94% waste, shipped bytes same,  per-carrier restyle 1.00×
```

`pnpm examples:build` prints this table on every run and fails if a publication survives into
`examples/output.css` or a carrier is left without the aggregate.
