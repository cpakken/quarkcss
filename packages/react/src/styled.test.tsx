// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import { m } from 'framer-motion'
import React, { ComponentProps } from 'react'
import { QuarkVariantProps, styled } from '.'

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

  type QuarkVariants = QuarkVariantProps<typeof Container>

  test('displayName', () => {
    expect(Container.displayName).toBe('Container')
  })

  test('Without Variants', () => {
    const TEST = styled.div('d')

    const Center = styled.div({
      base: 'flex items-center justify-center',
      // variants: {
      //   color: { red: 'red', blue: 'blue' },
      //   size: { small: 'small', large: 'large' },
      // }
    })

    type QuarkVariants = QuarkVariantProps<typeof Center>

    type Props = Prettify<ComponentProps<typeof Center>>
    // type Props = Prettify<PropsOf<typeof Center>>

    type A = Props['color']

    const { container } = render(
      <Center>
        <div>Testing</div>
      </Center>
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
      <Container color="red" size="large" cn={['amazing', { custom: true }]}>
        <div>Child</div>
      </Container>
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

    type QuarkVariants = QuarkVariantProps<typeof StyledCustomButton>
    type Props = ComponentProps<typeof StyledCustomButton>
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
      }
    )

    const { container } = render(
      <>
        <StyledCustomButton append="world" color="blue" size="small" className="test">
          hello
        </StyledCustomButton>
        <StyledCustomButton color="red" size="small" className="test">
          hello
        </StyledCustomButton>
      </>
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

    const StyledMotion = styled(m.div, {}, { animate: {} })

    const { container } = render(
      <div>
        <StyledMotion style={{ x: 0 }}>
          <div>Testing</div>
        </StyledMotion>
      </div>
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

    type QuarkVariants = QuarkVariantProps<typeof Composed>

    const { container } = render(
      <Composed color="red" size="large" className="custom">
        <div>Child</div>
      </Composed>
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
})

test('className string', () => {
  const Center = styled('div', ['flex items-center', 'justify-center'], { 'aria-label': 'center' })
  // const Center = styled('div', 'flex items-center justify-center', { 'aria-label': 'center' })

  type QuarkVariants = QuarkVariantProps<typeof Center>

  const { container } = render(
    <Center>
      <div>Testing</div>
    </Center>
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

  type QuarkVariants = QuarkVariantProps<typeof Button>

  const Center = styled.div(`
    flex 
    items-center
    justify-center
  `)

  const { container } = render(
    <Center>
      <Button color="blue" size="small" className="test">
        hello
      </Button>
    </Center>
  )

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="flex items-center justify-center"
      >
        <button
          class="baseClass blue small test"
        >
          hello
        </button>
      </div>
    </div>
  `)
})
