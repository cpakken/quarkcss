import { describe, test, expect } from 'bun:test'
import { twMerge } from 'tailwind-merge'
import { css, createCss, getCssFactoryId, getQuarkCssFactoryId } from '..'

describe('class engine', () => {
  test('tailwind-merge merge engine', () => {
    const cssMerge = createCss({
      merge: twMerge,
    })

    const config = { base: 'p-4', variants: { size: { large: 'p-8' } } }
    const standard = css(config)
    const merged = cssMerge(config)

    const standardCX = standard({ size: 'large' })
    const mergedCX = merged({ size: 'large' })

    expect(standardCX).toEqual('p-4 p-8')
    expect(mergedCX).toEqual('p-8')
  })

  test('caches component-owned variant classes before per-call extensions', () => {
    let mergeCount = 0
    const cssMerge = createCss({
      merge: (className) => {
        mergeCount++
        return twMerge(className)
      },
      variants: {
        cache: true,
      },
    })

    const button = cssMerge({ base: 'p-4', variants: { size: { large: 'p-8' } } })

    expect(button({ size: 'large' })).toEqual('p-8')
    expect(button({ size: 'large' })).toEqual('p-8')
    expect(mergeCount).toBe(1)

    expect(button({ size: 'large' }, 'p-10')).toEqual('p-10')
    expect(mergeCount).toBe(2)
  })

  test('created css factories have private identities', () => {
    const firstCss = createCss({
      merge: twMerge,
    })
    const secondCss = createCss({
      merge: twMerge,
    })
    const button = firstCss({ base: 'p-2 p-4' })

    expect(getQuarkCssFactoryId(button)).toBe(getCssFactoryId(firstCss))
    expect(getCssFactoryId(firstCss)).not.toBe(getCssFactoryId(secondCss))
  })
})
