import { css, getQuarkConfig, isQuarkCss, type QuarkProps } from '..'

describe('core', () => {
  test('classname', () => {
    const className = css({ base: 'baseClass' })
    type PROPS = QuarkProps<typeof className>
    expect(className()).toEqual('baseClass')

    const cssWithoutConfig = css(['baseClass'])

    expect(cssWithoutConfig({}, 'additional', null, { foo: true, bar: null, baz: 1 % 3 })).toEqual(
      'baseClass additional foo baz'
    )
  })

  test('variants', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        color: { red: 'red', blue: 'blue' },
        size: { small: 'small', large: 'large', null: '' },
      },
    })

    type PROPS = QuarkProps<typeof className>

    expect(className({ color: 'red', size: 'large' })).toEqual('baseClass red large')
    expect(className({ color: 'red' })).toEqual('baseClass red')
  })

  test('handle multiline', () => {
    const className = css({
      base: `
        baseClass
        baseClass2
        baseClass3
      `,
      variants: {
        color: { red: 'red', blue: 'blue' },
        size: { small: 'small', large: 'large' },
      },
    })

    expect(
      className({ color: 'red', size: 'large' }, 'additional', null, { foo: true, bar: null })
    ).toEqual('baseClass baseClass2 baseClass3 red large additional foo')
  })

  test('defaultVariant', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        color: { red: 'red', blue: 'blueValue' },
        size: { small: 'small', large: 'large', null: '' },
      },
      defaults: {
        color: 'blue',
        // asdf: 'this shoould type error',
      },
    })

    expect(className()).toEqual('baseClass blueValue')
    expect(className({ color: 'red' })).toEqual('baseClass red')
    expect(className({ size: 'large' })).toEqual('baseClass blueValue large')
  })

  test('true boolean', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        isDragging: { true: 'dragging' },
        hover: { null: 'notHover' },
      },
    })

    expect(className({ isDragging: true })).toEqual('baseClass dragging notHover')
    expect(className({ isDragging: true, hover: false })).toEqual('baseClass dragging notHover')
    expect(className({ isDragging: true, hover: true })).toEqual('baseClass dragging')
  })

  test('compoundVariants', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        color: { red: 'red', blue: 'blue' },
        size: { small: 'small', large: 'large' },
        isDragging: { true: 'dragging' },
      },
      compound: [
        {
          color: 'red',
          size: 'small',
          value: 'redSmall',
        },
        {
          color: 'blue',
          size: 'large',
          value: 'blueLarge',
        },
        {
          color: 'blue',
          isDragging: true,
          value: 'blueDragging',
        },
        {
          color: 'blue',
          isDragging: null,
          value: ['blueNotDrag'],
        },
      ],
      defaults: {
        size: 'large',
      },
    })

    type Props = QuarkProps<typeof className>

    expect(className({ color: 'blue' })).toEqual('baseClass blue large blueLarge blueNotDrag')
    expect(className({ color: 'red' })).toEqual('baseClass red large')

    expect(className({ color: 'red', size: 'large' })).toEqual('baseClass red large')
    expect(className({ color: 'red', size: 'large' })).toEqual('baseClass red large')

    expect(className({ color: 'red', size: 'small' })).toEqual('baseClass red small redSmall')

    expect(className({ color: 'blue', size: 'large' })).toEqual(
      'baseClass blue large blueLarge blueNotDrag'
    )

    expect(className({ color: 'blue', size: 'large' })).toEqual(
      'baseClass blue large blueLarge blueNotDrag'
    )

    expect(className({ color: 'blue', isDragging: true })).toEqual(
      'baseClass blue large dragging blueLarge blueDragging'
    )

    expect(
      className({ color: 'blue', isDragging: true }, ['additional', false, null, 'foo'])
    ).toEqual('baseClass blue large dragging blueLarge blueDragging additional foo')
  })

  test('utils', () => {
    const config = {
      base: 'baseClass',
      variants: {
        color: { red: 'red', blue: 'blue' },
        size: { small: 'small', large: 'large' },
      },
    }

    const className = css(config)
    expect(isQuarkCss(className)).toEqual(true)
    expect(isQuarkCss({})).toEqual(false)

    expect(getQuarkConfig(className)).toEqual(config)
  })
})
