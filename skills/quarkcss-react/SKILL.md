---
name: quarkcss-react
description: Use when a task involves @quarkcss/react or QuarkCSS in React, including adding, editing, extracting, reviewing, or choosing whether to create styled components, variants, compound variants, defaults, custom component wrappers, css composition, Tailwind conflict handling.
---

# QuarkCSS React

`@quarkcss/react` is a React styling layer for QuarkCSS core. It turns atomic class lists into typed React components with component-owned base styles, variants, compound variants, defaults, default props, and per-instance class extensions.

Use it to organize Tailwind-heavy JSX into named app primitives when the styling has a concept worth owning. It works alongside normal React `className`s and headless component libraries such as Radix or Base UI: pass the primitive to `styled(...)` when a named styling API, variants, or compatible default props make the component easier to use.

## When To Use It

- Inline `className`s are fine for simple, local layout and one-off scaffolding.
- Use QuarkCSS for custom styled components when naming the UI concept improves readability, reuse, or ownership.
- Reach for QuarkCSS when a class list is repeated, has variants, represents a stable app-specific primitive, or mixes base styles with per-instance extensions.
- Avoid wrapping every element in QuarkCSS just to avoid inline classes.
- Use variants and defaults for the component's owned styling API, and `cx` for one-off extensions on Quark component instances.

## Core API

```tsx
import { styled } from '@quarkcss/react'

// Intrinsic elements support tag shorthand.
const Bold = styled.span('font-bold')
// const Bold = styled.span({ base: 'font-bold' }) // same as above

// Base classes can be a string or string[] when variants are not needed.
const Center = styled.div('flex items-center justify-center', { 'aria-label': 'center' })

const Card = styled.div([
  'flex flex-col gap-4 p-6',     // layout
  'bg-white rounded-xl shadow',  // appearance
  'transition-all duration-200'  // animation
])

// The final argument sets default component props.
const SearchInput = styled.input('h-8 px-2 text-sm', {
  autoComplete: 'off',
  type: 'search',
})
```

Style input can be a `string`, `string[]`, a quark `css(...)` function, or a config object:

```tsx
const StyledCard = styled(Card, 'p-4 rounded-xl')
const StyledPanel = styled(Panel, ['flex flex-col gap-4', 'bg-white rounded-xl'])
const StyledInput = styled(Input, { base: 'block w-full', variants: { invalid: { true: 'border-red-500' } } })
```

Use arrays for long class lists and group classes by concern. Each array entry can contain multiple classes.

## Variants And Defaults

```tsx
const StyledButton = styled.button({
  base: 'inline-flex items-center justify-center font-medium transition-colors',
  variants: {
    size: {
      small: 'h-8 px-3 text-sm',
      medium: ['h-10 px-4', 'text-base'], // use arrays to organize multiple classes
      large: `
        h-12
        px-6
        text-lg
      `
    },
    color: {
      red: 'bg-red-500 text-white',
      blue: 'bg-blue-500 text-white'
    },

    // Use a lone `true` branch for opt-in boolean styling; unneeded: `false: ''`.
    loading: {
      true: 'opacity-60 pointer-events-none'
    },

    // Boolean variants can also use `false` or `null` keys for explicit falsey fallbacks.
    // Any `true`, `false`, or `null` key makes the prop optional.
    rounded: {
      true: 'rounded-full', // `rounded === true`
      false: 'rounded-none', // `rounded` is omitted, undefined, false, null, or 0

      // null: 'rounded-none', // (falsey fallback; `false` wins when both exist)

      // Additional keys can coexist with boolean keys.
      small: 'rounded-sm',
      medium: 'rounded-md'
    }
  },

  // Compound variants
  compound: [
    {
      size: 'small',
      color: 'red',
      class: 'border-2 border-red-500'
    },
    {
      size: 'medium',
      color: 'blue',
      className: 'border-2 border-blue-500'
    },
    {
      // Match multiple variant conditions, like cva's compoundVariants.
      size: ['small', 'medium'],
      color: 'red',
      value: 'hover:bg-red-600' // `value` is also supported for compatibility
    }
  ],

  // Defaults apply when a variant prop is omitted or undefined.
  // Defaulted keys are optional in QuarkVariantProps<typeof StyledButton>.
  defaults: {
    size: 'small',
    color: 'red'
  }
}, {
  // Default component props owned by this styled primitive.
  type: 'button'
})

<StyledButton size="medium" color="blue" loading>
  Click Me
</StyledButton>
```

Use variants for named visual concepts owned by the component. A variant should represent a styling decision the component API intentionally exposes, not just a way to toggle arbitrary classes.

Use `defaults` for normal enum defaults. Use `null` or `false` branches when falsey input should map to explicit fallback classes.

## Composition

### Custom Components

Pass custom components first. The next argument is the Quark style input; the final argument is default component props.

```tsx
import { motion } from 'framer-motion'

const MotionBox = styled(motion.div, {
  base: 'rounded-lg shadow'
}, {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 }
})
```

```tsx
import * as Slider from '@radix-ui/react-slider'

const StyledSlider = styled(Slider.Root, { /* ... */ })
```

