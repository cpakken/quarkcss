import { twMerge } from 'tailwind-merge'
import type { Styled } from './styled'
import { createStyled } from './styled'

export * from './styled'

export const styled: Styled = createStyled(twMerge)
