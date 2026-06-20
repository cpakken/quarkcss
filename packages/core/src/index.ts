//false variant is applied when no variant value is passed
export type QuarkVariants = { [key: string]: string | string[] }

export type QuarkVariantsMap = { [variantKey: string]: QuarkVariants }

type BooleanishVariantValue = boolean | null | undefined | 0
type BooleanConfigKey = 'true' | 'false' | 'null'

type VariantPropValue<VariantValues> =
  Extract<VariantValues, BooleanConfigKey> extends never
    ? VariantValues
    : Exclude<VariantValues, BooleanConfigKey> | BooleanishVariantValue

type BooleanPropKeys<VariantValues, VariantPropKey> =
  Extract<VariantValues, BooleanConfigKey> extends never ? never : VariantPropKey
export type GetBooleanPropKeys<VariantsMap> = {
  [K in keyof VariantsMap]: BooleanPropKeys<keyof VariantsMap[K], K>
}[keyof VariantsMap]

export type PartialPropsOfVariantsMap<VariantsMap extends QuarkVariantsMap> = {
  [Key in keyof VariantsMap]?: VariantPropValue<keyof VariantsMap[Key]>
}

type ExactPartialPropsOfVariantsMap<
  VariantsMap extends QuarkVariantsMap,
  Props extends PartialPropsOfVariantsMap<VariantsMap>,
> = Props & Record<Exclude<keyof Props, keyof VariantsMap>, never>

type Flatten<T> = T extends Record<any, any> ? { [P in keyof T]: T[P] } : T
type PartialSubset<T, K extends keyof T> = Flatten<
  Pick<T, Exclude<keyof T, K>> & Partial<Pick<T, K>>
>

//Props are required unless they are in the defaults or are a boolean variant
//(has variant prop 'false' | 'null' | 'true')
export type PropsOfVariantsMap<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
> = PartialSubset<
  {
    [Key in keyof VariantsMap]: VariantPropValue<keyof VariantsMap[Key]>
  },
  (Extract<keyof Defaults, keyof VariantsMap> | GetBooleanPropKeys<VariantsMap>) & string
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
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
> = {
  base?: string | string[]
  variants?: VariantsMap

  compound?: CompoundVariants<VariantsMap>[]
  defaults?: ExactPartialPropsOfVariantsMap<VariantsMap, Defaults>
}

export type NamedQuarkConfig<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
> = QuarkConfig<VariantsMap, Defaults> & { name?: string }

export type MergeQuarkVariantValues<Base, Extension> = Flatten<
  Omit<Base, keyof Extension> & {
    [Key in keyof Extension]: Key extends keyof Base ? QuarkClassValue : Extension[Key]
  }
>

export type MergeQuarkVariantsMap<
  Base extends QuarkVariantsMap,
  Extension extends QuarkVariantsMap,
> =
  Flatten<
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
  ExtensionDefaults,
> = Flatten<Omit<BaseDefaults, keyof ExtensionDefaults> & ExtensionDefaults> &
  PartialPropsOfVariantsMap<VariantsMap>

export type MergeQuarkConfig<
  BaseVariants extends QuarkVariantsMap,
  BaseDefaults extends PartialPropsOfVariantsMap<BaseVariants>,
  ExtensionVariants extends QuarkVariantsMap,
  ExtensionDefaults extends PartialPropsOfVariantsMap<ExtensionVariants>,
  MergedVariants extends QuarkVariantsMap = MergeQuarkVariantsMap<BaseVariants, ExtensionVariants>,
> = NamedQuarkConfig<
  MergedVariants,
  MergeQuarkDefaults<MergedVariants, BaseDefaults, ExtensionDefaults>
>

const $quark = Symbol('quark')
const $quarkCssFactory = Symbol('quark.css.factory')

export type MixedCX =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | readonly MixedCX[]
  | { [key: string]: any }

export interface QuarkCss<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
> {
  (variants?: PropsOfVariantsMap<VariantsMap, Defaults>, ...rest: MixedCX[]): string
  [$quark]: NamedQuarkConfig<VariantsMap, Defaults>
  [$quarkCssFactory]: QuarkCssFactoryId
}

export type AnyQuarkCss = QuarkCss<any, any>
export type QuarkCssFactoryId = object

export type QuarkProps<Quark> =
  Quark extends QuarkCss<infer VariantsMap, infer Defaults>
    ? PropsOfVariantsMap<VariantsMap, Defaults>
    : never

