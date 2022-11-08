export type QuarkVariants = { [key: string]: string }

export type QuarkVariantsMap = { [variantKey: string]: QuarkVariants }

type TrueStringToBoolean<StringUnion> = StringUnion extends 'true'
  ? Exclude<StringUnion, 'true'> | boolean
  : StringUnion

export type PropsOfVariantsMap<VariantsMap extends QuarkVariantsMap> = {
  [Key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[Key]>
}

export type DefaultVariants<VariantsMap extends QuarkVariantsMap> = {
  [key in keyof VariantsMap]?: keyof VariantsMap[key] & string
}

export type QuarkConfig<VariantsMap extends QuarkVariantsMap = {}> = {
  base?: string | string[]
  variants?: VariantsMap
  defaultVariants?: DefaultVariants<VariantsMap>
}

export type QuarkCss<VariantsMap extends QuarkVariantsMap> = (variantValues?: PropsOfVariantsMap<VariantsMap>) => string

export function css<VariantsMap extends QuarkVariantsMap>(config: QuarkConfig<VariantsMap>): QuarkCss<VariantsMap> {
  const { base, variants, defaultVariants } = config
  const baseClass = Array.isArray(base) ? base.join(' ') : base
  const variantsEntries = Object.entries(variants || {})

  return (props: PropsOfVariantsMap<VariantsMap> = {}) => {
    const classNames: string[] = baseClass ? [baseClass] : []

    for (const [key, map] of variantsEntries) {
      const variantProp = props[key]
      const className = variantProp ? map[variantProp.toString()] : defaultVariants?.[key]

      if (className) classNames.push(className)
    }

    return classNames.join(' ')
  }
}
