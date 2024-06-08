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
  AnyQuarkCss,
} from '@quarkcss/core'
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardRefRenderFunction,
  ReactElement,
  createElement,
  forwardRef,
} from 'react'
import { createSeparateQuarkPropsFn } from './createSeparateQuarkPropsFn'

import { createUseQuarkMemo } from './shallow-compare'

export type QuarkComponentProps<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>,
> = Assign<
  Assign<ComponentProps<Element>, Partial<DefaultComponentProps>>,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cn?: MixedCN }>
>

export type QuarkComponentPropsWithoutRef<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>,
> = Assign<
  Assign<ComponentPropsWithoutRef<Element>, Partial<DefaultComponentProps>>,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cn?: MixedCN }>
>

export interface QuarkComponent<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>,
> {
  (
    props: QuarkComponentProps<Element, VariantsMap, Defaults, DefaultComponentProps>
  ): ReactElement<any, any> | null
  CSS: QuarkCss<VariantsMap, Defaults>
  displayName: string
}

// type IsNever<T, A> = [T] extends [never] ? A : T
// type Assign<A, B> = Omit<A, keyof B | 'as'> & B
type Assign<A, B> = Omit<A, keyof B> & B

export type QuarkVariantProps<C> = C extends QuarkComponent<any, infer V, infer D, any>
  ? PropsOfVariantsMap<V, D>
  : never

// export type PropsOf<COMP extends ElementType> = COMP extends QuarkComponent<
//   infer E,
//   infer C,
//   infer D,
//   infer CD
// >
//   ? QuarkComponentProps<E, C, D, CD>
//   : ComponentProps<COMP>

export type PropsWithoutRefOf<COMP extends ElementType> = COMP extends QuarkComponent<
  infer E,
  infer C,
  infer D,
  infer CD
>
  ? QuarkComponentPropsWithoutRef<E, C, D, CD>
  : ComponentPropsWithoutRef<COMP>

export type PartialComponentProps<Element extends ElementType> = Partial<ComponentProps<Element>>

// export type AnyQuarkCss = QuarkCss<any, any>

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
    DefaultProps extends PartialComponentProps<Element> = {},
  >(
    element: Element,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>
  <
    Element extends ElementType,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<Element> = {},
  >(
    element: Element,
    config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
    defaultComponentProps?: DefaultProps
  ): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>
}

export type StyledProxy = {
  [K in keyof JSX.IntrinsicElements]: {
    <DefaultProps extends PartialComponentProps<K> = {}>(
      baseCSS: string | string[],
      defaultComponentProps?: DefaultProps
    ): QuarkComponent<K, {}, {}, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {},
    >(
      config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
      defaultComponentProps?: DefaultProps
    ): QuarkComponent<K, VariantsMap, Defaults, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {},
    >(
      quarkCSS: QuarkCss<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultProps
    ): QuarkComponent<K, VariantsMap, Defaults, DefaultProps>
  }
}

export type Styled = StyledFnOverload & StyledProxy

function _styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends PartialComponentProps<Element> = {},
>(
  this: typeof css,
  element: Element,
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

  const _CSS = quark || CSS({})

  if (isClient) {
    // Client Side Rendering
    quark = createUseQuarkMemo(quark)
  }

  const Component: ForwardRefRenderFunction<any, any> = (
    { children, className: _className, cn, ...props },
    ref
  ) => {
    const [quarkProps, rest] = separateQuarkProps(props)

    const className = quark(quarkProps as any, _className, cn)

    // @ts-ignore
    return createElement(element, { ...defaultComponentProps, className, ...rest, ref }, children)
  }

  // const Forwarded = memo(forwardRef(Component))
  const Forwarded = forwardRef(Component)
  Forwarded.displayName =
    name || `Quark_${isString(element) ? element : element.displayName || element.name}`

  return Object.assign(Forwarded, { CSS: _CSS }) as any
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

const isClient = typeof window !== 'undefined'
