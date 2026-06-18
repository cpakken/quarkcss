import type { MixedCX } from '@quarkcss/core'
// @vitest-environment happy-dom
import { render } from '@solidjs/testing-library'
import { createSignal, type ComponentProps } from 'solid-js'
import { expectTypeOf } from 'vitest'
import { type QuarkVariantProps, styled } from './styled'

const html = String

test('styled', () => {
  const Bold = styled.div('text-bold')
  // const Bold = styled.div('text-bold', {ari})
  // const Bold = styled('div', 'text-bold', {aria})

  expectTypeOf<QuarkVariantProps<typeof Bold>>().toEqualTypeOf<{}>()
  expectTypeOf<ComponentProps<typeof Bold>['class']>().toEqualTypeOf<
    ComponentProps<'div'>['class']
  >()

  const { container } = render(() => (
    <Bold cx={['custom', { world: true, foo: false }]}>
      <span>hello</span>
    </Bold>
  ))

  expect(container.innerHTML).toBe(
    html`<div class="text-bold custom world"><span>hello</span></div>`
  )
})

test('styled with variants', () => {
  // const Button = styled('button', {
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
  type Props = ComponentProps<typeof Button>

  expect(Button.displayName).toBe('Button')
  expectTypeOf<Variants>().toEqualTypeOf<{
    size: 'sm' | 'md' | 'lg'
  }>()
  expectTypeOf<Props['cx']>().toEqualTypeOf<MixedCX | undefined>()
  expectTypeOf<Props['type']>().toEqualTypeOf<ComponentProps<'button'>['type']>()

  const { container } = render(() => <Button size="lg">Click me</Button>)

  expect(container.innerHTML).toBe(html`<button type="button" class="text-lg">Click me</button>`)
})

test('styled with variants using signal', () => {
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

  const [size, setSize] = createSignal<'sm' | 'md' | 'lg' | null>('sm')

  const [content, setContent] = createSignal('Click me')

  const { container } = render(() => <Button size={size()}>{content()}</Button>)

  expect(container.innerHTML).toBe(html`<button class="text-sm">Click me</button>`)
  setSize('md')
  expect(container.innerHTML).toBe(html`<button class="text-md">Click me</button>`)
  setSize('lg')
  expect(container.innerHTML).toBe(html`<button class="text-lg">Click me</button>`)

  setContent('Click me again')
  expect(container.innerHTML).toBe(html`<button class="text-lg">Click me again</button>`)

  setSize(null)
  expect(container.innerHTML).toBe(html`<button class="">Click me again</button>`)
})
