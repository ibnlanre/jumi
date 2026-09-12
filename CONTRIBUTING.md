# Contributing to Jumi

Thank you for your interest in contributing to Jumi! This guide will help you understand our design philosophy and contribution process.

---

## Design Philosophy

Jumi follows clear principles that ensure consistency, clarity, and excellent developer experience. Understanding these principles is essential before contributing.

### 1. CSS Property Fidelity

**Class names mirror their CSS property names as closely as possible.**

```html
✅ Good
<div class="animate-background-color-blue-500">     <!-- background-color -->
<div class="animate-border-radius-full">            <!-- border-radius -->
<div class="animate-backdrop-filter-blur-md">       <!-- backdrop-filter -->

❌ Avoid
<div class="animate-bg-blue-500">                   <!-- abbreviated -->
<div class="animate-radius-full">                   <!-- loses context -->
<div class="animate-blur-md">                       <!-- ambiguous property -->
```

**Why?** Developers can immediately understand which CSS property is being animated without guessing or memorizing abbreviations.

---

### 2. Minimal Abbreviations

Only use abbreviations that are universally understood or part of CSS conventions.

**Acceptable:**
- `x`, `y`, `z` for spatial axes (`translate-x`, `rotate-z`)
- Standard CSS shorthand (`margin`, `padding`)

**Not acceptable:**
- `bg` for `background-color`
- `bd` for `border`
- `pos` for `position`

**Why?** Full names reduce cognitive load and make the codebase accessible to developers at all experience levels.

---

### 3. Hierarchical Naming

Maintain property relationships in class names.

```html
✅ Good
animate-backdrop-filter-drop-shadow-blur-md
animate-backdrop-filter-drop-shadow-color-blue-500
animate-border-image-outset-4
animate-mask-border-width-2

❌ Avoid  
animate-drop-shadow-blur-md                     <!-- loses parent context -->
animate-border-outset-4                         <!-- ambiguous -->
```

**Why?** Hierarchical naming preserves the relationship between parent and child properties, making the API predictable.

---

### 4. Semantic Clarity Over Brevity

Prioritize clear, readable class names over shorter alternatives.

```html
✅ Preferred
<div class="animate-backdrop-filter-drop-shadow-offset-x-4">

❌ Avoid
<div class="animate-bd-drop-x-4">
```

**Why?** Self-documenting code is maintainable code. A few extra characters are worth the clarity.

---

### 5. Use Tailwind v4 Relationship Variants

Leverage Tailwind's built-in `:is()`, `:has()`, and `:where()` variants instead of creating custom selector utilities.

```html
✅ Good - Use Tailwind v4 variants
<div class="is-[h1]:animate-fade-in">
<nav class="has-[>button]:animate-scale-110">
<section class="where-[.card]:animate-slide-in-up">

❌ Avoid - Custom natural language variants
<div class="child-h1:animate-fade-in">
<nav class="has-button:animate-scale-110">
```

**Why?** Tailwind v4 provides standardized, well-documented patterns. No need to reinvent the wheel.

---

### 6. Carrier Classes Hold What Utilities Cannot

Some responsibilities cannot live in a single utility class. `animations` and `transitions` are **carriers**: the author opts an element in once, and the carrier declares the shared composition state that element needs.

```html
✅ Good
<div class="animations animate-rotate-45 animate-scale-110">

❌ Avoid
<div class="animate-rotate-45 animate-scale-110">   <!-- nothing assembles them -->
```

**Why?** Every animation on an element competes for the same CSS declarations, and those declarations are *lists* (`animation-name`, `animation-duration`, and the rest) that the browser resolves by position. A utility can own its own value, but it cannot own the list: Tailwind compiles each candidate without knowing what else the element carries. So the list is assembled once, on the element, by a carrier the author asks for.

The carrier is also the surface's single handle for turning motion off — `.animations { animation: none }` is what the reduced-motion guidance targets — and it declares the shared defaults, which is why a global control written on an ancestor does not silently retime a descendant's animations.

**Before proposing to remove a carrier class, answer this:** where does the shared composition responsibility move? If the answer is "nowhere", the change has reintroduced the exact problem the carrier solved. The extra class is deliberate; it is the price of composing motion under a compiler that never sees the whole element.

**The carrier can be `@apply`ed, and its data still follows it.**

```html
✅ Good
<div class="animations animate-rotate-45">

✅ Also fine
<div class="my-motion">   <!-- .my-motion { @apply animations animate-rotate-45 } -->
```

