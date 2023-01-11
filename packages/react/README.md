## Install

```bash
npm install @quarkcss/react

pnpm install @quarkcss/react

yarn add @quarkcss/react
```
| Package           | Minified | Gzipped |
| ----------------- | -------- | ------- |
| `@quarkcss/core`  | 1.02KB   | 0.54KB  |
| `@quarkcss/react` | 1.09KB   | 0.55KB  |

Less than 1KB gzipped!?! 😲

## Description
Create fully-typed React styled-components using atomic css classes.

Inspired by [`@stitches/react`](https://stitches.dev/docs/variants) variants api to generate atomic css classes

Use with your favorite atomic css library:
  - [Tailwindcss](https://tailwindcss.com/)
  - [unocss](https://github.com/unocss/unocss)
  - [windicss](https://github.com/windicss/windicss)

For framerwork-agnostic styling, use [`@quarkcss/core`](https://github.com/cpakken/quarkcss/tree/master/packages/core)

## Usage

```tsx
import { styled } from '@quarkcss/react'

//Basic
const StyledButton = styled('button', {
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
}, {
  //default component props - initialize default props for your base component <button />
  disabled: true,
  onclick: () => console.log('button is clicked')
})

// If you don't need variants, you can also declare your base class names as a `string` or `string[]`
const Center = styled('div', 'flex items-center justify-center', { 'aria-label': 'center' })

// Declare Variants as Props
const App = () => {
  return (
  <Center>
    <StyledButton size="medium" color="blue" rounded>
      Click Me
    </StyledButton>
  </Center>
  )
}
```
## Wrap Components

For components like framer-motion (motion.div) and Radix Primatives

```tsx
import { styled } from '@quarkcss/react'
import { motion } from 'framer-motion'

const MotionBox = styled(motion.div, {
  /* Style Config */
}, {
  //Use second argument to initialize default props for your base component <motion.div />
  variants: {
    initial: { opacity: 0, x: -100},
    animate: { opacity: 1, x: 0}
  },
  initial: 'initial',
  animate: 'animate',
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 30
  }
})
```

```tsx

import { styled } from '@quarkcss/react'
import * as Slider from '@radix-ui/react-slider'

//Radix Primatives
const StyledSlider = styled(Slider.Root, {
  /* ... */
})
```


## Polymorphic Components
Use the `as` prop to change the underlying component. Typescript will automatically infer the correct props for the new component.
```tsx
const StyledComponet = styled('span', {
  /* ... */
})

const App = () => {
  return (
    <div>
      <StyledComponent as="button">
        Click Me
      </StyledComponent>
      <StyledComponent as={motion.div}>
        Click Me
      </StyledComponent>
    </div>
  )
}
```
⚠️ **Warning**: If you declared default props, make sure they are compatible with the new component. Otherwise compose with its core css. 

## Compose with @quark/core `css` function

```tsx

import { styled, css } from '@quarkcss/react'

// `css` re-exported from @quarkcss/core
const container = css({
  base: /* ... */
  variants: { /* ... */ }
  compound: [ /* ... */ ]
  defaults: { /* ... */ }
})

// Directly pass quark css function to styled
const StyledContainer = styled('div', container)

// Retrieve quark css from Styled Component
expect(StyledContainer.CSS).toBe(container)
```
Now we can re-use quark config without using `as`, and pass different default component props

```tsx
//example with framer-motion

const MotionContainer = styled(motion.div, StyledContainer.CSS, {
  //Declare default props for your base component <motion.div />
  initial: { x: -100 },
  animate: { x: 0 },
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 30
  }
})

```

## Typescript
```ts
//Extract QuarkVariants from styled component
const StyledContainer = styled({ /* ... */ }})

type QuarkVariants = QuarkComponentVariants<typeof StyledContainer>
type QuarkVariantsMap = QuarkComponentVariantsMap<typeof StyledContainer>

//Or Interface Version
interface QuarkVariants extends QuarkComponentVariants<typeof StyledContainer> {}
interface QuarkVariantsMap extends QuarkComponentVariantsMap<typeof StyledContainer> {}

//To Extract Props from Styled Component use ✔️
import { PropsOf } from '@quarkcss/react'
type StyledComponentProps = PropsOf<typeof StyledContainer>

//instead of reacts ComponentProps ❌
import { ComponentProps } from 'react'
type StyledComponentProps = ComponentProps<typeof StyledContainer>

//The polymorphic 'as' prop makes ComponentProps infer all undeclared props as `any` 
//even thought the declared props are typed correctly.

``` 


