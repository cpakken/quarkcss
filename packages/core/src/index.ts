//false variant is applied when no variant value is passed
export type QuarkVariants = { [key: string]: string | string[] }

export type QuarkVariantsMap = { [variantKey: string]: QuarkVariants }

type BooleanishVariantValue = boolean | null | undefined | 0
type BooleanConfigKey = 'true' | 'false' | 'null'

type VariantPropValue<VariantValues> = Extract<VariantValues, BooleanConfigKey> extends never
  ? VariantValues
  : Exclude<VariantValues, BooleanConfigKey> | BooleanishVariantValue

type BooleanPropKeys<VariantValues, VariantPropKey> =
  Extract<VariantValues, BooleanConfigKey> extends never ? never : VariantPropKey
export type GetBooleanPropKeys<VariantsMap> = {
  [K in keyof VariantsMap]: BooleanPropKeys<keyof VariantsMap[K], K>
}[keyof VariantsMap]

export type PartialPropsOfVariantsMap<VariantsMap extends QuarkVariantsMap> = {
  //if not partial, non-variant keys are rejected as desired
  //partial allows for partial props to be passed in and no DX variant key recommendation
  //TODO how to make parital while reject other keys?

  [Key in keyof VariantsMap]?: VariantPropValue<keyof VariantsMap[Key]>
  // [Key in keyof VariantsMap]?: VariantPropValue<keyof VariantsMap[Key]>
  // [Key in keyof VariantsMap]: VariantPropValue<keyof VariantsMap[Key]>
}

type Flatten<T> = T extends Record<any, any> ? { [P in keyof T]: T[P] } : T
type PartialSubset<T, K extends keyof T> = Flatten<
  Pick<T, Exclude<keyof T, K>> & Partial<Pick<T, K>>
>

//Props are required unless they are in the defaults or are a boolean variant
//(has variant prop 'false' | 'null' | 'true')
export type PropsOfVariantsMap<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>
> = PartialSubset<
  {
    [Key in keyof VariantsMap]: VariantPropValue<keyof VariantsMap[Key]>
  },
  (keyof Defaults | GetBooleanPropKeys<VariantsMap>) & string
>

export type QuarkClassValue = string | string[]

type CompoundVariantValue<VariantValues> =
  | VariantPropValue<VariantValues>
  | VariantPropValue<VariantValues>[]

type PartialCompoundPropsOfVariantsMap<VariantsMap extends QuarkVariantsMap> = {
  [Key in keyof VariantsMap]?: CompoundVariantValue<keyof VariantsMap[Key]>
}

type CompoundClassValue =
  | { value: QuarkClassValue; class?: QuarkClassValue; className?: QuarkClassValue }
  | { value?: QuarkClassValue; class: QuarkClassValue; className?: QuarkClassValue }
  | { value?: QuarkClassValue; class?: QuarkClassValue; className: QuarkClassValue }

export type CompoundVariants<VariantsMap extends QuarkVariantsMap> =
  PartialCompoundPropsOfVariantsMap<VariantsMap> & CompoundClassValue

export type QuarkConfig<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {}
> = {
  base?: string | string[]
  variants?: VariantsMap

  compound?: CompoundVariants<VariantsMap>[]
  defaults?: Defaults
}

export type NamedQuarkConfig<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {}
> = QuarkConfig<VariantsMap, Defaults> & { name?: string }

export type MergeQuarkVariantValues<Base, Extension> = Flatten<
  Omit<Base, keyof Extension> & {
    [Key in keyof Extension]: Key extends keyof Base ? QuarkClassValue : Extension[Key]
  }
>

export type MergeQuarkVariantsMap<
  Base extends QuarkVariantsMap,
  Extension extends QuarkVariantsMap
> = Flatten<
  Omit<Base, keyof Extension> & {
    [Key in keyof Extension]: Key extends keyof Base
      ? MergeQuarkVariantValues<Base[Key], Extension[Key]>
      : Extension[Key]
  }
> extends infer Merged extends QuarkVariantsMap
  ? Merged
  : never

export type MergeQuarkDefaults<
  VariantsMap extends QuarkVariantsMap,
  BaseDefaults,
  ExtensionDefaults
> = Flatten<Omit<BaseDefaults, keyof ExtensionDefaults> & ExtensionDefaults> &
  PartialPropsOfVariantsMap<VariantsMap>

export type MergeQuarkConfig<
  BaseVariants extends QuarkVariantsMap,
  BaseDefaults extends PartialPropsOfVariantsMap<BaseVariants>,
  ExtensionVariants extends QuarkVariantsMap,
  ExtensionDefaults extends PartialPropsOfVariantsMap<ExtensionVariants>,
  MergedVariants extends QuarkVariantsMap = MergeQuarkVariantsMap<
    BaseVariants,
    ExtensionVariants
  >
> = NamedQuarkConfig<
  MergedVariants,
  MergeQuarkDefaults<MergedVariants, BaseDefaults, ExtensionDefaults>
>

const $quark = Symbol('quark')

type Falsey = false | null | undefined | 0 | ''
export type MixedCX = string | (string | Falsey)[] | { [key: string]: any } | Falsey

export interface QuarkCss<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {}
> {
  (variants?: PropsOfVariantsMap<VariantsMap, Defaults>, ...rest: MixedCX[]): string
  [$quark]: NamedQuarkConfig<VariantsMap, Defaults>
}

export type AnyQuarkCss = QuarkCss<any, any>

export type QuarkProps<Quark> = Quark extends QuarkCss<infer VariantsMap, infer Defaults>
  ? PropsOfVariantsMap<VariantsMap, Defaults>
  : never

// export function css<Config extends QuarkConfig>(config: Config): QuarkCss<Config> {

