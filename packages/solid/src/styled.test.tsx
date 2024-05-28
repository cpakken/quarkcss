// @vitest-environment happy-dom
import { render } from '@solidjs/testing-library'
import { styled } from './styled'

test('basic', () => {
  const { container } = render(() => <div>hello</div>)
  expect(container.innerHTML).toBe('<div>hello</div>')
})

test.only('styled', () => {
  const Bold = styled.div('text-bold')
  const { container } = render(() => (
    <Bold>
      <span>hello</span>
      <span>world</span>
    </Bold>
  ))

  console.log(container.innerHTML)
})
