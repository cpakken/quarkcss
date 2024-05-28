import { test, expect, describe, beforeEach } from 'bun:test'
import { styled } from './styled'
import van from 'vanjs-core'
import { waitFor } from '@testing-library/dom'

const html = String

describe('styled', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('styled', () => {
    const Hello = styled.div('font-bold')
    document.body.append(Hello({}, 'world'))

    expect(document.body.innerHTML).toBe(html`<div class="font-bold">world</div>`)
  })

  test('styled with variants', () => {
    const Button = styled.button({
      variants: {
        size: {
          sm: 'text-sm',
          md: 'text-md',
          lg: 'text-lg',
        },
      },
    })

    document.body.append(Button({ size: 'lg' }, 'Click me'))

    expect(document.body.innerHTML).toBe(html`<button class="text-lg">Click me</button>`)
  })

  test('styled with variants using state', async () => {
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

    const size = van.state<'sm' | 'md' | 'lg' | null>('sm')

    const content = van.state('Click me')

    document.body.append(Button({ size }, content))

    expect(document.body.innerHTML).toBe(html`<button class="text-sm">Click me</button>`)

    size.val = 'md'

    await waitFor(() =>
      expect(document.body.innerHTML).toBe(html`<button class="text-md">Click me</button>`)
    )

    size.val = 'lg'
    await waitFor(() =>
      expect(document.body.innerHTML).toBe(html`<button class="text-lg">Click me</button>`)
    )

    content.val = 'Click me again'
    size.val = null

    await waitFor(() =>
      expect(document.body.innerHTML).toBe(html`<button class="">Click me again</button>`)
    )
  })
})
