import { css } from '@quarkcss/core'
import { createSeparateQuarkPropsFn } from './createSeparateQuarkPropsFn'

describe('createSeparateQuarkPropsFn', () => {
  const config = {
    variants: { color: { red: 'red', blue: 'blue' }, size: { small: 'small', large: 'large' } },
  }
  const separateProps = createSeparateQuarkPropsFn(css(config))

  test('basic ', () => {
    const [quarkProps, rest] = separateProps({ color: 'red', size: 'large' })
    expect(quarkProps).toEqual({ color: 'red', size: 'large' })
    expect(rest).toEqual({})
  })

  test('extra', () => {
    const [quarkProps, rest] = separateProps({
      color: 'red',
      size: 'large',
      foo: 'bar',
      baz: 'qux',
    })
    expect(quarkProps).toEqual({ color: 'red', size: 'large' })
    expect(rest).toEqual({ foo: 'bar', baz: 'qux' })
  })

  test('selective', () => {
    const [quarkProps, rest] = separateProps({ size: 'large', foo: 'bar', baz: 'qux' })
    expect(quarkProps).toEqual({ size: 'large' })
    expect(rest).toEqual({ foo: 'bar', baz: 'qux' })
  })

  test('shouldForwardProp filters non-variant props', () => {
    const separateProps = createSeparateQuarkPropsFn(
      css(config),
      (prop, defaultValidator) => defaultValidator(prop) && prop !== 'foo'
    )
    const [quarkProps, rest] = separateProps({ color: 'red', foo: 'bar', baz: 'qux' })

    expect(quarkProps).toEqual({ color: 'red' })
    expect(rest).toEqual({ baz: 'qux' })
  })

  test('shouldForwardProp can forward variant props', () => {
    const separateProps = createSeparateQuarkPropsFn(
      css(config),
      (prop, defaultValidator) => prop === 'color' || defaultValidator(prop)
    )
    const [quarkProps, rest] = separateProps({ color: 'red', size: 'large', foo: 'bar' })

    expect(quarkProps).toEqual({ color: 'red', size: 'large' })
    expect(rest).toEqual({ color: 'red', foo: 'bar' })
  })
})

// describe('shallowMemoPrev', () => {
//   test('basic', () => {
//     const memoedFn = shallowMemoPrev((obj) => ({ ...obj }))

//     const arg1 = { foo: 'bar' }
//     const result1 = memoedFn(arg1)
//     const result2 = memoedFn({ foo: 'bar' })

//     const result3 = memoedFn({ foo: 'baz' })
//     const result4 = memoedFn(arg1)

//     expect(arg1).not.toBe(result1)
//     expect(result1).toBe(result2)

//     expect(result1).not.toBe(result3)

//     expect(result3).not.toBe(result4)
//     expect(result4).not.toBe(result1)

//     expect(result4).toEqual(result1)
//   })
// })