It took two changes to make that true, and both are worth knowing before touching either.

The first is that the aggregate cannot be published at a literal selector. Every entry is `var(--jumi-<slot>-animation-name, …)`, those slot variables are declared by the `animate-*` utilities **on the element**, and a `var()` chain inside a custom property resolves where it is *declared*. Published on `:root` — which shipped for a while — the declaration computes to the guaranteed-invalid value, that value inherits, and every carrier resolves `animation-name: none`. Published on `.animations` it never reaches a variant-prefixed form. Measured both times; `pnpm behaviour:check` is the check that catches it.

The second is that a utility body is not a fixed selector. Tailwind re-parents it for a variant and **copies** it for `@apply`, so by the time CSS exists, one carrier has become several rules in contexts Jumi never wrote. So the carrier marks itself (`--jumi-carrier`), the model publishes the aggregate as *staging* (`--jumi-carrier-staging`, on a rule nothing reads), and `finalize` — after Tailwind is done — writes the aggregate into every marked rule and deletes the staging. `@apply animations` copies the marker with the rest of the body, so the copy is a carrier like any other and is completed the same way.

**Before proposing to publish the aggregate anywhere else, answer this:** which element will resolve that declaration? A rule that nothing reads is fine; a rule that is read at the wrong element is the bug above, and it fails silently — a carrier that resolves `none` looks exactly like a carrier with no slots.

---

## Animation Conventions

### Effect Animations

Effect names use descriptive, hyphenated words following the pattern: `{type}-{direction}-{origin}`

```html
✅ Good
bounce-in, bounce-out                     <!-- Clear direction: -in vs -out -->
slide-in-left, slide-out-right            <!-- Type + direction + axis -->
fade-in, fade-out                         <!-- Simple directional -->
arc-top-left, arc-bottom-right            <!-- Hierarchical origin points -->
zoom-in, zoom-out                         <!-- Descriptive type -->
skew-left, skew-right-up                  <!-- Compound directions -->
wipe-in-center, wipe-out-left             <!-- Advanced: type-direction-origin -->
iris-in-center, iris-out-top-right        <!-- Full pattern -->
barn-door-in-center, curtain-out-left     <!-- Multi-word types (hyphenated) -->

❌ Avoid
bounceIn                                  <!-- camelCase -->
slideLeft                                 <!-- missing -in/-out direction -->
wipeC                                     <!-- abbreviated origin -->
fade                                      <!-- missing direction -->
arcTL                                     <!-- abbreviated -->
bd-in-c                                   <!-- multiple abbreviations -->
```

**Why this pattern?**
- Descriptive names (wipe, iris, box, barn-door) convey intent immediately
- Consistent direction indicators (-in/-out) make behavior predictable  
- Hierarchical origins (-center, -top-left) provide precision when needed
- No abbreviations ensures accessibility for all skill levels

### Property Animations

Follow the pattern: `animate-{css-property}-{value}`

```html
<div class="animate-opacity-50">                    <!-- opacity: 0.5 -->
<div class="animate-width-full">                    <!-- width: 100% -->
<div class="animate-background-color-red-500">      <!-- background-color: red -->
```

---

## Project Structure

```
src/
├── keyframes/
│   ├── effects.ts       # Named animations (bounce-in, slide-out, etc.)
│   └── property.ts      # Property-based keyframes
├── properties/
│   ├── match.ts         # Main utility definitions
│   └── component.ts     # Additional utilities  
├── theme/               # Theme value definitions
├── variants/            # Relationship helpers (if needed)
└── variables/           # CSS custom property definitions
```

---

## How to Contribute

### Adding a New CSS Property

1. **Verify the CSS property name** on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS)
2. **Add to `properties/match.ts`** in alphabetical order
3. **Use the established pattern:**

```typescript
'animate-scroll-margin-top': {
  property: value => ({
    '--jumi-scroll-margin-top': value,
    // Register keyframes via shared creator
  }),
  type: 'spacing', // or appropriate type
},
```

4. **Support Tailwind theme tokens** when applicable (colors, spacing, etc.)
5. **Test with arbitrary values:** `animate-scroll-margin-top-[24px]`

---

### Adding a New Effect Animation

1. **Choose a descriptive, hyphenated name**
2. **Add to `keyframes/effects.ts`**
3. **Follow the keyframe pattern:**

