// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import React, { ComponentProps } from 'react'
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
})
