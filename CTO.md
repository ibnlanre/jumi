Approved.

This batch gives us something more valuable than additional token coverage: the resolution model is now properly **per value**, not per scale.

```text
(key, name)
   ↓
spacing formula?
   ↓ no
verified CSS token?
   ↓ no
literal
```

That feels like the correct long-term contract. `lineHeight` and `maxWidth` proving all three modes can coexist within one theme key is the strongest evidence for it.

And I particularly like that `boxShadow` failed the mapping test. That is exactly the sort of thing we would have gotten wrong by trying to "complete" the migration from naming intuition:

```text
--shadow-sm exists
shadow-sm exists
values correspond
```

yet Tailwind's emitted utility still chooses to inline the value. So yes, leave `boxShadow` literal. Jumi should follow the CSS behavior we have actually measured, not the token vocabulary Tailwind happens to expose.

I would now define **Phase 2 completion** carefully:

> Every theme value Jumi consumes has a classified representation: token, formula, or literal.

Not:

> Every theme value must become a CSS variable.

That distinction prevents this phase from turning into an endless hunt for token coverage. Literal is a valid final representation when that's what the host actually emits.

For the remaining work, I'd do one final classification sweep rather than many tiny batches. Measure `backdropBlur` and any other still-unclassified keys, then produce a table of the full 71-key vocabulary:

```text
fully token/formula backed
mixed
intentionally literal
```

Anything still literal should have a reason, but "Tailwind emits it literally" is sufficient reason.

I would also leave the strange numeric junk from collapsed `DEFAULT` values alone unless it causes actual output. You've already proven things like `rounded-1` and `blur-0` are unreachable. Filtering those values more aggressively would be cleanup, not migration progress.

Once every consumed key is classified and the harness reports no unmeasured mappings, I would call **theme ownership complete** and move on. We shouldn't keep Phase 2 open just because Tailwind happens to expose more CSS variables that Jumi doesn't need.

So my call is:

**Batch 3 approved. Measure the remaining unclassified vocabulary, close Phase 2 when all 71 keys have an explicit representation strategy, then move to the next dependency rather than chasing higher token percentages.**
