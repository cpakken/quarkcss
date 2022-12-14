import { css, PropsOfVariantsMap, QuarkConfig, QuarkVariantsMap } from '@quarkcss/core'
import {
  ComponentProps,
  ComponentType,
  createElement,
  forwardRef,
  ForwardRefExoticComponent,
  memo,
} from 'react'
import { createSeparateQuarkPropsFn } from './createSeparateQuarkPropsFn'

export interface QuarkComponent<
  Element extends keyof JSX.IntrinsicElements | ComponentType<any> = ComponentType<any>,
  VariantsMap extends QuarkVariantsMap = {}
> extends ForwardRefExoticComponent<Assign<ComponentProps<Element>, PropsOfVariantsMap<VariantsMap>>> {}

type Assign<A, B> = Omit<A, keyof B> & B

export type QuarkComponentVariantsMap<C> = C extends QuarkComponent<any, infer V> ? V : never
export type QuarkComponentVariants<C> = PropsOfVariantsMap<QuarkComponentVariantsMap<C>>

export function styled<
  Element extends keyof JSX.IntrinsicElements | ComponentType<any>,
  VariantsMap extends QuarkVariantsMap = {}
>(element: Element, config: QuarkConfig<VariantsMap>): QuarkComponent<Element, VariantsMap> {
  const quark = css(config)
  const separateQuarkProps = createSeparateQuarkPropsFn(config)

  return memo(
    forwardRef<any, any>(({ children, className: _className, ...props }, ref) => {
      const [quarkProps, rest] = separateQuarkProps(props)

      const cssClassString = quark(quarkProps)
      const className = _className ? `${cssClassString} ${_className}` : cssClassString

      // @ts-ignore
      return createElement(element, { ref, className, ...rest }, children)
    })
  ) as any
}
