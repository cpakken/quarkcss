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
  //if not partial, non-variant keys are rejected as desired
  //partial allows for partial props to be passed in and no DX variant key recommendation
  //TODO how to make parital while reject other keys?

  [Key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[Key]>
  // [Key in keyof VariantsMap]?: TrueStringToBoolean<keyof VariantsMap[Key]>
  // [Key in keyof VariantsMap]: TrueStringToBoolean<keyof VariantsMap[Key]>
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
    [Key in keyof VariantsMap]: TrueStringToBoolean<keyof VariantsMap[Key]>
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

type Falsey = false | null | undefined | 0 | ''
export type MixedCN = string | string[] | { [key: string]: any } | Falsey

export interface QuarkCss<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {}
> {
  (variants?: PropsOfVariantsMap<VariantsMap, Defaults>, ...rest: MixedCN[]): string
  [$quark]: QuarkConfig<VariantsMap, Defaults>
}

export type QuarkProps<Quark> = Quark extends QuarkCss<infer VariantsMap, infer Defaults>
  ? PropsOfVariantsMap<VariantsMap, Defaults>
  : never

// export function css<Config extends QuarkConfig>(config: Config): QuarkCss<Config> {

export type QuarkPlugin = (classnames: string) => string

export function createCss(...plugins: QuarkPlugin[]): typeof css {
  if (plugins.length === 0) return css

  return ((config: any) => {
    const quark = css(config)
    return Object.assign(
      (...props: any) => {
        const classnames = quark(...props)
        return plugins.reduce((acc, plugin) => plugin(acc), classnames)
      },
      { [$quark]: quark[$quark] }
    )
  }) as any
}

//Overloading css() ruins type inference, so have to do it this way
type MaybeQuarkConfig<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>
> =
  | (QuarkConfig<VariantsMap, Defaults> & { name?: string })
  | string[]
  //Hack so that typescript can narrow type errors to QuarkConfig instead of the whole parameter
  | (string & { quark?: VariantsMap })

export function css<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {}
>(configOrString: MaybeQuarkConfig<VariantsMap, Defaults>): QuarkCss<VariantsMap, Defaults> {
  const config =
    typeof configOrString === 'string' || Array.isArray(configOrString)
      ? { base: configOrString }
      : configOrString

  const { base, variants, defaults, compound } = config
  const baseClass = Array.isArray(base) ? base.join(' ') : base
  const variantsEntries = variants && Object.entries(variants)

  const getNormalizedProp = (props: any, key: string) => {
    return normalize(Object.hasOwn(props, key) ? props[key] : defaults?.[key])
  }

  const _css = (props: any = {}, ...rest: MixedCN[]) => {
    const classNames: string[] = baseClass ? [baseClass] : []

    //Process Variants
    if (variantsEntries) {
      for (const [key, map] of variantsEntries) {
        const className = map[getNormalizedProp(props, key)]
        if (className) classNames.push(...arrayify(className))
      }
    }

    //Process Compound Variants
    if (compound) {
      //Value
      for (const variant of compound) {
        let match = true

        for (const key in variant) {
          // if (compoundPropKeywords.has(key)) continue
          if (key === 'value') continue

          if (getNormalizedProp(props, key) !== normalize(variant[key] as any)) {
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

    //Add Rest
    for (const className of rest) {
      if (className) {
        if (typeof className === 'string') classNames.push(className)
        else if (Array.isArray(className)) classNames.push(...className)
        else {
          for (const key in className) {
            if (className[key]) {
              classNames.push(key)
            }
          }
        }
      }
    }

    return cleanMultiLine(classNames.join(' '))
  }

  return Object.assign(_css, {
    [$quark]: config,
  })
}

export const isQuarkCss = (value: any): boolean => {
  return !!value?.[$quark]
}

export const getQuarkConfig = <
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>
>(
  quark: QuarkCss<VariantsMap, Defaults>
): QuarkConfig<VariantsMap, Defaults> => {
  return quark[$quark]
}

const normalize = (key: string | boolean | null | undefined): string => {
  //If falsey, return 'null' as the prop key, if true, return 'true'
  return !key ? 'null' : key.toString()
}

export const arrayify = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

export const cleanMultiLine = (str: string) => str.replace(/\s+/g, ' ').trim()

// const compoundPropKeywords = new Set(['value', 'negate'])
