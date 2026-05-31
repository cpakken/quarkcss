---
name: quarkcss-react
description: Guidance for using @quarkcss/react to build typed React styled components with atomic CSS classes, variants, compound variants, defaults, custom components, css composition, Tailwind conflict handling, and TypeScript helpers.
---

# QuarkCSS React

Use `@quarkcss/react` when building or refactoring React components that should use QuarkCSS `styled`, `css`, `cx`, variants, compound variants, defaults, or typed variant props.

## Usage

```tsx
import { styled } from '@quarkcss/react'

const StyledButton = styled('button', {
  name: 'DisplayName/Button', // react-dev-tools display name
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

    // Boolean variants usually use `true` and `false` keys.
    // Declaring `true`, `false`, or `null` makes the prop optional.
    rounded: {
      true: 'rounded-full', // `rounded === true`
      false: 'rounded-none', // `rounded` is omitted, undefined, false, null, or 0

      // `null` is also supported; `false` wins when both exist.
      // null: 'rounded-none',

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
  // Default component props for the base <button />.
  disabled: true,
  onClick: () => console.log('button is clicked')
})

// Base classes can be a string or string[] when variants are not needed.
const Center = styled('div', 'flex items-center justify-center', { 'aria-label': 'center' })

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

Pass custom components first. The second argument is the Quark style input; the third argument is default component props.

```tsx
import { styled } from '@quarkcss/react'
import { motion } from 'framer-motion'

const MotionBox = styled(motion.div, {
  base: 'rounded-lg shadow'
}, {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 }
})
```

```tsx
import { styled } from '@quarkcss/react'
import * as Slider from '@radix-ui/react-slider'

const StyledSlider = styled(Slider.Root, {
  /* ... */
})
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

const StyledContainer = styled('div', containercss)

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

Use the JSX element shorthand for intrinsic elements:

```tsx
const Button = styled.button('bg-red-500 w-12')
```

Style input can be a `string`, `string[]`, a quark `css(...)` function, or a config object:

```tsx
const StyledCard = styled(Card, 'p-4 rounded-xl')
const StyledPanel = styled(Panel, ['flex flex-col gap-4', 'bg-white rounded-xl'])
const StyledInput = styled(Input, { base: 'block w-full', variants: { invalid: { true: 'border-red-500' } } })
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

Prefer `cx` for quark-specific class extensions, and use `className` when forwarding ordinary React props. If those classes may conflict with Tailwind utilities from the config, design the config to avoid the conflict or use `createStyled(twMerge)`.

## Tailwind Conflicts

Quark appends class names in this order: `base`, `variants`, `compound`, then `className` and `cx`. It does not scope classes, apply CSS-in-JS specificity rules, or run `tailwind-merge` unless you opt into a plugin, so conflicting Tailwind utilities can both appear:

```tsx
const Button = styled('button', {
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
const Button = styled('button', {
  base: 'inline-flex items-center justify-center',
  variants: {
    size: {
      null: 'h-8 px-3 text-sm',
      large: 'h-12 px-6 text-lg'
    }
  }
})
```

Another strategy is to keep stable utilities in `base` and let variants update CSS variables:

```tsx
const Button = styled('button', {
  base: 'h-[var(--button-height)] px-[var(--button-padding-x)] text-[length:var(--button-font-size)]',
  variants: {
    size: {
      null: '[--button-height:2rem] [--button-padding-x:0.75rem] [--button-font-size:0.875rem]',
      large: '[--button-height:3rem] [--button-padding-x:1.5rem] [--button-font-size:1.125rem]'
    }
  }
})
```

Tailwind CSS v4 exposes [theme values as CSS variables](https://tailwindcss.com/docs/theme), which works well for token-driven components.

For automatic conflict resolution, create a configured `styled` function with `tailwind-merge`:

```tsx
import { createStyled } from '@quarkcss/react'
import { twMerge } from 'tailwind-merge'

const styledMerge = createStyled(twMerge)

const Button = styledMerge('button', {
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
