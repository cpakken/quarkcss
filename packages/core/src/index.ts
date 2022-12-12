//null variant is applied when no variant value is passed
export type QuarkVariants = { [key: string]: string | string[] } & { null?: string | string[] }
// export type QuarkVariants = { [key: string]: string }

export type QuarkVariantsMap = { [variantKey: string]: QuarkVariants }

type TrueStringToBoolean<StringUnion> = StringUnion extends 'true' | 'null'
  ? Exclude<StringUnion, 'true' | 'null'> | boolean | null | undefined
  : StringUnion

export type PropsOfVariantsMap<VariantsMap extends QuarkVariantsMap> = {
  [Key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[Key] & string>
}

export type DefaultVariants<VariantsMap extends QuarkVariantsMap> = {
  [key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[key] & string>
}

export type CompoundVariant<VariantsMap extends QuarkVariantsMap> = {
  [key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[key] & string>
} & { value: string | string[] }

export type QuarkConfig<VariantsMap extends QuarkVariantsMap = {}> = {
  base?: string | string[]
  variants?: VariantsMap
  compoundVariants?: CompoundVariant<VariantsMap>[]
  defaultVariants?: DefaultVariants<VariantsMap>
}

export type QuarkCss<VariantsMap extends QuarkVariantsMap> = (
  variantValues?: PropsOfVariantsMap<VariantsMap>
) => string

export function css<VariantsMap extends QuarkVariantsMap>(
  config: QuarkConfig<VariantsMap>
): QuarkCss<VariantsMap> {
  const { base, variants, defaultVariants, compoundVariants = [] } = config
  const baseClass = Array.isArray(base) ? base.join(' ') : base
  const variantsEntries = Object.entries(variants || {})

  return (props: PropsOfVariantsMap<VariantsMap> = {}) => {
    const classNames: string[] = baseClass ? [baseClass] : []

    //Process Variants
    for (const [key, map] of variantsEntries) {
      const className = map[normalize(props[key])] ?? defaultVariants?.[key]

      if (className) classNames.push(...arrayify(className))
    }

    //Process Compound Variants
    for (const variant of compoundVariants) {
      let match = true

      for (const key in variant) {
        if (key === 'value') continue

        if (normalize(props[key]) !== normalize(variant[key])) {
          match = false
          break
        }
      }

      if (match) {
        classNames.push(...arrayify(variant.value))
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
