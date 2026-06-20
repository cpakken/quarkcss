import { createCss, type QuarkClassComposer } from '@quarkcss/core'
import { cn } from 'cnfast'
import type { Styled } from './styled'
import { createStyled } from './styled'

export * from './styled'
export { cn } from 'cnfast'

const compose = cn as QuarkClassComposer

export const css = createCss({
  compose,
  variants: {
    cache: true,
    precompute: 256,
  },
})

export const styled: Styled = createStyled({ css })
