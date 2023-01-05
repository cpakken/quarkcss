# Install

```bash
npm install @quarkcss/react

pnpm install @quarkcss/react

yarn add @quarkcss/react
```

# Description

Fully typed component styling for React with atomic css classes

Inspired by stitches api for atomic style css classes
  - Taiiwind, unocss, windicss
  - use stitches css-in-js api for atomic css classes

For framerwork-agnostic styling, use [@quarkcss/core](...)

# Usage

```tsx
import { styled } from '@quarkcss/react'

//Basic
const StyledButton = styled('button', {
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
}, {
  //Default Component Props 
  onClick: () => console.log('Button is clicked')
})


// Declare Variants as Props
const App = () => {
  return (
    <StyledButton size="medium" color="blue" rounded>
      Click Me
    </StyledButton>
  )
}
```


## Wrap Components

For components like framer-motion (motion.div) 
Radix Primatives

```tsx
import { styled } from '@quarkcss/react'
import { motion } from 'framer-motion'

const MotionBox = styled(motion.div, {
  /* Style Config */
}, {
  //Default Props for motion.div
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



