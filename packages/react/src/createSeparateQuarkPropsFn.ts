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
  const variantKeys = variants ? new Set(Object.keys(variants)) : undefined
  const defaultValidator = (prop: string) => !variantKeys?.has(prop)

  return (props: Record<any, any>): [any, any] => {
    const quarkProps = {} as any
    const rest = {} as any

    if (!variantKeys && !shouldForwardProp) return [quarkProps, props] as any

    for (const propKey in props) {
      const isVariantProp = variantKeys?.has(propKey)

      if (isVariantProp) {
        quarkProps[propKey] = props[propKey]
      }

      if (!shouldForwardProp ? !isVariantProp : shouldForwardProp(propKey, defaultValidator)) {
        rest[propKey] = props[propKey]
      }
    }

    return [quarkProps, rest]
  }
}
