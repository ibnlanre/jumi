---
applyTo: '**'
---

# Jumi Development Instructions for LLMs

These instructions guide AI assistants working on the Jumi animation library codebase. Follow these principles and patterns to maintain consistency with the project's philosophy.

## Core Philosophy

### 1. CSS Property Fidelity
**Always use the exact CSS property name from the specification.**

```typescript
// ✅ CORRECT - Exact CSS property names
'animate-background-color-{color}': { ... }
'animate-border-radius-{size}': { ... }
'animate-backdrop-filter-blur-{size}': { ... }
'animate-transform-origin-{position}': { ... }

// ❌ WRONG - Abbreviated or modified names
'animate-bg-{color}': { ... }
'animate-radius-{size}': { ... }
'animate-blur-{size}': { ... }
'animate-origin-{position}': { ... }
```

**Verification:** Always check MDN (https://developer.mozilla.org/en-US/docs/Web/CSS) for the canonical CSS property name before adding a new utility.

### 2. Minimal Abbreviations
Only abbreviate when universally understood or part of CSS convention.

```typescript
// ✅ ACCEPTABLE abbreviations
'animate-translate-x-{distance}': { ... }  // x, y, z for axes
'animate-rotate-z-{angle}': { ... }

// ❌ AVOID custom abbreviations
'animate-pos-{position}': { ... }          // Use 'position'
'animate-disp-{display}': { ... }          // Use 'display'
'animate-txt-{value}': { ... }             // Use 'text-*'
```

### 3. Hierarchical Naming
Maintain parent-child relationships in property names.

```typescript
// ✅ CORRECT - Preserves hierarchy
'animate-backdrop-filter-blur-{size}': { ... }
'animate-backdrop-filter-brightness-{value}': { ... }
'animate-backdrop-filter-contrast-{value}': { ... }
'animate-border-image-slice-{value}': { ... }
'animate-border-image-width-{size}': { ... }

// ❌ WRONG - Loses context
'animate-blur-{size}': { ... }              // Which blur?
'animate-brightness-{value}': { ... }       // Filter or adjustment?
'animate-image-slice-{value}': { ... }      // What image?
```

### 4. Effect Animation Naming
Use descriptive, hyphenated names for effect animations.

```typescript
// ✅ CORRECT - Clear, descriptive, hyphenated
'bounce-in'
'slide-in-left'
'fade-out-up'
'arc-in-bottom-right'
'wipe-in-top-left'
'iris-out-center'

// ❌ WRONG - CamelCase, unclear, abbreviated
'bounceIn'
'slideL'
'fadeUp'
'arcBR'
'wipeT'
```

## Pattern Recognition & Implementation

### Property Animation Pattern

When adding a new CSS property animation:

```typescript
// Standard pattern in properties/match.ts
'animate-{css-property}-{value}': {
  property: (value) => ({
    '--jumi-{css-property}': value,
    // Register keyframes via shared creator
  }),
  type: '{appropriate-type}', // 'color' | 'length' | 'angle' | etc.
},
```

**Examples:**

```typescript
'animate-scroll-margin-top-{size}': {
  property: (value) => ({
    '--jumi-scroll-margin-top': value,
  }),
  type: 'length',
},

'animate-outline-color-{color}': {
  property: (value) => ({
    '--jumi-outline-color': value,
  }),
  type: 'color',
},

'animate-z-index-{value}': {
  property: (value) => ({
    '--jumi-z-index': value,
  }),
  type: 'number',
},
```

### Effect Animation Pattern

When adding a new effect animation in `keyframes/effects.ts`:

```typescript
// Standard keyframe structure
'{effect-name}': {
  '0%': {
    // Initial state
    opacity: '0',
    transform: 'scale(0.3)',
  },
  '50%': {
    // Mid-point (optional)
    opacity: '1',
    transform: 'scale(1.05)',
  },
  '100%': {
    // Final state
    opacity: '1',
    transform: 'scale(1)',
  },
},
```

**Categories & Examples:**

```typescript
// ENTRANCE: Elements appearing
'fade-in': { ... }
'slide-in-up': { ... }
'bounce-in-left': { ... }
'iris-in-center': { ... }

// EXIT: Elements leaving
'fade-out': { ... }
'slide-out-down': { ... }
'zoom-out-right': { ... }

// ATTENTION: Looping focus effects
'pulse': { ... }
'shake': { ... }
'float': { ... }

// EMPHASIS: One-time highlights
'bounce': { ... }
'flash': { ... }
'pop': { ... }

// PRESENTATION: Mask/clip-path reveals
'wipe-in-left': { ... }
'iris-out-center': { ... }
'curtain-in-vertical': { ... }
```

### Transform Composition Pattern

Transforms should be composable via CSS custom properties:

```typescript
// Individual transform utilities
'animate-translate-x-{distance}': {
  property: (value) => ({
    '--jumi-translate-x': value,
  }),
  type: 'length',
},

'animate-rotate-{angle}': {
  property: (value) => ({
    '--jumi-rotate': value,
  }),
  type: 'angle',
},

'animate-scale-{value}': {
  property: (value) => ({
    '--jumi-scale': value,
  }),
  type: 'number',
},
```

These compose naturally in HTML:
```html
<div class="animate-translate-x-[20px] animate-rotate-45 animate-scale-110">
  <!-- All transforms apply simultaneously -->
</div>
```

## Type System Guidelines

### Adding to Type Definitions

When adding new properties, update the corresponding TypeScript types:

```typescript
// types/attributes.ts or similar
export type AnimatableProperty = 
  | 'background-color'
  | 'border-radius'
  | 'opacity'
  | 'width'
  // Add new property here (alphabetically)
  | 'your-new-property'
  ;

export type Effect =
  | 'fade-in'
  | 'bounce-in'
  // Add new effect here (alphabetically within category)
  | 'your-new-effect'
  ;
```

**If you encounter a type error:**
1. Verify the CSS property name is correct
2. Add the property to the appropriate type definition
3. Ensure the property is in the correct alphabetical position

## File Organization

### Where Things Go

```
src/
├── keyframes/
│   ├── effects.ts        # Add effect animations here
│   │                     # (fade-in, bounce-in, wipe-in-left, etc.)
│   └── property.ts       # Property-based keyframe generators
│
├── properties/
│   ├── match.ts          # Add new CSS property utilities here
│   │                     # (animate-width, animate-color, etc.)
│   └── add.ts            # Additional utility definitions
│
├── theme/                # Timing, easing, and theme values
├── variants/             # Relationship variants (prefer Tailwind's :is/:has)
├── variables/            # CSS custom property definitions
└── types/                # TypeScript type definitions
```

### Alphabetical Organization

**IMPORTANT:** All properties must be organized alphabetically within their sections.

```typescript
// ✅ CORRECT - Alphabetical
'animate-background-color-{color}': { ... },
'animate-border-radius-{size}': { ... },
'animate-color-{color}': { ... },
'animate-opacity-{value}': { ... },
'animate-width-{size}': { ... },

// ❌ WRONG - Random order
'animate-width-{size}': { ... },
'animate-background-color-{color}': { ... },
'animate-opacity-{value}': { ... },
'animate-color-{color}': { ... },
'animate-border-radius-{size}': { ... },
```

**Note:** Disregard ordering errors when they appear. If a new addition seems misplaced, ignore it—the linter may have repositioned it for optimization. Focus on incorporating the properties correctly.

## Value Type Mapping

Use appropriate types for different CSS properties:

```typescript
// Colors - Use Tailwind theme
type: 'color'
// Examples: blue-500, red-600, [#ff0000]

// Lengths/Sizes - Use spacing tokens
type: 'length'
// Examples: 4, 8, [20px], [calc(100%-2rem)]

// Angles - Use angle values
type: 'angle'
// Examples: 45, [23deg], [0.25turn], [1.5rad]

// Numbers - Unitless values
type: 'number'
// Examples: 1.5, 0.5, 100

// Timing - Milliseconds
type: 'time'
// Examples: 300, 1000, [350ms]

// Custom - For complex values
type: 'custom'
// Arbitrary values only
```

## Per-Property Modifiers

Support per-property timing overrides:

```typescript
// Pattern: animation-{property}-{ms}/{css-property}
'animation-duration-{ms}/{property}': {
  // Allows: animation-duration-600/rotate animation-duration-300
  // Result: rotate takes 600ms, everything else 300ms
},

'animation-delay-{ms}/{property}': {
  // Allows: animation-delay-150/opacity animation-delay-0
  // Result: opacity delays 150ms, everything else starts immediately
},
```

## Stagger Animation System

Implement stagger with CSS calc():

```typescript
// Forward stagger pattern
'animation-delay-forward-{interval}/{count}': {
  // Creates delays: 0ms, interval*1, interval*2, ..., interval*(count-1)
  // Example: animation-delay-forward-100/5
  // Child 1: 0ms, Child 2: 100ms, Child 3: 200ms, Child 4: 300ms, Child 5: 400ms
},

// Backward stagger pattern
'animation-delay-backward-{interval}/{count}': {
  // Creates delays in reverse: interval*(count-1), ..., interval*1, 0ms
  // Example: animation-delay-backward-150/4
  // Child 1: 450ms, Child 2: 300ms, Child 3: 150ms, Child 4: 0ms
},
```

## Tailwind v4 Integration

### Use Built-in Relationship Variants

**DO:** Leverage Tailwind v4's `:is()`, `:has()`, `:where()` variants

```html
✅ CORRECT
<div class="is-[h1]:animate-fade-in">
<nav class="has-[>button]:animate-scale-110">
<section class="where-[.active]:animate-glow">
```

**DON'T:** Create custom natural-language selector variants

```html
❌ AVOID
<div class="child-h1:animate-fade-in">
<nav class="contains-button:animate-scale-110">
<section class="when-active:animate-glow">
```

### Respect Motion Preferences

Always consider accessibility:

```typescript
// Utilities should work with motion-safe/motion-reduce
// These are built into Tailwind v4

// Example usage:
<div class="motion-safe:animate-bounce-in motion-reduce:animate-fade-in">
  // Bounces for users who allow motion
  // Fades for users who prefer reduced motion
</div>
```

## Common Tasks

### Adding a Missing CSS Property

1. **Verify on MDN:** Confirm exact property name
2. **Open `properties/match.ts`**
3. **Find alphabetical position**
4. **Add using standard pattern:**

```typescript
'animate-{property-name}-{value}': {
  property: (value) => ({
    '--jumi-{property-name}': value,
  }),
  type: 'appropriate-type',
},
```

5. **Update type definitions if needed**
6. **Test with arbitrary value:** `animate-{property}-[custom-value]`

### Adding a New Effect Animation

1. **Choose descriptive hyphenated name**
2. **Determine category:** entrance, exit, attention, emphasis, or presentation
3. **Open `keyframes/effects.ts`**
4. **Add keyframe definition:**

```typescript
'{effect-name}': {
  '0%': { /* initial state */ },
  '50%': { /* optional mid-point */ },
  '100%': { /* final state */ },
},
```

5. **Update Effect type in type definitions**
6. **Document motion characteristics** (spring, linear, elastic, etc.)

### Adding a Presentation/Mask Effect

1. **Use clear descriptive name:** `wipe`, `iris`, `curtain`, `barn-door`, etc.
2. **Include direction:** `-in` vs `-out`, plus directional suffix
3. **Use `clip-path` for mask animations:**

```typescript
'wipe-in-left': {
  '0%': {
    'clip-path': 'inset(0 100% 0 0)',
  },
  '100%': {
    'clip-path': 'inset(0 0 0 0)',
  },
},
```

4. **Consider origin points:** `-center`, `-top-left`, `-bottom-right`, etc.

### Handling Type Errors

**If a valid CSS property triggers an error:**
- The property is missing from either the Attributes or Property type
- Update the corresponding type definition
- Add the property alphabetically

```typescript
// Find the type file (e.g., types/index.ts)
export type AnimatableProperty = 
  | 'existing-property-1'
  | 'existing-property-2'
  // Add new property alphabetically here
  | 'your-new-property'
  | 'existing-property-3'
  ;
```

## Quality Checklist

Before submitting changes, verify:

- [ ] Property name matches CSS specification exactly
- [ ] No unnecessary abbreviations
- [ ] Hierarchical relationships preserved
- [ ] Alphabetical ordering maintained (or ignore linter repositioning)
- [ ] Type definitions updated
- [ ] Arbitrary values supported: `[custom-value]`
- [ ] Tailwind theme tokens used where applicable
- [ ] Works with motion preferences (motion-safe/motion-reduce)
- [ ] Effect animations use hyphenated names
- [ ] Transforms are composable
- [ ] Per-property modifiers work: `/property` syntax
- [ ] Documentation comments added for complex logic

## Examples of Common Additions

### Adding `scroll-padding-top`

```typescript
// In properties/match.ts (alphabetically placed)
'animate-scroll-padding-top-{size}': {
  property: (value) => ({
    '--jumi-scroll-padding-top': value,
  }),
  type: 'length',
},
```

### Adding `mix-blend-mode`

```typescript
'animate-mix-blend-mode-{mode}': {
  property: (value) => ({
    '--jumi-mix-blend-mode': value,
  }),
  type: 'custom', // Enum values like 'multiply', 'screen', etc.
},
```

### Adding `curtain-in-horizontal` effect

```typescript
// In keyframes/effects.ts
'curtain-in-horizontal': {
  '0%': {
    'clip-path': 'inset(0 50% 0 50%)',
  },
  '100%': {
    'clip-path': 'inset(0 0 0 0)',
  },
},
```

## Reference Resources

- **CSS Properties:** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
- **Animatable Properties:** https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties
- **Clip-path Examples:** https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path
- **Easing Functions:** https://easings.net/
- **Tailwind v4 Docs:** https://tailwindcss.com/docs

## Summary

1. **Use exact CSS property names** (no abbreviations except x/y/z)
2. **Maintain hierarchical relationships** in nested properties
3. **Organize alphabetically** within sections
4. **Use hyphenated names** for effect animations
5. **Support composition** through CSS custom properties
6. **Leverage Tailwind v4** built-in variants
7. **Consider accessibility** with motion preferences
8. **Update type definitions** when adding new properties
9. **Test with arbitrary values** to ensure flexibility
10. **Document complex logic** with JSDoc comments

---

**Remember:** Consistency is key. When in doubt, find a similar existing property or effect and follow its pattern exactly.