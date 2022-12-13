import { css, PropsOfVariantsMap, QuarkConfig, QuarkVariantsMap } from '@quarkcss/core'
import {
  ComponentProps,
  ComponentType,
  createElement,
  forwardRef,
  ForwardRefExoticComponent,
  memo,
} from 'react'

export interface QuarkComponent<
  Element extends keyof JSX.IntrinsicElements | ComponentType<any> = ComponentType<any>,
  VariantsMap extends QuarkVariantsMap = {}
> extends ForwardRefExoticComponent<Assign<ComponentProps<Element>, PropsOfVariantsMap<VariantsMap>>> {}

type Assign<A, B> = Omit<A, keyof B> & B

export type QuarkComponentVariantsMap<C> = C extends QuarkComponent<any, infer V> ? V : never
export type QuarkComponentVariants<C> = PropsOfVariantsMap<QuarkComponentVariantsMap<C>>

export function styled<
  Element extends keyof JSX.IntrinsicElements | ComponentType<any>,
  VariantsMap extends QuarkVariantsMap = {}
>(element: Element, config: QuarkConfig<VariantsMap>): QuarkComponent<Element, VariantsMap> {
  const quark = css(config)
  const separateQuarkProps = createSeparateQuarkPropsFn(config)

  return memo(
    forwardRef<any, any>(({ children, className: _className, ...props }, ref) => {
      const [quarkProps, rest] = separateQuarkProps(props)

      const cssClassString = quark(quarkProps)
      const className = _className ? `${cssClassString} ${_className}` : cssClassString

      // @ts-ignore
      return createElement(element, { ref, className, ...rest }, children)
    })
  ) as any
}

function createSeparateQuarkPropsFn<Config extends QuarkConfig>({ variants }: Config) {
  return <Props extends Record<string, any>>(
    props: Props
  ): [Pick<Props, keyof Config['variants']>, Omit<Props, keyof Config['variants']>] => {
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

    return [quarkProps, rest] as any
  }
}

// export function shallowMemoPrev<FN extends (arg: Record<string, any>) => any>(fn: FN): FN {
//   let prevArg: Record<string, any> | undefined
//   let prevResult: any | undefined

//   return ((arg: Record<string, any>) => {
//     if (prevArg !== undefined && isShallowEqual(arg, prevArg)) return prevResult
//     prevArg = arg
//     prevResult = fn(arg)
//     return prevResult
//   }) as any
// }

// function isShallowEqual(a: Record<string, any>, b: Record<string, any>) {
//   for (const key in a) {
//     if (a[key] !== b[key]) return false
//   }
//   return true
// }
