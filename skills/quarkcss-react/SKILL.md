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

## Usage

```tsx
import { styled } from '@quarkcss/react'

const StyledButton = styled.button({
  base: 'inline-flex items-center justify-center font-medium transition-colors',
  variants: {
    size: {
      // `null` handles omitted, null, false, or 0 and makes `size` optional.
      null: 'h-8 px-3 text-sm',

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

    // Boolean variants can use `true`, `false`, or `null` keys. (Any of these keys makes the prop optional)
    // A lone `true` branch is fine for an opt-in toggle; unneeded: `false: ''`.
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
    color: 'red'
  }
}, {
  // Default component props owned by this styled primitive.
  type: 'button'
})

// Base classes can be a string or string[] when variants are not needed.
const Center = styled.div('flex items-center justify-center', { 'aria-label': 'center' })

// Intrinsic elements also support tag shorthand.
const Bold = styled.span('font-bold')
// const Bold = styled.span({ base: 'font-bold' }) // same as above

const App = () => {
  return (
    <Center>
      <StyledButton size="medium" color="blue" rounded>
        <Bold>Click Me</Bold>
      </StyledButton>
    </Center>
  )
}
```

## Custom Components

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

## Compose with @quark/core `css` Function

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

## Tips

QuarkCSS should reduce noisy JSX, not hide every class string. In a Tailwind project, convert long repeated class lists, ternary class strings, and reusable component states into `styled` configs with variants when doing so makes the code easier to read, reuse, or change. Keep inline `className`s when the styling is simple, local, and clearer at the call site.

Use the JSX element shorthand for intrinsic elements:

```tsx
const Button = styled.button('bg-red-500 w-12')
```

Style input can be a `string`, `string[]`, a quark `css(...)` function, or a config object:

```tsx
const StyledCard = styled(Card, 'p-4 rounded-xl')
const StyledPanel = styled(Panel, ['flex flex-col gap-4', 'bg-white rounded-xl'])
const StyledInput = styled(Input, { base: 'block w-full', variants: { invalid: { true: 'border-red-500' } } })
// The final argument sets default component props.
const SearchInput = styled(Input, 'h-8 px-2 text-sm', {
  autoComplete: 'off',
  type: 'search',
})
```

Use arrays for long class lists and group classes by concern. Each array entry can contain multiple classes:

```tsx
const Card = styled.div([
  'flex flex-col gap-4 p-6',     // layout
  'bg-white rounded-xl shadow',  // appearance
  'transition-all duration-200'  // animation
])
```

Use `cx` for per-instance customization. `cx` accepts a string, a string array, or an object map:

```tsx
<Button cx={['text-white', enabled && 'opacity-100']} />
<Button cx={{ hidden }} />
```

Prefer `cx` for per-instance class extensions on Quark components. Keep `className` available for React compatibility, prop forwarding, and external consumers that expect it. If those classes may conflict with Tailwind utilities from the config, design the config to avoid the conflict, use `@quarkcss/react/merge` when the app already depends on `tailwind-merge`, or use `createStyled(twMerge)` for custom plugin setup.

When styling headless primitives such as Radix or Base UI, pass the primitive directly to `styled(...)`. Use QuarkCSS for the app's styling API around the primitive, without replacing its behavior model.

When converting JSX or a UI primitive into a Quark component, review static props as well as `className`. Move compatible, component-owned defaults into the final `styled(...)` argument. Keep instance-specific identity, accessibility, controlled values, state, handlers, and children at the call site.

## Tailwind Conflicts

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
// className: 'p-4 p-8'
```

Design configs so each style concern has one owner. If size is variant-controlled, put fallback sizing in a `null` or `false` branch instead of `base`:

```tsx
const Button = styled.button({
  base: 'inline-flex items-center justify-center',
  variants: {
    size: {
      null: 'h-8 px-3 text-sm',
      large: 'h-12 px-6 text-lg'
    }
  }
})
```

Prefer the regular variant shape above. When avoiding Tailwind conflicts without `tailwind-merge` would make variants repetitive, a CSS-variable escape hatch is to keep state utilities in `base` and set values from variants:

```tsx
const Button = styled.button({
  base: 'bg-(--button-bg) hover:bg-(--button-bg-hover)',
  variants: {
    tone: {
      null: '[--button-bg:var(--color-surface)] [--button-bg-hover:var(--color-surface-hover)]',
      danger: '[--button-bg:var(--color-danger)] [--button-bg-hover:var(--color-danger-hover)]'
    }
  }
})
```

Tailwind CSS v4 custom property shorthand like `bg-(--button-bg)` expands to the equivalent `var(...)` arbitrary value; variable values can be explicit values or theme token vars.

For automatic conflict resolution in React projects that already depend on `tailwind-merge`, import the preconfigured entrypoint:

```tsx
import { styled } from '@quarkcss/react/merge'

const Button = styled.button({
  base: 'p-4',
  variants: {
    size: {
      large: 'p-8'
    }
  }
})

<Button size="large" />
// tailwind-merge resolves 'p-4 p-8' to 'p-8'
```

This is equivalent to `createStyled(twMerge)` and keeps the default `@quarkcss/react` entrypoint plugin-free.

Use `createStyled(...)` directly when composing `tailwind-merge` with other plugins or when an app wants its own configured styling module. If no plugins are needed, import `styled` directly from `@quarkcss/react`.

```ts
// lib/quarkcss.ts
import { createStyled } from '@quarkcss/react'
import { twMerge } from 'tailwind-merge'

export const styled = createStyled(twMerge)
```

```tsx
// Use your app's path alias/import convention if you have one.
import { styled } from '@quarkcss/react/merge'

const Button = styled.button('p-4')
```

`tailwind-merge` is optional so projects can choose whether the extra dependency and bundle size are worth it.

If all else fails, Tailwind's important modifier can still force an override: `!bg-red-500`.
