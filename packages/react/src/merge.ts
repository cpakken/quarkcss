import { createCss } from '@quarkcss/core'
import { twMerge } from 'tailwind-merge'
import type { Styled } from './styled'
import { createStyled } from './styled'

export * from './styled'

export const css = createCss(twMerge)
export const styled: Styled = createStyled(twMerge)
