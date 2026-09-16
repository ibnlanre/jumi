# Self-part declarations: audit result

Status: **audited 2026-09-16.** One found, no change made. Recorded because the frame rule now depends on
knowing whether it is deliberate.

---

## What was audited

Candidates whose declaration names their own attribute among their parts —
`color('<attribute>', ['<attribute>', …])`. These are the cases where the key a phrase writes and the key
a frame would read are the same name, so the frame's outer read is the value's only possible consumer.

## The result

**One of 398.** `animate-border-block-color`, in `src/properties/tween.ts`:

```ts
'animate-border-block-color': {
  fn: color('border-block-color', ['border-block-color']),
  …
}
```

Every other candidate either declares no parts (a whole-property tween) or declares parts that are
components of a composed attribute.

## What it does

- As a **value** (`animate-border-block-color-red`) it is well behaved: it writes
  `--jumi-border-block-color`, and the keyframe for the attribute reads it.
- As a **phrase** (`animate-border-block-color-[0:red|50:blue]`) it writes
  `--jumi-border-block-color-<id>-<offset>`, which is also the attribute's own frame key. Before
  2026-09-16 the frame emitted no read at all in that case, because the rule was written as "no parts at
  all" rather than "the phrase wrote that key" — measured as one candidate whose frame value nothing
  consumed.

So the declaration reads oddly (`border-block-color` is a property, and its only part is itself) and is
harmless for values; it is now handled for phrases as well, by narrowing the read to the rule the code
always claimed.

## Decision

No change to the declaration. It is *either* a deliberate normalization — naming the addressable surface
explicitly so the candidate is addressable at all — *or* an accident of the property sweep that
converted the table. Nothing observable distinguishes the two: the value path is identical, and the
phrase path now works either way.

What is not uncertain is the check: `scripts/constituent-check.mjs` reports the set on every run
(`N address their own attribute`), so a second one appearing is visible without anyone remembering this
file. If the count grows, the question above becomes worth answering properly.
