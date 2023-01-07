import { css, isQuarkCss, PropsOfVariantsMap, QuarkConfig, QuarkCss, QuarkVariantsMap } from '@quarkcss/core'
import { ComponentProps, createElement, ElementType, forwardRef, memo, ReactElement } from 'react'
import { createSeparateQuarkPropsFn } from './createSeparateQuarkPropsFn'

export type QuarkComponentPolymorphicProps<
  As extends ElementType | never,
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  DefaultProps extends PartialComponentProps<Element>
> = { as?: As } & Assign<
  // ComponentProps<IsNever<As, Element>>,
  Assign<ComponentProps<IsNever<As, Element>>, Partial<DefaultProps>>,
  // Assign<IsNever<ComponentProps<As>, ComponentProps<Element>>, Partial<DefaultProps>>,
  PropsOfVariantsMap<VariantsMap>
>

export interface QuarkComponent<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  DefaultProps extends PartialComponentProps<Element>
> {
  <As extends ElementType | never = never>(
    props: QuarkComponentPolymorphicProps<As, Element, VariantsMap, DefaultProps>
  ): ReactElement<any, any> | null
  CSS: QuarkCss<VariantsMap>
}

type IsNever<T, A> = [T] extends [never] ? A : T

// type Assign<A, B> = Omit<A, keyof B> & B
type Assign<A, B> = Omit<A, keyof B | 'as'> & B

export type QuarkComponentVariantsMap<C> = C extends QuarkComponent<any, infer V, any> ? V : never
export type QuarkComponentVariants<C> = PropsOfVariantsMap<QuarkComponentVariantsMap<C>>
export type PropsOf<C extends ElementType> = C extends QuarkComponent<infer E, infer V, infer D>
  ? QuarkComponentPolymorphicProps<never, E, V, D>
  : ComponentProps<C>

export type PartialComponentProps<Element extends ElementType> = Partial<ComponentProps<Element>>

export function styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap = {},
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  element: Element,
  configOrCss: QuarkConfig<VariantsMap> | QuarkCss<VariantsMap>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap, DefaultProps> {
  const quark = isQuarkCss(configOrCss)
    ? (configOrCss as QuarkCss<VariantsMap>)
    : css(configOrCss as QuarkConfig<VariantsMap>)

  const separateQuarkProps = createSeparateQuarkPropsFn(quark)

  return Object.assign(
    memo(
      forwardRef<any, any>(({ children, className: _className, as, ...props }, ref) => {
        const [quarkProps, rest] = separateQuarkProps(props)

        const cssClassString = quark(quarkProps as any)
        const className = _className ? `${_className} ${cssClassString}` : cssClassString

        // @ts-ignore
        return createElement(as || element, { ...defaultComponentProps, className, ...rest, ref }, children)
      })
    ),
    { CSS: quark }
  ) as any
}

//Re-export @quark/core
export { css, isQuarkCss }
export type { QuarkConfig, QuarkCss, QuarkVariantsMap }
