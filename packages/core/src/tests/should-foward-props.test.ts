import { createShouldForwardProps } from '..'

describe('shouldforwardprops', () => {
  const config = { variants: { color: { red: 'red', blue: 'blue' }, size: { small: 'small', large: 'large' } } }
  const shouldForwardProps = createShouldForwardProps(config)

  test('basic ', () => {
    const [quarkProps, rest] = shouldForwardProps({ color: 'red', size: 'large' })
    expect(quarkProps).toEqual({ color: 'red', size: 'large' })
    expect(rest).toEqual({})
  })

  test('extra', () => {
    const [quarkProps, rest] = shouldForwardProps({ color: 'red', size: 'large', foo: 'bar', baz: 'qux' })
    expect(quarkProps).toEqual({ color: 'red', size: 'large' })
    expect(rest).toEqual({ foo: 'bar', baz: 'qux' })
  })

  test('selective', () => {
    const [quarkProps, rest] = shouldForwardProps({ size: 'large', foo: 'bar', baz: 'qux' })
    expect(quarkProps).toEqual({ size: 'large' })
    expect(rest).toEqual({ foo: 'bar', baz: 'qux' })
  })
})
