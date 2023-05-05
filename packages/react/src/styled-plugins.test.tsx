// @vitest-environment happy-dom

import React from "react";
import { twMerge } from 'tailwind-merge';
import { createStyled } from ".";
import { render } from '@testing-library/react'

describe('styled with plugins', () => {
  const styledMerge = createStyled(twMerge)

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

});