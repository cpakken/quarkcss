import {
  AnyQuarkCss,
  MixedCN,
  PartialPropsOfVariantsMap,
  PropsOfVariantsMap,
  QuarkConfig,
  QuarkCss,
  QuarkPlugin,
  QuarkVariantsMap,
  arrayify,
  createCss,
  css,
  getQuarkConfig,
  isQuarkCss,
} from '@quarkcss/core'

import type { ChildDom, PropsWithKnownKeys, StateView, TagFunc } from 'vanjs-core'
import van from 'vanjs-core'
import { val } from './val'

// export type VanElement = keyof HTMLElementTagNameMap | TagFunc<Element>
export type VanElement = keyof HTMLElementTagNameMap

export type BaseElementOf<T> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : never

// export type BaseElementOf<T> = T extends keyof HTMLElementTagNameMap
//   ? TagFunc<HTMLElementTagNameMap[T]>
//   : T extends TagFunc<infer E>
//   ? E
//   : never

// export type VanProps<T> = PropsWithKnownKeys<BaseElementOf<T>>
export type VanProps<T> = PropsWithKnownKeys<BaseElementOf<T>>

type Assign<A, B> = Omit<A, keyof B> & B

type ValueProp<T> = T | StateView<T> | (() => T)

type ValueProps<T> = {
  [K in keyof T]: ValueProp<T[K]>
}

export type QuarkComponentProps<
  Element extends VanElement,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends VanProps<Element>
> = Assign<
  // Assign<VanProps<Element>, Partial<DefaultComponentProps>>,
  Assign<VanProps<Element>, DefaultComponentProps>,
  Assign<ValueProps<PropsOfVariantsMap<VariantsMap, Defaults>>, { cn?: ValueProp<MixedCN> }>
>

export interface QuarkVanComponent<
  Element extends VanElement,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends VanProps<Element>
> {
  (
    first?: QuarkComponentProps<Element, VariantsMap, Defaults, DefaultComponentProps> | ChildDom,
    ...rest: readonly ChildDom[]
  ): BaseElementOf<Element>
  CSS: QuarkCss<VariantsMap, Defaults>
  displayName: string
}

export type StyledFnOverload = {
  <Element extends VanElement, DefaultProps extends VanProps<Element> = {}>(
    element: Element,
    baseCSS: string | string[],
    defaultComponentProps?: DefaultProps
  ): QuarkVanComponent<Element, {}, {}, DefaultProps>

  <
    Element extends VanElement,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends VanProps<Element> = {}
  >(
    element: Element,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): QuarkVanComponent<Element, VariantsMap, Defaults, DefaultProps>

  <
    Element extends VanElement,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends VanProps<Element> = {}
  >(
    element: Element,
    config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
    defaultComponentProps?: DefaultProps
  ): QuarkVanComponent<Element, VariantsMap, Defaults, DefaultProps>
}

export type Styled = StyledFnOverload & {
  [K in keyof HTMLElementTagNameMap]: {
    <DefaultProps extends VanProps<K> = {}>(
      baseCSS: string | string[],
      defaultComponentProps?: DefaultProps
    ): QuarkVanComponent<K, {}, {}, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends VanProps<K> = {}
    >(
      config: QuarkConfig<VariantsMap, Defaults> & { name?: string },
      defaultComponentProps?: DefaultProps
    ): QuarkVanComponent<K, VariantsMap, Defaults, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends VanProps<K> = {}
    >(
      quarkCSS: QuarkCss<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultProps
    ): QuarkVanComponent<K, VariantsMap, Defaults, DefaultProps>
  }
}

function _styled<
  Element extends VanElement,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends VanProps<Element> = {}
>(
  this: typeof css,
  element: Element,
  configOrCssOrClassStrings: QuarkCss<VariantsMap, Defaults>,
  defaultComponentProps?: DefaultProps
): QuarkVanComponent<Element, VariantsMap, Defaults, DefaultProps> {
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

  const { variants } = getQuarkConfig(quark)

  const separateQuarkProps = (props: Record<any, any>): [any, any] => {
    const quarkProps = {} as any
    const rest = {} as any

    if (!variants) return [quarkProps, props] as any

    for (const propKey in props) {
      if (Object.hasOwn(variants, propKey)) {
        quarkProps[propKey] = props[propKey]
      } else {
        rest[propKey] = props[propKey]
      }
    }

    return [quarkProps, rest] as const
  }

  const _CSS = quark || CSS({})

  const tagFunc = van.tags[element] as unknown as TagFunc<Element>

  const Component = (first: any, ...children: any[]) => {
    const [_quarkProps, { cn, class: _className, ...rest }] = separateQuarkProps(first || {})

    const className = () => {
      const quarkProps = {} as any
      for (const key in _quarkProps) {
        quarkProps[key] = val(_quarkProps[key])
      }

      return quark(quarkProps, val(_className), ...arrayify(val(cn)))
    }

    return tagFunc({ ...defaultComponentProps, class: className, ...rest }, ...children)
  }

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
