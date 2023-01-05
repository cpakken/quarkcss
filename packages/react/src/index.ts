import { css, PropsOfVariantsMap, QuarkConfig, QuarkVariantsMap } from '@quarkcss/core'
import {
  ComponentProps,
  ComponentType,
  createElement,
  ElementType,
  forwardRef,
  memo,
  ReactElement,
} from 'react'
import { createSeparateQuarkPropsFn } from './createSeparateQuarkPropsFn'

type QuarkComponentPolymorphicProps<
  As extends ElementType,
  Element extends ElementType = ComponentType,
  VariantsMap extends QuarkVariantsMap = {},
  DefaultProps extends DefaultComponentPropsConfig<Element> = DefaultComponentPropsConfig<Element>
> = { as?: As } & Assign<Assign<ComponentProps<Element>, DefaultProps>, PropsOfVariantsMap<VariantsMap>>

export interface QuarkComponent<
  Element extends ElementType = ComponentType,
  VariantsMap extends QuarkVariantsMap = {},
  DefaultProps extends DefaultComponentPropsConfig<Element> = DefaultComponentPropsConfig<Element>
> {
  <As extends ElementType | never = never>(
    props: QuarkComponentPolymorphicProps<As, IsNever<As, Element>, VariantsMap, DefaultProps>
  ): ReactElement | null
}

type IsNever<T, A> = [T] extends [never] ? A : T

type Assign<A, B> = Omit<A, keyof B> & B

export type QuarkComponentVariantsMap<C> = C extends QuarkComponent<any, infer V> ? V : never
export type QuarkComponentVariants<C> = PropsOfVariantsMap<QuarkComponentVariantsMap<C>>

export type DefaultComponentPropsConfig<Element extends ElementType> = Partial<
  Omit<ComponentProps<Element>, 'className'>
>

export function styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap = {},
  DefaultProps extends DefaultComponentPropsConfig<Element> = DefaultComponentPropsConfig<Element>
>(
  element: Element,
  config: QuarkConfig<VariantsMap>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap> {
  const quark = css(config)
  const separateQuarkProps = createSeparateQuarkPropsFn(config)

  return memo(
    forwardRef<any, any>(({ children, className: _className, as, ...props }, ref) => {
      const [quarkProps, rest] = separateQuarkProps(props)

      const cssClassString = quark(quarkProps)
      const className = _className ? `${_className} ${cssClassString}` : cssClassString

      // @ts-ignore
      return createElement(as || element, { ...defaultComponentProps, className, ...rest, ref }, children)
    })
  ) as any
}
