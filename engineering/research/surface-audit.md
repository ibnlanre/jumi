# The public surface, audited before it is frozen

Chromium 153.0.8010.12 (`CSS.supports`, for the grammar questions). `pnpm spike:surface-audit`
(`scripts/spike-surface-audit.mjs`). No `src/` changes — this audit recommends, it does not edit.

## Summary

Two questions, and the answers are opposite in kind:

- **Is the naming model coherent?** The *model* is coherent — property name first, value last, one route per
  property — but **coverage has a hole in the `transform` family**: `animate-transform-origin-*` exists,
  `animate-perspective-*` and `animate-perspective-origin-*` do not, and the `perspective` *property* is
  therefore not animatable through Jumi at all while being perfectly animatable in the browser.
- **Does Jumi duplicate the host?** **No.** Not one utility Jumi registers outside the tween family writes a
  real declaration: every one of them writes only `--jumi-*` slot variables. The `will-change` overlap I
  reported in the inventory does not exist — Tailwind owns it, and Jumi registers nothing for it.

## 1 · The transform family, spelling by spelling

Each candidate is built alone, and the declarations are read off the rule whose selector carries it.

| spelling | result |
| --- | --- |
| `animate-rotate-45` | emitted — the control for this table |
| `animate-translate-x-[10px]` | emitted |
| `animate-transform-origin-center` | emitted |
| `animate-transform-origin-[50%_50%]` | emitted |
| `animate-transform-origin-x-center` | emitted |
| `animate-transform-[perspective(400px)]` | emitted — the `perspective()` **function**, inside the `transform` value |
| `animate-backface-visibility-hidden` | emitted |
| **`animate-perspective-400`** | **refused** |
| **`animate-perspective-[400px]`** | **refused** |
| **`animate-perspective-origin-center`** | **refused** |
| **`animate-perspective-origin-[50%_50%]`** | **refused** |
| `animate-transform-box-fill-box` | refused (the property is not animatable; nothing to do) |

Read against the sources, the mechanism is clear rather than merely observed:

- `--jumi-perspective` is a **part of the `transform` value** — `src/composition/transform.ts` joins it with
  the matrix, rotate, scale, skew and translate parts. So `perspective` is reachable *as a transform
  function*, under `animate-transform-[perspective(400px)]`, and not as a property.
- `perspective-origin` appears in the keyframe/property name map and has a `--jumi-perspective-origin`
  variable, but no tween entry registers it — the same shape as the `auto` value gaps the size sweep found:
  modelled, not exposed.

**Assessment.** The naming model itself is consistent enough for 1.0 — every property that is exposed is
exposed as `<css-property>-<value>` under `animate-`, and the two that are missing are missing for the same
reason (no registration), not because two naming schemes disagree. What is *not* coherent is the coverage:
`transform-origin` and `perspective-origin` are the same kind of property (both affect how a child's
transform is computed), one has a motion and the other does not, and `perspective` — which is animatable and
which Jumi already models — has no motion at all.

Both are one `values:` map plus one entry each, of exactly the shape every other property in `tween.ts` uses,
and both sit next to behaviour Jumi already has (`transform-origin` as a motion, `perspective` as a
composition part). This is coverage work, not design work — which is precisely the category that is safe to
finish before freezing and unsafe to guess about after.

## 2 · Does Jumi duplicate the host?

Every utility Jumi registers outside the tween family was probed with a representative set of values, built
twice — with Jumi and without the plugin — and the declarations of the rule it produced were read back.

| reading | result |
| --- | --- |
| utilities probed | 26 (25 controls read from `src/properties/controls.ts`, plus the `interpolate-size` utility) |
| utilities that emitted on a sampled value | 21 |
| **utilities that wrote a real CSS declaration** | **0** |
| utilities that wrote only `--jumi-*` slot variables | 21 |

So the separation the CTO described is not a policy Jumi needs to adopt — it is already the structure:

```text
animate-* / animation-*-{value} / transition-*-{value}   →  slot configuration: --jumi-* variables only
```

A control writes `--jumi-<slot>-<part>` and the composition turns it into the declaration; the host cannot
express that relationship, so the vocabulary is earned rather than duplicated.

### The `will-change` claim, corrected

The inventory credited `will-change` to a Jumi source file, and the natural reading was that Jumi competes
with Tailwind there. Measured directly:

| candidate | with Jumi | without Jumi |
| --- | --- | --- |
| `will-change-[transform]` | emits | **emits, identically** |
| `will-change-transform` | emits | **emits, identically** |
| `animate-will-change-[transform]` | nothing | nothing |

**Jumi registers no `will-change` utility at all.** The credit came from the inventory's coverage ladder
walking up to a source file that *names* the property, which is a weaker fact than it looked: the two builds
are byte-identical, so the host owns it outright and there is nothing to remove.

The rule is still worth writing down as policy, because it is the test to apply to anything added later:

> If Tailwind exposes the property comprehensively, Jumi defers — unless Jumi adds semantics the host cannot
> express (a motion slot, a per-slot relationship, a name, a composition part).

Everything Jumi currently ships passes that test, which means the audit's recommendation is **no removals**,
and the only vacancies are the two additions in §1.
