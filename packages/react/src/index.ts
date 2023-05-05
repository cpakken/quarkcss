import {
  arrayify,
  cleanMultiLine,
  createCss,
  css,
  isQuarkCss,
  PartialPropsOfVariantsMap,
  PropsOfVariantsMap,
  QuarkConfig,
  QuarkCss,
  QuarkPlugin,
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
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> = { as?: As } & Assign<
  Assign<ComponentProps<IsNever<As, Element>>, Partial<DefaultComponentProps>>,
  PropsOfVariantsMap<VariantsMap, Defaults>
>

export interface QuarkComponent<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> {
  <As extends ElementType | never = never>(
    props: QuarkComponentPolymorphicProps<As, Element, VariantsMap, Defaults, DefaultComponentProps>
  ): ReactElement<any, any> | null
  CSS: QuarkCss<VariantsMap, Defaults>
}

type IsNever<T, A> = [T] extends [never] ? A : T

// type Assign<A, B> = Omit<A, keyof B> & B
type Assign<A, B> = Omit<A, keyof B | 'as'> & B

export type QuarkComponentVariantProps<C> = C extends QuarkComponent<any, infer V, infer D, any>
  ? PropsOfVariantsMap<V, D>
  : never

export type PropsOf<COMP extends ElementType> = COMP extends QuarkComponent<
  infer E,
  infer C,
  infer D,
  infer CD
>
  ? QuarkComponentPolymorphicProps<never, E, C, D, CD>
  : ComponentProps<COMP>

export type PartialComponentProps<Element extends ElementType> = Partial<ComponentProps<Element>>

type AnyQuarkCss = QuarkCss<any, any>

type MaybeQuarkConfig<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>
> =
  | QuarkConfig<VariantsMap, Defaults>
  | QuarkCss<VariantsMap, Defaults>
  | string[]
  //Hack so that typescript can narrow type errors to QuarkConfig instead of the whole parameter
  | (string & { quark?: VariantsMap })

export type StyledFn = <
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  element: Element,
  configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultProps
) => QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>

export type Styled = StyledFn & {
  [K in keyof JSX.IntrinsicElements]: {
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {}
    >(
      configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultProps
    ): QuarkComponent<K, VariantsMap, Defaults, DefaultProps>
  }
}

function _styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  this: typeof css,
  element: Element,
  configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps> {
  const quark = isQuarkCss(configOrCssOrClassStrings)
    ? (configOrCssOrClassStrings as AnyQuarkCss)
    : !isStrings(configOrCssOrClassStrings)
    ? this(configOrCssOrClassStrings as QuarkConfig)
    : null

  let Component: ForwardRefRenderFunction<any, any>

  if (quark) {
    const separateQuarkProps = createSeparateQuarkPropsFn(quark)
    Component = ({ children, className: _className, as, ...props }, ref) => {
      const [quarkProps, rest] = separateQuarkProps(props)

      //TODO useMemo on quarkProps
      const cssClassString = quark(quarkProps as any)
      const className = _className ? `${_className} ${cssClassString}` : cssClassString

      // @ts-ignore
      return createElement(as || element, { ...defaultComponentProps, className, ...rest, ref }, children)
    }
  } else {
    Component = ({ children, className: _className, as, ...props }, ref) => {
      const baseClass = cleanMultiLine(arrayify(configOrCssOrClassStrings as string | string[]).join(' '))

      const className = _className ? `${_className} ${baseClass}` : baseClass

      // @ts-ignore
      return createElement(as || element, { ...defaultComponentProps, className, ...props, ref }, children)
    }
  }

  // @ts-ignore
  Component.displayName = `Quark(${element.displayName || element.name})`
  //TODO remove memo
  return Object.assign(memo(forwardRef(Component)), { CSS: quark || css({}) }) as any
}

const isStrings = (value: any): value is string | string[] => {
  return typeof value === 'string' || Array.isArray(value)
}

export function createStyled(...plugins: QuarkPlugin[]): Styled {
  const css = createCss(...plugins)

  return new Proxy(_styled.bind(css), {
    get(target, prop) {
      if (typeof prop !== 'string') throw new Error(`styled: invalid prop \`${prop.toString()}\` `)

      return (configOrCssOrClassStrings: any, defaultComponentProps?: any) =>
        target(prop as any, configOrCssOrClassStrings, defaultComponentProps)
    },
  }) as any
}

export const styled: Styled = createStyled()

//Re-export @quark/core
export { css, isQuarkCss }
export type { QuarkConfig, QuarkCss, QuarkVariantsMap }
