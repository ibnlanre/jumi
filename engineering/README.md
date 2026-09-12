# Engineering records

This directory explains **how and why Jumi is built**. It is deliberately not part of `docs/`, which
is the public documentation site and nothing else.

Nothing here is private — this is a public repository, and the split is about **intended audience**,
not access control. A reader looking for how to use Jumi wants `docs/`; a reader changing Jumi wants
this.

```text
engineering/
  architecture/   how the machine works, and why it is shaped this way
  research/       investigations, measurements, and their conclusions
  roadmap/        what is planned, in what order, and what was closed
```

## What lives where

| File | Why it is here |
| --- | --- |
| `architecture/aggregate-representation.md` | the carrier protocol and the measurement that rejected the linked representation |
| `architecture/carrier-locality.md` | why the aggregate resolves on the carrier, with the browser measurement |
| `architecture/dependency-gap.md` | what still stands between Jumi and independent emission, and why that is a product decision |
| `architecture/effect-model.md` | what an effect is mechanically — one element, one keyframe timeline |
| `architecture/phrases.md` | the shipped phrase grammar, and the host value-parser constraints it works within |
| `research/scanner-inventory.md` | candidate discovery: what the host hands a matcher, per candidate |
| `research/upstream-limitation.md` | a parked investigation into a host limitation |
| `roadmap/migration.md` | the migration: its phases, what closed, and what was decided along the way |

## Rules of the split

- **`docs/` is product documentation.** Its audience is someone using Jumi. If a page would not be
  linked from the site's navigation, it does not belong there.
- **`engineering/` is build history and rationale.** Its audience is someone changing Jumi, including
  a future agent, and it is where measurements, rejected options and settled decisions are recorded.
- **Root markdown is the entry point.** `README.md` introduces the package; `CONTRIBUTING.md` states
  the rules, including this one (principle 10).

`CTO.md` and `HOOKS.md` still sit at the root. They are candidates for `engineering/decisions/` when
that cleanup is worth doing — not mixed into the split above.
