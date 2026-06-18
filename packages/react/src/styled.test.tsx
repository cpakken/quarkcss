// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import type { MixedCX } from '@quarkcss/core'
import { m } from 'framer-motion'
import React, { type ComponentProps, type ComponentPropsWithoutRef } from 'react'
import { expectTypeOf } from 'vitest'
import { type QuarkVariantProps, styled } from '.'

type Prettify<T> = { [K in keyof T]: T[K] } & {}

describe('styled', () => {
  const Container = styled('div', {
    name: 'Container',
    base: 'baseClass',
    variants: {
      color: { red: 'red', blue: 'blue' },
      size: { small: 'small', large: 'large' },
    },
    defaults: {
      color: 'blue',
    },
  })

  test('displayName', () => {
    expect(Container.displayName).toBe('Container')
  })

  test('variant types', () => {
    type Variants = QuarkVariantProps<typeof Container>
    type Props = ComponentProps<typeof Container>

    expectTypeOf<Variants>().toEqualTypeOf<{
      color?: 'red' | 'blue'
      size: 'small' | 'large'
    }>()
    expectTypeOf<Props['cx']>().toEqualTypeOf<MixedCX | undefined>()
  })

  test('Without Variants', () => {
    const Center = styled.div({
      base: 'flex items-center justify-center',
      // variants: {
      //   color: { red: 'red', blue: 'blue' },
      //   size: { small: 'small', large: 'large' },
      // }
    })

    expectTypeOf<QuarkVariantProps<typeof Center>>().toEqualTypeOf<{}>()
    type Props = Prettify<ComponentProps<typeof Center>>
    expectTypeOf<Props['color']>().toEqualTypeOf<string | undefined>()

    const { container } = render(
      <Center>
        <div>Testing</div>
      </Center>,
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="flex items-center justify-center"
        >
          <div>
            Testing
          </div>
        </div>
      </div>
    `)
  })

  test('base', () => {
    const { container } = render(
      <Container color="red" size="large" cx={['amazing', { custom: true }]}>
        <div>Child</div>
      </Container>,
    )
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="baseClass red large amazing custom"
        >
          <div>
            Child
          </div>
        </div>
      </div>
    `)
  })

  test('template strings', () => {
    const Conatiner2 = styled('div', {
      base: `
        baseClass
        bg-red-500
    `,
    })

    const { container } = render(<Conatiner2 />)
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="baseClass bg-red-500"
      />
    `)
  })

  test('HOC', () => {
    const CustomButton = ({
      children,
      append,
      ...rest
    }: ComponentProps<'button'> & { append: string }) => (
      <button {...rest}>{`${children} ${append}`}</button>
    )

    // type P = PropsOf<typeof StyledCustomButton>
    // type PB = P['style']
    // type PB = P['style']

    // type A = Props['disab']
    // type B = Props['as']

    const StyledCustomButton = styled(
      CustomButton,
      {
        base: 'baseClass',
        variants: {
          color: { red: 'red', blue: 'blue' },
          size: { small: 'small', large: 'large' },
        },
      },
      {
        type: 'button',
        append: '??',
      },
    )

    type Variants = QuarkVariantProps<typeof StyledCustomButton>
    type Props = ComponentProps<typeof StyledCustomButton>

    expectTypeOf<Variants>().toEqualTypeOf<{
      color: 'red' | 'blue'
      size: 'small' | 'large'
    }>()
    expectTypeOf<Props['append']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Props['type']>().toEqualTypeOf<ComponentProps<'button'>['type']>()

    const { container } = render(
      <>
        <StyledCustomButton append="world" color="blue" size="small" className="test">
          hello
        </StyledCustomButton>
        <StyledCustomButton color="red" size="small" className="test">
          hello
        </StyledCustomButton>
      </>,
    )
    expect(container).toMatchInlineSnapshot(`
    <div>
      <button
        class="baseClass blue small test"
        type="button"
      >
        hello world
      </button>
      <button
        class="baseClass red small test"
        type="button"
      >
        hello ??
      </button>
    </div>
  `)
  })

  test('HOC / Polymorphic Framer Motion Types', () => {
    // const StyledMotion = styled(motion.div, {
    // const Styled = styled('div', {})

    const StyledMotion = styled(m.div, {}, { layout: true })

    type Props = ComponentProps<typeof StyledMotion>
    expectTypeOf<Props['layout']>().toEqualTypeOf<ComponentProps<typeof m.div>['layout']>()

    const { container } = render(
      <div>
        <StyledMotion style={{ x: 0 }} layout="position">
          <div>Testing</div>
        </StyledMotion>
      </div>,
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div
            class=""
            style="transform: none;"
          >
            <div>
              Testing
            </div>
          </div>
        </div>
      </div>
    `)
  })

  test('compose', () => {
    const Composed = styled('button', Container.CSS, {
      style: { top: 0 },
    })

    type Variants = QuarkVariantProps<typeof Composed>
    type Props = ComponentProps<typeof Composed>
    type PropsWithoutRef = ComponentPropsWithoutRef<typeof Composed>

    expectTypeOf<Variants>().toEqualTypeOf<{
      color?: 'red' | 'blue'
      size: 'small' | 'large'
    }>()
    expectTypeOf<Props['style']>().toEqualTypeOf<ComponentProps<'button'>['style']>()
    expectTypeOf<PropsWithoutRef['style']>().toEqualTypeOf<ComponentProps<'button'>['style']>()

    const { container } = render(
      <Composed color="red" size="large" className="custom">
        <div>Child</div>
      </Composed>,
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="baseClass red large custom"
          style="top: 0px;"
        >
          <div>
            Child
          </div>
        </button>
      </div>
    `)
  })

  test('extends quark components by appending config output', () => {
    const Badge = styled(
      'span',
      {
        base: 'badge-base',
        variants: {
          tone: {
            neutral: 'tone-neutral',
            danger: 'tone-danger',
          },
          size: {
            small: 'size-small',
          },
        },
        compound: [
          {
            tone: 'danger',
            size: 'small',
            class: 'badge-danger-small',
          },
        ],
        defaults: {
          tone: 'neutral',
          size: 'small',
        },
      },
      {
        role: 'status',
        title: 'Base title',
      }
    )

    const InteractiveBadge = styled(
      Badge,
      {
        base: 'interactive-base',
        variants: {
          tone: {
            danger: 'interactive-danger',
            dangerHover: 'interactive-danger-hover',
          },
          interactive: {
            true: 'interactive-enabled',
          },
        },
        compound: [
          {
            tone: 'danger',
            interactive: true,
            class: 'interactive-danger-compound',
          },
        ],
        defaults: {
          tone: 'dangerHover',
        },
      },
      {
        title: 'Interactive title',
      }
    )

    type Variants = QuarkVariantProps<typeof InteractiveBadge>
    type Props = ComponentProps<typeof InteractiveBadge>

    expectTypeOf<Variants>().toEqualTypeOf<{
      tone?: 'neutral' | 'danger' | 'dangerHover'
      size?: 'small'
      interactive?: boolean | null | undefined | 0
    }>()
    expectTypeOf<Props['role']>().toEqualTypeOf<ComponentProps<'span'>['role']>()
    expectTypeOf<Props['title']>().toEqualTypeOf<ComponentProps<'span'>['title']>()

    const { container } = render(
      <>
        <InteractiveBadge tone="danger" interactive className="custom">
          Danger
        </InteractiveBadge>
        <InteractiveBadge>Default</InteractiveBadge>
      </>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="badge-base interactive-base tone-danger interactive-danger size-small interactive-enabled badge-danger-small interactive-danger-compound custom"
          role="status"
          title="Interactive title"
        >
          Danger
        </span>
        <span
          class="badge-base interactive-base interactive-danger-hover size-small"
          role="status"
          title="Interactive title"
        >
          Default
        </span>
      </div>
    `)
  })

  test('extends quark components with base classes', () => {
    const Button = styled(
      'button',
      {
        base: 'button-base',
        variants: {
          tone: {
            neutral: 'tone-neutral',
            danger: 'tone-danger',
          },
        },
        defaults: {
          tone: 'neutral',
        },
      },
      {
        type: 'button',
      }
    )

    const ToolbarButton = styled(Button, ['toolbar-button', 'gap-2'])

    type Variants = QuarkVariantProps<typeof ToolbarButton>
    type Props = ComponentProps<typeof ToolbarButton>

    expectTypeOf<Variants>().toEqualTypeOf<{
      tone?: 'neutral' | 'danger'
    }>()
    expectTypeOf<Props['type']>().toEqualTypeOf<ComponentProps<'button'>['type']>()

    const { container } = render(
      <>
        <ToolbarButton>Default</ToolbarButton>
        <ToolbarButton tone="danger" className="custom">
          Danger
        </ToolbarButton>
      </>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="button-base toolbar-button gap-2 tone-neutral"
          type="button"
        >
          Default
        </button>
        <button
          class="button-base toolbar-button gap-2 tone-danger custom"
          type="button"
        >
          Danger
        </button>
      </div>
    `)
  })

  test('extends already-extended quark components', () => {
    const Badge = styled.span({
      base: 'badge-base',
      variants: {
        tone: {
          neutral: 'tone-neutral',
          danger: 'tone-danger',
        },
      },
      defaults: {
        tone: 'neutral',
      },
    })

    const InteractiveBadge = styled(Badge, {
      variants: {
        tone: {
          danger: 'interactive-danger',
        },
        interactive: {
          true: 'interactive-enabled',
        },
      },
    })

    const ActionBadge = styled(InteractiveBadge, {
      base: 'action-badge',
      variants: {
        tone: {
          danger: 'action-danger',
          success: 'tone-success',
        },
      },
      defaults: {
        tone: 'success',
      },
    })

    type Variants = QuarkVariantProps<typeof ActionBadge>

    expectTypeOf<Variants>().toEqualTypeOf<{
      tone?: 'neutral' | 'danger' | 'success'
      interactive?: boolean | null | undefined | 0
    }>()

    const { container } = render(
      <>
        <ActionBadge>Default</ActionBadge>
        <ActionBadge tone="danger" interactive>
          Danger
        </ActionBadge>
      </>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="badge-base action-badge tone-success"
        >
          Default
        </span>
        <span
          class="badge-base action-badge tone-danger interactive-danger action-danger interactive-enabled"
        >
          Danger
        </span>
      </div>
    `)
  })
})

