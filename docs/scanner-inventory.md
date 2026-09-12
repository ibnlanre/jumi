# Scanner inventory — what discovery owns, measured

Phase 3 asks whether Jumi can find its own candidates. The useful question is not "how do we scan"
but **"if Jumi had the complete set of class-like strings in the user's sources, what information
would still be missing before the model could decide everything it needs?"** That separates
discovery from parsing, and it is answerable today without writing any scanner.

The instrument is `node scripts/spike-candidates.mjs`: the real CLI, Jumi's own plugin with every
matcher wrapped, and a fixture built as a candidate matrix. It records what each candidate delivers
to a Jumi callback — name, value, modifier, and the rest of the context object.

## What a Jumi matcher actually receives

| Candidate in the source | What Jumi is handed | What a raw string would *not* give it |
| --- | --- | --- |
| `animate-rotate-45` | `animate-rotate` ← `"45deg"` | the name → value lookup: `45` resolves through Jumi's own `values` map, which today the host performs |
| `animate-rotate-[23deg]` | `"23deg"` | bracket parsing |
| `animate-rotate-[0.25turn]` | `"0.25turn"` | bracket parsing |
| `animate-rotate-[calc(1deg_+_2deg)]` | `"calc(1deg + 2deg)"` | bracket parsing **and** `_` → space |
| `animate-rotate-[var(--spin)]` | `"var(--spin)"` | bracket parsing |
| `animate-width-[3rem]` | `"3rem"` | bracket parsing |
| `animate-width-abc` | **nothing at all** | type validation — Jumi declares `type: 'length'` and never sees a value that fails it |
| `hover:animate-scale-110` | `animate-scale` ← `"1.1"` | nothing: the variant is invisible *both* ways. Measured identical to the bare candidate |
| `*:animate-scale-110` | same | same |
| `motion-reduce:animate-scale-110` | same | same |
| `transition-duration-600/rotate` | `"600ms"`, `modifier: "rotate"` | `/` splitting, plus the same values lookup |
| `-animate-bottom-4` | `"calc(calc(var(--spacing) * 4) * -1)"` | negation, **composed onto Jumi's already-resolved value** |
| `animate-opacity-50`, twice | **one** call | nothing — the host dedupes before matching |
| `animate-bounce-in`, twice | one call (`animate` ← `"bounce-in"`) | nothing — effects are a matcher too, not static CSS |
| `animations` | one call (`animations` ← `""`) | nothing |

The context object carries exactly one key — `{ modifier }`. There is no variant, no source
location, and no original string. 15 calls arrive for 12 distinct utilities.

Two conclusions fall straight out of the table:

1. **Discovery does not need the variant grammar.** `hover:animate-scale-110` contains
   `animate-scale-110` as a substring, and the matcher cannot tell the two apart anyway, so a
   substring scan finds everything a variant-aware one would. What it *cannot* do without more work
   is the parsing on the right-hand column — but that is the arbitrary-value workstream, not
   discovery.
2. **`type` is doing real filtering today.** `animate-width-abc` produces no call, no warning and no
   output. A Jumi-owned scanner that does not reproduce type validation does not merely scan
   differently — it starts emitting utilities that Tailwind currently refuses.

## Who owns what today

| Concern | Today | If Jumi discovers candidates |
| --- | --- | --- |
| which files are scanned | host — `@source`, `source(none)`, globs, ignores | Jumi |
| candidate extraction | host scanner | Jumi |
| deduplication | host (measured above) plus Jumi's own registries | unchanged |
| ordering | host — measured: **identical call sequence under reversed document order** | Jumi must reproduce it |
| variants on a candidate | host, stripped before Jumi sees anything | **not required** for discovery |
| arbitrary syntax | host (`[23deg]` → `23deg`, `_` → space) | Jumi, as its own workstream |
| type validation | host | Jumi |
| name → value | host looks up the map Jumi supplied | Jumi — it owns the vocabulary now |
| negation | host composes onto Jumi's resolved value | Jumi |
| incremental | host re-scans and re-presents the whole candidate set | Jumi |

Ordering is the one row that is not merely plumbing. The aggregate's ten flat lists are built in
registration order, and their order **is** precedence: a later slot's longhand wins where two
animations share one. The host decides that order today and does so stably, which is why every
snapshot in this repo can assert a slot sequence at all. A Jumi scanner that finds candidates in a
different order changes animation precedence, not just bytes.

## What Jumi has for this now

Nothing. `src/` never touches the filesystem — no glob, no `readdir`, no `readFile` — and the
plugin is handed candidates by the host. Worth recording while it is in view: **`glob@^11` is
declared as a runtime dependency and is used only by `scripts/analyze.js`**, so it belongs in
`devDependencies` whether or not Phase 3 happens.

## The narrow goal

> Can Jumi independently discover the raw candidates it cares about, without yet understanding
> Tailwind's variant grammar?

Answer from this inventory: **yes for discovery** — it is a substring problem — with three
consequences to accept up front:

- false positives are the cost (any prose, comment or string containing `animate-` is a candidate,
  which is exactly what the host's scanner also has to filter);
- ordering has to be reproduced, because it is semantic;
- type validation has to be reproduced, or Jumi starts emitting what the host currently rejects.

## Acceptance, if we build it

Not a new scanner API — a comparison against the harnesses that already exist:

1. Wrap the plugin as this spike does, over each real corpus (`css-snapshot/fixture.html`,
   `variant.html`, `examples/`, the docs catalogue), and record the candidates Jumi's matchers are
   called for.
2. Scan the same sources for class-like strings, and require the Jumi-relevant subset (`animate-*`
   and the carrier `animations`) to match that set **exactly** — no misses, no extras.
3. Require the resulting slot order to equal the host's, byte for byte, in `pnpm css:check`.

Until all three hold, the host keeps the scanner.
