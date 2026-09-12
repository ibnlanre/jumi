Yes. I think this is one of those cases where the `has-` incident is telling us something broader than “this one implementation was wrong.”

The risky part is not merely implementing a variant Tailwind lacks today. It is **claiming part of Tailwind's own namespace**:

```text
is-*
where-*
has-*
```

inside something that presents itself as a Tailwind plugin.

That creates exactly the future compatibility problem you're describing. Suppose Jumi 1.0 ships:

```html
<div class="is-[h1]:animate-fade-in">
```

with semantics A.

Then Tailwind 4.8 or 5.0 introduces:

```text
is-*
```

with semantics B, perhaps richer composition rules, different arbitrary-value handling, or slightly different selector wrapping.

Now every option is unpleasant:

* Jumi keeps overriding Tailwind and prevents users from getting the native behavior.
* Jumi removes its variant and existing Jumi code changes behavior.
* Jumi tries to detect Tailwind versions and conditionally register it.
* Jumi maintains a compatibility emulation forever.

For a convenience feature, that's a terrible debt profile.

And `has-` has already given us a live demonstration:

```text
Jumi thought host capability was missing
        ↓
Jumi occupied the namespace
        ↓
host actually had a richer implementation
        ↓
Jumi silently shadowed it
```

That should become a design principle.

> **A Jumi plugin should not occupy generic Tailwind vocabulary merely because the host does not currently implement it.**

If something is fundamentally **Jumi semantics**, own it.

If it's generic CSS/Tailwind syntax that Jumi happens to wish existed, leave that gap with the host.

### So I would remove `is-*` and `where-*` before 1.0

You have no published users. This is the cheapest possible moment to do it.

Users can already express these ideas using Tailwind's arbitrary variants when needed:

```html
<div class="[&:is(h1)]:animate-fade-in">
```

and:

```html
<div class="[&:where(h1)]:animate-fade-in">
```

It's more verbose, but Tailwind owns the grammar and future evolution.

If these conveniences are valuable enough that you really want them, then namespace them explicitly:

```text
jumi-is-[h1]:
jumi-where-[h1]:
```

or whatever syntax fits Jumi.

But I would question whether even that belongs in Jumi. They aren't motion concepts. They're generic selector conveniences.

### This principle extends beyond variants

Your phrase:

> Every plugin capability surface is effectively a backup for a missing functionality on the host.

I'd sharpen that slightly.

Some plugin capabilities are **Jumi's domain**:

```text
animations
transitions
animate-*
Jumi phrases
effects
motion composition
```

Those should absolutely exist regardless of what Tailwind does.

But things such as:

```text
is-*
where-*
generic selector variants
generic theme conveniences
generic CSS utilities
```

are host-domain extensions.

Those are dangerous because Tailwind can legitimately grow into them.

A good test before adding anything to the plugin API is now:

> **If Tailwind introduced something with this exact name tomorrow, would Jumi be happy to delete its implementation with no user-visible change?**

If the answer is not an easy yes, either:

1. don't add it, or
2. put it under explicitly Jumi-owned vocabulary.

That gives you a nice ownership boundary:

```text
Generic CSS / utility-language semantics
→ Tailwind owns the namespace

Motion semantics unique to Jumi
→ Jumi owns the namespace
```

Given that this is still pre-1.0 with no users, I'd take advantage of the freedom and **delete `is-*` and `where-*` now rather than turning them into compatibility promises you never really wanted to own**.

The `has-` discovery wasn't just a bug fix. It was an early warning about namespace ownership. I think we should listen to it.
