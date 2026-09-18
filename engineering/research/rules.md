# Standing research rules

Jumi's measurable claims are decided by arms that run in a browser. D.3.9–D.3.11 produced enough repeated failure
modes that they are worth stating once rather than rediscovering them per pass. Every rule below comes from a defect
that **got past a guard and looked like a finding**, and each names what holds it now — a rule with no mechanism
behind it is a hope, and the ones that are still hopes say so.

The distinction that organises all of them:

```text
route executes                    the class applied and the animation exists
route assigns the right subject   the emitted declaration names the intended execution leaf
route produces displacement       the observable actually moves
```

Three separate facts, not one. D.3.11's four `equivalent-no-op` edge routes are the case that proves it: they execute
and assign exactly their contracted leaf, and produce no displacement — legitimately, because their endpoint is
native-equal to the position they already rest at.

## The rules

| #   | Rule                                                                                                                            | The defect that produced it                                                     | What holds it now                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Inspect the **current emitted structure** before designing a repair.                                                            | 18 — a book measured a `dist` older than the source                             | partial: the gate's `bundle` stage precedes the books, but a hand-run book can still read a stale `dist`                          |
| 2   | Native semantic probes and Jumi emission probes are **different instruments**.                                                  | 15 — a `linear` reference compared against an `ease` shipped curve              | `scripts/lib/frames.mjs` builds native arms and takes the easing as a parameter; a result must say which arm it is                |
| 3   | A verdict-producing arm must **prove the shipped class was applied**.                                                           | 19 and 20 — a resting declaration read as a target; a probe with no class       | structural: `probeMarkup` and `gateBArm` return the markup _and_ the reference together, so no verdict can be built from one half |
| 4   | A **flat reference needs a moving control**.                                                                                    | D.3.11 — a void comparison where every arm agreed with itself                   | structural: the route book's verdict requires `equivalent.turns === 'flat'` **and** `control.turns === 'moves'`                   |
| 5   | Never infer axis semantics from a visually plausible `<position>` spelling. **Prove which component moved.**                    | 17 and 22 — a two-value spelling whose second component binds the other axis    | the endpoint is read from the emitted declaration, and native references are spelled in the grammar the route resolves in         |
| 6   | Structural CSS claims come from **parsed declarations**, not substring matches.                                                 | D.3.11 — a scan for `offset-position:` matched inside `--jumi-offset-position:` | partial: see the note below                                                                                                       |
| 7   | Read the exact current block from the working tree **before mutating it**.                                                      | four failed edits in D.3.11, every one anchored on remembered text              | process only — including that a literal `\u2019` in the source is not the character it denotes                                    |
| 8   | Once behaviour and architecture are proven, switch to **implementation mode**; only a behavioural contradiction reopens design. | four days of research loop after the mechanism was already proven               | the track's standing instruction, and how D.3.9–D.3.11 landed                                                                     |

### Rule 6 is the one still owed a mechanism

The defect was mine, not the product's: a brace-depth scanner looking for the real property matched the substring
`offset-position:` inside the custom property `--jumi-offset-position:`, and reported an unconditional declaration that
did not exist. The route book's own slot reads avoid this by construction rather than by parsing — the needle is the
whole token `--jumi-<leaf>-100`, so a collision would need another name to contain it entirely. That is a property of
the needle, not a guarantee:

> Put the boundary in the needle, or parse the declaration. A bare property name is a substring.

## Two corollaries worth keeping

- **A probe defect and a product defect look identical from the outside.** Both produce a clean-looking reading rather
  than an error. The question that separates them is not "did the arms agree?" but "what was the reference's own
  value?" Defects 15, 19, 20, 22 and the scanner all passed the first question and failed the second.
- **An explanation is not a reading.** "The two spellings name the same position" was a hypothesis about
  `left 50%` and `right 50%`, and it was good enough to design a ruling around. The arm falsified it — the spellings
  name `0% 50%` and `100% 50%`. Algebra proposes; the arm decides.