```typescript
'bounce-in': {
  '0%': {
    opacity: '0',
    transform: 'scale(0.3) translateY(-100px)',
  },
  '50%': {
    opacity: '1', 
    transform: 'scale(1.05) translateY(10px)',
  },
  '100%': {
    opacity: '1',
    transform: 'scale(1) translateY(0)',
  },
},
```

4. **Consider accessibility:** Test with `prefers-reduced-motion`
5. **Document motion type:** Spring physics, linear, parabolic arc, etc.

---

### Code Standards

- **Alphabetical ordering:** Keep properties sorted
- **2-space indentation**
- **TypeScript strict mode:** All contributions must pass strict type checking
- **JSDoc comments:** Add for complex functions
- **Consistent formatting:** Follow existing patterns

---

### Before Submitting

Run the gate. It is the whole contract, and it is cheap:

```bash
pnpm check        # tsc, eslint, unit tests, and every check below
```

Individually, when you are iterating on one of them:

```bash
pnpm exec tsc --noEmit      # types
pnpm exec eslint src scripts
pnpm vitest run             # unit tests, including the shared CSS helper
pnpm css:check              # the byte snapshot, over two frozen corpora
pnpm incremental:check      # incremental builds stay correct and local
pnpm behaviour:check        # a real browser resolves a real carrier
```

**`behaviour:check` is not optional, and it is not a duplicate of the others.** Every
harness above reads emitted *text*: the snapshot compares bytes, the structural metrics
count declarations, the incremental harness watches a list grow. A page can pass all of
them while a browser does nothing — that has happened twice here. It happened most
recently with the aggregate published on `:root`, where the CSS looked plausible, the
snapshot was green, 123 unit tests passed, and every carrier resolved
`animation-name: none`, because a `var()` chain inside a custom property resolves where
it is *declared* and the slot variables are element-local. `behaviour:check` compiles
the canonical corpus, loads it in Chromium, and asserts the resolved `animation-name` of
real carriers. If you change where data is declared, or how an element reads it, this is
the check that knows.

- [ ] Read and understand the design philosophy
- [ ] Verify CSS property names on MDN
- [ ] Check for similar existing implementations
- [ ] Add utilities in alphabetical order
- [ ] Test with arbitrary values
- [ ] Ensure TypeScript types are correct
- [ ] `pnpm check` passes
- [ ] Include examples in your PR description

---

## Quality Standards

### Performance
- Consider bundle size impact
- Prefer GPU-accelerated transforms
- Use CSS custom properties efficiently

### Accessibility  
- Respect `prefers-reduced-motion`
- Test with screen readers when relevant
- Provide reduced-motion alternatives for complex animations

### Browser Support
- Target modern browsers (Chrome 88+, Firefox 89+, Safari 14+)
- Test cross-browser before submitting

### Documentation
- Clear examples for new features
- Update README if adding major functionality
- Explain the "why" in PR descriptions

---

## Examples of Good Contributions

### ✅ Adding backdrop-filter-hue-rotate

```typescript
// properties/match.ts (alphabetically placed)
'animate-backdrop-filter-hue-rotate': {
  property: value => ({
    '--jumi-backdrop-filter-hue-rotate': value,
  }),
  type: 'angle',
},
```

**Why this is good:**
- Exact CSS property name
- Maintains hierarchical relationship with `backdrop-filter`
- Supports arbitrary values: `animate-backdrop-filter-hue-rotate-[45deg]`

### ✅ Adding elastic-bounce effect

```typescript
// keyframes/effects.ts
'elastic-bounce': {
  '0%': {
    transform: 'scale(0) translateY(100%)',
    opacity: '0',
  },
  '60%': {
    transform: 'scale(1.1) translateY(-10%)',
    opacity: '1',
  },
  '80%': {
    transform: 'scale(0.95) translateY(5%)',
  },
  '100%': {
    transform: 'scale(1) translateY(0)',
    opacity: '1',
  },
},
```

**Why this is good:**
- Descriptive hyphenated name
- Natural motion curve with overshoot
- Includes opacity for entrance effect

---

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/your-repo/discussions)
- **Found a bug?** Create an [Issue](https://github.com/your-repo/issues) with a minimal reproduction
- **Feature request?** Propose it in an issue first before implementing

---

## Need Clarification?

If you're unsure about:
- Whether to abbreviate a name → Don't abbreviate
- How to name a new property → Use the exact CSS property name
- Whether to create a custom variant → Use Tailwind's `:is()`, `:has()`, `:where()`

When in doubt, ask! We're here to help.

---

**Thank you for helping make web animations more accessible and delightful!**