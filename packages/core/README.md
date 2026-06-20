## Introduction

`@quarkcss/core` is the framework-agnostic styling core for QuarkCSS. It turns atomic class lists into typed class name generators with base styles, variants, compound variants, defaults, config composition, and per-call class extensions.

- Create fully-typed class name generators using atomic css classes.
- Organize your atomic css with variant props.
- Declare default variants and fallback variant branches.
- Compose generated class names with plain strings, arrays, and conditional class maps.
- Reuse the same styling config across framework adapters.

Use it with your favorite utility-class workflow:

- [Tailwind CSS](https://tailwindcss.com/)
- Existing CSS class systems
- CVA-style variant config conventions

For component APIs, use the framework packages built on core:

- [`@quarkcss/react`](https://github.com/cpakken/quarkcss/tree/master/packages/react)
- [`@quarkcss/solid`](https://github.com/cpakken/quarkcss/tree/master/packages/solid)
- [`@quarkcss/van`](https://github.com/cpakken/quarkcss/tree/master/packages/van)

## Install

```bash
bun add @quarkcss/core
```

## When To Use It

Inline class strings are fine for simple, local layout and one-off scaffolding. Use QuarkCSS when naming the styling concept improves readability, reuse, or ownership.

Reach for `@quarkcss/core` when a class list is repeated, has variants, needs a typed API, or should be shared outside a specific UI framework. Avoid wrapping every class string just to avoid inline classes.

Use variants and defaults for the styling API owned by the class generator. Use additional classes at the call site for one-off extensions.

## Core API

```ts
import { css } from '@quarkcss/core'

// Base classes can be a string when variants are not needed.
const bold = css('font-bold')

bold()
// 'font-bold'

// Arrays are just an organization pattern; each entry can contain one or more classes.
const card = css([
  'flex flex-col gap-4 p-6',     // layout
  'bg-white rounded-xl shadow',  // appearance
  'transition-all duration-200'  // animation
])

card()
// 'flex flex-col gap-4 p-6 bg-white rounded-xl shadow transition-all duration-200'
```

Style input can be a `string`, `string[]`, or a config object:

```ts
const panel = css({
  base: 'block w-full',
  variants: {
    invalid: {
      true: 'border-red-500'
    }
  }
})
```

Generated functions accept variant props as the first argument and clsx-style class values after that:

```ts
const className = panel(
  { invalid: true },
  'rounded-md',
  enabled && 'opacity-100',
  ['shadow-sm', focused && 'ring-2'],
  { hidden, 'pointer-events-none opacity-60': loading }
)
```

Additional classes are appended after `base`, `variants`, and `compound`.

## Variants And Defaults

```ts
import { css } from '@quarkcss/core'

const button = css({
  base: 'inline-flex items-center justify-center font-medium transition-colors',
  variants: {
    size: {
      small: 'h-8 px-3 text-sm',
      medium: ['h-10 px-4', 'text-base'],
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

    // Use a lone `true` branch for opt-in boolean styling.
    loading: {
      true: 'opacity-60 pointer-events-none'
    },

    // Boolean variants can also use `false` or `null` keys for falsey fallbacks.
    // Any `true`, `false`, or `null` key makes the prop optional.
    rounded: {
      true: 'rounded-full', // `rounded === true`
      false: 'rounded-none', // omitted, undefined, false, null, or 0

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
  // Defaulted keys are optional in QuarkProps<typeof button>.
  defaults: {
    size: 'small',
    color: 'red'
  }
})

button({ size: 'medium', color: 'blue', loading: true, rounded: true })
// 'inline-flex items-center justify-center font-medium transition-colors h-10 px-4 text-base bg-blue-500 text-white opacity-60 pointer-events-none rounded-full border-2 border-blue-500'
```

Use variants for named styling concepts owned by the class generator. A variant should represent a styling decision the API intentionally exposes, not just a way to toggle arbitrary classes.

Use `defaults` for normal enum defaults. Use `null` or `false` branches when falsey input should map to explicit fallback classes.

## TypeScript

```ts
import { type QuarkProps } from '@quarkcss/core'

type ButtonVariants = QuarkProps<typeof button>

const variants = {
  color: 'blue',
  size: 'large',
  rounded: true
} satisfies ButtonVariants

button(variants)

interface ButtonVariantProps extends QuarkProps<typeof button> {}
```

`QuarkProps` is the object type accepted by `button(...)`. It infers variant keys and values from the config. Defaulted variants and boolean-style variants are optional.

## Composition Utilities

Core exposes small utilities for framework adapters and shared styling systems:

```ts
import {
  css,
  getQuarkConfig,
  isQuarkCss,
  mergeQuarkConfigs
} from '@quarkcss/core'

const badge = css({
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
})

const interactiveBadge = css(
  mergeQuarkConfigs(getQuarkConfig(badge), {
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
)

isQuarkCss(interactiveBadge)
// true
```

`mergeQuarkConfigs` appends extension output after base output. Base classes are concatenated, compound variants are appended, new variant values are added, and matching variant keys and values append classes in base-then-extension order. Extension defaults override base defaults for the same key.

## Styling Patterns

QuarkCSS should reduce noisy class composition, not hide every class string. In a Tailwind project, convert long repeated class lists, ternary class strings, and reusable states into `css` configs with variants when doing so makes the code easier to read, reuse, or change.

Use arrays for long class lists and group classes by concern:

```ts
const card = css([
  'flex flex-col gap-4 p-6',     // layout
  'bg-white rounded-xl shadow',  // appearance
  'transition-all duration-200'  // animation
])
```

Use additional arguments for per-call customization. They accept strings, arrays, falsey values, and object maps:

```ts
button(
  { size: 'medium', color: 'blue' },
  'shadow-sm',
  enabled && 'opacity-100',
  { hidden, 'pointer-events-none opacity-60': loading }
)
```

If a generator has no variants but needs per-call extensions, pass `undefined` or `{}` as the first argument:

```ts
card(undefined, 'max-w-sm')
card({}, 'max-w-sm')
```

Keep each style concern owned in one place. If a variant controls a concept, avoid repeating competing utilities in `base` or per-call class extensions.

## Tailwind Conflicts

Quark appends class names in this order: `base`, `variants`, `compound`, then additional class values passed to the generated function. It does not scope classes, apply CSS-in-JS specificity rules, or merge Tailwind conflicts unless you configure a class engine, so conflicting Tailwind utilities can both appear.

The next example intentionally contains conflicting utilities to show merge behavior. This can be useful for consumer overrides or resilience against styling mistakes, but avoid relying on conflicts when the config can be organized cleanly.

```ts
const button = css({
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

button({ size: 'large', tone: 'danger' }, 'px-6')
// without merge: 'rounded-md bg-slate-900 px-3 px-5 bg-red-600 px-6'
```

If a style concern is variant-controlled, keep that concern's utilities inside its variant and use `defaults` for the normal cases:

```ts
const button = css({
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

```ts
const badge = css({
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
```

Tailwind CSS v4 custom property shorthand like `bg-(--badge-bg)` expands to the equivalent `var(...)` arbitrary value; variable values can be explicit values or theme token vars.

For automatic conflict resolution, create a configured `css` function with a class engine. Merge-only engines such as `tailwind-merge` receive Quark's joined class string:

```ts
import { createCss } from '@quarkcss/core'
import { twMerge } from 'tailwind-merge'

const cssMerge = createCss({
  merge: twMerge,
  variants: {
    cache: true,
    precompute: 256
  }
})

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

`variants.cache` stores component-owned `base` + `variants` + `compound` output before per-call extensions are added. `variants.precompute` fills that cache during `css(...)` construction when the variant matrix is small enough.

If an app uses a class engine with `createCss`, re-export that configured `css` from a local module. If no engine is needed, import `css` directly from `@quarkcss/core`.

```ts
// lib/quarkcss.ts
import { createCss } from '@quarkcss/core'
import { twMerge } from 'tailwind-merge'

export const css = createCss({
  merge: twMerge,
  variants: {
    cache: true
  }
})
```

```ts
// Use your app's path alias/import convention if you have one.
import { css } from '@/lib/quarkcss'

const button = css('p-4 p-8')
```

`tailwind-merge` and other merge engines are optional so projects can choose whether the extra dependency and bundle size are worth it.

If all else fails, Tailwind's important modifier can still force an override: `!bg-red-500`.

## Editor Support

Set the Tailwind VSCode plugin to recognize atomic class names outside of `<... className="">`. For a broad match, use:

```json
{
  "tailwindCSS.experimental.classRegex": ["\"([^\"]*)\"", "'([^']*)'"]
}
```

For a more targeted `css(...)` match, use:

```json
{
  "tailwindCSS.experimental.classRegex": [
    [
      "css\\(\\s*([\\s\\S]*?)\\)(?:\\n|$)",
      "[\"'`]([^\"'`]*).*?[\"'`]"
    ]
  ]
}
```
