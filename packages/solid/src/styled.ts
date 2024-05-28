import {
  AnyQuarkCss,
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

import { type ComponentProps, type ValidComponent, mergeProps, splitProps } from 'solid-js'
import type { JSX } from 'solid-js/jsx-runtime'

import h from 'solid-js/h'

export type PartialComponentProps<Element extends ValidComponent> = Partial<ComponentProps<Element>>

type Assign<A, B> = Omit<A, keyof B> & B

export type QuarkComponentProps<
  Element extends ValidComponent,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> = Assign<
  Assign<ComponentProps<Element>, Partial<DefaultComponentProps>>,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cn?: MixedCN }>
>

export interface QuarkSolidComponent<
  Element extends ValidComponent,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>
> {
  (props: QuarkComponentProps<Element, VariantsMap, Defaults, DefaultComponentProps>): JSX.Element
  CSS: QuarkCss<VariantsMap, Defaults>
  displayName: string
}

export type StyledFnOverload = {
  <Element extends ValidComponent, DefaultProps extends PartialComponentProps<Element> = {}>(
    element: Element,
    baseCSS: string | string[],
    defaultComponentProps?: DefaultProps
  ): QuarkSolidComponent<Element, {}, {}, DefaultProps>

  <
    Element extends ValidComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<Element> = {}
  >(
    element: Element,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): QuarkSolidComponent<Element, VariantsMap, Defaults, DefaultProps>

  <
    Element extends ValidComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<Element> = {}
  >(
    element: Element,
    config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
    defaultComponentProps?: DefaultProps
  ): QuarkSolidComponent<Element, VariantsMap, Defaults, DefaultProps>
}

export type Styled = StyledFnOverload & {
  [K in keyof JSX.IntrinsicElements]: {
    <DefaultProps extends PartialComponentProps<K> = {}>(
      baseCSS: string | string[],
      defaultComponentProps?: DefaultProps
    ): QuarkSolidComponent<K, {}, {}, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {}
    >(
      config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
      defaultComponentProps?: DefaultProps
    ): QuarkSolidComponent<K, VariantsMap, Defaults, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {}
    >(
      quarkCSS: QuarkCss<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultProps
    ): QuarkSolidComponent<K, VariantsMap, Defaults, DefaultProps>
  }
}

function _styled<
  Element extends ValidComponent,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends PartialComponentProps<Element> = {}
>(
  this: typeof css,
  element: Element,
  configOrCssOrClassStrings: QuarkCss<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultProps
): QuarkSolidComponent<Element, VariantsMap, Defaults, DefaultProps> {
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

  // const separateQuarkProps = createSeparateQuarkPropsFn(quark)

  const variantProps = Object.keys(getQuarkConfig(quark).variants || {}) as any

  const separateQuarkProps = (props: any[]) => {
    return splitProps(props, ['class', 'cn'] as any, variantProps)
  }

  const _CSS = quark || CSS({})

  const Component = (props: any) => {
    const [cl, quarkProps, rest] = separateQuarkProps(props)

    const className = () => {
      const resolvedQuarkProps = Object.fromEntries(
        Object.entries(quarkProps).map(([key, value]) => [key, resolve(value)])
      )

      return quark(resolvedQuarkProps, resolve(cl.class), resolve(cl.cn))
    }

    const merged = mergeProps(defaultComponentProps, { class: className }, rest)

    return h(element, merged)
  }

  // const Forwarded = forwardRef(Component)
  // Forwarded.displayName =
  // Forwarded.displayName = name || `Quark_${isString(element) ? element : element.displayName || element.name}`
  // return Object.assign(Forwarded, { CSS: _CSS }) as any

  return Object.assign(Component, { CSS: _CSS }) as any
}

const isString = (value: any): value is string => typeof value === 'string'

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

//resolves if signal else return
const resolve = <T>(signalOrVal: (() => T) | T): T => {
  // @ts-expect-error
  return typeof signalOrVal === 'function' ? signalOrVal() : signalOrVal
}
