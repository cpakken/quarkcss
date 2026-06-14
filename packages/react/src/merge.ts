import { twMerge } from 'tailwind-merge'
import { createStyled } from './styled'
import type { Styled } from './styled'

export * from './styled'

export const styled: Styled = createStyled(twMerge)
