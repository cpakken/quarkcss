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
import { createSeparateQuarkPropsFn, type ShouldForwardProp } from './createSeparateQuarkPropsFn'
import { createUseQuarkMemo } from './shallow-compare'

export type QuarkComponentProps<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>,
> = Assign<
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
  DefaultComponentProps extends PartialComponentProps<Element>,
> {
  (
    props: QuarkComponentProps<Element, VariantsMap, Defaults, DefaultComponentProps>
  ): ReactElement<any, any> | null
  CSS: QuarkCss<VariantsMap, Defaults>
  displayName: string
}

type Assign<A, B> = Omit<A, keyof B> & B

export type QuarkVariantProps<C> =
  C extends QuarkComponent<any, infer V, infer D, any> ? PropsOfVariantsMap<V, D> : never

export type PartialComponentProps<Element extends ElementType> = Partial<ComponentProps<Element>>

export type StyledQuarkConfig<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
> = NamedQuarkConfig<VariantsMap, Defaults> & {
  shouldForwardProp?: ShouldForwardPropConfig<VariantsMap>
}

export type ShouldForwardPropConfig<VariantsMap extends QuarkVariantsMap> =
  | ShouldForwardProp
  | readonly (keyof VariantsMap & string)[]

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
  >,
> = QuarkComponent<
  QuarkElementOf<Component>,
  MergedVariants,
  MergeQuarkDefaults<MergedVariants, QuarkDefaultsOf<Component>, Defaults>,
  Assign<QuarkDefaultPropsOf<Component>, DefaultProps>
>

