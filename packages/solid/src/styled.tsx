import type { JSX } from 'solid-js/jsx-runtime'
import {
  type AnyQuarkCss,
  type MixedCX,
  type PartialPropsOfVariantsMap,
  type PropsOfVariantsMap,
  type QuarkConfig,
  type QuarkCss,
  type QuarkOptions,
  type QuarkVariantsMap,
  createCss,
  css,
  getQuarkConfig,
  isQuarkCss,
} from '@quarkcss/core'
import { type ComponentProps, type ValidComponent, mergeProps, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type PartialComponentProps<Element extends ValidComponent> = Partial<ComponentProps<Element>>

type Assign<A, B> = Omit<A, keyof B> & B
type NamedQuarkConfig<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
> = QuarkConfig<VariantsMap, Defaults> & { name?: string }

export type QuarkComponentProps<
  Element extends ValidComponent,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>,
> = Assign<
  Assign<
    ComponentProps<Element>,
    {
      [K in keyof DefaultComponentProps &
        keyof ComponentProps<Element>]?: ComponentProps<Element>[K]
    }
  >,
  Assign<PropsOfVariantsMap<VariantsMap, Defaults>, { cx?: MixedCX }>
>

export interface QuarkSolidComponent<
  Element extends ValidComponent,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultComponentProps extends PartialComponentProps<Element>,
> {
  (props: QuarkComponentProps<Element, VariantsMap, Defaults, DefaultComponentProps>): JSX.Element
  CSS: QuarkCss<VariantsMap, Defaults>
  displayName: string
}

export type QuarkVariantProps<C> =
  C extends QuarkSolidComponent<any, infer V, infer D, any> ? PropsOfVariantsMap<V, D> : never

// type MaybeQuarkConfig<
//   VariantsMap extends QuarkVariantsMap,
//   Defaults extends PartialPropsOfVariantsMap<VariantsMap>
// > =
//   | (QuarkConfig<VariantsMap, Defaults> & { name?: string })
//   | QuarkCss<VariantsMap, Defaults>
//   | string[]
//   //Hack so that typescript can narrow type errors to QuarkConfig instead of the whole parameter
//   | (string & { quark?: VariantsMap })

// export type StyledFn2 = <
//   Element extends ValidComponent,
//   VariantsMap extends QuarkVariantsMap = {},
//   Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
//   DefaultProps extends PartialComponentProps<Element> = {}
// >(
//   element: Element,
//   configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
//   defaultComponentProps?: DefaultProps
// ) => QuarkSolidComponent<Element, VariantsMap, Defaults, DefaultProps>

// export type Styled2 = StyledFn2 & {
//   [K in keyof JSX.IntrinsicElements]: {
//     <
//       VariantsMap extends QuarkVariantsMap = {},
//       Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
//       DefaultProps extends PartialComponentProps<K> = {}
//     >(
//       configOrCssOrClassStrings: MaybeQuarkConfig<VariantsMap, Defaults>,
//       defaultComponentProps?: DefaultProps
//     ): QuarkSolidComponent<K, VariantsMap, Defaults, DefaultProps>
//   }
// }

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
    DefaultProps extends PartialComponentProps<Element> = {},
  >(
    element: Element,
    quarkCSS: QuarkCss<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): QuarkSolidComponent<Element, VariantsMap, Defaults, DefaultProps>

  <
    Element extends ValidComponent,
    VariantsMap extends QuarkVariantsMap = {},
    Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
    DefaultProps extends PartialComponentProps<Element> = {},
  >(
    element: Element,
    config: NamedQuarkConfig<VariantsMap, Defaults>,
    defaultComponentProps?: DefaultProps
  ): QuarkSolidComponent<Element, VariantsMap, Defaults, DefaultProps>
}

type StyledProxyFns = {
  [K in keyof JSX.IntrinsicElements]: {
    <DefaultProps extends PartialComponentProps<K> = {}>(
      baseCSS: string | string[],
      defaultComponentProps?: DefaultProps
    ): QuarkSolidComponent<K, {}, {}, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {},
    >(
      config: NamedQuarkConfig<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultProps
    ): QuarkSolidComponent<K, VariantsMap, Defaults, DefaultProps>
    <
      VariantsMap extends QuarkVariantsMap = {},
      Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
      DefaultProps extends PartialComponentProps<K> = {},
    >(
      quarkCSS: QuarkCss<VariantsMap, Defaults>,
      defaultComponentProps?: DefaultProps
    ): QuarkSolidComponent<K, VariantsMap, Defaults, DefaultProps>
  }
}

export type Styled = StyledFnOverload & StyledProxyFns

function _styled<
  Element extends ValidComponent,
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
  DefaultProps extends PartialComponentProps<Element> = {},
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
    name = (getQuarkConfig(quark) as NamedQuarkConfig<VariantsMap, Defaults>).name
  } else {
    quark = CSS(configOrCssOrClassStrings as QuarkConfig | string | string[])

    name = (configOrCssOrClassStrings as NamedQuarkConfig<VariantsMap, Defaults>).name
  }

  // const separateQuarkProps = createSeparateQuarkPropsFn(quark)

  const variantProps = Object.keys(getQuarkConfig(quark).variants || {}) as any

  const separateQuarkProps = (props: any[]) => {
    return splitProps(props, ['class', 'cx'] as any, variantProps)
  }

  const _CSS = quark || CSS({})

  const Component = (props: any) => {
    const [cl, quarkProps, rest] = separateQuarkProps(props)

    const merged = mergeProps(defaultComponentProps, rest)
    const className = () =>
      cl.class && cl.cx
        ? quark(quarkProps, cl.class, cl.cx)
        : cl.class
          ? quark(quarkProps, cl.class)
          : cl.cx
            ? quark(quarkProps, cl.cx)
            : quark(quarkProps)

    return <Dynamic component={element as any} {...merged} class={className()} />
  }

  return Object.assign(Component, {
    CSS: _CSS,
    displayName: name || `Quark_${isString(element) ? element : element.name}`,
  }) as any
}

const isString = (value: any): value is string => typeof value === 'string'

export function createStyled(options?: QuarkOptions): Styled {
  const CSS = createCss(options)

  return new Proxy(_styled.bind(CSS), {
    get(target, prop) {
      if (!isString(prop)) throw new Error(`styled: invalid prop \`${prop.toString()}\` `)

      return (configOrCssOrClassStrings: any, defaultComponentProps?: any) =>
        target(prop as any, configOrCssOrClassStrings, defaultComponentProps)
    },
  }) as any
}

export const styled: Styled = createStyled()
// export const styled: Styled2 = createStyled() as any

//Re-export @quark/core
export { css, isQuarkCss }
export type { QuarkConfig, QuarkCss, QuarkVariantsMap }
