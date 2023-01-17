// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import { m } from 'framer-motion'
import React, { ComponentProps, ReactNode } from 'react'
import { PropsOf, QuarkComponentVariants, styled } from '.'

describe('styled', () => {
  const Container = styled('div', {
    base: 'baseClass',
    variants: {
      color: { red: 'red', blue: 'blue' },
      size: { small: 'small', large: 'large' },
    },
    defaults: {
      color: 'blue',
    },
  })

  type QuarkVariants = QuarkComponentVariants<typeof Container>

  test('Without Variants', () => {
    const Center = styled('div', {
      base: 'flex items-center justify-center',
    })

    type Props = ComponentProps<typeof Center>
    type A = Props['disab']

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
      <Container color="red" size="large" className="custom">
        <div>Child</div>
      </Container>
    )
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="custom baseClass red large"
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
    const CustomButton = ({ children, append, ...rest }: ComponentProps<'button'> & { append: string }) => (
      <button {...rest}>{`${children} ${append}`}</button>
    )

    type QuarkVariants = QuarkComponentVariants<typeof StyledCustomButton>
    type Props = ComponentProps<typeof StyledCustomButton>
    type P = PropsOf<typeof StyledCustomButton>
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
        class="test baseClass blue small"
        type="button"
      >
        hello world
      </button>
      <button
        class="test baseClass red small"
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

    const StyledMotion = styled(
      m.div,
      {},
      {
        animate: {},
      }
    )

    const StyledDiv = styled('div', {})
    const Custom = ({ children, style }: { children: ReactNode; style: string; crazy: number }) => {
      return (
        <div>
          {children} {style}
        </div>
      )
    }

    const { container } = render(
      <div>
        <StyledMotion style={{ x: 0 }}>
          <div>Testing</div>
        </StyledMotion>
        <StyledDiv as={m.div} style={{ x: 0 }}>
          <div>Testing</div>
        </StyledDiv>
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

  test('polymorphic', () => {
    const Center = styled('div', {
      base: 'flex items-center justify-center',
    })

    const { container } = render(
      <>
        <Center as="a" href="/">
          <div>Testing</div>
        </Center>
        <Center as="button" disabled>
          <div>Testing</div>
        </Center>
        {/* <div disabled>d</div> */}
      </>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <a
          class="flex items-center justify-center"
          href="/"
        >
          <div>
            Testing
          </div>
        </a>
        <button
          class="flex items-center justify-center"
          disabled=""
        >
          <div>
            Testing
          </div>
        </button>
      </div>
    `)
  })

  test('compose', () => {
    const Composed = styled('button', Container.CSS, {
      style: { top: 0 },
    })

    type QuarkVariants = QuarkComponentVariants<typeof Composed>

    const { container } = render(
      <Composed color="red" size="large" className="custom">
        <div>Child</div>
      </Composed>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="custom baseClass red large"
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

  type QuarkVariants = QuarkComponentVariants<typeof Center>

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

  type QuarkVariants = QuarkComponentVariants<typeof Button>

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
          class="test baseClass blue small"
        >
          hello
        </button>
      </div>
    </div>
  `)
})
