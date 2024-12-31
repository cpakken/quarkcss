import { test, expect, describe, beforeEach } from 'bun:test'
import { styled } from './styled'
import van from 'vanjs-core'
import { waitFor } from '@testing-library/dom'

// const html = String
const html = (strings: TemplateStringsArray, ...values: any[]) => {
  let result = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '')
  return result.replace(/\n\s+/g, '')
}

describe('styled', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('styled', () => {
    const Bold = styled.div('font-bold')
    const { div } = van.tags
    document.body.append(Bold({}, Bold('HELLO'), 'world', Bold(div('foobar'))))

    expect(document.body.innerHTML).toBe(
      html`<div class="font-bold">
        <div class="font-bold">HELLO</div>
        world
        <div class="font-bold"><div>foobar</div></div>
      </div>`
    )
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

    document.body.append(
      Button({ size: 'lg', cx: ['custom', { foo: true, bar: false }] }, 'Click me')
    )

    expect(document.body.innerHTML).toBe(html`<button class="text-lg custom foo">Click me</button>`)
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
