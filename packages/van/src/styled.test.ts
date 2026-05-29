import type { MixedCX } from '@quarkcss/core'
import { test, expect, describe, beforeEach, expectTypeOf } from 'bun:test'
import {
  type QuarkComponentProps,
  type QuarkVanComponent,
  type QuarkVariantProps,
  type ValueProp,
  type VanProps,
  styled,
} from './styled'
import van from 'vanjs-core'
import { waitFor } from '@testing-library/dom'

type PropsOf<C> = C extends QuarkVanComponent<infer E, infer V, infer D, infer DP>
  ? QuarkComponentProps<E, V, D, DP>
  : never

// const html = String
const html = (strings: TemplateStringsArray, ...values: any[]) => {
  let result = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '')
  return result.replace(/\n\s+/g, '')
}

describe('styled', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('styled', () => {
    const Bold = styled.div('font-bold')
    const { div } = van.tags

    expectTypeOf<QuarkVariantProps<typeof Bold>>().toEqualTypeOf<{}>()

    document.body.append(Bold(), Bold({}, Bold('HELLO'), 'world', Bold(div('foobar'))))

    expect(document.body.innerHTML).toBe(
      html`<div class="font-bold"></div>
      <div class="font-bold">
        <div class="font-bold">HELLO</div>
        world
        <div class="font-bold"><div>foobar</div></div>
      </div>`
    )
  })

  test('styled with variants', () => {
    const Button = styled.button(
      {
        name: 'Button',
        variants: {
          size: {
            sm: 'text-sm',
            md: 'text-md',
            lg: 'text-lg',
          },
        },
      },
      {
        type: 'button',
      }
    )

    type Variants = QuarkVariantProps<typeof Button>
    type Props = PropsOf<typeof Button>

    expectTypeOf<Variants>().toEqualTypeOf<{
      size: ValueProp<'sm' | 'md' | 'lg'>
    }>()
    expectTypeOf<Props['cx']>().toEqualTypeOf<ValueProp<MixedCX> | undefined>()
    expectTypeOf<Props['type']>().toEqualTypeOf<VanProps<'button'>['type']>()

    document.body.append(
      Button({ size: 'lg', cx: ['custom', { foo: true, bar: false }] }, 'Click me')
    )

    expect(document.body.innerHTML).toBe(
      html`<button type="button" class="text-lg custom foo">Click me</button>`
    )
  })

  test('styled with variants using state', async () => {
    const Button = styled.button({
      variants: {
        size: {
          null: '',
          sm: 'text-sm',
          md: 'text-md',
          lg: 'text-lg',
        },
      },
    })

    const size = van.state<'sm' | 'md' | 'lg' | null>('sm')

    const content = van.state('Click me')

    document.body.append(Button({ size }, content))

    expect(document.body.innerHTML).toBe(html`<button class="text-sm">Click me</button>`)

    size.val = 'md'

    await waitFor(() =>
      expect(document.body.innerHTML).toBe(html`<button class="text-md">Click me</button>`)
    )

    size.val = 'lg'
    await waitFor(() =>
      expect(document.body.innerHTML).toBe(html`<button class="text-lg">Click me</button>`)
    )

    content.val = 'Click me again'
    size.val = null

    await waitFor(() =>
      expect(document.body.innerHTML).toBe(html`<button class="">Click me again</button>`)
    )
  })
})
