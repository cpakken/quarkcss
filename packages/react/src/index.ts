import type {
  ComponentPropsWithRef,
  ComponentType,
  ForwardRefExoticComponent,
  PropsWithChildren,
  ReactHTML,
} from 'react'
import { createElement, forwardRef } from 'react'
import {
  css,
  PropsOfVariantsMap,
  QuarkConfig,
  QuarkVariantsMap,
  shallowMemoPrev,
  createShouldForwardProps,
} from '@quarkcss/core'

export interface UnoComponent<Element extends keyof ReactHTML | ComponentType, VariantsMap extends QuarkVariantsMap>
  extends ForwardRefExoticComponent<
    PropsWithChildren<Assign<ComponentPropsWithRef<Element>, PropsOfVariantsMap<VariantsMap>>>
  > {}

type Assign<A, B> = Omit<A, keyof B> & B

export function styled<Element extends keyof ReactHTML | ComponentType, VariantsMap extends QuarkVariantsMap = {}>(
  element: Element,
  config: QuarkConfig<VariantsMap>
): UnoComponent<Element, VariantsMap> {
  const quark = shallowMemoPrev(css(config))
  const shouldForwardProps = shallowMemoPrev(createShouldForwardProps(config))

  return forwardRef<
    Element,
    PropsWithChildren<{ [variant in keyof VariantsMap]?: any } & ComponentPropsWithRef<Element>>
  >(({ children, className: _className, ...props }, ref) => {
    const [quarkProps, rest] = shouldForwardProps(props)

    const css = quark(quarkProps)
    const className = _className ? `${_className} ${css}` : css

    // @ts-ignore
    return createElement(element, { ref, className, ...rest }, children)
  }) as any
}
