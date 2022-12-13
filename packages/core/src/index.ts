//null variant is applied when no variant value is passed
export type QuarkVariants = { [key: string]: string | string[] } & { null?: string | string[] }

export type QuarkVariantsMap = { [variantKey: string]: QuarkVariants }

type TrueStringToBoolean<StringUnion> = StringUnion extends 'true' | 'null'
  ? Exclude<StringUnion, 'true' | 'null'> | boolean | null | undefined
  : StringUnion

export type PropsOfVariantsMap<VariantsMap extends QuarkVariantsMap> = {
  [Key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[Key] & string>
}

export type CompoundVariants<VariantsMap extends QuarkVariantsMap> =
  | (PropsOfVariantsMap<VariantsMap> & { value: string | string[]; exact?: never })
  | (PropsOfVariantsMap<VariantsMap> & { exact: string | string[]; value?: never })

export type QuarkConfig<VariantsMap extends QuarkVariantsMap = {}> = {
  base?: string | string[]
  variants?: VariantsMap

  compound?: CompoundVariants<VariantsMap>[]
  defaults?: PropsOfVariantsMap<VariantsMap>
}

export type QuarkCss<VariantsMap extends QuarkVariantsMap> = (
  variantValues?: PropsOfVariantsMap<VariantsMap>
) => string

export type GetQuarkVariantsMap<Quark extends QuarkCss<{}>> = Quark extends QuarkCss<infer V> ? V : never

export type GetQuarkVariants<Quark extends QuarkCss<{}>> = PropsOfVariantsMap<GetQuarkVariantsMap<Quark>>

export function css<VariantsMap extends QuarkVariantsMap>(
  config: QuarkConfig<VariantsMap>
): QuarkCss<VariantsMap> {
  const { base, variants, defaults, compound = [] } = config
  const baseClass = Array.isArray(base) ? base.join(' ') : base
  const variantsEntries = Object.entries(variants || {})

  return (props: PropsOfVariantsMap<VariantsMap> = {}) => {
    const classNames: string[] = baseClass ? [baseClass] : []

    //Process Variants
    for (const [key, map] of variantsEntries) {
      const className = map[normalize(props[key])] ?? defaults?.[key]

      if (className) classNames.push(...arrayify(className))
    }

    //Process Compound Variants
    for (const variant of compound) {
      let match = true

      //if only is true, only match if all props are present
      const iterator = variant.exact ? props : variant

      for (const key in iterator) {
        if (compoundPropKeywords.has(key)) continue

        if (normalize(props[key]) !== normalize(variant[key])) {
          match = false
          break
        }
      }

      if (match) {
        const className = variant.exact ?? variant.value
        classNames.push(...arrayify(className))
      }
    }

    return classNames.join(' ')
  }
}

const arrayify = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

const normalize = (key: string | boolean | null | undefined): string => {
  //If falsey, return 'null' as the prop key, if true, return 'true'
  return !key ? 'null' : key.toString()
}

const compoundPropKeywords = new Set(['exact', 'value'])
