// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import React from 'react'
import { expectTypeOf } from 'vitest'
import { createCss, css, getQuarkConfig, mergeQuarkConfigs, styled, type QuarkProps } from '.'
import {
  createCss as createCssFromCnfast,
  css as cssCnfast,
  getQuarkConfig as getQuarkConfigFromCnfast,
  mergeQuarkConfigs as mergeQuarkConfigsFromCnfast,
  styled as styledCnfast,
  type QuarkProps as CnfastQuarkProps,
} from './cnfast'

describe('styled with class engines', () => {
  const differentFactoryMessage =
    'Cannot use Quark CSS created by a different styled/css factory. Import both css and styled from the same configured QuarkCSS module.'

  test('main entry re-exports core helpers and types', () => {
    const button = css({
      variants: {
        tone: { neutral: 'text-slate-900', danger: 'text-red-600' },
      },
      defaults: {
        tone: 'neutral',
      },
    })

    expectTypeOf<QuarkProps<typeof button>>().toEqualTypeOf<{
      tone?: 'neutral' | 'danger'
    }>()
    expect(getQuarkConfig(button).defaults).toEqual({ tone: 'neutral' })
    expect(mergeQuarkConfigs({ base: 'p-2' }, { base: 'p-4' }).base).toEqual(['p-2', 'p-4'])
    expect(createCss({ merge: (classNames) => classNames.toUpperCase() })('base')()).toBe('BASE')
  })

  test('cnfast entry re-exports core helpers and keeps css configured', () => {
    const button = cssCnfast({
      base: 'p-2',
      variants: {
        size: { large: 'p-4' },
      },
    })

    expectTypeOf<CnfastQuarkProps<typeof button>>().toEqualTypeOf<{
      size: 'large'
    }>()
    expect(button({ size: 'large' }, 'p-8')).toBe('p-8')
    expect(getQuarkConfigFromCnfast(button).base).toBe('p-2')
    expect(mergeQuarkConfigsFromCnfast({ base: 'w-2' }, { base: 'w-4' }).base).toEqual([
      'w-2',
      'w-4',
    ])
    expect(
      createCssFromCnfast({
        merge: (classNames) => classNames.toUpperCase(),
      })('base')()
    ).toBe('BASE')
  })

  test('exports css with cnfast applied', () => {
    const button = cssCnfast({
      base: 'p-4',
      variants: {
        size: { large: 'p-8' },
      },
    })

    expect(button({ size: 'large' })).toEqual('p-8')
  })

  test('cnfast css and styled are a matched factory pair', () => {
    const buttonCSS = cssCnfast({ base: 'p-2 p-4' })
    const Button = styledCnfast.button(buttonCSS)
    const DangerButton = styledCnfast(Button, { base: 'bg-red-500' })
    const Copy = styledCnfast('button', Button.CSS)

    const { container } = render(
      <>
        <Button />
        <DangerButton />
        <Copy />
      </>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <button
          class="p-4"
        />
        <button
          class="p-4 bg-red-500"
        />
        <button
          class="p-4"
        />
      </div>
    `)
  })

  test('throws when mixing css and styled factories', () => {
    const buttonCSS = cssCnfast({ base: 'p-2 p-4' })
    const Button = styledCnfast.button('p-2 p-4')

    expect(() => styled.button(buttonCSS)).toThrow(differentFactoryMessage)
    expect(() => styled(Button, { base: 'bg-red-500' })).toThrow(differentFactoryMessage)
    expect(() => styled('button', Button.CSS)).toThrow(differentFactoryMessage)
  })

  const Container = styledCnfast('div', {
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

  test('preserves class engine when composing with Quark CSS', () => {
    const Composed = styledCnfast('div', Container.CSS)

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
