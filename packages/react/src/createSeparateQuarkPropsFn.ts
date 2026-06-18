import { getQuarkConfig, type QuarkCss } from '@quarkcss/core'

export type ShouldForwardProp = (
  prop: string,
  defaultValidator: (prop: string) => boolean
) => boolean

export function createSeparateQuarkPropsFn(
  quark: QuarkCss<any, any>,
  shouldForwardProp?: ShouldForwardProp
) {
  const { variants } = getQuarkConfig(quark)
  const defaultValidator = (prop: string) => !variants || !Object.hasOwn(variants, prop)

  return (props: Record<any, any>): [any, any] => {
    const quarkProps = {} as any
    const rest = {} as any

    if (!variants && !shouldForwardProp) return [quarkProps, props] as any

    for (const propKey in props) {
      if (variants && Object.hasOwn(variants, propKey)) {
        quarkProps[propKey] = props[propKey]
      }

      if (!shouldForwardProp ? defaultValidator(propKey) : shouldForwardProp(propKey, defaultValidator)) {
        rest[propKey] = props[propKey]
      }
    }

    return [quarkProps, rest]
  }
}
