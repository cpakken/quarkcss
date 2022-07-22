import { css } from '..'

describe('core', () => {
  test('classname', () => {
    const className = css({ base: 'baseClass' })
    expect(className()).toEqual('baseClass')
  })
  test('variants', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        color: { red: 'red', blue: 'blue' },
        size: { small: 'small', large: 'large' },
      },
    })

    expect(className({ color: 'red', size: 'large' })).toEqual('baseClass red large')
    expect(className({ color: 'red' })).toEqual('baseClass red')
  })

  test('defaultVariant', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        color: { red: 'red', blue: 'blue' },
        size: { small: 'small', large: 'large' },
      },
      defaultVariants: {
        color: 'blue',
      },
    })

    expect(className()).toEqual('baseClass blue')
    expect(className({ color: 'red' })).toEqual('baseClass red')
    expect(className({ size: 'large' })).toEqual('baseClass blue large')
  })
})
