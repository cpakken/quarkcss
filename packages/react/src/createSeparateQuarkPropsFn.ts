import { QuarkConfig } from '@quarkcss/core'

export function createSeparateQuarkPropsFn<Config extends QuarkConfig>({ variants }: Config) {
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
