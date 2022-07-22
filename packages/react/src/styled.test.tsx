// @vitest-environment happy-dom

import React from 'react'
import { styled } from '.'
import { render } from '@testing-library/react'

describe('styled', () => {
  const Container = styled('div', {
    base: 'baseClass',
    variants: {
      color: { red: 'red', blue: 'blue' },
      size: { small: 'small', large: 'large' },
    },
    defaultVariants: {
      color: 'blue',
    },
  })

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
