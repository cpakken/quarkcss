import { css, createCss } from '..'
import { twMerge } from 'tailwind-merge'

describe('plugins', () => {
  test('tailwind-merge', () => {
    const cssMerge = createCss(twMerge)

    const config = { base: 'p-4', variants: { size: { large: 'p-8' } } }
    const standard = css(config)
    const merged = cssMerge(config)

    const standardCX = standard({ size: 'large' })
    const mergedCX = merged({ size: 'large' })

    expect(standardCX).toEqual('p-4 p-8')
    expect(mergedCX).toEqual('p-8')
  })
})
