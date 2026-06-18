import {
  type AnyQuarkCss,
  type MergeQuarkDefaults,
  type MergeQuarkVariantsMap,
  type MixedCX,
  type NamedQuarkConfig,
  type PartialPropsOfVariantsMap,
  type PropsOfVariantsMap,
  type QuarkConfig,
  type QuarkCss,
  type QuarkPlugin,
  type QuarkVariantsMap,
  arrayify,
  createCss,
  css,
  getQuarkConfig,
  isQuarkCss,
  mergeQuarkConfigs,
} from '@quarkcss/core'
import {
  type ComponentProps,
  type ElementType,
  type ForwardRefRenderFunction,
  type JSX,
  type ReactElement,
  createElement,
  forwardRef,
} from 'react'
import { createSeparateQuarkPropsFn } from './createSeparateQuarkPropsFn'

import { createUseQuarkMemo } from './shallow-compare'

export type QuarkComponentProps<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> = Assign<
  // Assign<ComponentProps<Element>, Partial<DefaultComponentProps>>,
  Assign<
    ComponentProps<Element>,
    { [K in keyof DefaultComponentProps]?: ComponentProps<Element>[K] }
  >,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cx?: MixedCX }>
>

export interface QuarkComponent<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> {
  (props: QuarkComponentProps<Element, VariantsMap, Defaults, DefaultComponentProps>): ReactElement<
    any,
    any
  > | null
  CSS: QuarkCss<VariantsMap, Defaults>
  displayName: string
}

// type IsNever<T, A> = [T] extends [never] ? A : T
// type Assign<A, B> = Omit<A, keyof B | 'as'> & B
type Assign<A, B> = Omit<A, keyof B> & B

export type QuarkVariantProps<C> = C extends QuarkComponent<any, infer V, infer D, any>
  ? PropsOfVariantsMap<V, D>
  : never

export type PartialComponentProps<Element extends ElementType> = Partial<ComponentProps<Element>>

// export type AnyQuarkCss = QuarkCss<any, any>

export type AnyQuarkComponent = QuarkComponent<any, any, any, any>

type QuarkElementOf<Component extends AnyQuarkComponent> =
  Component extends QuarkComponent<infer Element, any, any, any> ? Element : never

type QuarkVariantsOf<Component extends AnyQuarkComponent> =
  Component extends QuarkComponent<any, infer VariantsMap, any, any> ? VariantsMap : never

type QuarkDefaultsOf<Component extends AnyQuarkComponent> =
  Component extends QuarkComponent<any, any, infer Defaults, any> ? Defaults : never

type QuarkDefaultPropsOf<Component extends AnyQuarkComponent> =
  Component extends QuarkComponent<any, any, any, infer DefaultProps> ? DefaultProps : never

type ExtendQuarkComponent<
  Component extends AnyQuarkComponent,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends PartialComponentProps<QuarkElementOf<Component>>,
  MergedVariants extends QuarkVariantsMap = MergeQuarkVariantsMap<
    QuarkVariantsOf<Component>,
    VariantsMap
  >
> = QuarkComponent<
  QuarkElementOf<Component>,
  MergedVariants,
  MergeQuarkDefaults<MergedVariants, QuarkDefaultsOf<Component>, Defaults>,
  Assign<QuarkDefaultPropsOf<Component>, DefaultProps>
>

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
  <
    Component extends AnyQuarkComponent,
    DefaultProps extends PartialComponentProps<QuarkElementOf<Component>> = {}
  >(
    element: Component,
    baseCSS: string | string[],
    defaultComponentProps?: DefaultProps
  ): ExtendQuarkComponent<Component, {}, {}, DefaultProps>
  <
    Component extends AnyQuarkComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<QuarkElementOf<Component>> = {}
  >(
    element: Component,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): ExtendQuarkComponent<Component, VariantsMap, Defaults, DefaultProps>
  <
    Component extends AnyQuarkComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<QuarkElementOf<Component>> = {}
  >(
    element: Component,
    config: NamedQuarkConfig<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): ExtendQuarkComponent<Component, VariantsMap, Defaults, DefaultProps>
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
    config: NamedQuarkConfig<VariantsMap, Defaults>,
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
      DefaultProps extends PartialComponentProps<K> = {}
    >(
      config: NamedQuarkConfig<VariantsMap, Defaults>,
      // config: QuarkConfig<VariantsMap, Defaults>,
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

export type Styled = StyledFnOverload & StyledProxy

const quarkComponentMeta = Symbol.for('quarkcss.react.component')

type AnyNamedQuarkConfig = NamedQuarkConfig<any, any>

type QuarkComponentMeta = {
  element: ElementType
  defaultComponentProps?: Record<any, any>
}

function _styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  this: typeof css,
  element: Element,
  configOrCssOrClassStrings: QuarkCss<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps> {
  const CSS = this

  const baseMeta = getQuarkComponentMeta(element)
  const elementToRender = baseMeta?.element ?? element
  let quark: AnyQuarkCss
  let name: string | undefined

  if (baseMeta) {
    const extensionConfig = toQuarkConfig(configOrCssOrClassStrings)
    const config = mergeQuarkConfigs(
      getQuarkConfig((element as AnyQuarkComponent).CSS),
      extensionConfig
    )
    quark = CSS(config)
    name = config.name
  } else if (isQuarkCss(configOrCssOrClassStrings)) {
    //quarkCSS
    quark = configOrCssOrClassStrings as AnyQuarkCss
    name = getQuarkConfig(quark).name
  } else {
    const config = toQuarkConfig(configOrCssOrClassStrings)
    quark = CSS(config)
    name = config.name
  }

  const mergedDefaultComponentProps = baseMeta
    ? { ...baseMeta.defaultComponentProps, ...defaultComponentProps }
    : defaultComponentProps

  const separateQuarkProps = createSeparateQuarkPropsFn(quark)

  const _CSS = quark || CSS({})

  if (isClient) {
    // Client Side Rendering
    quark = createUseQuarkMemo(quark)
  }

  const Component: ForwardRefRenderFunction<any, any> = (
    { children, className: _className, cx, ...props },
    ref
  ) => {
    const [quarkProps, rest] = separateQuarkProps(props)

    const className = quark(quarkProps as any, _className, ...arrayify(cx))

    // @ts-ignore
    return createElement(
      elementToRender,
      { ...mergedDefaultComponentProps, className, ...rest, ref },
      children
    )
  }

  // const Forwarded = memo(forwardRef(Component))
  const Forwarded = forwardRef(Component)
  const displayName = isString(elementToRender)
    ? elementToRender
    : elementToRender.displayName || elementToRender.name
  Forwarded.displayName = name || `Quark_${displayName}`

  return Object.assign(Forwarded, {
    CSS: _CSS,
    [quarkComponentMeta]: {
      element: elementToRender,
      defaultComponentProps: mergedDefaultComponentProps,
    } satisfies QuarkComponentMeta,
  }) as any
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

const getQuarkComponentMeta = (element: any): QuarkComponentMeta | undefined => {
  return element?.[quarkComponentMeta]
}

const toQuarkConfig = (configOrString: AnyQuarkCss | QuarkConfig | string | string[]) => {
  if (isQuarkCss(configOrString)) return getQuarkConfig(configOrString)

  if (typeof configOrString === 'string' || Array.isArray(configOrString)) {
    return { base: configOrString }
  }

  return configOrString as AnyNamedQuarkConfig
}
