import {
  arrayify,
  cleanMultiLine,
  css,
  isQuarkCss,
  PropsOfVariantsMap,
  QuarkConfig,
  QuarkCss,
  QuarkVariantsMap,
} from '@quarkcss/core'
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
  Assign<ComponentProps<IsNever<As, Element>>, Partial<DefaultProps>>,
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

type MaybeQuarkConfig<VariantsMap extends QuarkVariantsMap> =
  | QuarkConfig<VariantsMap>
  | QuarkCss<VariantsMap>
  | string[]
  //Hack so that typescript can narrow type errors to QuarkConfig instead of the whole parameter
  | (string & { quark?: VariantsMap })

export type StyledFn = <
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap = {},
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  element: Element,
  configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap>,
  defaultComponentProps?: DefaultProps
) => QuarkComponent<Element, VariantsMap, DefaultProps>

export type Styled = StyledFn & {
  [K in keyof JSX.IntrinsicElements]: {
    <VariantsMap extends QuarkVariantsMap = {}, DefaultProps extends PartialComponentProps<K> = {}>(
      configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap>,
      defaultComponentProps?: DefaultProps
    ): QuarkComponent<K, VariantsMap, DefaultProps>
  }
}

function _styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap = {},
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  element: Element,
  configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap, DefaultProps> {
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
      const baseClass = arrayify(configOrCssOrClassStrings as string | string[])
        .map(cleanMultiLine)
        .join(' ')

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

export const styled: Styled = new Proxy(_styled, {
  get(target, prop) {
    if (typeof prop !== 'string') throw new Error(`styled: invalid prop \`${prop.toString()}\` `)

    return (configOrCssOrClassStrings: any, defaultComponentProps?: any) =>
      target(prop as any, configOrCssOrClassStrings, defaultComponentProps)
  },
}) as any

export { css, isQuarkCss }
export type { QuarkConfig, QuarkCss, QuarkVariantsMap }
