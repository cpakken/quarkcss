import { css, createCss } from '..'
import { twMerge } from 'tailwind-merge'

describe('plugins', () => {
  test('tailwind-merge', () => {
    const cssMerge = createCss(twMerge)

    const config = { base: 'p-4', variants: { size: { large: 'p-8' } } }
    const standard = css(config)
    const merged = cssMerge(config)

    const standardCN = standard({ size: 'large' })
    const mergedCN = merged({ size: 'large' })

    expect(standardCN).toEqual('p-4 p-8')
    expect(mergedCN).toEqual('p-8')
  })
})
