import { css, isQuarkCss, PropsOfVariantsMap, QuarkConfig, QuarkCss, QuarkVariantsMap } from '@quarkcss/core'
import {
  ComponentProps,
  createElement,
  ElementType,
  forwardRef,
  ForwardRefRenderFunction,
  memo,
  ReactElement,
} from 'react'
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

type AnyQuarkCss = QuarkCss<any>

export function styled<Element extends ElementType, DefaultProps extends PartialComponentProps<Element> = {}>(
  element: Element,
  baseClasses: string | string[],
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, {}, DefaultProps>

export function styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap = {},
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  element: Element,
  configOrCss: QuarkConfig<VariantsMap> | QuarkCss<VariantsMap>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap, DefaultProps>

export function styled<Element extends ElementType>(
  element: Element,
  configOrCssOrClassStrings: string | string[] | QuarkConfig | AnyQuarkCss,
  defaultComponentProps?: PartialComponentProps<Element>
) {
  const quark = isQuarkCss(configOrCssOrClassStrings)
    ? (configOrCssOrClassStrings as AnyQuarkCss)
    : !isStrings(configOrCssOrClassStrings)
    ? css(configOrCssOrClassStrings as QuarkConfig)
    : null

  let Component: ForwardRefRenderFunction<any, any>

  if (quark) {
    const separateQuarkProps = createSeparateQuarkPropsFn(quark)
    Component = ({ children, className: _className, as, ...props }, ref) => {
      const [quarkProps, rest] = separateQuarkProps(props)
      const cssClassString = quark(quarkProps as any)
      const className = _className ? `${_className} ${cssClassString}` : cssClassString

      // @ts-ignore
      return createElement(as || element, { ...defaultComponentProps, className, ...rest, ref }, children)
    }
  } else {
    Component = ({ children, className: _className, as, ...props }, ref) => {
      const baseClass = Array.isArray(configOrCssOrClassStrings)
        ? configOrCssOrClassStrings.join(' ')
        : configOrCssOrClassStrings

      const className = _className ? `${_className} ${baseClass}` : baseClass

      // @ts-ignore
      return createElement(as || element, { ...defaultComponentProps, className, ...props, ref }, children)
    }
  }

  return Object.assign(memo(forwardRef(Component)), { CSS: quark || css({}) }) as any
}

const isStrings = (value: any): value is string | string[] => {
  return typeof value === 'string' || Array.isArray(value)
}

//Re-export @quark/core
export { css, isQuarkCss }
export type { QuarkConfig, QuarkCss, QuarkVariantsMap }
