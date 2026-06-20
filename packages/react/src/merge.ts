import { createCss } from '@quarkcss/core'
import { twMerge } from 'tailwind-merge'
import type { Styled } from './styled'
import { createStyled } from './styled'

export * from './styled'
export { twMerge } from 'tailwind-merge'

export const css = createCss({
  merge: twMerge,
  variants: {
    cache: true,
    precompute: 256,
  },
})

export const styled: Styled = createStyled({ css })