React Native primitives are custom components, not intrinsic JSX tags:

```tsx
import { View } from 'react-native'

const Box = styled(View, { /* ... */})
```

Default component props must be compatible with the wrapped component. Otherwise compose with core CSS.

When styling headless primitives such as Radix or Base UI, pass the primitive directly to `styled(...)`. Use QuarkCSS for the app's styling API around the primitive, without replacing its behavior model.

### css And .CSS Reuse

```tsx
import { styled, css } from '@quarkcss/react'

// `css` is re-exported from @quarkcss/core.
const containercss = css({
  base: /* ... */,
  variants: { /* ... */ },
  compound: [ /* ... */ ],
  defaults: { /* ... */ }
})

const StyledContainer = styled.div(containercss)

// Retrieve quark css from a styled component.
expect(StyledContainer.CSS).toBe(containercss)
```

Use `.CSS` to reuse the same Quark CSS config with another base component and different default component props.

```tsx
const MotionContainer = styled(motion.div, StyledContainer.CSS, {
  initial: { x: -100 },
  animate: { x: 0 },
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 30
  }
})
```

## TypeScript

```ts
import type { ComponentProps } from 'react'
import { type QuarkVariantProps } from '@quarkcss/react'

type Variants = QuarkVariantProps<typeof StyledButton>
const variants: Variants = { color: 'blue', size: 'large', rounded: true }

interface VariantProps extends QuarkVariantProps<typeof StyledButton> {}

type StyledComponentProps = ComponentProps<typeof StyledButton>
```

`QuarkVariantProps` infers variant keys and values from the config. Props are optional when the variant key is in `defaults` or declares a `true`, `false`, or `null` branch.

## Styling Patterns

QuarkCSS should reduce noisy JSX, not hide every class string. In a Tailwind project, convert long repeated class lists, ternary class strings, and reusable component states into `styled` configs with variants when doing so makes the code easier to read, reuse, or change. Keep inline `className`s when the styling is simple, local, and clearer at the call site.

Use `cx` for per-instance customization. `cx` accepts a string, a string array, or an object map:

```tsx
<Button cx={['text-white', enabled && 'opacity-100']} />
<Button cx={{ hidden }} />
```

Prefer `cx` for per-instance class extensions on Quark components. Keep `className` available for React compatibility, prop forwarding, and external consumers that expect it.

When converting JSX or a UI primitive into a Quark component, review static props as well as `className`. Move compatible, component-owned defaults into the final `styled(...)` argument. Keep instance-specific identity, accessibility, controlled values, state, handlers, and children at the call site.

## Style Ownership And Tailwind Conflicts

Keep each style concern owned in one place. If a variant controls a concept, avoid repeating competing utilities in `base`, `className`, `cx`, or nested child components.

Quark appends class names in this order: `base`, `variants`, `compound`, then `className` and `cx`. It does not scope classes, apply CSS-in-JS specificity rules, or run `tailwind-merge` unless you opt into a plugin, so conflicting Tailwind utilities can both appear:

```tsx
const Button = styled.button({
  base: 'p-4',
  variants: {
    size: {
      large: 'p-8'
    }
  }
})

<Button size="large" />
// without merge: 'p-4 p-8'
// with @quarkcss/react/merge: 'p-8'
```

If size is variant-controlled, keep all sizing utilities inside the size variant and use `defaults` for the normal case:

```tsx
const Button = styled.button({
  base: 'inline-flex items-center justify-center',
  variants: {
    size: {
      small: 'h-8 px-3 text-sm',
      large: 'h-12 px-6 text-lg'
    }
  },
  defaults: {
    size: 'small'
  }
})
```

When one semantic choice drives several related values, use CSS variables instead of duplicating competing utilities. Variants should set the values; base styles and nested children should consume or inherit the resolved values.

Prefer this pattern when duplicating the same variant across composed children would spread ownership or risk visual drift:

```tsx
const Badge = styled.span({
  base: [
    'bg-(--badge-bg) text-(--badge-fg) ring-1 ring-inset ring-(--badge-ring)',
    '[--badge-bg:var(--muted)] [--badge-fg:var(--muted-foreground)] [--badge-ring:transparent]'
  ],
  variants: {
    tone: {
      danger: [
        '[--badge-bg:color-mix(in_oklch,var(--destructive)_12%,transparent)]',
        '[--badge-fg:var(--destructive)]',
        '[--badge-ring:color-mix(in_oklch,var(--destructive)_30%,transparent)]'
      ]
    }
  }
})
```

Pass the same variant through child components only when those children have independent styling responsibilities. Otherwise, let children inherit or consume the parent-owned variables.

Tailwind CSS v4 custom property shorthand like `bg-(--badge-bg)` expands to the equivalent `var(...)` arbitrary value; variable values can be explicit values or theme token vars.

For automatic conflict resolution in React projects that already depend on `tailwind-merge`, import the preconfigured entrypoint:

```tsx
import { styled } from '@quarkcss/react/merge'
```

Use `createStyled(twMerge)` when the app needs a custom `tailwind-merge` plugin setup.