export type QuarkClassComposer = (...values: MixedCX[]) => string

export type QuarkVariantOptions = {
  cache?: boolean | { max?: number }
  precompute?: false | number
}

export type QuarkOptions = {
  compose?: QuarkClassComposer
  merge?: (className: string) => string
  variants?: QuarkVariantOptions
}

type NormalizedClassEngine = {
  compose?: QuarkClassComposer
  merge?: (className: string) => string
  cacheSize: number
  precomputeLimit: false | number
}

const defaultClassEngine: NormalizedClassEngine = {
  cacheSize: 0,
  precomputeLimit: false,
}

const DEFAULT_VARIANT_CACHE_SIZE = 512
const defaultCssFactoryId: QuarkCssFactoryId = {}

export type QuarkCssFactory = typeof css & {
  [$quarkCssFactory]: QuarkCssFactoryId
}

export function createCss(options?: QuarkOptions): QuarkCssFactory {
  const classEngine = normalizeClassEngine(options)

  if (classEngine === defaultClassEngine) return css as QuarkCssFactory

  const cssFactoryId: QuarkCssFactoryId = {}
  const cssFactory = ((config: any) =>
    createQuarkCss(config, classEngine, cssFactoryId)) as QuarkCssFactory

  return Object.assign(cssFactory, {
    [$quarkCssFactory]: cssFactoryId,
  })
}

//Overloading css() ruins type inference, so have to do it this way
type MaybeQuarkConfig<
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
> =
  | NamedQuarkConfig<VariantsMap, Defaults>
  | string[]
  //Hack so that typescript can narrow type errors to QuarkConfig instead of the whole parameter
  | (string & { quark?: VariantsMap })

export function css<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
>(configOrString: MaybeQuarkConfig<VariantsMap, Defaults>): QuarkCss<VariantsMap, Defaults> {
  return createQuarkCss(configOrString, defaultClassEngine, defaultCssFactoryId)
}

function createQuarkCss<
  VariantsMap extends QuarkVariantsMap = {},
  Defaults extends PartialPropsOfVariantsMap<VariantsMap> = {},
>(
  configOrString: MaybeQuarkConfig<VariantsMap, Defaults>,
  classEngine: NormalizedClassEngine,
  cssFactoryId: QuarkCssFactoryId
): QuarkCss<VariantsMap, Defaults> {
  const config =
    typeof configOrString === 'string' || Array.isArray(configOrString)
      ? { base: configOrString }
      : configOrString

  const { base, variants, defaults, compound } = config
  const baseClassNames = base ? normalizeClassNames(base) : []
  const variantsEntries = variants && normalizeVariantEntries(variants)
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
      classNames: className ? normalizeClassNames(className) : [],
    }
  })

  const getNormalizedProp = (props: any, key: string) => {
    const value = props[key]
    return normalize(value === undefined ? defaults?.[key] : value)
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

  const getOwnedClassValues = (props: any) => {
    const classNames: string[] = baseClassNames.length > 0 ? [...baseClassNames] : []

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

    return classNames
  }

  const hasDynamicOwnedClasses = Boolean(variantsEntries || compoundEntries)
  const variantCache =
    hasDynamicOwnedClasses && (classEngine.cacheSize > 0 || classEngine.precomputeLimit !== false)
      ? createStringCache(classEngine.cacheSize || DEFAULT_VARIANT_CACHE_SIZE)
      : undefined

  const getVariantCacheKey = (props: any) => {
    if (!variantsEntries) return ''

    let cacheKey = ''
    for (const [key] of variantsEntries) {
      const propKey = getNormalizedProp(props, key)
      cacheKey += propKey.length + ':' + propKey + '|'
    }

    return cacheKey
  }

  const computeOwnedClassName = (props: any) =>
    composeClassName(getOwnedClassValues(props), classEngine)

  const staticOwnedClassName = hasDynamicOwnedClasses
    ? undefined
    : composeClassName(baseClassNames, classEngine)

  const getOwnedClassName = hasDynamicOwnedClasses
    ? (props: any) => {
        if (!variantCache) return computeOwnedClassName(props)

        const cacheKey = getVariantCacheKey(props)
        const cached = variantCache.get(cacheKey)
        if (cached !== undefined) return cached

        const className = computeOwnedClassName(props)
        variantCache.set(cacheKey, className)
        return className
      }
    : () => staticOwnedClassName!

  if (variantCache && variantsEntries && classEngine.precomputeLimit !== false) {
    precomputeVariantClasses(
      variantsEntries,
      classEngine.precomputeLimit,
      getVariantCacheKey,
      computeOwnedClassName,
      variantCache
    )
  }

  const _css = function (props: any = {}) {
    const ownedClassName = getOwnedClassName(props)
    const restLength = arguments.length - 1

    if (restLength <= 0) return ownedClassName

    if (restLength === 1) {
      const classValue = arguments[1] as MixedCX
      return classValue
        ? composeClassValues(classEngine, ownedClassName, classValue)
        : ownedClassName
    }

    if (restLength === 2) {
      const classValue = arguments[1] as MixedCX
      const cxValue = arguments[2] as MixedCX
      return classValue || cxValue
        ? composeClassValues(classEngine, ownedClassName, classValue, cxValue)
        : ownedClassName
    }

    let hasRestClassValues = false
    for (let index = 1; index < arguments.length; index++) {
      if (arguments[index]) {
        hasRestClassValues = true
        break
      }
    }

    if (!hasRestClassValues) return ownedClassName

    const classValues: MixedCX[] = [ownedClassName]
    for (let index = 1; index < arguments.length; index++) {
      classValues.push(arguments[index])
    }

    return composeClassName(classValues, classEngine)
  }

  return Object.assign(_css, {
    [$quark]: config,
    [$quarkCssFactory]: cssFactoryId,
  })
}

