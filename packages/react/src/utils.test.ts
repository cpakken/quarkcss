import { createSeparateQuarkPropsFn, shallowMemoPrev } from '.'

describe('createSeparateQuarkPropsFn', () => {
  const config = { variants: { color: { red: 'red', blue: 'blue' }, size: { small: 'small', large: 'large' } } }
  const separateProps = createSeparateQuarkPropsFn(config)

  test('basic ', () => {
    const [quarkProps, rest] = separateProps({ color: 'red', size: 'large' })
    expect(quarkProps).toEqual({ color: 'red', size: 'large' })
    expect(rest).toEqual({})
  })

  test('extra', () => {
    const [quarkProps, rest] = separateProps({ color: 'red', size: 'large', foo: 'bar', baz: 'qux' })
    expect(quarkProps).toEqual({ color: 'red', size: 'large' })
    expect(rest).toEqual({ foo: 'bar', baz: 'qux' })
  })

  test('selective', () => {
    const [quarkProps, rest] = separateProps({ size: 'large', foo: 'bar', baz: 'qux' })
    expect(quarkProps).toEqual({ size: 'large' })
    expect(rest).toEqual({ foo: 'bar', baz: 'qux' })
  })
})

describe('shallowMemoPrev', () => {
  test('basic', () => {
    const memoedFn = shallowMemoPrev((obj) => ({ ...obj }))

    const arg1 = { foo: 'bar' }
    const result1 = memoedFn(arg1)
    const result2 = memoedFn({ foo: 'bar' })

    const result3 = memoedFn({ foo: 'baz' })
    const result4 = memoedFn(arg1)

    expect(arg1).not.toBe(result1)
    expect(result1).toBe(result2)

    expect(result1).not.toBe(result3)

    expect(result3).not.toBe(result4)
    expect(result4).not.toBe(result1)

    expect(result4).toEqual(result1)
  })
})
