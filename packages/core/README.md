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

Inspired by [`@stitches/core`](https://stitches.dev/docs/variants) api for atomic style css classes
  - Tailwind, unocss, windicss
  - use stitches css-in-js api to generate atomic css classes

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
      medium: ['w-8', 'h-8'], //Use arrays to organize multiple classes
      large: 'w-12 h-12'
    },
    color: {
      red: 'bg-red-500',
      blue: 'bg-blue-500'
    },
    rounded: {
      true: 'rounded-full', //`rounded` will accept Truthy types (true | false | null | undefined)
      null: 'rounded-none'  //Default if no variant is passed
    }
  },
  //Compound Variants
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
  //Default Variants
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