test('className string', () => {
  const Center = styled('div', ['flex items-center', 'justify-center'], { 'aria-label': 'center' })
  // const Center = styled('div', 'flex items-center justify-center', { 'aria-label': 'center' })

  expectTypeOf<QuarkVariantProps<typeof Center>>().toEqualTypeOf<{}>()
  expectTypeOf<ComponentProps<typeof Center>['aria-label']>().toEqualTypeOf<
    ComponentProps<'div'>['aria-label']
  >()

  const { container } = render(
    <Center>
      <div>Testing</div>
    </Center>,
  )

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        aria-label="center"
        class="flex items-center justify-center"
      >
        <div>
          Testing
        </div>
      </div>
    </div>
  `)
})

test('proxy intrinsic elements', () => {
  const Button = styled.button({
    base: 'baseClass',
    variants: {
      color: { red: 'red', blue: 'blue' },
      size: { small: 'small', large: 'large' },
    },
  })

  type Variants = QuarkVariantProps<typeof Button>
  type Props = ComponentProps<typeof Button>

  expectTypeOf<Variants>().toEqualTypeOf<{
    color: 'red' | 'blue'
    size: 'small' | 'large'
  }>()
  expectTypeOf<Props['className']>().toEqualTypeOf<ComponentProps<'button'>['className']>()

  const Center = styled.div(`
    flex 
    items-center
    justify-center
  `)

  const { container } = render(
    <Center>
      <Button color="blue" size="small" className="test" cx={['amazing', null, { custom: true }]}>
        hello
      </Button>
    </Center>,
  )

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="flex items-center justify-center"
      >
        <button
          class="baseClass blue small test amazing custom"
        >
          hello
        </button>
      </div>
    </div>
  `)
})
