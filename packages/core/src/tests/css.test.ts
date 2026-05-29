import { css, getQuarkConfig, isQuarkCss, type QuarkProps } from '..'
import {describe, test, expect, expectTypeOf} from 'bun:test'

describe('core', () => {
  test('classname', () => {
    const className = css({ base: 'baseClass' })
    // type PROPS = QuarkProps<typeof className>
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

    type Props = QuarkProps<typeof className>

    expectTypeOf<{
      color: 'red' | 'blue'
      size?: 'small' | 'large'
    }>().toExtend<Props>()
    expectTypeOf<{ color: 'red' }>().toExtend<Props>()
    expectTypeOf<{ color: 'blue'; size: false }>().toExtend<Props>()

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
        size: { small: 'small', large: 'large', null: 'medium' },
        isDragging: { true: 'dragging', false: 'notDragging' },
      },
      defaults: {
        color: 'blue',
        // asdf: 'this shoould type error',
      },
    })

    type Props = QuarkProps<typeof className>

    expectTypeOf<{
      color?: 'red' | 'blue'
      size?: 'small' | 'large'
      isDragging?: boolean
    }>().toExtend<Props>()
    expectTypeOf<{}>().toExtend<Props>()
    expectTypeOf<{ isDragging: false; size: null }>().toExtend<Props>()

    expect(className()).toEqual('baseClass blueValue medium notDragging')
    expect(className({ color: undefined, size: undefined, isDragging: undefined })).toEqual(
      'baseClass blueValue medium notDragging'
    )
    expect(className({ color: 'red', isDragging: true })).toEqual('baseClass red medium dragging')
    expect(className({ size: 'large' })).toEqual('baseClass blueValue large notDragging')
  })

  test('boolean variants use false key for falsey values', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        rounded: {
          true: 'rounded-full',
          false: 'rounded-none',
          null: 'legacy-rounded-none',
          small: 'rounded-sm',
        },
      },
    })

    const zeroProps: QuarkProps<typeof className> = { rounded: 0 }
    type Props = QuarkProps<typeof className>

    expectTypeOf<{
      rounded?: boolean | 'small' | null | 0
    }>().toExtend<Props>()
    expectTypeOf<{}>().toExtend<Props>()

    expect(className()).toEqual('baseClass rounded-none')
    expect(className({ rounded: false })).toEqual('baseClass rounded-none')
    expect(className({ rounded: null })).toEqual('baseClass rounded-none')
    expect(className(zeroProps)).toEqual('baseClass rounded-none')
    expect(className({ rounded: true })).toEqual('baseClass rounded-full')
    expect(className({ rounded: 'small' })).toEqual('baseClass rounded-sm')
  })

  test('boolean variants support legacy null key', () => {
    const className = css({
      base: 'baseClass',
      variants: {
        rounded: {
          true: 'rounded-full',
          null: 'rounded-none',
        },
      },
    })

    type Props = QuarkProps<typeof className>

    expectTypeOf<{
      rounded?: boolean | null | 0
    }>().toExtend<Props>()
    expectTypeOf<{}>().toExtend<Props>()

    expect(className()).toEqual('baseClass rounded-none')
    expect(className({ rounded: false })).toEqual('baseClass rounded-none')
    expect(className({ rounded: null })).toEqual('baseClass rounded-none')
    expect(className({ rounded: 0 })).toEqual('baseClass rounded-none')
    expect(className({ rounded: true })).toEqual('baseClass rounded-full')
  })

  test('explicit falsey boolean values override default true variant', () => {
    const className = css({
      variants: {
        rounded: {
          true: 'rounded-full',
          false: 'rounded-none',
        },
      },
      defaults: {
        rounded: true,
      },
    })

    type Props = QuarkProps<typeof className>

    expectTypeOf<{
      rounded?: boolean | null | 0
    }>().toExtend<Props>()
    expectTypeOf<{}>().toExtend<Props>()

    expect(className()).toEqual('rounded-full')
    expect(className({ rounded: undefined })).toEqual('rounded-full')
    expect(className({ rounded: false })).toEqual('rounded-none')
    expect(className({ rounded: null })).toEqual('rounded-none')
    expect(className({ rounded: 0 })).toEqual('rounded-none')
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

    expectTypeOf<{
      color: 'red' | 'blue'
      size?: 'small' | 'large'
      isDragging?: boolean
    }>().toExtend<Props>()
    expectTypeOf<{ color: 'blue'; isDragging: false }>().toExtend<Props>()

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

  test('compound variants support CVA-style class aliases and multiple conditions', () => {
    const button = css({
      base: ['font-semibold', 'border', 'rounded'],
      variants: {
        intent: {
          primary: 'bg-blue-500 text-white border-transparent',
          secondary: 'bg-white text-gray-800 border-gray-400',
        },
        size: {
          small: 'text-sm py-1 px-2',
          medium: 'text-base py-2 px-4',
        },
        disabled: {
          true: 'opacity-50 cursor-not-allowed',
          false: '',
        },
      },
      compound: [
        {
          intent: ['primary', 'secondary'],
          size: 'medium',
          class: 'tracking-wide',
        },
        {
          intent: 'primary',
          disabled: false,
          className: 'hover:bg-blue-600',
        },
        {
          intent: 'secondary',
          disabled: false,
          class: 'hover:bg-gray-100',
        },
        {
          intent: 'primary',
          size: ['medium'],
          value: ['uppercase'],
        },
      ],
      defaults: {
        intent: 'primary',
        size: 'medium',
        disabled: false,
      },
    })

    type Props = QuarkProps<typeof button>

    expectTypeOf<{
      intent?: 'primary' | 'secondary'
      size?: 'small' | 'medium'
      disabled?: boolean
    }>().toExtend<Props>()
    expectTypeOf<{}>().toExtend<Props>()
    expectTypeOf<{ intent: 'secondary'; size: 'small'; disabled: false }>().toExtend<Props>()

    expect(button()).toEqual(
      'font-semibold border rounded bg-blue-500 text-white border-transparent text-base py-2 px-4 tracking-wide hover:bg-blue-600 uppercase'
    )
    expect(button({ disabled: true })).toEqual(
      'font-semibold border rounded bg-blue-500 text-white border-transparent text-base py-2 px-4 opacity-50 cursor-not-allowed tracking-wide uppercase'
    )
    expect(button({ intent: 'secondary', size: 'medium' })).toEqual(
      'font-semibold border rounded bg-white text-gray-800 border-gray-400 text-base py-2 px-4 tracking-wide hover:bg-gray-100'
    )
    expect(button({ intent: 'secondary', size: 'small' })).toEqual(
      'font-semibold border rounded bg-white text-gray-800 border-gray-400 text-sm py-1 px-2 hover:bg-gray-100'
    )
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
