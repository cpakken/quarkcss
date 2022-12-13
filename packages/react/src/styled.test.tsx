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

  test('basic', () => {
    const { container } = render(<Container />)
    const { className } = container.firstElementChild!
    expect(className).toEqual('baseClass blue')
  })

  test('props', () => {
    const { container } = render(<Container color="red" size="large" />)
    const { className } = container.firstElementChild!
    expect(className).toEqual('baseClass red large')
  })

  test('custom className', () => {
    const { container } = render(<Container color="red" size="large" className="custom" />)
    const { className } = container.firstElementChild!
    expect(className).toEqual('custom baseClass red large')
  })
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
  console.log(prettyDOM(container.firstElementChild!))

  expect(className).toEqual('baseClass blue small test')
})