export type QuarkPlugin = (classnames: string) => string

export function createCss(...plugins: QuarkPlugin[]): typeof css {
  if (plugins.length === 0) return css

  return ((config: any) => {
    const quark = css(config)

    if (plugins.length === 0) {
      return quark
    }

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
  | NamedQuarkConfig<VariantsMap, Defaults>
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
  const baseClass = base ? cleanMultiLine(Array.isArray(base) ? base.join(' ') : base) : base
  const variantsEntries = variants && Object.entries(variants)
  const compoundEntries = compound?.map((variant) => {
    const conditions: [string, string | string[]][] = []

    for (const key in variant) {
      if (compoundPropKeywords.has(key)) continue

      const value = variant[key]
      conditions.push([
        key,
        Array.isArray(value)
          ? value.map((condition) => normalize(condition as any))
          : normalize(value as any),
      ])
    }

    const className = variant.value ?? variant.class ?? variant.className

    return {
      conditions,
      classNames: className ? arrayify(className) : [],
    }
  })

  const getNormalizedProp = (props: any, key: string) => {
    const value = props[key]
    return normalize(value === undefined ? defaults?.[key] : value)
  }

  const getVariantClass = (map: QuarkVariants, key: string) => {
    if (key === 'false') return map.false !== undefined ? map.false : map.null
    return map[key]
  }

  const isCompoundMatch = (props: any, key: string, value: string | string[]) => {
    const propValue = getNormalizedProp(props, key)

    if (Array.isArray(value)) {
      for (const variantValue of value) {
        if (propValue === variantValue) return true
      }

      return false
    }

    return propValue === value
  }

  const _css = (props: any = {}, ...rest: MixedCX[]) => {
    const classNames: string[] = baseClass ? [baseClass] : []

    //Process Variants
    if (variantsEntries) {
      for (const [key, map] of variantsEntries) {
        const propKey = getNormalizedProp(props, key)
        const className = getVariantClass(map, propKey)
        if (className) classNames.push(...arrayify(className))
      }
    }

    //Process Compound Variants
    if (compoundEntries) {
      //Value
      for (const variant of compoundEntries) {
        let match = true

        for (const [key, value] of variant.conditions) {
          if (!isCompoundMatch(props, key, value)) {
            match = false
            break
          }
        }

        if (match) {
          classNames.push(...variant.classNames)
        }
      }
    }

    //Add Rest
    for (const className of rest) {
      if (className) {
        if (typeof className === 'string') classNames.push(className)
        else if (Array.isArray(className)) classNames.push(...className.filter(Boolean))
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
): NamedQuarkConfig<VariantsMap, Defaults> => {
  return quark[$quark]
}

export const mergeQuarkConfigs = <
  BaseVariants extends QuarkVariantsMap,
  BaseDefaults extends PartialPropsOfVariantsMap<BaseVariants>,
  ExtensionVariants extends QuarkVariantsMap,
  ExtensionDefaults extends PartialPropsOfVariantsMap<ExtensionVariants>
>(
  baseConfig: NamedQuarkConfig<BaseVariants, BaseDefaults>,
  extensionConfig: NamedQuarkConfig<ExtensionVariants, ExtensionDefaults>
): MergeQuarkConfig<BaseVariants, BaseDefaults, ExtensionVariants, ExtensionDefaults> => {
  const base = mergeClassValues(baseConfig.base, extensionConfig.base)
  const variants = mergeVariants(baseConfig.variants, extensionConfig.variants)
  const compound =
    baseConfig.compound || extensionConfig.compound
      ? [...(baseConfig.compound || []), ...(extensionConfig.compound || [])]
      : undefined
  const defaults =
    baseConfig.defaults || extensionConfig.defaults
      ? { ...baseConfig.defaults, ...extensionConfig.defaults }
      : undefined
  const name = extensionConfig.name ?? baseConfig.name

  return {
    ...(name ? { name } : {}),
    ...(base ? { base } : {}),
    ...(variants ? { variants } : {}),
    ...(compound ? { compound } : {}),
    ...(defaults ? { defaults } : {}),
  } as MergeQuarkConfig<BaseVariants, BaseDefaults, ExtensionVariants, ExtensionDefaults>
}

const mergeVariants = (
  baseVariants?: QuarkVariantsMap,
  extensionVariants?: QuarkVariantsMap
): QuarkVariantsMap | undefined => {
  if (!baseVariants) return extensionVariants
  if (!extensionVariants) return baseVariants

  const merged: QuarkVariantsMap = { ...baseVariants }

  for (const variantKey in extensionVariants) {
    const baseValues = merged[variantKey]
    const extensionValues = extensionVariants[variantKey]

    if (!extensionValues) continue

    if (!baseValues) {
      merged[variantKey] = extensionValues
      continue
    }

    const mergedValues = { ...baseValues }

    for (const valueKey in extensionValues) {
      const classValue = mergeClassValues(baseValues[valueKey], extensionValues[valueKey])
      if (classValue) mergedValues[valueKey] = classValue
    }

    merged[variantKey] = mergedValues
  }

  return merged
}

const mergeClassValues = (
  baseValue?: QuarkClassValue,
  extensionValue?: QuarkClassValue
): QuarkClassValue | undefined => {
  if (!baseValue) return extensionValue
  if (!extensionValue) return baseValue

  return [...arrayify(baseValue), ...arrayify(extensionValue)]
}

const normalize = (key: string | boolean | null | undefined | 0): string => {
  // Falsey values use the `false` branch, or the `null` branch when no `false` branch exists.
  return !key ? 'false' : key.toString()
}

export const arrayify = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

export const cleanMultiLine = (str: string) => str.replace(/\s+/g, ' ').trim()

const compoundPropKeywords = new Set(['value', 'class', 'className'])
