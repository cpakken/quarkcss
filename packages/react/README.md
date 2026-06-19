## Introduction

`@quarkcss/react` is a React styling layer for QuarkCSS core. It turns atomic class lists into typed React components with component-owned base styles, variants, compound variants, defaults, default props, and per-instance class extensions.

- Create fully-typed React styled components using atomic css classes.
- Organize your atomic css with variant props
  - Inspired by [`@stitches/react`](https://stitches.dev/docs/variants) api to generate atomic css classes
- Declare default variants, fallback variant branches, and default component props.
- Polymorphic and composable. Reuse quark styles from one component to another.

Use with your favorite atomic css library:
  - [Tailwindcss](https://tailwindcss.com/)
  - [cva](https://cva.style/docs)

For framework-agnostic styling, use [`@quarkcss/core`](https://github.com/cpakken/quarkcss/tree/master/packages/core)

## Install

```bash
bun add @quarkcss/react
```

## When To Use It

Inline `className`s are fine for simple, local layout and one-off scaffolding. Use QuarkCSS when naming the UI concept improves readability, reuse, or ownership.

Reach for QuarkCSS when a class list is repeated, has variants, represents a stable app-specific primitive, or mixes base styles with per-instance extensions. Avoid wrapping every element just to avoid inline classes.

Use variants and defaults for the component's owned styling API, and `cx` for one-off extensions on Quark component instances.

## Core API

```tsx
import { styled } from '@quarkcss/react'

// Prefer proxy shorthand for intrinsic elements; styled('span', 'font-bold') is equivalent.
const Bold = styled.span('font-bold')

// Base classes can be a string or string[] when variants are not needed.
const Center = styled.div('flex items-center justify-center', { 'aria-label': 'center' })

// Arrays are just an organization pattern; each entry can contain one or more classes.
const Card = styled.div([
  'flex flex-col gap-4 p-6',     // layout
  'bg-white rounded-xl shadow',  // appearance
  'transition-all duration-200'  // animation
])

// The final argument sets default component props.
const SearchInput = styled.input('h-8 px-2 text-sm', {
  autoComplete: 'off',
  type: 'search'
})
```

Style input can be a `string`, `string[]`, a quark `css(...)` function, or a config object:

```tsx
const StyledCard = styled(Card, 'p-4 rounded-xl')
const StyledPanel = styled(Panel, ['flex flex-col gap-4', 'bg-white rounded-xl'])
const StyledInput = styled(Input, { base: 'block w-full', variants: { invalid: { true: 'border-red-500' } } })
```

## Variants And Defaults

```tsx
import { styled } from '@quarkcss/react'

const StyledButton = styled.button({
  name: 'DisplayName/Button', // react-dev-tools display name
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

      // null: 'rounded-none', // falsey fallback; `false` wins when both exist

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

const Center = styled.div('flex items-center justify-center')
const Bold = styled.span('font-bold')

const App = () => {
  return (
    <Center>
      <StyledButton size="medium" color="blue" loading rounded>
        <Bold>Click Me</Bold>
      </StyledButton>
    </Center>
  )
}
```

Use variants for named visual concepts owned by the component. A variant should represent a styling decision the component API intentionally exposes, not just a way to toggle arbitrary classes.

Use `defaults` for normal enum defaults. Use `null` or `false` branches when falsey input should map to explicit fallback classes.

## Composition

### Custom Components

Pass custom components first. The second argument is the Quark style input; the third argument is default component props.

```tsx
// Motion components
import { motion } from 'framer-motion'

const MotionBox = styled(motion.div, {
  base: 'rounded-lg shadow'
}, {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 }
})

// Headless UI primitives
import { Button } from '@base-ui/react/button'

const StyledButton = styled(Button, { /* ... */ })

// React Native primitives are custom components, not intrinsic JSX tags.
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
StyledContainer.CSS === containercss // true

// Use `.CSS` to reuse the same Quark CSS config with another base component
// and different default component props.
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

## Extending Quark Components

Pass a Quark component to `styled(...)` to extend it directly. Quark merges the base component config with the extension config and renders the original underlying element or custom component.

```tsx
const Badge = styled.span({
  base: 'inline-flex items-center rounded px-2',
  variants: {
    tone: {
      neutral: 'bg-gray-100 text-gray-900',
      danger: 'bg-red-100 text-red-900'
    },
    size: {
      small: 'text-xs'
    }
  },
  defaults: {
    tone: 'neutral',
    size: 'small'
  }
}, {
  role: 'status'
})

const ActionBadge = styled(Badge, {
  base: 'cursor-pointer',
  variants: {
    tone: {
      danger: 'ring-1 ring-red-300',
      success: 'bg-green-100 text-green-900'
    },
    interactive: {
      true: 'hover:brightness-95'
    }
  },
  defaults: {
    tone: 'success'
  }
})
```

The merged component keeps the base variants and adds extension variants. When both configs define the same variant key and value, classes are appended in base-then-extension order. New variant values are added, compound variants are appended, and extension defaults override base defaults for the same key.

Default component props merge the same way: base props are kept unless the extension provides the same prop. `shouldForwardProp` filters also compose, so a prop filtered by the base component stays filtered in extensions.

## TypeScript

```ts
import type { ComponentProps } from 'react'
import { type QuarkVariantProps } from '@quarkcss/react'

type Variants = QuarkVariantProps<typeof StyledButton>
const variants = { color: 'blue', size: 'large', rounded: true } satisfies Variants

interface VariantProps extends QuarkVariantProps<typeof StyledButton> {}

type StyledComponentProps = ComponentProps<typeof StyledButton>
```

`QuarkVariantProps` infers variant keys and values from the config. Defaulted variants and boolean-style variants are optional.

## Styling Patterns

QuarkCSS should reduce noisy JSX, not hide every class string. In a Tailwind project, convert long repeated class lists, ternary class strings, and reusable component states into `styled` configs with variants when doing so makes the code easier to read, reuse, or change. Keep inline `className`s when the styling is simple, local, and clearer at the call site.

Use the JSX element shorthand for intrinsic elements:

```tsx
const Button = styled.button('bg-red-500 w-12')
```

Use arrays for long class lists and group classes by concern. Each array entry can contain multiple classes:

```tsx
const Card = styled.div([
  'flex flex-col gap-4 p-6',     // layout
  'bg-white rounded-xl shadow',  // appearance
  'transition-all duration-200'  // animation
])
```

Use `cx` for per-instance customization. `cx` accepts clsx-style values:

```tsx
<Button cx="bg-foreground text-background" />
<Button cx={['shadow-sm', enabled && 'opacity-100', { hidden, 'pointer-events-none opacity-60': loading }]} />
```

Prefer `cx` for per-instance class extensions on Quark components. Keep `className` available for React compatibility, prop forwarding, and external consumers that expect it.

When converting JSX or a UI primitive into a Quark component, review static props as well as `className`. Move compatible, component-owned defaults into the final `styled(...)` argument. Keep instance-specific identity, accessibility, controlled values, state, handlers, and children at the call site.

## Prop Filtering

Add `shouldForwardProp` to a styled config to prevent styling-only props from reaching the rendered component.

```tsx
const Input = styled.input({
  base: 'inline-flex items-center',
  variants: {
    size: {
      small: 'text-sm',
      large: 'text-lg'
    }
  },
  shouldForwardProp: ['size']
})
```

Variant props are consumed by default. Pass an array of variant keys to forward those props in addition to the default forwarded props.

Use a predicate for custom filtering:

```tsx
const Button = styled.button({
  base: 'inline-flex items-center',
  shouldForwardProp: (prop, defaultValidator) =>
    defaultValidator(prop) && prop !== 'busy'
})
```

The `defaultValidator` fallback preserves Quark's default behavior for all other props.

## Style Ownership And Tailwind Conflicts

Keep each style concern owned in one place. If a variant controls a concept, avoid repeating competing utilities in `base`, `className`, `cx`, or nested child components.

Quark appends class names in this order: `base`, `variants`, `compound`, then `className` and `cx`. It does not scope classes, apply CSS-in-JS specificity rules, or run `tailwind-merge` unless you opt into a plugin, so conflicting Tailwind utilities can both appear.

Prefer configs where each style concern has one owner. The next example intentionally contains conflicting utilities to show merge behavior. This can be useful for composed components, consumer overrides, or resilience against styling mistakes, but avoid relying on conflicts when the config can be organized cleanly.

```tsx
const Button = styled.button({
  base: 'rounded-md bg-slate-900 px-3',
  variants: {
    size: {
      large: 'px-5'
    },
    tone: {
      danger: 'bg-red-600'
    }
  }
})

<Button size="large" tone="danger" cx="px-6" />
// without merge: 'rounded-md bg-slate-900 px-3 px-5 bg-red-600 px-6'
// with @quarkcss/react/merge: 'rounded-md bg-red-600 px-6'
```

If a style concern is variant-controlled, keep that concern's utilities inside its variant and use `defaults` for the normal cases:

```tsx
const Button = styled.button({
  base: 'inline-flex items-center justify-center rounded-md',
  variants: {
    size: {
      base: 'h-8 px-3 text-sm',
      large: 'h-12 px-6 text-lg'
    },
    tone: {
      neutral: 'bg-slate-900 text-white',
      danger: 'bg-red-600 text-white'
    }
  },
  defaults: {
    size: 'base',
    tone: 'neutral'
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
        // Tailwind v4 `--alpha(...)` is a color-mix shorthand.
        // Equivalent: '[--badge-bg:color-mix(in_oklch,var(--destructive)_12%,transparent)]'
        '[--badge-bg:--alpha(var(--destructive)/12%)]',
        '[--badge-fg:var(--destructive)]',
        '[--badge-ring:--alpha(var(--destructive)/30%)]'
      ]
    }
  }
})

const InteractiveBadge = styled(Badge, {
  variants: {
    interactive: {
      true: [
        // For interactive alpha, replace the static percentage with a variable.
        '[--badge-alpha:12%] hover:[--badge-alpha:18%]',
        '[--badge-bg:--alpha(var(--destructive)/var(--badge-alpha))]'
      ]
    }
  }
})
```

Pass the same variant through child components only when those children have independent styling responsibilities. Otherwise, let children inherit or consume the parent-owned variables.

Tailwind CSS v4 custom property shorthand like `bg-(--badge-bg)` expands to the equivalent `var(...)` arbitrary value; variable values can be explicit values or theme token vars.

For automatic conflict resolution, create a configured `styled` function with `tailwind-merge`:

```tsx
import { createStyled } from '@quarkcss/react'
import { twMerge } from 'tailwind-merge'

const styledMerge = createStyled(twMerge)

const Button = styledMerge.button({
  base: 'p-4',
  variants: {
    size: {
      large: 'p-8'
    }
  }
})

<Button size="large" />
// className: 'p-8'
```

If your React project already depends on `tailwind-merge`, use the preconfigured entrypoint.
It exports the same `styled` API as `createStyled(twMerge)` and a `css` export with `tailwind-merge` applied:

```tsx
import { css, styled } from '@quarkcss/react/merge'

const buttonCSS = css({
  base: 'p-4',
  variants: {
    size: {
      large: 'p-8'
    }
  }
})

const Button = styled.button(buttonCSS)
```

If an app uses plugins with `createStyled`, re-export that configured `styled` from a local module. If no plugins are needed, import `styled` directly from `@quarkcss/react`.

```ts
// lib/quarkcss.ts
import { createStyled } from '@quarkcss/react'
import { twMerge } from 'tailwind-merge'

// Re-export styled with the tailwind-merge plugin applied.
export const styled = createStyled(twMerge)
```

```tsx
// Use your app's path alias/import convention if you have one.
import { styled } from '@/lib/quarkcss'

const Button = styled.button('p-4')
```

`tailwind-merge` is optional so projects can choose whether the extra dependency and bundle size are worth it.

If all else fails, Tailwind's important modifier can still force an override: `!bg-red-500`.

## Editor Support

Set the Tailwind VSCode plugin to recognize atomic class names outside of `<... className="">`. For a broad match, use:

```json
"tailwindCSS.experimental.classRegex": ["\"([^\"]*)\"", "'([^']*)'"]
```

For a more targeted `styled(...)` match, use:

```json
  "tailwindCSS.experimental.classRegex": [
    [
      "styled(?:(?:\\.\\w+\\()|(?:\\(\\s*[\\w.'\"]+,))\\s*([\\s\\S]*?)\\)(?:\\n|$)",
      "[\"'`]([^\"'`]*).*?[\"'`]"
    ]
  ],
```
