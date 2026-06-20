## Introduction
**What if [stitches](https://stitches.dev/docs/variants) + [tailwind](https://tailwindcss.com/) = 👶?**

- Create fully-typed Solid styled components using atomic css classes.
- Organize your atomic css with variant props
  - Inspired by [`@stitches/react`](https://stitches.dev/docs/variants) api to generate atomic css classes
- Declare default variants, fallback variant branches, and default component props.
- Composable. Reuse quark styles from one component to another.

Use with your favorite atomic css library:
  - [Tailwindcss](https://tailwindcss.com/)
  - [cva](https://cva.style/docs)

For framework-agnostic styling, use [`@quarkcss/core`](https://github.com/cpakken/quarkcss/tree/master/packages/core)

## Install

```bash
bun add @quarkcss/solid
```

## Usage

```tsx
import { createSignal } from 'solid-js'
import { styled } from '@quarkcss/solid'

const StyledButton = styled.button({
  name: 'DisplayName/Button',
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
  type: 'button'
})

// Base classes can be a string or string[] when variants are not needed.
const Center = styled.div('flex items-center justify-center', { 'aria-label': 'center' })

// Intrinsic elements also support tag shorthand.
const Bold = styled.span('font-bold')
// const Bold = styled.span({ base: 'font-bold' }) // same as above

const App = () => {
  const [size] = createSignal<'small' | 'medium' | 'large' | null>('medium')

  return (
    <Center>
      <StyledButton size={size()} color="blue" rounded cx={['shadow-sm', 'focus:outline-none']}>
        <Bold>Click Me</Bold>
      </StyledButton>
    </Center>
  )
}
```

## Custom Components

Pass custom components first. The second argument is the Quark style input; the third argument is default component props.

```tsx
import type { ComponentProps } from 'solid-js'
import { styled } from '@quarkcss/solid'

const LinkButton = (props: ComponentProps<'a'>) => <a {...props} />

const StyledLinkButton = styled(LinkButton, {
  base: 'inline-flex items-center font-medium text-blue-600'
}, {
  href: '#'
})
```

Default component props must be compatible with the wrapped component. Otherwise compose with core CSS.

## Compose with @quark/core `css` function

```tsx
import { styled, css } from '@quarkcss/solid'

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
const LinkContainer = styled(LinkButton, StyledContainer.CSS, {
  href: '#'
})
```

## TypeScript

```ts
import type { ComponentProps } from 'solid-js'
import { type QuarkVariantProps } from '@quarkcss/solid'

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
<Button cx={['text-white', enabled() && 'opacity-100']} />
<Button cx={{ hidden: hidden() }} />
```

Prefer `cx` for quark-specific class extensions, and use `class` when forwarding ordinary Solid props. If those classes may conflict with Tailwind utilities from the config, design the config to avoid the conflict or configure a class engine.

## Tailwind Conflicts

Quark appends class names in this order: `base`, `variants`, `compound`, then `class` and `cx`. It does not scope classes, apply CSS-in-JS specificity rules, or merge Tailwind conflicts unless you configure a class engine, so conflicting Tailwind utilities can both appear:

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
// class: 'p-4 p-8'
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

For automatic conflict resolution, create a configured `styled` function with a class engine:

```tsx
import { createStyled } from '@quarkcss/solid'
import { twMerge } from 'tailwind-merge'

const styledMerge = createStyled({
  merge: twMerge,
  variants: {
    cache: true,
    precompute: 256
  }
})

const Button = styledMerge.button({
  base: 'p-4',
  variants: {
    size: {
      large: 'p-8'
    }
  }
})

<Button size="large" />
// class: 'p-8'
```

If an app uses a class engine with `createStyled`, re-export that configured `styled` from a local module. If no engine is needed, import `styled` directly from `@quarkcss/solid`.

```ts
// lib/quarkcss.ts
import { createStyled } from '@quarkcss/solid'
import { twMerge } from 'tailwind-merge'

export const styled = createStyled({
  merge: twMerge,
  variants: {
    cache: true
  }
})
```

```tsx
// Use your app's path alias/import convention if you have one.
import { styled } from '@/lib/quarkcss'

const Button = styled.button('p-4')
```

`tailwind-merge` and other class engines are optional so projects can choose whether the extra dependency and bundle size are worth it.

If all else fails, Tailwind's important modifier can still force an override: `!bg-red-500`.

## Editor Support

Set the Tailwind VSCode plugin to recognize atomic class names outside of `<... class="">`. For a broad match, use:

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
