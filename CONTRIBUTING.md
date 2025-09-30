# Contributing to Jumi

Thank you for your interest in contributing to Jumi! This document outlines our development philosophy, coding standards, and contribution guidelines.

## 🎯 Philosophy of Utility Class Design

Jumi follows a distinct philosophy in naming and structuring utility classes that prioritizes clarity, consistency, and developer experience. Understanding these principles is crucial for maintaining the project's coherence.

### Core Principles

#### 1. **CSS Property Fidelity**
Utility class names should mirror their corresponding CSS property names as closely as possible.

**✅ Good Examples:**
- `animate-background-color-red-500` → `background-color: red`
- `animate-align-content-center` → `align-content: center`
- `animate-backdrop-filter-drop-shadow-blur-md` → `backdrop-filter: drop-shadow(...)`
- `animate-border-bottom-left-radius-lg` → `border-bottom-left-radius: ...`

**❌ Avoid:**
- `animate-bg-red-500` (abbreviates `background-color`)
- `animate-items-center` (too abbreviated from `align-items`)
- `animate-drop-blur-md` (loses the context of `backdrop-filter-drop-shadow`)

#### 2. **Natural Language Over Technical Syntax**
Jumi prioritizes human-readable class names that express intent in natural language rather than requiring deep CSS knowledge.

**Philosophy:** CSS selectors and relationships should be expressible in plain English, making the codebase more accessible to developers of all skill levels and reducing the mental overhead of understanding complex selector relationships.

**Examples:**
- `if-child-is-h1` instead of requiring knowledge of `& h1`
- `if-next-sibling-is-p` instead of memorizing `& + p`
- `if-direct-child-is-button` instead of understanding `& > button`

This approach transforms CSS from a technical requirement into an intuitive, self-documenting language that expresses design intent clearly.

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

#### 6. **Natural Language Patterns**
When possible, use natural language constructs that read like English sentences, making CSS relationships more intuitive.

**✅ Examples from Jumi:**
```html
<!-- Reads like: "if child is h1, then apply styles" -->
<div class="if-child-is-h1:text-blue-500">
  <h1>This will be blue</h1>
</div>

<!-- Reads like: "if direct child is button, then apply styles" -->
<nav class="if-direct-child-is-button:space-x-4">
  <button>Home</button>
  <button>About</button>
</nav>

<!-- Reads like: "if next sibling is p, then apply styles" -->
<h2 class="if-next-sibling-is-p:mb-2">Title</h2>

<!-- Reads like: "if sibling is img, then apply styles" -->
<div class="if-sibling-is-img:flex">
  <p>Text content</p>
  <img src="..." alt="...">
</div>
```

**Rationale:** Natural language patterns reduce the cognitive overhead of understanding CSS relationships. Instead of memorizing cryptic selectors like `& > *` or `& + *`, developers can read the class name and immediately understand the relationship being targeted.

**Traditional CSS vs. Natural Language:**
```css
/* Traditional approach - requires CSS knowledge */
.parent > button { /* direct child selector */ }
.element + p { /* adjacent sibling selector */ }
.element ~ img { /* general sibling selector */ }

/* Jumi's natural language approach - self-documenting */
.if-direct-child-is-button { /* immediately clear */ }
.if-next-sibling-is-p { /* reads like English */ }
.if-sibling-is-img { /* intuitive relationship */ }
```

#### Designing New Natural Language Patterns

When creating new variants or utilities that involve relationships or conditions, follow these guidelines:

**Pattern Structure:**
- Start with a condition word: `if`, `when`, `has`, `not`
- Follow with the relationship: `child-is`, `parent-is`, `sibling-is`, `ancestor-is`
- Use descriptive qualifiers: `direct-child`, `next-sibling`, `previous-sibling`

**Examples of Good Patterns:**
```css
/* Conditional relationships */
if-child-is-{element}          /* & {element} */
if-direct-child-is-{element}   /* & > {element} */
if-next-sibling-is-{element}   /* & + {element} */
if-sibling-is-{element}        /* & ~ {element} */

/* State-based patterns (potential future additions) */
when-hover-has-{element}       /* &:hover {element} */
if-focus-within-{element}      /* &:focus-within {element} */
```

**Readability Test:** The class name should read naturally when spoken aloud:
- ✅ "if child is h1" (clear and natural)
- ✅ "if direct child is button" (specific and understandable)
- ❌ "child-h1" (missing context)
- ❌ "direct-btn" (abbreviated and unclear)

### Animation-Specific Conventions

#### Effect Animations
Effect animation names should be descriptive and intuitive:

- `bounce-in`, `bounce-out` (not `bounceIn`, `bounceOut`)
- `slide-in-left`, `slide-out-right` (directional clarity)
- `zoom-in`, `zoom-out` (not `zoomIn`, `zoomOut`)
- `fade-in-up`, `fade-out-down` (combined motions)

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
    '--jumi-property-name-keyframes': create.animation('property-name'),
  }),
  type: 'appropriate-type',
  values: getValues('themeKey'),
},
```

#### Alphabetical Organization
Properties must be organized alphabetically within their files to maintain consistency and ease of navigation.

#### Value Mapping
Use Tailwind's existing theme values when appropriate:
- Colors: `getValues('colors')`
- Spacing: `getValues('spacing')`
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
├── variants/          # Custom variants (if-child-is, etc.)
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
    '--jumi-scroll-margin-top-keyframes': create.animation('scroll-margin-top'),
  }),
  values: getValues('spacing'),
},
```

#### Adding a New Effect Animation
```typescript
'spring-bounce-in': {
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