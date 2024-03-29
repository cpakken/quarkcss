//null variant is applied when no variant value is passed
// export type QuarkVariants = { [key: string]: string | string[] } & { null?: string | string[] }
export type QuarkVariants = { [key: string]: string | string[] }

export type QuarkVariantsMap = { [variantKey: string]: QuarkVariants }

type TrueStringToBoolean<StringUnion> = StringUnion extends 'true' | 'null'
  ? Exclude<StringUnion, 'true' | 'null'> | boolean | null | undefined
  : StringUnion

type BooleanPropKeys<VariantValues, VariantPropKey> = VariantValues extends 'null' | 'true'
  ? VariantPropKey
  : never
export type GetBooleanPropKeys<VariantsMap> = {
  [K in keyof VariantsMap]: BooleanPropKeys<keyof VariantsMap[K], K>
}[keyof VariantsMap]

export type PartialPropsOfVariantsMap<VariantsMap extends QuarkVariantsMap> = {
  [Key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[Key] & string>
}
type Flatten<T> = T extends Record<any, any> ? { [P in keyof T]: T[P] } : T
type PartialSubset<T, K extends keyof T> = Flatten<Pick<T, Exclude<keyof T, K>> & Partial<Pick<T, K>>>

//Props are required unless they are in the defaults or are a boolean variant
//(has variant prop 'null' | 'true')
export type PropsOfVariantsMap<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>
> = PartialSubset<
  {
    [Key in keyof VariantsMap]: TrueStringToBoolean<keyof VariantsMap[Key] & string>
  },
  (keyof Defaults | GetBooleanPropKeys<VariantsMap>) & string
>

export type CompoundVariants<VariantsMap extends QuarkVariantsMap> =
  | PartialPropsOfVariantsMap<VariantsMap> & { value: string | string[] }

export type QuarkConfig<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {}
> = {
  base?: string | string[]
  variants?: VariantsMap

  compound?: CompoundVariants<VariantsMap>[]
  defaults?: Defaults
}

const $quark = Symbol('quark')

export interface QuarkCss<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>
> {
  (variantValues?: PropsOfVariantsMap<VariantsMap, Defaults>): string
  [$quark]: QuarkConfig<VariantsMap, Defaults>
}

export type GetQuarkProps<Quark> = Quark extends QuarkCss<infer VariantsMap, infer Defaults>
  ? PropsOfVariantsMap<VariantsMap, Defaults>
  : never

// export function css<Config extends QuarkConfig>(config: Config): QuarkCss<Config> {
export function css<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {}
>(config: QuarkConfig<VariantsMap, Defaults>): QuarkCss<VariantsMap, Defaults> {
  const { base, variants, defaults, compound } = config as any
  const baseClass = Array.isArray(base) ? base.join(' ') : base
  const variantsEntries = Object.entries(variants || {}) as any

  const getNormalizedProp = (props: any, key: string) => {
    return normalize(Object.hasOwn(props, key) ? props[key] : defaults?.[key])
  }

  const _css = (props: any = {}) => {
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

  return Object.assign(_css, {
    [$quark]: config,
  })
}

export function isQuarkCss(value: any): boolean {
  return !!value?.[$quark]
}

export function getQuarkConfig<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>
>(quark: QuarkCss<VariantsMap, Defaults>): QuarkConfig<VariantsMap, Defaults> {
  return quark[$quark]
}

const normalize = (key: string | boolean | null | undefined): string => {
  //If falsey, return 'null' as the prop key, if true, return 'true'
  return !key ? 'null' : key.toString()
}

export const arrayify = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

export const cleanMultiLine = (str: string) => str.replace(/\s+/g, ' ').trim()

const compoundPropKeywords = new Set(['value', 'negate'])
