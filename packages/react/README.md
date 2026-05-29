## Introduction
**What if [stitches](https://stitches.dev/docs/variants) + [tailwind](https://tailwindcss.com/) = 👶?**

- Create fully-typed React styled components using atomic css classes.
- Organize your atomic css with variants props 
  - Inspired by [`@stitches/react`](https://stitches.dev/docs/variants) api to generate atomic css classes
- Declare default props for your base component
- Polymorphic and composable. Reuse quark styles from one component to another.

Use with your favorite atomic css library:
  - [Tailwindcss](https://tailwindcss.com/)
  - [cva](https://cva.style/docs)

For framework-agnostic styling, use [`@quarkcss/core`](https://github.com/cpakken/quarkcss/tree/master/packages/core)

## Install

```bash
npm install @quarkcss/react

pnpm install @quarkcss/react

bun add @quarkcss/react
```

## Usage

```tsx
import { styled } from '@quarkcss/react'

//Basic
const StyledButton = styled('button', {
  name: 'DisplayName/Button', //react-dev-tools display name (default Quark_{element.(displayName || name || tag)})
  base: 'bg-red-500',
  variants: {
    size: {
      small: 'w-4 h-4',

      //use arrays to organize multiple classes
      medium: ['w-8', 'h-8'], 

      //template strings multi-line support
      large: ` 
        w-12
        h-12
      `
    },
    color: {
      red: 'bg-red-500',
      blue: 'bg-blue-500'
    },
    //boolean variants (when `true`, `false`, or legacy `null` keys are declared, variant prop will have `boolean | null | undefined | 0` type)
    rounded: { 
      true: 'rounded-full', //`rounded === true`
      false: 'rounded-none', //`rounded` is falsey (undefined | false | null | 0) or undeclared
      
      // `null` is still supported for compatibility. If both `false` and `null` are declared, `false` is preferred.
      // null: 'rounded-none',

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
  //default variants
  defaults: {
    size: 'small',
    color: 'red'
  }
}, {
  //default component props - initialize default props for your base component <button />
  disabled: true,
  onClick: () => console.log('button is clicked')
})

// If you don't need variants, you can also declare your base class names as a `string` or `string[]`
const Center = styled('div', 'flex items-center justify-center', { 'aria-label': 'center' })

//You can use the element tag directly
const Bold = styled.span('font-bold')
// const Bold = styled.span({ base: 'font-bold' }) //same as above

// Declare Variants as Props
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

For components like framer-motion (motion.div) and Radix Primatives

```tsx
import { styled } from '@quarkcss/react'
import { motion } from 'framer-motion'

const MotionBox = styled(motion.div, {
  /* Style Config */
}, {
  //Initialize default props for your base component <motion.div />
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

⚠️ **Warning**: If you declared default props, make sure they are compatible with the new component. Otherwise compose with its core css. 

## Compose with @quark/core `css` function

```tsx
import { styled, css } from '@quarkcss/react'

// `css` re-exported from @quarkcss/core
const containercss = css({
  base: /* ... */
  variants: { /* ... */ }
  compound: [ /* ... */ ]
  defaults: { /* ... */ }
})

// Directly pass quark css function to styled
const StyledContainer = styled('div', containercss)

// Retrieve quark css from Styled Component
expect(StyledContainer.CSS).toBe(containercss)
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
//Extract variant props from styled component
const StyledContainer = styled({ /* ... */ }})

type Variants = QuarkVariantProps<typeof StyledContainer>

//Or Interface Version
interface Variants extends QuarkVariantProps<typeof StyledContainer> {}

//To extract props from a styled component use ✔️
import { PropsWithoutRefOf } from '@quarkcss/react'
type StyledComponentProps = PropsWithoutRefOf<typeof StyledContainer>

//instead of reacts ComponentProps ❌
import { ComponentProps } from 'react'
type StyledComponentProps = ComponentProps<typeof StyledContainer>

//The polymorphic 'as' prop makes ComponentProps infer all undeclared props as `any` 
//even thought the declared props are typed correctly.

``` 
## Caveats
- Specificity
  - css classes are not applied based on ordering specificity (unlike css-in-js / stitches)
    - design your variants such that atomic classes do not conflict 
    - if all else fails, overide with `!important` (i.e. `!bg-red-500`)
- Set Tailwind VSCode plugin to recognize atomic class names outside of `<... className="">`
  - in VSCode settings.json:
  ```json
  "tailwindCSS.experimental.classRegex": ["\"([^\"]*)\"", "'([^']*)'"],
  //TODO: Need to find more surgical regex to match atomic class names in QuarkConfig
  ```


## Vscode Tailwind Regex
- in VSCode settings.json:
```json
  "tailwindCSS.experimental.classRegex": [
    [
      "styled(?:(?:\\.\\w+\\()|(?:\\(\\s*[\\w.'\"]+,))\\s*([\\s\\S]*?)\\)(?:\\n|$)",
      "[\"'`]([^\"'`]*).*?[\"'`]"
    ]
  ],
```
