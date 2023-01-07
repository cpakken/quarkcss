import { getQuarkConfig, GetQuarkVariantsMap, QuarkCss } from '@quarkcss/core'

export function createSeparateQuarkPropsFn<Quark extends QuarkCss<{}>>(quark: Quark) {
  return <Props extends Record<string, any>>(
    props: Props
  ): [
    Pick<Props, keyof GetQuarkVariantsMap<Quark> & string>,
    Omit<Props, keyof GetQuarkVariantsMap<Quark> & string>
  ] => {
    const quarkProps = {} as any
    const rest = {} as any

    const { variants } = getQuarkConfig(quark)

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