Object.assign(css, {
  [$quarkCssFactory]: defaultCssFactoryId,
})

export const isQuarkCss = (value: any): boolean => {
  return !!value?.[$quark]
}

export const getQuarkConfig = <
  VariantsMap extends QuarkVariantsMap,
  Defaults extends PartialPropsOfVariantsMap<VariantsMap>,
>(
  quark: QuarkCss<VariantsMap, Defaults>
): NamedQuarkConfig<VariantsMap, Defaults> => {
  return quark[$quark]
}

export const getQuarkCssFactoryId = (quark: AnyQuarkCss): QuarkCssFactoryId => {
  return quark[$quarkCssFactory]
}

export const getCssFactoryId = (cssFactory: QuarkCssFactory): QuarkCssFactoryId => {
  return cssFactory[$quarkCssFactory]
}

export const mergeQuarkConfigs = <
  BaseVariants extends QuarkVariantsMap,
  BaseDefaults extends PartialPropsOfVariantsMap<BaseVariants>,
  ExtensionVariants extends QuarkVariantsMap,
  ExtensionDefaults extends PartialPropsOfVariantsMap<ExtensionVariants>,
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

const getVariantClass = (map: QuarkVariants, key: string) => {
  if (key === 'false') return map.false !== undefined ? map.false : map.null
  return map[key]
}

export const arrayify = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value])

const normalizeClassEngine = (options?: QuarkOptions): NormalizedClassEngine => {
  if (!options) return defaultClassEngine

  const variantOptions = options.variants

  const cacheSize =
    variantOptions?.cache === true
      ? DEFAULT_VARIANT_CACHE_SIZE
      : variantOptions?.cache
        ? (variantOptions.cache.max ?? DEFAULT_VARIANT_CACHE_SIZE)
        : 0

  return {
    compose: options.compose,
    merge: options.merge,
    cacheSize,
    precomputeLimit:
      typeof variantOptions?.precompute === 'number' ? variantOptions.precompute : false,
  }
}

const composeClassName = (
  classValues: readonly MixedCX[],
  classEngine: NormalizedClassEngine
): string => {
  const className = classEngine.compose
    ? classEngine.compose(...classValues)
    : joinClassValues(classValues)

  return classEngine.merge ? classEngine.merge(className) : className
}

const composeClassValues = (
  classEngine: NormalizedClassEngine,
  first: MixedCX,
  second: MixedCX,
  third?: MixedCX
): string => {
  const className = classEngine.compose
    ? third === undefined
      ? classEngine.compose(first, second)
      : classEngine.compose(first, second, third)
    : third === undefined
      ? joinTwoClassValues(first, second)
      : joinThreeClassValues(first, second, third)

  return classEngine.merge ? classEngine.merge(className) : className
}

const joinClassValues = (classValues: readonly MixedCX[]): string => {
  let className = ''

  for (const value of classValues) {
    const resolvedValue = resolveClassValue(value)

    if (resolvedValue) {
      if (className) className += ' '
      className += resolvedValue
    }
  }

  return cleanJoinedClassName(className)
}

