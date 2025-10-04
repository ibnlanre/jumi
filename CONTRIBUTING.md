# Contributing to Jumi

Thank you for your interest in contributing to Jumi! This document outlines our development philosophy, coding standards, and contribution guidelines.

## 🎯 Philosophy of Utility Class Design

Jumi follows a distinct philosophy in naming and structuring utility classes that prioritizes clarity, consistency, and developer experience. Understanding these principles is crucial for maintaining the project's coherence.

### Core Principles

#### 1. **CSS Property Fidelity**
Utility class names should mirror their corresponding CSS property names as closely as possible.

**✅ Good Examples:**
- `animate-background-color-blue-500` → `background-color: theme(colors.blue.500)`
- `animate-width-full` → `width: 100%`
- `animate-backdrop-filter-drop-shadow-blur-md` → `backdrop-filter: drop-shadow(...)`
- `animate-border-radius-full` → `border-radius: 9999px`

**❌ Avoid:**
- `animate-bg-red-500` (abbreviates `background-color`)
- `animate-items-center` (too abbreviated from `align-items`)
- `animate-drop-blur-md` (loses the context of `backdrop-filter-drop-shadow`)

#### 2. **Relationship Selectors with Tailwind v4 Variants**
Prefer Tailwind v4’s built-in relationship variants for selector logic over custom natural-language variants.

**Use:**
- `is-[h1]:...` for matching a child/descendant element
- `has-[>img]:...` for parent that has a direct child selector
- `where-[.card]:...` to group selectors without increasing specificity

These keep class names precise while leveraging standardized Tailwind mechanisms.

#### 3. **Minimal Abbreviations**
Abbreviations should be kept to an absolute minimum, with exceptions only for universally understood conventions.

**Acceptable Abbreviations:**
- `x`, `y`, `z` for spatial axes (e.g., `translate-x`, `offset-y`, `rotate-z`)
- Established CSS shorthand (e.g., `margin`, `padding` instead of expanding all sides)

**Rationale:** Full names improve code readability, reduce cognitive load, and make the codebase more accessible to developers with varying experience levels.

#### 4. **Hierarchical Naming**
When CSS properties have sub-properties or variations, maintain the hierarchical relationship in the class name.

**Examples:**
- `backdrop-filter-drop-shadow` → `backdrop-filter-drop-shadow-blur`, `backdrop-filter-drop-shadow-color`
- `border-image` → `border-image-outset`, `border-image-repeat`
- `mask-border` → `mask-border-slice`, `mask-border-width`

#### 5. **Semantic Clarity Over Brevity**
Prioritize clarity and semantic meaning over shorter class names.

**✅ Preferred:**
```html
<div class="animate-backdrop-filter-drop-shadow-offset-x-4 animate-backdrop-filter-drop-shadow-color-blue-500">
```

**❌ Avoid:**
```html
<div class="animate-bd-drop-x-4 animate-bd-drop-blue-500">
```

#### 6. **Selector Naming Guidance**
Use Tailwind’s `is-*`, `has-*`, and `where-*` to express relationships; avoid inventing new natural-language variants.

**Examples:**
```html
<div class="is-[h1]:text-blue-500">...</div>
<nav class="has-[>button]:space-x-4">...</nav>
<section class="where-[.card]:p-4">...</section>
```

### Animation-Specific Conventions

#### Effect Animations
Effect animation names should be descriptive, hyphenated, and consistent:

- `bounce-in` (not `bounceIn`)
- `slide-in-{direction}`, `slide-out-{direction}` (e.g., `slide-in-left`)
- `zoom-in`, `zoom-out`
- `fade-in`, `fade-out`
- `arc-top-left`, `arc-bottom-right`
- `skew-{direction}` (e.g., `skew-left`, `skew-right`)

#### Property Animations
Property animations follow the pattern: `animate-{css-property}-{value}`

- `animate-opacity-50` → animates to `opacity: 0.5`
- `animate-width-full` → animates to `width: 100%`
- `animate-background-color-red-500` → animates to `background-color: red`

### Implementation Guidelines

#### TypeScript Patterns
All utility definitions should follow established patterns:

```typescript
'animate-property-name': {
  property: value => ({
    '--jumi-property-name': value,
    // register variables and keyframes via the shared creator so both are emitted together
  }),
  type: 'appropriate-type',
  // prefer theme tokens where applicable (e.g., colors, spacing)
},
```

#### Alphabetical Organization
Properties must be organized alphabetically within their files to maintain consistency and ease of navigation.

#### Value Mapping
Use Tailwind v4 theme tokens when appropriate:
- Colors (e.g., theme colors)
- Spacing
- Timing: `animationDelay`, `animationDuration`

### File Structure Philosophy

```
src/
├── keyframes/
│   ├── effects.ts     # Named effect animations (bounce-in, slide-out, etc.)
│   └── property.ts    # Property-based keyframes
├── properties/
│   ├── match.ts       # Main utility definitions
│   └── add.ts         # Additional utilities
├── theme/             # Theme value definitions
├── variants/          # Relationship helpers if needed (prefer Tailwind :is() / :has())
└── variables/         # CSS custom property definitions
```

### Contributing Guidelines

#### Before Contributing

1. **Read the Philosophy**: Ensure you understand our naming conventions
2. **Check Existing Patterns**: Look for similar implementations in the codebase
3. **Verify CSS Property Names**: Reference MDN documentation for exact property names

#### Making Changes

1. **Property Additions**: Add new properties in alphabetical order within `match.ts`
2. **Effect Animations**: Add to `effects.ts` with descriptive, hyphenated names
3. **Type Definitions**: Update TypeScript types when adding new property categories
4. **Tests**: Include relevant test cases for new functionality

#### Code Style

- Use consistent indentation (2 spaces)
- Follow alphabetical ordering
- Include JSDoc comments for complex functions
- Maintain TypeScript strict mode compliance

#### Naming New Properties

When adding support for new CSS properties:

1. **Check CSS Specification**: Use the exact property name from CSS specs
2. **Handle Sub-properties**: Maintain hierarchical relationships
3. **Consider Logical Groupings**: Group related properties together
4. **Test Edge Cases**: Ensure arbitrary values work correctly

### Examples of Good Contributions

#### Adding a New CSS Property
```typescript
'animate-scroll-margin-top': {
  property: value => ({
    '--jumi-scroll-margin-top': value,
    // register scroll-margin-top keyframes via the shared creator
  }),
  // values: spacing tokens or arbitrary values
},
```

#### Adding a New Effect Animation
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

### Quality Standards

- **Consistency**: Follow established patterns without deviation
- **Documentation**: Include clear examples and use cases
- **Performance**: Consider the impact on bundle size and runtime performance
- **Accessibility**: Respect user preferences for reduced motion
- **Browser Support**: Ensure compatibility with modern browsers

### Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Create an issue with minimal reproduction case
- **Features**: Propose new features through issues first

By following these guidelines, we maintain Jumi's high quality and ensure that it remains intuitive and powerful for all developers. Thank you for contributing to making web animations more accessible and enjoyable!