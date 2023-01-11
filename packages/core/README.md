## Install

```bash
npm install @quarkcss/core

pnpm install @quarkcss/core

yarn add @quarkcss/core
```
| Package           | Minified | Gzipped |
| ----------------- | -------- | ------- |
| `@quarkcss/core`  | 1.02KB   | 0.54KB  |
| `@quarkcss/react` | 1.09KB   | 0.55KB  |

Less than 1KB gzipped!?! 😲

## Description
Fully typed framework-agnostic generator for atomic css classes.

Inspired by [`@stitches/core`](https://stitches.dev/docs/variants) variants api to generate atomic css classes

Use with your favorite atomic css library:
  - [Tailwindcss](https://tailwindcss.com/)
  - [unocss](https://github.com/unocss/unocss)
  - [windicss](https://github.com/windicss/windicss)

For React styling, use [`@quarkcss/react`](https://github.com/cpakken/quarkcss/tree/master/packages/react)

## Usage
```tsx
import { css } from '@quarkcss/core'

//Basic
const button = css({
  base: 'bg-red-500',
  variants: {
    size: {
      small: 'w-4 h-4',
      medium: ['w-8', 'h-8'], //use arrays to organize multiple classes
      large: 'w-12 h-12'
    },
    color: {
      red: 'bg-red-500',
      blue: 'bg-blue-500'
    },
    //boolean variants (when `true` or `null` keys are declared, variant prop will have `true | falsey` type)
    rounded: { 
      true: 'rounded-full', //`rounded === true`
      null: 'rounded-none'  //`rounded === falsey` (undefined | false | null | 0) or undeclared
      
      //❌ false: 'rounded-none' (Since `null` encompasses `falsey` and undeclared values)

      //Define additional keys in addition to boolean keys
      small: 'rounded-sm',
      medium: 'rounded-md',
    }
  },
  //compound variants
  compound: [
    {
      size: 'small',
      color: 'red',
      value: 'border-2 border-red-500'
    },
    {
      size: 'medium',
      color: 'blue',
      value: 'border-2 border-blue-500'
    }
  ],
  //default variants
  defaults: {
    size: 'small',
    color: 'red'
  }

})

//Usage
const classnames = button({
  size: 'medium',
  color: 'blue',
  rounded: true
})
//classnames: 'bg-blue-500 w-8 h-8 rounded-full border-2 border-blue-500'

const App = () => {
  return (
    <button className={button({size: 'medium', color: 'blue', rounded: true})}>
      Click Me
    </button>
  )
}

```
## Typescript
```ts
//Extract QuarkVariants from css generator
const button = css({ /* ... */ }})

type Variants = GetQuarkVariants<typeof button>

//Or interface version
interface Variants extends GetQuarkVariants<typeof button> {}

``` 


