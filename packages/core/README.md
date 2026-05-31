## Introduction
**What if [stitches](https://stitches.dev/docs/variants) + [tailwind](https://tailwindcss.com/) = 👶?**

- Create fully-typed class name generators using atomic css classes.
- Organize your atomic css with variant props
  - Inspired by [`@stitches/react`](https://stitches.dev/docs/variants) api to generate atomic css classes
- Declare default variants and fallback variant branches.
- Compose generated class names with plain strings, arrays, and conditional class maps.

Use with your favorite atomic css library:
  - [Tailwindcss](https://tailwindcss.com/)
  - [cva](https://cva.style/docs)

For framework-agnostic styling, use [`@quarkcss/core`](https://github.com/cpakken/quarkcss/tree/master/packages/core)

## Install

```bash
bun add @quarkcss/core
```

## Usage

```tsx
import { css } from '@quarkcss/core'

const button = css({
  base: 'inline-flex items-center justify-center font-medium transition-colors',
  variants: {
    size: {
      // `null` handles omitted, null, false, or 0 and makes `size` optional.
      null: 'h-8 px-3 text-sm',

      small: 'h-8 px-3 text-sm',
      medium: ['h-10 px-4', 'text-base'], // use arrays to organize multiple classes
      large: 'h-12 px-6 text-lg'
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
  // Defaulted keys are optional in QuarkProps<typeof button>.
  defaults: {
    color: 'red'
  }
})

const classnames = button({
  size: 'medium',
  color: 'blue',
  rounded: true
})
// classnames: 'inline-flex items-center justify-center font-medium transition-colors h-10 px-4 text-base bg-blue-500 text-white rounded-full border-2 border-blue-500'
```

## TypeScript

```ts
import { type QuarkProps } from '@quarkcss/core'

type ButtonVariants = QuarkProps<typeof button>
const variants: ButtonVariants = { color: 'blue', size: 'large', rounded: true }

button(variants)

interface ButtonVariantProps extends QuarkProps<typeof button> {}
```

`QuarkProps` is the object type accepted by `button(...)`. It infers variant keys and values from the config. Props are optional when the variant key is in `defaults` or declares a `true`, `false`, or `null` branch.

## Tips

Use strings for short class lists. Use arrays for long class lists and group classes by concern:

```ts
const card = css([
  'flex flex-col gap-4 p-6',     // layout
  'bg-white rounded-xl shadow',  // appearance
  'transition-all duration-200'  // animation
])
```

Pass additional classes after the variant props. Additional classes are appended after `base`, `variants`, and `compound`:

```ts
const classnames = button(
  { size: 'medium', color: 'blue' },
  'text-white',
  enabled && 'opacity-100',
  { hidden }
)
```

If those additional classes may conflict with Tailwind utilities from the config, design the config to avoid the conflict or use `createCss(twMerge)`.

## Tailwind Conflicts

Quark appends class names in this order: `base`, `variants`, `compound`, then additional class names passed to the generated function. It does not scope classes, apply CSS-in-JS specificity rules, or run `tailwind-merge` unless you opt into a plugin, so conflicting Tailwind utilities can both appear:

```ts
const button = css({
  base: 'p-4',
  variants: {
    size: {
      large: 'p-8'
    }
  }
})

button({ size: 'large' })
// 'p-4 p-8'
```

Design configs so each style concern has one owner. If size is variant-controlled, put fallback sizing in a `null` or `false` branch instead of `base`:

```ts
const button = css({
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

```ts
const button = css({
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

For automatic conflict resolution, create a configured `css` function with `tailwind-merge`:

```ts
import { createCss } from '@quarkcss/core'
import { twMerge } from 'tailwind-merge'

const cssMerge = createCss(twMerge)

const button = cssMerge({
  base: 'p-4',
  variants: {
    size: {
      large: 'p-8'
    }
  }
})

button({ size: 'large' })
// 'p-8'
```

If an app uses a configured `css`, re-export it from a local module. If no plugins are needed, import `css` directly from `@quarkcss/core`.

```ts
// lib/quarkcss.ts
import { createCss } from '@quarkcss/core'
import { twMerge } from 'tailwind-merge'

// Re-export css with the tailwind-merge plugin applied.
export const css = createCss(twMerge)
```

```ts
// Use your app's path alias/import convention if you have one.
import { css } from '@/lib/quarkcss'

const button = css('p-4 p-8')
```

`tailwind-merge` is optional so projects can choose whether the extra dependency and bundle size are worth it.

If all else fails, Tailwind's important modifier can still force an override: `"!bg-red-500"`.

## Editor Support

Set the Tailwind VSCode plugin to recognize atomic class names outside of `<... className="">`. For a broad match, use:

```json
"tailwindCSS.experimental.classRegex": ["\"([^\"]*)\"", "'([^']*)'"]
```

For a more targeted `css(...)` match, use:

```json
  "tailwindCSS.experimental.classRegex": [
    [
      "css\\(\\s*([\\s\\S]*?)\\)(?:\\n|$)",
      "[\"'`]([^\"'`]*).*?[\"'`]"
    ]
  ],
```