const joinTwoClassValues = (first: MixedCX, second: MixedCX): string => {
  const firstClassName = resolveClassValue(first)
  const secondClassName = resolveClassValue(second)

  if (!firstClassName) return cleanJoinedClassName(secondClassName)
  if (!secondClassName) return cleanJoinedClassName(firstClassName)

  return cleanJoinedClassName(firstClassName + ' ' + secondClassName)
}

const joinThreeClassValues = (first: MixedCX, second: MixedCX, third: MixedCX): string => {
  let className = ''
  const firstClassName = resolveClassValue(first)
  const secondClassName = resolveClassValue(second)
  const thirdClassName = resolveClassValue(third)

  if (firstClassName) className = firstClassName
  if (secondClassName) className = className ? className + ' ' + secondClassName : secondClassName
  if (thirdClassName) className = className ? className + ' ' + thirdClassName : thirdClassName

  return cleanJoinedClassName(className)
}

const resolveClassValue = (value: MixedCX): string => {
  if (!value) return ''

  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'bigint') return value.toString()
  if (typeof value === 'boolean') return ''

  let className = ''

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolvedValue = resolveClassValue(item)

      if (resolvedValue) {
        if (className) className += ' '
        className += resolvedValue
      }
    }

    return className
  }

  const classMap = value as { [key: string]: any }

  for (const key in classMap) {
    if (classMap[key]) {
      if (className) className += ' '
      className += key
    }
  }

  return className
}

const cleanJoinedClassName = (className: string) =>
  needsCleanMultiLine(className) ? cleanMultiLine(className) : className

type StringCache = ReturnType<typeof createStringCache>

const createStringCache = (maxSize: number) => {
  let cache: Record<string, string> = Object.create(null)
  let previousCache: Record<string, string> = Object.create(null)
  let cacheSize = 0

  return {
    get(key: string) {
      return cache[key] ?? previousCache[key]
    },
    set(key: string, value: string) {
      cache[key] = value

      if (++cacheSize > maxSize) {
        cacheSize = 0
        previousCache = cache
        cache = Object.create(null)
      }
    },
  }
}

const precomputeVariantClasses = (
  variantsEntries: [string, QuarkVariants][],
  limit: number,
  getVariantCacheKey: (props: any) => string,
  computeOwnedClassName: (props: any) => string,
  variantCache: StringCache
) => {
  if (limit <= 0) return

  let total = 1
  const valuesByVariant = variantsEntries.map(([key, map]) => {
    const values = Object.keys(map)
    total *= values.length

    return [key, values] as const
  })

  if (total === 0 || total > limit) return

  const props: Record<string, string> = {}

  const visit = (index: number) => {
    if (index === valuesByVariant.length) {
      variantCache.set(getVariantCacheKey(props), computeOwnedClassName(props))
      return
    }

    const [key, values] = valuesByVariant[index]!

    for (const value of values) {
      props[key] = value
      visit(index + 1)
    }
  }

  visit(0)
}

const multiWhitespace = /\s+/g
const needsMultiWhitespaceCleanup = /(^\s|\s$|\s{2,}|[^\S ])/

export const cleanMultiLine = (str: string) => str.replace(multiWhitespace, ' ').trim()

const needsCleanMultiLine = (str: string) => needsMultiWhitespaceCleanup.test(str)

const normalizeClassValue = (value: QuarkClassValue): QuarkClassValue => {
  if (Array.isArray(value)) return value.map(cleanMultiLine).filter(Boolean)

  return cleanMultiLine(value)
}

const normalizeClassNames = (value: QuarkClassValue): string[] => {
  if (Array.isArray(value)) return value.map(cleanMultiLine).filter(Boolean)

  const className = cleanMultiLine(value)
  return className ? [className] : []
}

const normalizeVariantClassMap = (map: QuarkVariants): QuarkVariants => {
  const normalized: QuarkVariants = {}

  for (const key in map) {
    const className = map[key]
    if (className !== undefined) normalized[key] = normalizeClassValue(className)
  }

  return normalized
}

const normalizeVariantEntries = (variants: QuarkVariantsMap): [string, QuarkVariants][] => {
  const entries: [string, QuarkVariants][] = []

  for (const key in variants) {
    const map = variants[key]
    if (map !== undefined) entries.push([key, normalizeVariantClassMap(map)])
  }

  return entries
}

const compoundPropKeywords = new Set(['value', 'class', 'className'])
