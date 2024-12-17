import { getQuarkConfig, QuarkCss } from '@quarkcss/core'

export function createSeparateQuarkPropsFn(quark: QuarkCss<any, any>) {
  const { variants } = getQuarkConfig(quark)

  return (props: Record<any, any>): [any, any] => {
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

    return [quarkProps, rest]
  }
}
