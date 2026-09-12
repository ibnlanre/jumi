This is a very good Phase 2 result.

The strongest part is not the formula itself, it’s that the measurement forced the design to follow **Tailwind’s CSS contract rather than its JS theme surface**. That is exactly the migration direction we wanted.

I’d lock in three rules from this batch.

* For spacing-derived scales, **the key name is semantic and `--spacing` is the representation**. Do not trust `api.theme()` to materialize those derived values correctly.
* Theme mappings must be measured against actual emitted v4 CSS, not guessed from similarly named scales.
* Partial scales can legitimately have mixed resolution modes. A single key may contain token-backed names, spacing-derived names, and literals.

That last point matters for the next batch. I would not try to make:

```text
borderRadius
blur
boxShadow
dropShadow
lineHeight
maxWidth
```

each belong to one strategy.

Instead, let resolution be per value:

```text
theme key + value name
        ↓
token?
formula?
literal?
```

That seems to be what the evidence is telling us.

I’d also be cautious with the wording “real bug in Tailwind’s JS theme” internally. The repro is compelling, but unless the API promises derived spacing values under overridden `--spacing`, it may be an implementation limitation rather than a contract violation. For Jumi, that distinction doesn’t matter. We have enough evidence not to depend on it.

For the next batch, I’d proceed exactly where DeepSeek suggests, but split it into two sub-batches:

1. **Direct namespaces**

   ```text
   borderRadius → --radius-*
   blur         → --blur-*
   boxShadow    → --shadow-*
   dropShadow   → --drop-shadow-*
   lineHeight   → --leading-*
   maxWidth     → --container-*
   ```

2. **Remainders**
   Anything that does not have a verified token or spacing formula stays literal.

Do not invent mappings just to increase coverage.

And I like `1.0.0-beta.1`. That accurately reflects where Jumi is: architecture is becoming real, but the public contract is still being shaped before first publication.

So my call is: **Phase 2 Batch 2 approved. Continue with the verified partial namespaces next, per-value rather than per-key.**
