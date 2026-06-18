// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import React from 'react'
import { styled } from '.'
import { styled as styledMerge } from './merge'

describe('styled with plugins', () => {
  const Container = styledMerge('div', {
    base: 'baseClass w-2',
    variants: {
      color: { red: 'red', blue: 'blue' },
      size: { small: 'w-10', large: 'w-20' },
    },
    defaults: {
      color: 'blue',
    },
  })

  test('base', () => {
    const { container } = render(
      <Container color="red" size="large" className="custom w-30">
        <div>Child</div>
      </Container>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="baseClass red custom w-30"
        >
          <div>
            Child
          </div>
        </div>
      </div>
    `)
  })

  test('preserves plugins when composing with Quark CSS', () => {
    const Composed = styled('div', Container.CSS)

    const { container } = render(
      <Composed size="large" className="custom w-30">
        <div>Child</div>
      </Composed>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="baseClass blue custom w-30"
        >
          <div>
            Child
          </div>
        </div>
      </div>
    `)
  })
})
