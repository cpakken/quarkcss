import {
  MixedCN,
  PartialPropsOfVariantsMap,
  PropsOfVariantsMap,
  QuarkConfig,
  QuarkCss,
  QuarkPlugin,
  QuarkVariantsMap,
  createCss,
  css,
  getQuarkConfig,
  isQuarkCss,
} from '@quarkcss/core'
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardRefRenderFunction,
  ReactElement,
  createElement,
  forwardRef,
  useMemo,
} from 'react'
import { createSeparateQuarkPropsFn } from './createSeparateQuarkPropsFn'
import { useCompare } from './shallow-compare'
import { shallowEqualAll } from './shallow-compare'

export type QuarkComponentPolymorphicProps<
  As extends ElementType | never,
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> = { as?: As } & Assign<
  Assign<ComponentProps<IsNever<As, Element>>, Partial<DefaultComponentProps>>,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cn?: MixedCN }>
>

export type QuarkComponentPolymorphicPropsWithoutRef<
  As extends ElementType | never,
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> = { as?: As } & Assign<
  Assign<ComponentPropsWithoutRef<IsNever<As, Element>>, Partial<DefaultComponentProps>>,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cn?: MixedCN }>
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
  displayName: string
}

type IsNever<T, A> = [T] extends [never] ? A : T

// type Assign<A, B> = Omit<A, keyof B> & B
type Assign<A, B> = Omit<A, keyof B | 'as'> & B

export type QuarkVariantProps<C> = C extends QuarkComponent<any, infer V, infer D, any>
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

export type PropsWithoutRefOf<COMP extends ElementType> = COMP extends QuarkComponent<
  infer E,
  infer C,
  infer D,
  infer CD
>
  ? QuarkComponentPolymorphicPropsWithoutRef<never, E, C, D, CD>
  : ComponentPropsWithoutRef<COMP>

export type PartialComponentProps<Element extends ElementType> = Partial<ComponentProps<Element>>

type AnyQuarkCss = QuarkCss<any, any>

export type AnyQuarkComponent = QuarkComponent<any, any, any, any>

//BEFORE THE NOT OVERLOADED VERSION

// type MaybeQuarkConfig<
//   VariantsMap extends QuarkVariantsMap,
//   Defaults extends PartialPropsOfVariantsMap<VariantsMap>
// > =
//   | (QuarkConfig<VariantsMap, Defaults> & { name?: string })
//   | QuarkCss<VariantsMap, Defaults>
//   | string[]
//   //Hack so that typescript can narrow type errors to QuarkConfig instead of the whole parameter
//   | (string & { quark?: VariantsMap })

// export type StyledFn = <
//   Element extends ElementType,
//   VariantsMap extends QuarkVariantsMap = {},
//   Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
//   DefaultProps extends PartialComponentProps<Element> = {}
// >(
//   element: Element,
//   configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
//   defaultComponentProps?: DefaultProps
// ) => QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>

// export type Styled = StyledFn & {
//   [K in keyof JSX.IntrinsicElements]: {
//     <
//       VariantsMap extends QuarkVariantsMap = {},
//       Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
//       DefaultProps extends PartialComponentProps<K> = {}
//     >(
//       configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
//       defaultComponentProps?: DefaultProps
//     ): QuarkComponent<K, VariantsMap, Defaults, DefaultProps>
//   }
// }

export type StyledFnOverload = {
  <Element extends ElementType, DefaultProps extends PartialComponentProps<Element> = {}>(
    element: Element,
    baseCSS: string | string[],
    defaultComponentProps?: DefaultProps
  ): QuarkComponent<Element, {}, {}, DefaultProps>
  <
    Element extends ElementType,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<Element> = {}
  >(
    element: Element,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>
  <
    Element extends ElementType,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<Element> = {}
  >(
    element: Element,
    config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
    defaultComponentProps?: DefaultProps
  ): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>
}

export type Styled = StyledFnOverload & {
  [K in keyof JSX.IntrinsicElements]: {
    <DefaultProps extends PartialComponentProps<K> = {}>(
      baseCSS: string | string[],
      defaultComponentProps?: DefaultProps
    ): QuarkComponent<K, {}, {}, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {}
    >(
      config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
      defaultComponentProps?: DefaultProps
    ): QuarkComponent<K, VariantsMap, Defaults, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {}
    >(
      quarkCSS: QuarkCss<VariantsMap, Defaults>,
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
  // configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
  configOrCssOrClassStrings: QuarkCss<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps> {
  const CSS = this

  let quark: AnyQuarkCss
  let name: string | undefined

  if (isQuarkCss(configOrCssOrClassStrings)) {
    //quarkCSS
    quark = configOrCssOrClassStrings as AnyQuarkCss
    // @ts-ignore
    name = getQuarkConfig(quark).name
  } else {
    quark = CSS(configOrCssOrClassStrings as QuarkConfig | string | string[])
    // @ts-ignore
    name = configOrCssOrClassStrings.name
  }

  const separateQuarkProps = createSeparateQuarkPropsFn(quark)

  const Component: ForwardRefRenderFunction<any, any> = (
    { children, className: _className, cn, as, ...props },
    ref
  ) => {
    const [quarkProps, rest] = separateQuarkProps(props)

    // const className = quark(quarkProps as any, _className, cn)
    const className = useMemo(
      () => quark(quarkProps as any, _className, cn),
      useCompare([quarkProps, _className, cn], shallowEqualAll)
    )

    // @ts-ignore
    return createElement(
      as || element,
      { ...defaultComponentProps, className, ...rest, ref },
      children
    )
  }

  // const Forwarded = memo(forwardRef(Component))
  const Forwarded = forwardRef(Component)
  Forwarded.displayName =
    name || `Quark_${isString(element) ? element : element.displayName || element.name}`

  return Object.assign(Forwarded, { CSS: quark || CSS({}) }) as any
}

export function createStyled(...plugins: QuarkPlugin[]): Styled {
  const CSS = createCss(...plugins)

  return new Proxy(_styled.bind(CSS), {
    get(target, prop) {
      if (!isString(prop)) throw new Error(`styled: invalid prop \`${prop.toString()}\` `)

      return (configOrCssOrClassStrings: any, defaultComponentProps?: any) =>
        target(prop as any, configOrCssOrClassStrings, defaultComponentProps)
    },
  }) as any
}

export const styled: Styled = createStyled()

//Re-export @quark/core
export { css, isQuarkCss }
export type { QuarkConfig, QuarkCss, QuarkVariantsMap }

const isString = (value: any): value is string => typeof value === 'string'
