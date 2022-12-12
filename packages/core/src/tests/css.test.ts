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
      compoundVariants: [
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
      ],
    })

    expect(className({ color: 'red', size: 'small' })).toEqual('baseClass red small redSmall')
    expect(className({ color: 'blue', size: 'large' })).toEqual('baseClass blue large blueLarge')
    expect(className({ color: 'blue', isDragging: true })).toEqual('baseClass blue dragging blueDragging')
  })
})
