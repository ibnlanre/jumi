# Changelog

> **Releases, newest first.** `0.1.0` is the first release: its notes are hand-written from the measurement
> records in `engineering/research/`, and they give the reasons rather than a recap. Everything under the
> divider is the mechanical commit record of the `1.0.0-beta.1` line, which was prepared and then renamed
> before anything was published — kept for provenance, not as a release note. `pnpm run changelog` writes
> each release after `0.1.0` above the first heading, from the commits tagged since the boundary, and leaves
> what is already written alone. Release flow: [CONTRIBUTING.md](CONTRIBUTING.md).

## 0.1.0 — unreleased

Each note below describes behaviour that was measured rather than recalled. None of it changes a motion; the
changes are about what Jumi writes, and about leaving the author's own CSS alone.

### Upgrading from the unpublished 1.0.0-beta.1 line

That line was never published, so nothing installed has to move — these are the changes it accumulated on the
way to this release.

**`interpolate-size` is no longer set for you.** It used to be written onto every element that animates, and the
declaration is inherited — so it opted in the element's whole subtree. Measured: a child with no motion of its
own found its own ordinary `width: 200px → auto` transition interpolating, identically to a control outside the
subtree, merely because an ancestor happened to animate. Keyword sizes now need the opt-in written where you
want it:

```html
<div class="interpolate-size-allow-keywords animate-width-auto w-[200px]">
  Keyword target
</div>
```

`interpolate-size-numeric-only` is the other half: it stops a subtree inheriting the switch. Both are plain
declarations, not motion controls, so they work on an element that animates nothing.

**The `perspective(...)` transform part moved to its own slot.** `--jumi-perspective` used to be the variable
behind the _transform function_; it is now `--jumi-perspective-3d`, and `--jumi-perspective` belongs to the
`perspective` property. If your own CSS sets `--jumi-perspective` to drive the transform function, rename it —
the two destinations are otherwise able to write the same variable.

**Keyword sizes resolve across the size family.** `animate-block-size-auto` and
`animate-min-{width,height,inline-size,block-size}-auto` now emit; `animate-block-size` no longer answers to the
bare spelling, which was the odd one out against `inline-size`. `max-*` keeps `none`, because that is the
keyword CSS gives those properties.

**A malformed motion name is reported and dropped.** A name becomes part of a custom property's name, so it
cannot contain whitespace — and inside `[brackets]` an underscore becomes one, which is why a name is written
bare. A name that is _valid_ but matches no motion is still silent: controls configure motion, they do not
create it.

**Two breaking changes the generated record carries and these notes had missed.** Both are real; which side of
`1.0.0-beta.1` they fall on is for the author to place, because the commit record does not say:

- `animation-range-{start,end}-timeline` is gone — `animation-range-start-entry` and
  `animation-range-end-exit` replace the former component controls.
- The phrase frame separator changed from a comma to a pipe, so `animate-rotate-[0:0deg|100:45deg]` is a phrase
  and a comma-separated value list cannot be confused with one.

They were found by generating a changelog from the history rather than by re-reading these notes, which is the
argument for the generated half being the mechanical record and this half being the reasons.

### Added

- `animate-perspective-*` and `animate-perspective-origin-*` — the standalone properties, animatable like any
  other. The transform function stays reachable as `animate-transform-[perspective(400px)]`, deliberately with
  no utility of its own.
- `interpolate-size-allow-keywords` and `interpolate-size-numeric-only`.
- `animation-range-{range}:` as a composition on every motion source, so a phrase or a single value can be
  placed on a range exactly as an effect can.
- Motion names are element-local: naming a motion elsewhere in a stylesheet no longer widens the addresses an
  element answers to, and two motions on one element may share a name.

### Fixed

- A keyword target on a phrase or single value emitted, validated, and did nothing — the range variant published
  under the slot key while the chains read the attribute.
- The gate's declaration count was a file-wide text search that could not see a transition composition declaring
  `transition:`. It counts the rules the structural detectors find now.

---

## 1.0.0-beta.1 — never published

The commit record of the line prepared as `1.0.0-beta.1` and renamed to `0.1.0` before anything shipped,
generated mechanically from Conventional Commits (through 2026-09-14). It is kept for provenance — what
changed, and when — rather than as a release note: nothing under this heading has ever been installed from a
registry, so the version, the date and the section names below describe the work, not a release.

### ⚠ BREAKING CHANGES

- animation-range-{start,end}-timeline is gone, and the
  range names are now the values of the halves they belong to —
  animation-range-start-entry and animation-range-end-exit replace the
  former component controls.
- switch phrase frame separator from comma to pipe

### Features

