import {
  type AnyQuarkCss,
  type MergeQuarkDefaults,
  type MergeQuarkVariantsMap,
  type MixedCX,
  type NamedQuarkConfig,
  type PartialPropsOfVariantsMap,
  type PropsOfVariantsMap,
  type QuarkCss,
  type QuarkCssFactory,
  type QuarkCssFactoryId,
  type QuarkOptions,
  type QuarkVariantsMap,
  createCss,
  getCssFactoryId,
  getQuarkConfig,
  getQuarkCssFactoryId,
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

export type QuarkComponentProps<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends object,
> = Assign<
  Assign<ComponentProps<Element>, DefaultedComponentProps<Element, DefaultComponentProps>>,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cx?: MixedCX }>
> &
  DataAttributes

export interface QuarkComponent<
  Element extends ElementType,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends object,
> {
  (
    props: QuarkComponentProps<Element, VariantsMap, Defaults, DefaultComponentProps>
  ): ReactElement<any, any> | null
  CSS: QuarkCss<VariantsMap, Defaults>
  displayName: string
}

type Assign<A, B> = Omit<A, keyof B> & B

export type DataAttributeValue = string | number | boolean | null | undefined

export type DataAttributes = {
  [K in `data-${string}`]?: DataAttributeValue
}

type DefaultedComponentProps<Element extends ElementType, DefaultComponentProps extends object> = {
  [K in keyof DefaultComponentProps & keyof ComponentProps<Element>]?: ComponentProps<Element>[K]
}

type DefaultComponentPropsInput<
  Element extends ElementType,
  DefaultComponentProps extends object,
> = {
  [K in keyof DefaultComponentProps]: K extends keyof ComponentProps<Element>
    ? ComponentProps<Element>[K]
    : K extends `data-${string}`
      ? DataAttributeValue
      : never
}

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
  DefaultProps extends object,
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
  <Component extends AnyQuarkComponent, DefaultProps extends object = {}>(
    element: Component,
    baseCSS: string | string[],
    defaultComponentProps?: DefaultComponentPropsInput<QuarkElementOf<Component>, DefaultProps>
  ): ExtendQuarkComponent<Component, {}, {}, DefaultProps>
  <
    Component extends AnyQuarkComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends object = {},
  >(
    element: Component,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultComponentPropsInput<QuarkElementOf<Component>, DefaultProps>
  ): ExtendQuarkComponent<Component, VariantsMap, Defaults, DefaultProps>
  <
    Component extends AnyQuarkComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends object = {},
  >(
    element: Component,
    config: StyledQuarkConfig<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultComponentPropsInput<QuarkElementOf<Component>, DefaultProps>
  ): ExtendQuarkComponent<Component, VariantsMap, Defaults, DefaultProps>
  <Element extends ElementType, DefaultProps extends object = {}>(
    element: Element,
    baseCSS: string | string[],
    defaultComponentProps?: DefaultComponentPropsInput<Element, DefaultProps>
  ): QuarkComponent<Element, {}, {}, DefaultProps>
  <
    Element extends ElementType,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends object = {},
  >(
    element: Element,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultComponentPropsInput<Element, DefaultProps>
  ): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>
  <
    Element extends ElementType,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends object = {},
  >(
    element: Element,
    config: StyledQuarkConfig<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultComponentPropsInput<Element, DefaultProps>
  ): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps>
}

export type StyledProxy = {
  [K in keyof JSX.IntrinsicElements]: {
    <DefaultProps extends object = {}>(
      baseCSS: string | string[],
      defaultComponentProps?: DefaultComponentPropsInput<K, DefaultProps>
    ): QuarkComponent<K, {}, {}, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends object = {},
    >(
      config: StyledQuarkConfig<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultComponentPropsInput<K, DefaultProps>
    ): QuarkComponent<K, VariantsMap, Defaults, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends object = {},
    >(
      quarkCSS: QuarkCss<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultComponentPropsInput<K, DefaultProps>
    ): QuarkComponent<K, VariantsMap, Defaults, DefaultProps>
  }
}

export type Styled = StyledFnOverload & StyledProxy

export type CreateStyledOptions = QuarkOptions | { css: QuarkCssFactory }

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
  cssFactoryId: QuarkCssFactoryId
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
  DefaultProps extends object = {},
>(
  this: QuarkCssFactory,
  element: Element,
  configOrCssOrClassStrings: StyledConfigInput<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultComponentPropsInput<Element, DefaultProps>
): QuarkComponent<Element, VariantsMap, Defaults, DefaultProps> {
  const CSS = this
  const cssFactoryId = getCssFactoryId(CSS)

  const baseMeta = getQuarkComponentMeta(element)
  if (baseMeta && baseMeta.cssFactoryId !== cssFactoryId) {
    throw new Error(differentFactoryMessage)
  }

  if (isQuarkCss(configOrCssOrClassStrings)) {
    assertSameCssFactory(configOrCssOrClassStrings as AnyQuarkCss, cssFactoryId)
  }

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

  const Component: ForwardRefRenderFunction<any, any> = (
    { className: _className, cx, ...props },
    ref
  ) => {
    const [quarkProps, rest] = separateQuarkProps(props)

    const className =
      _className && cx
        ? quark(quarkProps as any, _className, cx)
        : _className
          ? quark(quarkProps as any, _className)
          : cx
            ? quark(quarkProps as any, cx)
            : quark(quarkProps as any)

    // @ts-ignore
    return createElement(elementToRender, {
      ...mergedDefaultComponentProps,
      className,
      ...rest,
      ref,
    })
  }

  const Forwarded = forwardRef(Component)
  const displayName = isString(elementToRender)
    ? elementToRender
    : elementToRender.displayName || elementToRender.name
  Forwarded.displayName = name || `Quark_${displayName}`

  return Object.assign(Forwarded, {
    CSS: quark,
    [quarkComponentMeta]: {
      element: elementToRender,
      cssFactoryId,
      defaultComponentProps: mergedDefaultComponentProps,
      shouldForwardProp: shouldForwardPropConfig,
    } satisfies QuarkComponentMeta,
  }) as any
}

export function createStyled(options?: CreateStyledOptions): Styled {
  const CSS = isCssFactoryOptions(options) ? options.css : createCss(options)

  return new Proxy(_styled.bind(CSS), {
    get(target, prop) {
      if (!isString(prop)) throw new Error(`styled: invalid prop \`${prop.toString()}\` `)

      return (configOrCssOrClassStrings: any, defaultComponentProps?: any) =>
        target(prop as any, configOrCssOrClassStrings, defaultComponentProps)
    },
  }) as any
}

export const styled: Styled = createStyled()

export * from '@quarkcss/core'
export type { ShouldForwardProp }

const isString = (value: any): value is string => typeof value === 'string'

function isCssFactoryOptions(options?: CreateStyledOptions): options is { css: QuarkCssFactory } {
  return !!options && 'css' in options
}

const differentFactoryMessage =
  'Cannot use Quark CSS created by a different styled/css factory. Import both css and styled from the same configured QuarkCSS module.'

const assertSameCssFactory = (quark: AnyQuarkCss, cssFactoryId: QuarkCssFactoryId) => {
  if (getQuarkCssFactoryId(quark) !== cssFactoryId) {
    throw new Error(differentFactoryMessage)
  }
}

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
