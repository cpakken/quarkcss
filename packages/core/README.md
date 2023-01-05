## Install

```bash
npm install @quarkcss/core

pnpm install @quarkcss/core

yarn add @quarkcss/core
```
`@quarkcss/core` 
minified **0.84KB** gzipped **0.46KB**

`@quarkcss/react`
minified **0.61KB** gzipped **0.37KB**

## Description
Fully typed framework-agnostic generator for atomic css classes.

Inspired by [`@stitches/core`](https://stitches.dev/docs/variants) api for atomic style css classes
  - Taiiwind, unocss, windicss
  - use stitches css-in-js api for atomic css classes

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

const classnames = button({
  size: 'medium',
  color: 'blue',
  rounded: true
})

```
## Typescript
```ts
//Extract QuarkVariants from css generator
const button = css({ /* ... */ }})

type Variants = GetQuarkVariants<typeof button>

//Or interface version
interface Variants extends GetQuarkVariants<typeof button> {}

``` 