- add 'i' to 'm' properties ([05d298a](https://github.com/ibnlanre/jumi/commit/05d298ae84ef0ed3f579f51b780c5d348641e2c0))
- add animate-border property and extend block-size theme with additional properties ([b0a65fb](https://github.com/ibnlanre/jumi/commit/b0a65fb7732730f5dc16c26a0a4767b00666b013))
- add animation delay components and refactor backdrop properties ([0689087](https://github.com/ibnlanre/jumi/commit/0689087e01b88b025ada79be8f990a7b84a80826))
- add atStops collection and update empty object structure ([13b6f56](https://github.com/ibnlanre/jumi/commit/13b6f563805406fb79a6afba0b1ba8fc14d7bf53))
- add box-shadow inset support and related variables ([7dc9619](https://github.com/ibnlanre/jumi/commit/7dc96190675fa9a0e94a1cfdc5afe392c9d0b339))
- add comprehensive Jumi effect animations with categorized types ([b8c7838](https://github.com/ibnlanre/jumi/commit/b8c783864c88869cf027ed2134acba5bb8808ca2))
- add CSS transition layer with per-property timing controls ([5999add](https://github.com/ibnlanre/jumi/commit/5999add1b2710fae7d9326f6e4cbcc9bf10b1ee9))
- add hover and group-hover animation variants with enhanced composability ([18a1a6e](https://github.com/ibnlanre/jumi/commit/18a1a6e838a9c2b2b7b68b8776f392f35757ad11))
- Add new border animations and improve HTML structure for better readability ([026a4c1](https://github.com/ibnlanre/jumi/commit/026a4c1392fee92f1c54b190afb60a569953baff))
- add Tailwind CSS configuration and update TypeScript settings ([1c46ff4](https://github.com/ibnlanre/jumi/commit/1c46ff40b5ebaf26c02eb35eb9c37a57f5a14ce7))
- add the runtime wrapper for same-document transitions ([2301852](https://github.com/ibnlanre/jumi/commit/23018527f5f8eb7ef1773837c9f1532435ecac7f))
- add transform utilities and animations for TailwindCSS ([a5c57cd](https://github.com/ibnlanre/jumi/commit/a5c57cdecdb52018a079d2329f49b7dba58d1b72))
- address labelled animation slots by their label alone ([5378c6f](https://github.com/ibnlanre/jumi/commit/5378c6f89ea8de60ba80b1196f29269ebaa6cc0c))
- address labelled animation slots with dotted modifiers ([0785545](https://github.com/ibnlanre/jumi/commit/07855455bac392365b6ada5da72d26ca9707c3f4))
- assemble the transitions carrier through staging, like animations ([f0e19b3](https://github.com/ibnlanre/jumi/commit/f0e19b3157035514c1cd059fd213cafdfc868daf))
- close theme ownership with a measured classification ([9bef33f](https://github.com/ibnlanre/jumi/commit/9bef33fe552058f72b08563d1d9cc2d1b732a3f7))
- complete the aggregate into carriers after the build ([95321ef](https://github.com/ibnlanre/jumi/commit/95321effa727f24df3e30c3baa41c35613ee7e83))
- derive the Storybook catalog from the effect registry ([3730066](https://github.com/ibnlanre/jumi/commit/3730066a6816d00f9ab60c197c5a3c525aa578fb))
- distinguish stops from aliases in animation modifiers ([be833c8](https://github.com/ibnlanre/jumi/commit/be833c891d8f8c3fb06c50abdd5b4e89ad5a9b06))
- emit view transitions from the staged candidates ([5bfa772](https://github.com/ibnlanre/jumi/commit/5bfa77274b365e438f26b07ab3906e51b97cf75e))
- enhance animation handling and keyframe management ([ce4c4fe](https://github.com/ibnlanre/jumi/commit/ce4c4feb08647a76e804d256bef159258a11d261))
- enhance animation properties and add new border-related animations ([2bc210d](https://github.com/ibnlanre/jumi/commit/2bc210d3c150d06e661b517e323b869b28f01776))
- enhance animation properties and add new themes ([b28dcb4](https://github.com/ibnlanre/jumi/commit/b28dcb4377ddf61c55d9541aa37b11580c4bb220))
- enhance animation properties and effects ([f910956](https://github.com/ibnlanre/jumi/commit/f91095665f6a61bed2ac119c82b50f97e3b14673))
- enhance animation properties and introduce new variants ([a3a07aa](https://github.com/ibnlanre/jumi/commit/a3a07aa43026b90bb45a5066272e82d150eca3c9))
- enhance match properties with new animations and themes ([4597370](https://github.com/ibnlanre/jumi/commit/4597370e6aafe382d77aa0593edeedb5129decd5))
- enhance transform properties and simplify animation handling ([86d5b1a](https://github.com/ibnlanre/jumi/commit/86d5b1ab9440802d36e880083fee24a74ab6d509))
- expose animation-range as a per-slot part and gate it ([6c237dd](https://github.com/ibnlanre/jumi/commit/6c237dd94f0b57c245350185006482c140e21988))
- give labelled slots per-slot composition and timeline controls ([d4e2628](https://github.com/ibnlanre/jumi/commit/d4e2628ce68695668700985975719646be13d9f5))
- give perspective its own motion, apart from the transform function ([88ca293](https://github.com/ibnlanre/jumi/commit/88ca293b155d74a8c3c2d12c049f014af5d107ea))
- infer the composition from motion utilities, dropping the carrier classes ([ae97d61](https://github.com/ibnlanre/jumi/commit/ae97d61c453de83334cc0c567c298db70822e74d))
- materialize the aggregate into carrier longhands and drop the transport ([81a833c](https://github.com/ibnlanre/jumi/commit/81a833ce454b7a0868f4e2f3f6326c0244839c39))
- measure Jumi's composition against the View Transition API ([231b85a](https://github.com/ibnlanre/jumi/commit/231b85a3b9674bfc68851df193af3ae33c83f2bf))
- measure what the host hands Jumi per candidate ([cb963a2](https://github.com/ibnlanre/jumi/commit/cb963a2e9494c16e18e2b71976410c579da110a3))
- name every motion with a list, refusing names that cannot be written ([baf1cd4](https://github.com/ibnlanre/jumi/commit/baf1cd457d35f4bfc64b4cb7b9581d8f6fc4ebff))
- own Jumi's lifecycle in one build integration ([39dda27](https://github.com/ibnlanre/jumi/commit/39dda271fcf731dc0646e62a21dc830dbb538a89))
- place one motion with a range variant, beside the range utilities ([928c386](https://github.com/ibnlanre/jumi/commit/928c38662d883b6c883ef550a471abc05685645c))
- Refactor animation utilities and types for improved structure and functionality ([3aaa455](https://github.com/ibnlanre/jumi/commit/3aaa45518ad09663221bef5d5a3429e256af22ad))
- refactor AnimationShowcase import paths and add new component implementation ([5ddb28a](https://github.com/ibnlanre/jumi/commit/5ddb28a950f2a5ca38e2f1586ed17c6422f13735))
- register slot activation names as non-inheriting, asserting it in the browser ([e633481](https://github.com/ibnlanre/jumi/commit/e633481b383b48dde073047106270f6a0f503eb2))
- replace stops and aliases with self-contained phrases ([a59139f](https://github.com/ibnlanre/jumi/commit/a59139f7aaecc128397e4145e88e2f9aba95c3d2))
- resolve partial theme namespaces per value ([4530fb2](https://github.com/ibnlanre/jumi/commit/4530fb2a03f90b871333165ae9cf2dc239fc5389))
- resolve spacing theme names through the CSS formula ([9074a99](https://github.com/ibnlanre/jumi/commit/9074a9929cdf86fc75fb538fb1ec73cbb5586ff7))
- route phrases around the host type check, through a second handler ([cee40e2](https://github.com/ibnlanre/jumi/commit/cee40e246c20ba7afb0816c56996525a12bf5f99))
- stop claiming host selector vocabulary ([555502b](https://github.com/ibnlanre/jumi/commit/555502b92778a8e14344a88edbb3e5840933388d))
- switch phrase frame separator from comma to pipe ([4d09d4f](https://github.com/ibnlanre/jumi/commit/4d09d4ffdfb952f08bf75d8c82a2a6334a1152e1))
- **theme:** add new CSS properties and update existing ones ([893f766](https://github.com/ibnlanre/jumi/commit/893f766b0672278c5e890cca4075c99b390b8d32))
- update animation classes to use 'jumi' prefix for consistency ([5e47983](https://github.com/ibnlanre/jumi/commit/5e47983cc8625e48d208a9860c81a4baab7beb93))
- update animation keyframes and properties for consistency and flexibility ([7291b04](https://github.com/ibnlanre/jumi/commit/7291b04a6fff76062f93693074d933a998d31122))
- update README and examples for 'jumi' integration and enhance animation utilities ([1c6efe1](https://github.com/ibnlanre/jumi/commit/1c6efe1c7df286abf69a7fbea3013d361199fec8))

### Bug Fixes

- address a named motion on the rule that declared it, not in the aggregate ([3aa09b6](https://github.com/ibnlanre/jumi/commit/3aa09b61a2e6d0a78eb9450c2ddf93665c4a43f1))
- attach the animationend listener once per glyph in the effects catalog ([6bb8255](https://github.com/ibnlanre/jumi/commit/6bb825543194595be0d7de4f524ff176f8538ff8))
- erase the carrier marker on completion, not on change ([b1e7642](https://github.com/ibnlanre/jumi/commit/b1e76429ec8c1036b1a4ce821da91cb1c8b1995d))
- only opt in descendants when the author asks, not when an ancestor animates ([a9665c0](https://github.com/ibnlanre/jumi/commit/a9665c004558b87c73897503206621c172364c97))
- resolve animation-range on a slot's own key, so phrases range too ([0179327](https://github.com/ibnlanre/jumi/commit/01793270f9e24f5a87fca3ed18603bf129e24973))
- update ESLint and VSCode settings for improved code quality and consistency ([eecc789](https://github.com/ibnlanre/jumi/commit/eecc7893142537481592c9cbbf79ac89a67e23ef))
