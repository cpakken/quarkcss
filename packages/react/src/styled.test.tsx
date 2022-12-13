// @vitest-environment happy-dom

import { prettyDOM, render } from '@testing-library/react'
import React, { ComponentProps } from 'react'
import { QuarkComponentVariants, styled } from '.'

describe.skip('styled', () => {
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

  test('base', () => {
    const { container } = render(
      <Container color="red" size="large" className="custom">
        <div>Child</div>
      </Container>
    )
    const { className } = container.firstElementChild!
    expect(className).toEqual('custom baseClass red large')
  })
})

test('Without Variants', () => {
  const Center = styled('div', {
    base: 'flex items-center justify-center',
  })

  const { container } = render(
    <Center>
      <div>Testing</div>
    </Center>
  )

  const { className } = container.firstElementChild!
  expect(className).toEqual('flex items-center justify-center')
})

test('HOC', () => {
  const Component = ({ children, append, ...rest }: ComponentProps<'button'> & { append: string }) => (
    <button {...rest}>
      {children}
      {append}
    </button>
  )

  type QuarkVariants = QuarkComponentVariants<typeof StyledContainer>

  const StyledContainer = styled(Component, {
    base: 'baseClass',
    variants: {
      color: { red: 'red', blue: 'blue' },
      size: { small: 'small', large: 'large' },
    },
  })

  const { container } = render(
    <StyledContainer append="!" color="blue" size="small" className="test">
      hello
    </StyledContainer>
  )
  const { className } = container.firstElementChild!

  expect(className).toEqual('baseClass blue small test')
})
