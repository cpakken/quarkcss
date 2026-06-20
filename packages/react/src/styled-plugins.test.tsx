// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import React from 'react'
import { expectTypeOf } from 'vitest'
import { createCss, css, getQuarkConfig, mergeQuarkConfigs, styled, type QuarkProps } from '.'
import {
  createCss as createCssFromMerge,
  css as cssMerge,
  getQuarkConfig as getQuarkConfigFromMerge,
  mergeQuarkConfigs as mergeQuarkConfigsFromMerge,
  styled as styledMerge,
  type QuarkProps as MergeQuarkProps,
} from './merge'

describe('styled with plugins', () => {
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
    expect(createCss((classNames) => `${classNames} plugin`)('base')()).toBe('base plugin')
  })

  test('merge entry re-exports core helpers and keeps merged css configured', () => {
    const button = cssMerge({
      base: 'p-2',
      variants: {
        size: { large: 'p-4' },
      },
    })

    expectTypeOf<MergeQuarkProps<typeof button>>().toEqualTypeOf<{
      size: 'large'
    }>()
    expect(button({ size: 'large' }, 'p-8')).toBe('p-8')
    expect(getQuarkConfigFromMerge(button).base).toBe('p-2')
    expect(mergeQuarkConfigsFromMerge({ base: 'w-2' }, { base: 'w-4' }).base).toEqual([
      'w-2',
      'w-4',
    ])
    expect(createCssFromMerge((classNames) => classNames.toUpperCase())('base')()).toBe('BASE')
  })

  test('exports css with plugins applied', () => {
    const button = cssMerge({
      base: 'p-4',
      variants: {
        size: { large: 'p-8' },
      },
    })

    expect(button({ size: 'large' })).toEqual('p-8')
  })

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