export type StyledFnOverload = {
  <
    Component extends AnyQuarkComponent,
    DefaultProps extends PartialComponentProps<QuarkElementOf<Component>> = {},
  >(
    element: Component,
    baseCSS: string | string[],
    defaultComponentProps?: DefaultProps
  ): ExtendQuarkComponent<Component, {}, {}, DefaultProps>
  <
    Component extends AnyQuarkComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<QuarkElementOf<Component>> = {},
  >(
    element: Component,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): ExtendQuarkComponent<Component, VariantsMap, Defaults, DefaultProps>
  <
    Component extends AnyQuarkComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<QuarkElementOf<Component>> = {},
  >(
    element: Component,
    config: StyledQuarkConfig<VariantsMap, Defaults>,
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
    config: StyledQuarkConfig<VariantsMap, Defaults>,
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
      config: StyledQuarkConfig<VariantsMap, Defaults>,
      // config: QuarkConfig<VariantsMap, Defaults>,
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

const quarkComponentMeta = Symbol.for('quarkcss.react.component')

type AnyNamedQuarkConfig = NamedQuarkConfig<any, any>
type AnyStyledQuarkConfig = StyledQuarkConfig<any, any>
type AnyShouldForwardPropConfig = ShouldForwardPropConfig<any>
type NormalizedShouldForwardPropConfig = {
  predicates?: readonly ShouldForwardProp[]
  forwardedProps?: ReadonlySet<string>
}

type QuarkComponentMeta = {
  element: ElementType
  defaultComponentProps?: Record<any, any>
  shouldForwardProp?: NormalizedShouldForwardPropConfig
}

type StyledConfigInput<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
> = StyledQuarkConfig<VariantsMap, Defaults> | QuarkCss<VariantsMap, Defaults> | string | string[]

function _styled<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends PartialComponentProps<Element> = {},
>(
  this: typeof css,
  element: Element,
  configOrCssOrClassStrings: StyledConfigInput<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultProps
): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps> {
  const CSS = this

  const baseMeta = getQuarkComponentMeta(element)
  const elementToRender = baseMeta?.element ?? element
  const styledConfig = toStyledConfig(configOrCssOrClassStrings)
  let quark: AnyQuarkCss
  let name: string | undefined

  if (baseMeta) {
    const extensionConfig = styledConfig.config
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
    const config = styledConfig.config
    quark = CSS(config)
    name = config.name
  }

  const mergedDefaultComponentProps = baseMeta
    ? { ...baseMeta.defaultComponentProps, ...defaultComponentProps }
    : defaultComponentProps

  const shouldForwardPropConfig = composeShouldForwardProp(
    baseMeta?.shouldForwardProp,
    normalizeShouldForwardProp(styledConfig.shouldForwardProp)
  )
  const shouldForwardProp = createShouldForwardProp(shouldForwardPropConfig)
  const separateQuarkProps = createSeparateQuarkPropsFn(quark, shouldForwardProp)

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
      shouldForwardProp: shouldForwardPropConfig,
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
export type { ShouldForwardProp }

const isString = (value: any): value is string => typeof value === 'string'

const isClient = typeof window !== 'undefined'

const getQuarkComponentMeta = (element: any): QuarkComponentMeta | undefined => {
  return element?.[quarkComponentMeta]
}

const toStyledConfig = (
  configOrString: AnyQuarkCss | AnyStyledQuarkConfig | string | string[]
): { config: AnyNamedQuarkConfig; shouldForwardProp?: AnyShouldForwardPropConfig } => {
  if (isQuarkCss(configOrString)) {
    return { config: getQuarkConfig(configOrString as AnyQuarkCss) }
  }

  if (typeof configOrString === 'string' || Array.isArray(configOrString)) {
    return { config: { base: configOrString } }
  }

  const { shouldForwardProp, ...config } = configOrString as AnyStyledQuarkConfig

  return { config, shouldForwardProp }
}

const composeShouldForwardProp = (
  baseShouldForwardProp?: NormalizedShouldForwardPropConfig,
  extensionShouldForwardProp?: NormalizedShouldForwardPropConfig
): NormalizedShouldForwardPropConfig | undefined => {
  if (!baseShouldForwardProp) return extensionShouldForwardProp
  if (!extensionShouldForwardProp) return baseShouldForwardProp

  const predicates = mergePredicates(
    baseShouldForwardProp.predicates,
    extensionShouldForwardProp.predicates
  )

  const forwardedProps = mergeForwardedProps(
    baseShouldForwardProp.forwardedProps,
    extensionShouldForwardProp.forwardedProps
  )

  return {
    ...(predicates ? { predicates } : {}),
    ...(forwardedProps ? { forwardedProps } : {}),
  }
}

const normalizeShouldForwardProp = (
  shouldForwardProp?: AnyShouldForwardPropConfig
): NormalizedShouldForwardPropConfig | undefined => {
  if (!shouldForwardProp) return undefined
  if (typeof shouldForwardProp === 'function') return { predicates: [shouldForwardProp] }

  return { forwardedProps: new Set(shouldForwardProp) }
}

const mergePredicates = (
  basePredicates?: readonly ShouldForwardProp[],
  extensionPredicates?: readonly ShouldForwardProp[]
): readonly ShouldForwardProp[] | undefined => {
  if (!basePredicates) return extensionPredicates
  if (!extensionPredicates) return basePredicates

  return [...basePredicates, ...extensionPredicates]
}

const mergeForwardedProps = (
  baseForwardedProps?: ReadonlySet<string>,
  extensionForwardedProps?: ReadonlySet<string>
): ReadonlySet<string> | undefined => {
  if (!baseForwardedProps) return extensionForwardedProps
  if (!extensionForwardedProps) return baseForwardedProps

  return new Set([...baseForwardedProps, ...extensionForwardedProps])
}

const createShouldForwardProp = (
  shouldForwardProp?: NormalizedShouldForwardPropConfig
): ShouldForwardProp | undefined => {
  if (!shouldForwardProp) return undefined

  const { predicates, forwardedProps } = shouldForwardProp

  if (!predicates?.length && !forwardedProps) return undefined

  if (!predicates?.length) {
    return (prop, defaultValidator) => defaultValidator(prop) || !!forwardedProps?.has(prop)
  }

  if (!forwardedProps && predicates.length === 1) return predicates[0]

  return (prop, defaultValidator) => {
    const defaultOrForwarded = forwardedProps
      ? (prop: string) => defaultValidator(prop) || forwardedProps.has(prop)
      : defaultValidator

    for (const predicate of predicates) {
      if (!predicate(prop, defaultOrForwarded)) return false
    }

    return true
  }
}
