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
  | PropsOfVariantsMap<VariantsMap> & { value: string | string[] }

export type QuarkConfig<VariantsMap extends QuarkVariantsMap = {}> = {
  base?: string | string[]
  variants?: VariantsMap

  compound?: CompoundVariants<VariantsMap>[]
  defaults?: PropsOfVariantsMap<VariantsMap>
}

const $quark = Symbol('quark')

export interface QuarkCss<VariantsMap extends QuarkVariantsMap> {
  (variantValues?: PropsOfVariantsMap<VariantsMap>): string
  [$quark]: QuarkConfig<VariantsMap>
}

export type GetQuarkVariantsMap<Quark extends QuarkCss<{}>> = Quark extends QuarkCss<infer V> ? V : never

export type GetQuarkVariants<Quark extends QuarkCss<{}>> = PropsOfVariantsMap<GetQuarkVariantsMap<Quark>>

export function css<VariantsMap extends QuarkVariantsMap>(
  config: QuarkConfig<VariantsMap>
): QuarkCss<VariantsMap> {
  const { base, variants, defaults, compound } = config
  const baseClass = Array.isArray(base) ? base.join(' ') : base
  const variantsEntries = Object.entries(variants || {})

  const getNormalizedProp = <T extends PropsOfVariantsMap<VariantsMap>>(props: T, key: keyof T) => {
    return normalize(Object.hasOwn(props, key) ? props[key] : defaults?.[key])
  }

  const css = (props: PropsOfVariantsMap<VariantsMap> = {}) => {
    const classNames: string[] = baseClass ? [baseClass] : []

    //Process Variants
    for (const [key, map] of variantsEntries) {
      const className = map[getNormalizedProp(props, key)]
      if (className) classNames.push(...arrayify(className))
    }

    //Process Compound Variants
    if (compound) {
      //Value
      for (const variant of compound) {
        let match = true

        for (const key in variant) {
          if (compoundPropKeywords.has(key)) continue

          if (getNormalizedProp(props, key) !== normalize(variant[key])) {
            match = false
            break
          }
        }

        if (match) {
          const className = variant.value ?? ''
          classNames.push(...arrayify(className))
        }
      }
    }

    return cleanMultiLine(classNames.join(' '))
  }

  return Object.assign(css, {
    [$quark]: config,
  })
}

export function isQuarkCss<VariantsMap extends QuarkVariantsMap>(value: any): value is QuarkCss<VariantsMap> {
  return !!value?.[$quark]
}

export function getQuarkConfig<VariantsMap extends QuarkVariantsMap>(
  quark: QuarkCss<VariantsMap>
): QuarkConfig<VariantsMap> {
  return quark[$quark]
}

const arrayify = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

const normalize = (key: string | boolean | null | undefined): string => {
  //If falsey, return 'null' as the prop key, if true, return 'true'
  return !key ? 'null' : key.toString()
}

const cleanMultiLine = (str: string) => str.replace(/\s+/g, ' ').trim()

const compoundPropKeywords = new Set(['value', 'negate'])
