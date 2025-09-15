# Jumi Enhanced Architecture Migration Guide

This guide explains how to migrate from the traditional Jumi animation system to the new enhanced architecture inspired by TailwindCSS patterns.

## Overview of Changes

The new architecture introduces several key improvements:

1. **CSS Custom Property Composition** - Similar to TailwindCSS's `cssTransformValue` pattern
2. **Standardized Utility Plugin Creator** - Consistent API for creating utilities
3. **Composable Animations** - Multiple animations can work together seamlessly
4. **Enhanced Type Safety** - Better IntelliSense and type checking
5. **Performance Optimizations** - More efficient CSS generation

## Key Architectural Patterns

### 1. CSS Custom Property Composition

**Old Pattern:**

```scss
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation-name: fadeIn;
}
```

**New Pattern:**

```scss
@keyframes jumi-opacity {
  to {
    opacity: var(--jumi-opacity-to, 1);
  }
}

.animate-opacity-50 {
  --jumi-opacity-to: 0.5;
  animation-name: jumi-opacity;
}
```

### 2. Composable Transform Utilities

**Old Pattern (Individual animations):**

```html
<!-- Separate animations that don't compose -->
<div class="animate-slide-in-right">
  <div class="animate-scale-up"></div>
</div>
```

**New Pattern (Composable):**

```html
<!-- Multiple transforms that compose into a single animation -->
<div class="animate-translate-x-4 animate-scale-110 animate-rotate-12"></div>
```

**Generated CSS:**

```css
.animate-translate-x-4 {
  @defaults jumi-transform;
  --jumi-translate-x: 1rem;
  animation-name: jumi-translate-x;
}

@keyframes jumi-translate-x {
  to {
    transform: translateX(var(--jumi-translate-x, 0)) translateY(
        var(--jumi-translate-y, 0)
      )
      scale(var(--jumi-scale-x, 1), var(--jumi-scale-y, 1)) rotate(
        var(--jumi-rotate, 0deg)
      );
  }
}
```

### 3. Enhanced Plugin Creation

**Old Pattern:**

```typescript
// Manual utility creation
function createOpacityUtilities(api: PluginAPI) {
  api.addUtilities({
    ".animate-fade-in": {
      "animation-name": "fadeIn",
    },
    ".animate-fade-out": {
      "animation-name": "fadeOut",
    },
  });
}
```

**New Pattern:**

```typescript
// Standardized plugin creator
const opacityUtilities = createJumiUtilityPlugin(
  "opacity",
  [
    {
      classPrefix: "animate-opacity",
      properties: ["opacity"],
    },
  ],
  {
    type: "number",
    defaultProperties: {
      "--jumi-opacity-from": "0",
      "--jumi-opacity-to": "1",
    },
  }
);
```

## Migration Steps

### Step 1: Update Utility Creation

Replace manual utility creation with the new plugin system:

```typescript
// Before
function createWidthUtilities({ addUtilities, theme }: PluginAPI) {
  const widthValues = theme("jumi.dimensions") ?? defaultTheme.dimensions;
  const utilities: Record<string, any> = {};

  Object.entries(widthValues).forEach(([key, value]) => {
    utilities[`.animate-w-${key}`] = {
      "animation-name": "width-grow",
      "--width-target": value,
    };
  });

  addUtilities(utilities);
}

// After
const widthUtilities = createJumiUtilityPlugin(
  "width",
  [
    {
      classPrefix: "animate-w",
      properties: ["width"],
    },
  ],
  {
    type: "length",
    supportsNegativeValues: false,
  }
);
```

### Step 2: Add CSS Custom Property Defaults

```typescript
// Before - No default management
// Keyframes had hardcoded values

// After - Centralized defaults
import { addJumiDefaults } from "./utils/enhancedUtilities";

// In your plugin
addJumiDefaults()(api);
```

### Step 3: Update Keyframe Definitions

```scss
// Before - Individual keyframes
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes scaleUp {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

// After - Composed keyframes
@keyframes jumi-translate-x {
  to {
    transform: translateX(var(--jumi-translate-x, 0)) translateY(
        var(--jumi-translate-y, 0)
      )
      scale(var(--jumi-scale-x, 1), var(--jumi-scale-y, 1)) /* ... other transforms */;
  }
}
```

### Step 4: Update Type Definitions

```typescript
// Before - Basic PluginAPI
export interface PluginAPI {
  addUtilities: (utilities: Record<string, any>) => void;
  matchUtilities: (utilities: Record<string, any>) => void;
  // ...
}

// After - Enhanced PluginAPI with TailwindCSS features
export interface PluginAPI {
  addUtilities: (utilities: Record<string, any>) => void;
  matchUtilities: (
    utilities: Record<string, any>,
    options?: MatchUtilitiesOptions
  ) => void;
  addDefaults: (namespace: string, defaults: Record<string, string>) => void;
  // ...
}

export interface MatchUtilitiesOptions {
  supportsNegativeValues?: boolean;
  type?: string | string[];
  values?: Record<string, string>;
  // ...
}
```

## Usage Examples

### Basic Property Animation

```html
<!-- Old way -->
<div class="animate-fade-in animate-duration-300">
  <!-- New way -->
  <div class="animate-opacity-100 animate-duration-300"></div>
</div>
```

### Composed Animations

```html
<!-- Old way - Multiple separate animations -->
<div class="animate-slide-in-right animate-scale-up">
  <!-- New way - Single composed animation -->
  <div class="animate-translate-x-0 animate-scale-100"></div>
</div>
```

### Complex Multi-Property Animations

```html
<!-- New enhanced pattern -->
<div
  class="animate-w-64 animate-h-32 animate-bg-blue-500 animate-opacity-100 animate-duration-500 animate-ease-out"
></div>
```

### Filter Animations

```html
<!-- Composable filter effects -->
<div
  class="animate-blur-sm animate-brightness-110 animate-saturate-150 animate-duration-1000"
></div>
```

## Benefits of the New System

### 1. Better Performance

- CSS custom properties are more efficient than multiple animations
- Reduced CSS bundle size through property composition
- Browser optimizations for custom property changes

### 2. Enhanced Composability

- Multiple utilities can work together seamlessly
- No animation conflicts or overwrites
- Predictable stacking behavior

### 3. Improved Developer Experience

- Better IntelliSense support
- Type-safe value validation
- Consistent API patterns

### 4. TailwindCSS Alignment

- Follows established TailwindCSS patterns
- Compatible with TailwindCSS ecosystem tools
- Easier integration with existing TailwindCSS projects

### 5. Future-Proof Architecture

- Extensible plugin system
- Easy to add new properties and utilities
- Maintainable codebase structure

## Breaking Changes

### Removed Features

- Individual keyframe animations for simple properties
- Direct CSS generation patterns
- Hardcoded animation values

### Updated APIs

- `PluginAPI` interface now includes `addDefaults`
- `MatchUtilitiesOptions` includes `supportsNegativeValues`
- Utility creation now uses standardized plugin creator

### Migration Timeline

1. **Phase 1**: Add new enhanced utilities alongside existing ones
2. **Phase 2**: Update documentation and examples
3. **Phase 3**: Deprecate old patterns (with warnings)
4. **Phase 4**: Remove deprecated patterns in next major version

## Next Steps

1. **Integrate Enhanced Utilities**: Add the new utility system to your main plugin file
2. **Update Tests**: Ensure all tests pass with the new system
3. **Performance Testing**: Measure improvements in CSS bundle size and runtime performance
4. **Documentation**: Update all documentation to reflect new patterns
5. **Community Feedback**: Gather feedback on the new architecture
